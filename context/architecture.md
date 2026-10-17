# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16 App Router + TypeScript | Pages, layouts, and server/client boundaries |
| UI styling | Tailwind CSS 4 | Utility styling and semantic theme tokens |
| UI components | shadcn/ui `base-nova` + Base UI 1.8.0 | Accessible, locally generated primitives |
| Data tables | TanStack Table 9 | Generic table composition and column definitions |
| Icons | Lucide React | Interface icons |
| Class merging | `cn` via `lib/utils.ts` | Merge conditional Tailwind classes |

## Boundaries

- `app/` owns routes, the root layout, global styles, and metadata.
- `components/ui/` contains generated primitives. Update them through the shadcn CLI; do not hand-edit them.
- `components/data-table.tsx` is a reusable composition outside the generated directory.
- `lib/utils.ts` provides the shared `cn()` helper.
- `context/` contains product and implementation guidance.

## Invariants

1. Keep generated shadcn primitives untouched after installation.
2. Keep product data fetching and mutations outside shared UI primitives.
3. Use semantic theme tokens for component colors.
4. Default to server components; add a client boundary only where interaction requires it.
