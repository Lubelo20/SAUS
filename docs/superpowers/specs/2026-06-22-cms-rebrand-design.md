# CMS Rebrand — Brand Typography + Accents — Design

**Date:** 2026-06-22
Make the SAUS admin CMS match the public site's branding. Colors already match (navy/green/gold/red-saus/cream in `tailwind.config.ts`). The gap is **typography + the "official" aesthetic**: CMS uses Inter + JetBrains Mono; the public site uses **EB Garamond** (serif headings), **Source Sans 3** (body), **Source Code Pro** (reference codes). Purely visual — no layout/functional changes; reuses existing component classes so it cascades.

## Part 1 — Load the brand fonts (`src/app/layout.tsx`)

Use `next/font/google` (self-hosted, no layout shift). Import and configure with CSS variables:
```ts
import { EB_Garamond, Source_Sans_3, Source_Code_Pro } from 'next/font/google';
const serif = EB_Garamond({ subsets: ['latin'], weight: ['500','600','700'], variable: '--font-serif', display: 'swap' });
const sans  = Source_Sans_3({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-sans', display: 'swap' });
const mono  = Source_Code_Pro({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-mono', display: 'swap' });
```
Add `${serif.variable} ${sans.variable} ${mono.variable}` to the root `<html>` (or `<body>`) className.

## Part 2 — Map fonts in Tailwind (`tailwind.config.ts`)

```ts
fontFamily: {
  sans:  ['var(--font-sans)',  'system-ui', 'sans-serif'],
  serif: ['var(--font-serif)', 'Georgia', 'serif'],
  mono:  ['var(--font-mono)',  'monospace'],
},
```
(Replaces Inter / JetBrains Mono; `serif` is new.)

## Part 3 — Apply the type system (`src/app/globals.css`)

- Body stays `font-sans` (now Source Sans 3) — already `body { @apply ... font-sans }`.
- **Headings serif:** add `h1, h2, h3 { @apply font-serif; }` in `@layer base` (or a `.page-title { @apply font-serif font-bold; }` helper). Page titles that currently render large/bold become EB Garamond.
- **Mono treatment:** the existing uppercase metadata already uses mono via `.label` / `.badge` / `.table-base th` / the sidebar section labels — these now resolve to Source Code Pro automatically through the `mono` family change. Verify `.label`, `.badge`, `.table-base th`, and the sidebar section/`ADMIN PORTAL` labels read as Source Code Pro (add `font-mono` where a class sets uppercase tracking but isn't already mono).

## Part 4 — "Official" accents

- **Page-header ref line:** add a small mono ref above each page title — `SAUS/CMS/<SECTION>` (uppercase, `text-[10px]/[11px] font-mono tracking-[0.15em] text-navy/40`). Implement once as a shared `PageHeader` pattern OR add inline to each page's header block where titles live (each dashboard page has a title + subtitle header). Mirrors the public site's `SAUS/OFFICIAL/2026`.
- **Sidebar:** the brand title "SAUS CMS" → `font-serif` (matches the public seal/name treatment); "ADMIN PORTAL" stays mono. Keep the existing green·gold·red SA-flag stripe at the sidebar top.
- **Header (top bar):** add a thin SA-flag accent stripe (a 2–3px row of green/gold/red, or the existing pattern) along the top of the `Header` component to echo the public site's topbar. Subtle.

## Constraints / non-regression

- Visual only — no routing, data, auth, or layout-structure changes.
- Reuse existing Tailwind tokens + component classes; do not restyle working components beyond font/accents.
- Apply edits to BOTH the repo tree (`saus-admin/client/src` + `tailwind.config.ts`, committed) and the running copy (`~/saus-dash-local`); restart the dashboard (clear `.next`) to load the new fonts.

## Files

- `src/app/layout.tsx` (fonts), `tailwind.config.ts` (families), `src/app/globals.css` (serif headings + mono application), `src/components/layout/Sidebar.tsx` + `Header.tsx` (serif brand title, header accent stripe). Page-header ref line: a shared snippet or per-page header edit (keep minimal — can start with the most-visited pages: dashboard + the list pages).

## Verification (dashboard running)

1. Dashboard + News/Pages render with **EB Garamond** titles, **Source Code Pro** refs/labels/badges/table-headers, **Source Sans 3** body.
2. The `SAUS/CMS/…` ref line + SA-flag header accent show; sidebar brand title is serif.
3. No console errors; nothing misaligned; login page also picks up the fonts.

## Success criteria

CMS visibly matches the public-site branding (serif headings + mono refs + SA palette/accents), looks clean and modern, with no layout/functional regressions.
