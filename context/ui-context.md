# UI Context

## Theme

The global visual system is the tweakcn theme installed from `https://tweakcn.com/r/themes/cmlm03etv000204lh15608kec`. It provides warm neutral light surfaces and a charcoal dark variant. The light theme is the default; adding `.dark` to the document enables the dark token set. No theme switcher is part of this foundation unit.

## Colors

Use the shadcn semantic CSS variables through Tailwind utilities such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, and `text-destructive`. Do not add hardcoded color values to feature components.

| Role | CSS Variable | Light value | Dark value |
| --- | --- | --- | --- |
| Page background | `--background` | `oklch(0.9195 0.0169 88.0030)` | `oklch(0.1913 0 0)` |
| Surface | `--card` | `oklch(0.9530 0.0156 86.4257)` | `oklch(0.2264 0 0)` |
| Primary text | `--foreground` | `oklch(0.2350 0 0)` | `oklch(0.9173 0.0133 82.4015)` |
| Muted text | `--muted-foreground` | `oklch(0.4688 0.0136 84.5932)` | `oklch(0.6348 0.0113 81.7875)` |
| Primary accent | `--primary` | `oklch(0.3012 0 0)` | `oklch(0.8520 0.0205 100.6306)` |
| Border | `--border` | `oklch(0.8434 0.0231 87.1621)` | `oklch(0.2931 0 0)` |
| Error | `--destructive` | `oklch(0.5771 0.2152 27.3250)` | `oklch(0.6368 0.2078 25.3313)` |
| Success | — | Not defined by the selected theme | Not defined by the selected theme |

## Typography

| Role | Font stack | Variable |
| --- | --- | --- |
| UI text | Inter, sans-serif | `--font-sans` |
| Metadata/mono | JetBrains Mono, monospace | `--font-mono` |
| Headings | Playfair Display, serif | `--font-serif` and `--font-heading` |

Load all three locally stored variable fonts through Next.js font optimization in the root layout. The prototype uses Inter for body and controls, Playfair Display for headings and component titles, and JetBrains Mono for small source/timing metadata. The fonts are self-hosted rather than relying on device installation or a build-time network request.

## Border Radius

The theme base radius is `0.5rem` in `--radius`. Use the generated scale (`rounded-sm`, `rounded-md`, `rounded-lg`, and larger variants) instead of arbitrary radii.

## Component Library

Use shadcn/ui with the `base-nova` style on Base UI primitives. Generated primitives live in `components/ui/`; do not hand-edit those generated files. Add or update primitives with the shadcn CLI. The generic TanStack Data Table composition lives in `components/data-table.tsx`, outside the generated directory.

Installed primitives: Button, Table, Card, Dialog, Toast, Alert, Tabs, Skeleton, Alert Dialog, Calendar, Context Menu, Dropdown Menu, Empty, Field, Menubar, Questionnaire, Spinner, and Sonner. Label and Separator were added as dependencies of the requested components. The quiz adds local shadcn-style Badge, Input, Progress, and RadioGroup wrappers around Base UI or HTML primitives.

## Layout Patterns

The prototype homepage uses Empty as a PDF drop zone with an outline upload button. A successful result appears in a Card; selecting it opens a near-full-viewport Dialog reading overlay above the homepage. The overlay has its own close/back header, a scrollable notes area, and a responsive layout for sections and key terms. Sonner reports validation and request errors. Use semantic tokens for drag-over emphasis and keep the notes disclaimer visible with the result.

The same Dialog switches among notes, quiz options, generation, one-question quiz, and results views. Closing it clears quiz progress. The results include a question-by-question review and the quiz disclaimer.

## Icons

Use Lucide React (`lucide-react`). Prefer stroke icons sized `size-4` inline and `size-5` for buttons or prominent controls.
