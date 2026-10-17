# UI Context

## Theme

The global visual system uses the [specified tweakcn theme](https://tweakcn.com/r/themes/cmlm03etv000204lh15608kec): warm neutral light surfaces and a charcoal dark variant. Light is the default; `.dark` on the document enables dark tokens.

Use semantic Tailwind utilities such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, and `text-destructive` in feature components.

| Role | CSS variable | Light | Dark |
| --- | --- | --- | --- |
| Page background | `--background` | `oklch(0.9195 0.0169 88.0030)` | `oklch(0.1913 0 0)` |
| Surface | `--card` | `oklch(0.9530 0.0156 86.4257)` | `oklch(0.2264 0 0)` |
| Primary text | `--foreground` | `oklch(0.2350 0 0)` | `oklch(0.9173 0.0133 82.4015)` |
| Muted text | `--muted-foreground` | `oklch(0.4688 0.0136 84.5932)` | `oklch(0.6348 0.0113 81.7875)` |
| Primary accent | `--primary` | `oklch(0.3012 0 0)` | `oklch(0.8520 0.0205 100.6306)` |
| Border | `--border` | `oklch(0.8434 0.0231 87.1621)` | `oklch(0.2931 0 0)` |
| Error | `--destructive` | `oklch(0.5771 0.2152 27.3250)` | `oklch(0.6368 0.2078 25.3313)` |

The theme has no semantic success color token yet.

## Typography

| Role | Font stack | Variable |
| --- | --- | --- |
| UI text | Inter, sans-serif | `--font-sans` |
| Metadata | JetBrains Mono, monospace | `--font-mono` |
| Headings | Playfair Display, serif | `--font-serif` and `--font-heading` |

The fonts are bundled under `app/fonts/` and loaded through `next/font/local` in the root layout.

## Components

Use shadcn/ui with the `base-nova` style and Base UI primitives. Generated primitives live in `components/ui/`; update them through the shadcn CLI. The generic TanStack Data Table composition lives in `components/data-table.tsx`.

Installed primitives: Button, Table, Card, Dialog, Toast, Alert, Tabs, Skeleton, Alert Dialog, Calendar, Context Menu, Dropdown Menu, Empty, Field, Menubar, and Questionnaire. Label and Separator support these components.

The theme base radius is `0.5rem`. Use the generated radius scale. Use Lucide React icons, generally `size-4` inline and `size-5` for prominent controls.
