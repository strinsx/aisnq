# Progress Tracker

## Current Phase

- Complete: design system foundation and Next.js starter cleanup.

## Completed

- Added the `base-nova` shadcn/ui configuration and requested Base UI components.
- Applied the specified tweakcn light and dark theme tokens.
- Added the generic TanStack Data Table composition and shared `cn()` helper.
- Bundled Inter, Playfair Display, and JetBrains Mono locally through `next/font/local`.
- Replaced the Create Next App page, metadata, README, and starter assets with AISNQ foundation content.

## Architecture Decisions

- Pin `@base-ui/react` to 1.8.0 for compatibility with the generated components.
- Use the official `lucide-react` package for the requested icons.
- Keep Data Table outside `components/ui/` because it is a composition rather than a generated primitive.
- Keep the generated `components/ui/` files unchanged after installation.
- Load the three bundled fonts locally for builds without a font download.

## Next Up

- Build application flows against the relevant feature specifications.
