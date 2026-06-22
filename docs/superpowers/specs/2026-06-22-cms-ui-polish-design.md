# CMS UI Polish — Design

**Date:** 2026-06-22
Targeted layout/interface repair for the SAUS admin CMS (`saus-admin/client`, Next.js + Tailwind). The CMS already has a solid design system (`.btn`/`.card`/`.input`/`.badge`/`.table-base`/`.nav-link`, responsive shell with a mobile sidebar overlay), so this is **repair + light polish, not a redesign**.

## Goal

Fix the one clearly-broken layout (Media Library grid) and apply a conservative consistency polish across dashboard pages — using the existing design-system classes, changing only what's actually off.

## Part 1 — Media Library grid (the real bug)

**Symptom:** tiles render at ragged, uneven heights instead of uniform squares (left columns tall, right columns short, nothing aligns).
**Cause:** the grid container's default `align-items: stretch` stretches each tile to the row track height, **overriding the tile's `aspect-square`** so square cropping never applies.
**Fix (`src/app/dashboard/media/page.tsx`, grid view ~line 141):** add `items-start` (and `content-start`) to the grid container so tiles keep their `aspect-square` height; verify tiles are uniform squares with even `gap`. If `aspect-square` still doesn't constrain, set an explicit square via the tile (`aspect-square` already present) — the stretch fix is the primary change. List view (line ~160) is unaffected.

## Part 2 — Conservative consistency polish

Walk each dashboard page and fix only **real** issues, reusing existing classes (no new design language):
- **Page headers:** consistent title size/weight + subtitle + spacing across pages (Dashboard, lists, editors).
- **Cards/tables:** ensure list pages use `.card` + `.table-base` consistently; even padding; consistent empty states.
- **Cover-image control** (news/events/campaigns editors): tidy the upload dropzone + preview sizing/spacing (it works post-upload-feature; just align styling).
- **Spacing/alignment:** fix any obvious misalignments, inconsistent gaps, or overflow.
Anything already consistent is left alone.

## Part 3 — Verify editors + responsiveness

Spot-check the News/Events/Campaigns create+edit forms and the layout at laptop/mobile widths (sidebar overlay, content wrapping, no horizontal overflow). Fix only genuine breakages.

## Constraints / non-regression

- Reuse the existing Tailwind tokens + component classes; do not introduce a new theme or restyle working components.
- No functional changes (routing, data, auth, upload) — visual/layout only.
- Apply every client edit to BOTH the repo tree (`saus-admin/client/src`, committed) and the running copy (`~/saus-dash-local/src`); the dashboard needs a restart (clear `.next`) to reflect changes.

## Files (expected)

- `src/app/dashboard/media/page.tsx` (grid fix).
- Selected `src/app/dashboard/*/page.tsx` + possibly `src/components/layout/*` and `src/app/globals.css` for shared polish — only where a real issue exists.

## Verification

1. Media Library: tiles are uniform squares, evenly spaced, aligned rows (browser screenshot).
2. Each touched page: visually consistent headers/cards/spacing; no regressions; no console errors.
3. Laptop + mobile widths: sidebar/overlay + content behave; no horizontal overflow.

## Success criteria

- Media grid renders as a clean uniform grid; touched pages look consistent using the existing design system; no functional or visual regressions; works at desktop + mobile widths.
