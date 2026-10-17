# Progress Tracker

## Current Phase

- Complete: quiz generation prototype

## Current Goal

- Let students generate and take a notes-based quiz inside the study-notes Dialog, then review their results.

## Completed

- Read repository guidance, feature spec, context files, and installed Next.js App Router documentation.
- Initialized shadcn/ui with the `base-nova` style and Base UI primitives.
- Applied the specified tweakcn global theme and documented its light/dark semantic tokens.
- Installed Button, Table, Card, Dialog, Toast, Alert, Tabs, Skeleton, Alert Dialog, Calendar, Context Menu, Dropdown Menu, Empty, Field, Menubar, and Questionnaire. Label and Separator were also generated to support the component set.
- Added a generic TanStack Table Data Table renderer in `components/data-table.tsx`.
- Added the shared `cn()` helper in `lib/utils.ts` and installed Lucide React.
- Updated the architecture and UI context docs to reflect the installed system.
- Verified the production build passes.
- Installed the Gemini SDK and Zod, plus the shadcn Spinner and Sonner components for this prototype.
- Implemented the PDF drop zone, file validation and replacement, processing state, error toast, result Card and notes Dialog.
- Added the server-only Gemini upload route, shared Zod notes schema, local model setting, and short setup README.
- Verified the production build and lint checks pass.
- Exercised the API with wrong-type, oversized, empty, and valid generated PDFs; the valid PDF returned structured notes from Gemini.
- Checked built client assets for the configured API key; no match was found.
- Loaded and self-hosted Inter, Playfair Display, and JetBrains Mono through Next.js fonts; applied them to body text, headings, and prototype metadata.
- Verified the typography build and lint pass, with all three font mappings and webfont assets present in the production output.
- Expanded the notes Dialog into a responsive reading overlay with a back header, independent scrolling, an overview, sections, key terms, and the disclaimer.
- Verified the overlay production build and lint pass.
- Brought the existing PDF-to-notes prototype and context files into this checkout so the quiz feature builds on the established notes flow.
- Added quiz type, mixed priority, and question count options in the same Dialog, with a generating state and retryable error toast.
- Added one-question-at-a-time answering, progress, client grading, per-question review, section summary, retake, and new-quiz flows.
- Added the server-only Gemini quiz route with Zod request/output validation, count and type distribution checks, unique prompts, four-option multiple choice checks, source-section checks, and a short-notes guard.
- Added focused grading checks for identification normalization, exact multiple-choice matching, false answers, and missed-section summaries.
- Bundled the three existing variable fonts locally so production builds do not require Google Fonts access.
- Verified TypeScript, lint, and the production build pass in this checkout.
- Generated a live five-question mixed quiz from representative study notes using the original project's Gemini settings. The returned quiz had the requested 3/1/1 type split and source sections from the notes.

## In Progress

- None.

## Next Up

- Gather student feedback on the PDF-to-notes flow and its time savings against the 45-60 minute manual baseline.
- Review quiz quality with notes from a real uploaded module and gather student feedback; provider rate-limit behavior has not been forced in this checkout.
- Triage the dependency advisories before release.

## Open Questions

- Add a semantic success color token when a feature needs success-state styling; the selected theme does not define one.
- `npm install` reported 9 high-severity advisories in the dependency tree. Their packages and impact have not been audited in this task.

## Architecture Decisions

- Use shadcn's `base-nova` style with Base UI primitives.
- Pin `@base-ui/react` to 1.8.0. The 1.9.0 package declarations caused TypeScript to lose inherited component props; 1.8.0 typechecks with the generated files.
- Use the official `lucide-react` package to satisfy the spec's `lucide-reacts` requirement, which appears to be a package-name typo.
- Treat Data Table as a TanStack composition outside `components/ui/`; the shadcn registry provides it as a guide/pattern rather than a standalone CLI component.
- Keep generated `components/ui/` files untouched after installation.
- Send PDFs directly to Gemini inline; validate the structured result with Zod and keep uploads and notes only in memory.
- Use `gemini-3.5-flash-lite` for the local prototype model while keeping `GEMINI_MODEL` configurable.
- Map `font-heading` to Playfair Display, while Inter remains the interface font and JetBrains Mono identifies source and timing metadata.
- Keep quizzes and answers in memory; closing the notes Dialog discards progress. Grade answers in the browser against the returned answer key.
- Require mixed quizzes to allocate roughly half their questions to the selected priority type and split the rest across the other two types.
- Use locally stored versions of the previously fetched fonts through `next/font/local` for reproducible offline builds.

## Session Notes

- The production build passes on Next.js 16.4.0 after enabling TanStack's column visibility feature for the generic table renderer.
- Next.js warns that it ignored a parent-level lockfile outside this repository and suggests setting `turbopack.root`; build still completed successfully.
- A live request with a small generated PDF returned a title, section, and key term. Provider rate-limit and timeout behavior is handled in the route but was not forced during verification.
- This checkout has no `.env.local`; a live quiz request was run with the existing settings from the original project directory without copying the key into this checkout.
- Local API smoke checks returned 400 for invalid options, 422 for insufficient notes, and 503 for missing Gemini configuration.
- The live mixed-quiz API response contained exactly five valid questions across all three types, with source sections matching the supplied notes.
