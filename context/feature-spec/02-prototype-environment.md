## Goal

Build the core MVP of AISNQ: a single page at `/` where a student drags and drops a PDF, the Next.js backend sends it to Gemini, and the returned JSON is rendered as a shadcn Card that opens to show the generated study notes.

This prototype exists to test one claim: that a study-notes draft can be produced from a PDF in far less time than manual preparation (baseline: 45-60 minutes).

## Design Decision

- `/` shows a shadcn `Empty` component as the drop zone. It accepts drag-and-drop and also has an outline shadcn `Button` labeled "Upload PDF" that opens the file picker.
- Once a PDF is selected, the Empty shows the filename and a "Begin processing" `Button`. The student can remove the file and pick another before processing.
- On click, the button is disabled and a shadcn `Spinner` is shown until the request resolves.
- On success, a shadcn `Card` appears with the document title, a short summary, and the filename as the source label. Clicking the Card opens the full study notes in a `Dialog` (or `Sheet`).
- On failure, a toast (sonner) shows a plain-language error and the student can retry.
- The PDF is sent directly to Gemini as a file input. There is no separate text-extraction step in this prototype.
- Nothing is persisted. No database, no file storage. Results live in client state and are lost on refresh.

## Core Flows

1. **Happy path:** open `/` -> drop a PDF -> filename appears -> click "Begin processing" -> spinner -> Card appears -> click Card -> read the notes.
2. **Wrong file type:** a non-PDF is dropped -> rejected immediately on the client with a toast. Nothing is sent.
3. **Oversized file:** file exceeds the size limit -> rejected on the client with a toast stating the limit.
4. **Provider failure or timeout:** API returns an error -> spinner stops -> toast with the reason -> the file stays selected so the student can retry without re-uploading.
5. **Bad or empty output:** Gemini returns invalid JSON, or notes that are empty (for example, a scanned PDF with no readable content) -> treated as an error, not shown as a result.
6. **Replace file:** the student removes the selected file before processing and picks another.

## Implementation

**Frontend (`app/page.tsx`)**
- States: `idle` -> `fileSelected` -> `processing` -> `done` | `error`.
- Drop zone built on the shadcn `Empty` component, with drag-over highlighting.
- Client-side validation: MIME type is `application/pdf`, size at or below the limit.
- On "Begin processing", POST `multipart/form-data` to `/api/notes`.
- Measure elapsed time on the client (start at click, end at response) and display "Generated in X s" on the result Card.

**Backend (`app/api/notes/route.ts`)**
- Parse the uploaded file from `formData`.
- Re-validate type and size on the server (never trust the client).
- Send the PDF to Gemini (inline base64 or the Files API) with a notes-generation prompt. Request JSON output (`responseMimeType: application/json` with a response schema).
- Validate the response against a `zod` schema. If it fails, return an error.
- Return `{ notes, meta: { filename, durationMs } }`. Do not store the file or the output.
- The API key is read from `GEMINI_API_KEY` in the server environment only. The model name comes from `GEMINI_MODEL`.

**Notes JSON shape**
{
  "title": "string",
  "summary": "string",
  "sections": [
    { "heading": "string", "points": ["string"] }
  ],
  "keyTerms": [
    { "term": "string", "definition": "string" }
  ]
}

**Prompt guidance (first version)**
- Condense, do not remove: keep every important concept, definition, and name.
- Organize by the document's own structure.
- Do not invent information that is not in the document.
- Return only JSON matching the schema.

**UI text**
- Disclaimer shown on the result: "AI-generated notes can contain errors or omit details. Check them against your original material."

## Deliverables

- `app/page.tsx`: upload flow and results UI.
- `app/api/notes/route.ts`: upload handler and Gemini call.
- `lib/notes-schema.ts`: zod schema and shared types.
- `.env.local` with `GEMINI_API_KEY` and `GEMINI_MODEL`.
- shadcn components installed: `empty`, `button`, `spinner`, `card`, `dialog` (or `sheet`), `sonner`.
- Short README: how to run, and which env vars are required.

## Constraints

- PDF only for this prototype. Word, PowerPoint, and URL are later.
- Maximum file size: 10 MB (adjust to the provider's request limit).
- No authentication, no database, no file storage, no quiz, no offline mode.
- The Gemini key never reaches the browser.
- Free-tier provider: expect rate limits and occasional off-context output. Show the disclaimer, and show a clear error on rate-limit responses.
- Scanned or image-only PDFs may produce empty or poor notes. The prototype does not special-case them. It only fails gracefully.
- Keep it simple: no queues, no streaming, no background jobs.

## Complete when

- Dragging a PDF onto the Empty selects it, and the outline Upload button also works.
- A non-PDF or oversized file is rejected with a toast, and nothing is sent to the server.
- "Begin processing" shows the Spinner and disables the button until the request finishes.
- A valid PDF results in a Card containing the title, summary, and filename as the source label.
- Clicking the Card opens the full notes: sections, points, and key terms.
- The elapsed time is displayed on the result.
- A provider error, invalid JSON, or empty notes shows an error toast, and the file stays selected for retry.
- The API key is not exposed in any client bundle or network response.
- The disclaimer is visible with the notes.