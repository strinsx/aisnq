import { z } from "zod";
import { notesSchema } from "@/lib/notes-schema";

const text = z.string().trim().min(1);

export const questionTypeSchema = z.enum([
  "multiple_choice",
  "identification",
  "true_false",
]);
export const quizTypeSchema = z.enum([...questionTypeSchema.options, "mixed"]);
export const quizCountSchema = z.union([z.literal(5), z.literal(10), z.literal(15)]);

export const quizRequestSchema = z
  .object({
    notes: notesSchema,
    type: quizTypeSchema,
    priority: questionTypeSchema.optional(),
    count: quizCountSchema,
  })
  .superRefine((value, context) => {
    if (value.type === "mixed" && !value.priority) {
      context.addIssue({
        code: "custom",
        path: ["priority"],
        message: "Choose a type to prioritize for a mixed quiz.",
      });
    }
    if (value.type !== "mixed" && value.priority) {
      context.addIssue({
        code: "custom",
        path: ["priority"],
        message: "Priority is only available for mixed quizzes.",
      });
    }
  });

const baseQuestion = {
  id: text,
  prompt: text,
  explanation: text,
  sourceSection: text,
};

export const questionSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseQuestion,
    type: z.literal("multiple_choice"),
    options: z.array(text).length(4),
    correctAnswer: text,
  }),
  z.object({
    ...baseQuestion,
    type: z.literal("identification"),
    correctAnswer: text,
    acceptedAnswers: z.array(text).default([]),
  }),
  z.object({
    ...baseQuestion,
    type: z.literal("true_false"),
    correctAnswer: z.boolean(),
  }),
]);

export const quizSchema = z.object({ questions: z.array(questionSchema) });

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuizType = z.infer<typeof quizTypeSchema>;
export type QuizCount = z.infer<typeof quizCountSchema>;
export type QuizRequest = z.infer<typeof quizRequestSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Quiz = z.infer<typeof quizSchema>;

export function questionTargets(type: QuizType, count: QuizCount, priority?: QuestionType) {
  if (type !== "mixed") return { [type]: count } as Partial<Record<QuestionType, number>>;
  if (!priority) throw new Error("A mixed quiz needs a priority type.");
  const others = questionTypeSchema.options.filter((item) => item !== priority);
  const favored = Math.ceil(count / 2);
  const remainder = count - favored;
  return {
    [priority]: favored,
    [others[0]]: Math.ceil(remainder / 2),
    [others[1]]: Math.floor(remainder / 2),
  } as Partial<Record<QuestionType, number>>;
}

export function validateQuiz(quiz: Quiz, request: QuizRequest): boolean {
  if (quiz.questions.length !== request.count) return false;
  const targets = questionTargets(request.type, request.count, request.priority);
  const counts: Record<QuestionType, number> = {
    multiple_choice: 0,
    identification: 0,
    true_false: 0,
  };
  const headings = new Set(request.notes.sections.map((section) => section.heading));
  const prompts = new Set<string>();
  const ids = new Set<string>();

  for (const question of quiz.questions) {
    counts[question.type]++;
    const prompt = question.prompt.trim().toLowerCase().replace(/\s+/g, " ");
    if (prompts.has(prompt) || ids.has(question.id) || !headings.has(question.sourceSection)) {
      return false;
    }
    prompts.add(prompt);
    ids.add(question.id);

    if (question.type === "multiple_choice") {
      if (new Set(question.options.map((option) => option.toLowerCase().replace(/\s+/g, " "))).size !== 4) return false;
      if (!question.options.includes(question.correctAnswer)) return false;
    }
  }

  return questionTypeSchema.options.every((type) => counts[type] === (targets[type] ?? 0));
}
