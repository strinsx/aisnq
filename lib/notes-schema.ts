import { z } from "zod";

const nonEmptyText = z.string().trim().min(1);

export const notesSchema = z.object({
  title: nonEmptyText,
  summary: nonEmptyText,
  sections: z
    .array(
      z.object({
        heading: nonEmptyText,
        points: z.array(nonEmptyText).min(1),
      }),
    )
    .min(1),
  keyTerms: z.array(
    z.object({
      term: nonEmptyText,
      definition: nonEmptyText,
    }),
  ),
});

export type Notes = z.infer<typeof notesSchema>;
