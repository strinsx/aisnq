import { ApiError, GoogleGenAI, Type } from "@google/genai";

import { notesSchema } from "@/lib/notes-schema";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 60_000;

const responseSchema = {
  type: Type.OBJECT,
  required: ["title", "summary", "sections", "keyTerms"],
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["heading", "points"],
        properties: {
          heading: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    keyTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["term", "definition"],
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING },
        },
      },
    },
  },
};

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const startedAt = performance.now();
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("The upload could not be read. Please try again.", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.type !== "application/pdf") {
    return errorResponse("Please upload a PDF file.", 400);
  }

  if (file.size === 0) {
    return errorResponse("This PDF is empty. Choose another file.", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("PDFs must be 10 MB or smaller.", 413);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return errorResponse("Notes generation is not configured yet.", 503);
  }

  try {
    const pdf = Buffer.from(await file.arrayBuffer()).toString("base64");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          text: [
            "Create study notes from the attached PDF.",
            "Condense the material without removing important concepts, definitions, or names.",
            "Organize sections by the document's own structure.",
            "Do not invent information that is not in the document.",
            "Return only JSON matching the requested schema.",
          ].join(" "),
        },
        { inlineData: { mimeType: "application/pdf", data: pdf } },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    });

    const output = response.text;
    if (!output?.trim()) {
      return errorResponse(
        "No readable notes were generated from this PDF. Try another file.",
        422,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(output);
    } catch {
      return errorResponse(
        "The notes could not be read. Please try again.",
        502,
      );
    }

    const result = notesSchema.safeParse(parsed);
    if (!result.success) {
      return errorResponse(
        "No usable notes were generated from this PDF. Try another file.",
        422,
      );
    }

    return Response.json({
      notes: result.data,
      meta: {
        filename: file.name,
        durationMs: Math.round(performance.now() - startedAt),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return errorResponse(
          "Gemini is at its rate limit. Please try again shortly.",
          429,
        );
      }
      if (error.status === 408 || error.status === 504) {
        return errorResponse("Gemini took too long to respond. Please retry.", 504);
      }
    }

    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      return errorResponse("Gemini took too long to respond. Please retry.", 504);
    }

    return errorResponse(
      "Notes could not be generated right now. Please try again.",
      502,
    );
  }
}
