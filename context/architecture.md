# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16 App Router + TypeScript | Application routes and server/client component boundaries |
| UI styling | Tailwind CSS 4 | Utility styling and semantic theme utilities |
| UI components | shadcn/ui `base-nova` + Base UI 1.8.0 | Accessible, locally generated component source |
| Data tables | TanStack Table 9 | Generic table composition and column definitions |
| Icons | Lucide React | Tree-shakeable interface icons |
| Class merging | `cn` package via `lib/utils.ts` | Merge conditional Tailwind class strings |
| PDF notes generation | Google Gen AI SDK + Zod | Send PDFs to Gemini and validate structured notes |
| Quiz generation | Google Gen AI SDK + Zod | Generate and validate questions from notes JSON |

## System Boundaries

- `app/` owns routes, the root layout, global styles, and metadata.
- `components/ui/` contains shadcn-generated primitives. Update them through the shadcn CLI; do not hand-edit generated files.
- `components/` contains feature-level compositions such as the generic Data Table pattern.
- `lib/` contains shared utilities. `lib/utils.ts` re-exports the `cn()` class-merging helper.
- `context/` contains product and implementation guidance.
- `app/page.tsx` owns the client-only upload and in-memory result flow.
- `app/api/notes/route.ts` validates uploads and calls Gemini using server-only environment variables.
- `lib/notes-schema.ts` defines the shared notes shape and server validation schema.
- `app/api/quiz/route.ts` validates quiz requests and Gemini output; it receives notes JSON only.
- `lib/quiz-schema.ts` defines quiz shapes and structural checks. `lib/grade-quiz.ts` grades answers in the browser.
- `components/quiz/` contains the options, runner, and results views inside the existing notes Dialog.

## Storage Model

- The prototype has no application data storage.
- Data Table consumers provide their data and column definitions; the shared renderer does not fetch or persist records.
- Uploaded PDFs are sent directly to Gemini as inline file input. Neither PDFs nor notes are persisted by this application; results live only in client state.
- Quiz questions and answers also live only in client state. Closing the notes Dialog discards quiz progress.

## Auth and Access Model

- Authentication and authorization are not configured for the prototype.
- The prototype notes and quiz endpoints have no authentication. Keep `GEMINI_API_KEY` on the server and read the model name from `GEMINI_MODEL`.

## Invariants

1. Keep generated shadcn primitives untouched after installation; update them through the CLI.
2. Keep product data fetching and mutations outside shared UI primitives.
3. Use semantic theme tokens for component colors.
4. Default to server components; add a client boundary only where interaction requires it.
