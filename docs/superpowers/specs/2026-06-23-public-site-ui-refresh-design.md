# Public-Site UI Refresh — Design Spec

**Date:** 2026-06-23
**Branch:** `feature/public-ui-program`
**Status:** Design — awaiting user review

## 1. Goal

Make the SAUS public website look **clean and professional** through a *cohesive refresh of the shared design system* (`assets/saus.css`), not a layout rewrite. Improvements are made once in the design system and propagate to every page.

User-confirmed pain points (all four selected): too cluttered/dense, typography & spacing, colour/contrast usage, cards/sections/imagery.

## 2. Design direction (chosen via visual brainstorm)

A blend, decided screen-by-screen with the user:

- **Foundation: "Refined Institutional"** — keep the SAUS brand and gravitas (navy/gold/green, EB Garamond serif headings, Source Sans 3 body). Restrained colour, editorial hierarchy.
- **Hero: "Photo hero, refined overlay"** — full-bleed hero photo (client's own congress/campus images) with a clean left→right navy gradient so the headline is always legible; gold kicker label, large serif title, lead line, two buttons.
- **Sections & cards: "Airy & Soft"** — more whitespace, larger type, **soft floating cards** (borderless, subtle shadow, rounded corners), open stat rows.

Net feel: institutional restraint in colour/brand + modern openness in spacing and cards = "clean, professional, modern-premium."

## 3. The design-system changes

All values below are defined as tokens / classes in `assets/saus.css`. Existing class names are reused where possible so pages need minimal markup changes.

### 3.1 Spacing scale (fixes "cluttered/dense")
Adopt a consistent spacing scale and apply it generously:
`--space-1:4px --space-2:8px --space-3:12px --space-4:16px --space-6:24px --space-8:32px --space-12:48px --space-16:64px --space-24:96px`
- Major section vertical padding: **64–96px** desktop, scaling down ~40–56px on mobile.
- Card padding: **24px**. Grid gaps: **24–28px**.
- Increase whitespace between header stack and content, and between stacked blocks.

### 3.2 Typography (fixes "typography & spacing")
Refined modular scale (desktop; clamp down on mobile):
- h1/hero: EB Garamond 700, ~clamp(34px–52px), line-height 1.05
- h2/section: EB Garamond 700, ~28–32px, line-height 1.1
- h3/card: EB Garamond 600, ~17–18px
- body: Source Sans 3 400, 16px, **line-height 1.6**, max-width ~68ch for prose
- kicker/label: Source Sans 3 600, 10–11px, uppercase, letter-spacing .14–.18em, gold
- Consistent paragraph spacing; remove cramped line-heights.

### 3.3 Colour & contrast (fixes "colour/contrast")
- **Restraint:** white and cream dominate; navy for headings/text; **gold used only as accent** (kickers, thin rules, small chips); green/red sparingly (status, SA-flag strip).
- Replace heavy full-bleed colour blocks with **white/cream section alternation** for separation.
- Keep AA contrast (already met) and `:focus-visible`, skip links, reduced-motion (already in place — preserve).

### 3.4 Cards (fixes "cards/sections/imagery")
Refresh the shared card classes (`.panel`, `.info-card`, `.pillar`, news/event/campaign cards):
- Borderless **white**, `border-radius:14px`, soft shadow `0 8px 28px rgba(10,22,40,.09)`, padding 24px.
- Optional small accent chip/icon (green/gold tint) instead of heavy coloured borders.
- Subtle **hover lift** (translateY(-2px) + slightly deeper shadow), reduced-motion safe.
- Retire dated/heavy bordered card looks.

### 3.5 Section headers
Standard pattern everywhere: **gold kicker (uppercase label + short rule) + serif h2**, generous bottom margin. One reusable structure (`.sec-header` / `.sec-head`).

### 3.6 Hero (home)
Refined photo hero: client photo background + `linear-gradient(90deg, navy .92 → navy .25)` overlay, kicker, serif h1, lead, primary (gold) + ghost buttons. Legible at all widths; mobile stacks and increases overlay opacity.

### 3.7 Imagery
Consistent treatment: `object-fit:cover`, rounded corners on framed images, subtle overlays; gallery tiles already uniform — align radius/shadow with new cards.

### 3.8 Buttons & stats
- Buttons: consistent radius (~6px), clear sizes (sm/base/lg), navy/gold/outline variants, refined hover (micro-lift). Reuse existing `.btn` system; tidy values.
- Stats: large serif numerals + small uppercase labels, open/airy row (no heavy boxes).

### 3.9 Motion
Keep existing cross-page view transitions + `scrollbar-gutter:stable`. Card/button hover lifts only; all gated by `prefers-reduced-motion`.

## 4. Scope & rollout

**Home first, then all** (user choice).

1. **Phase 1 — Design system + Home (reference):** update `assets/saus.css` tokens/type/spacing/cards/section-headers/hero/buttons/stats; apply to `index.html` (hero markup + section-header + card classes). Get it right here.
2. **Phase 2 — Roll out to all pages:** about, contact, nsfas, apply, campaigns, leadership, news, events, gallery.
3. **Inline-CSS pages:** campaigns/leadership/news/events/gallery (and apply/nsfas partially) carry duplicated inline design-system CSS that would *override* the refreshed `saus.css`. As part of rollout, **remove/align those inline duplicates** so the shared system governs (single source of truth) — keeping only genuinely page-specific styles. This also resolves the drift we already hit (e.g. NSFAS nav, mobile header height).

## 5. Non-goals (YAGNI)

- No new pages, sections, or content; no copy rewriting; no fabricated data.
- No framework/build step; stays vanilla static.
- No change to the data pipeline or CMS.
- No re-architecting navigation (header was just unified — preserve it).

## 6. Constraints & risks

- **Live official site** — preserve all existing content and the SAUS brand; no fabricated names/figures.
- **Don't break:** the unified header, the `apply/` university detail modal (historically fragile), CMS-driven content rendering (`assets/saus-cms.js` hooks/ids), forms.
- **Accessibility:** keep AA contrast, focus-visible, skip links, reduced-motion.
- **Environment:** serve via `python3 -m http.server 8080`; hard-refresh (⌘⇧R) after CSS edits (cache); iCloud read quirks.
- **Verification:** browser-check home + a sample of each page type at desktop and mobile widths before calling done.

## 7. Acceptance criteria

- `index.html` reflects the chosen hero + airy/soft sections + refined type/spacing/colour, verified in-browser (desktop + mobile).
- All 10 pages share the refreshed system with no inline overrides re-introducing drift; header remains uniform.
- No content lost; apply modal, forms, and CMS rendering still work.
- Accessibility checks intact.
- Looks measurably cleaner/more professional vs current (whitespace, hierarchy, card polish).

## 8. Open questions / deferred

- Whether to fully delete vs. trim the inline `<style>` blocks on the 5 section pages (decide during implementation per-page; default: trim header/system rules, keep page-specific).
- Exact hero photos per page (use existing `gallery/galleryIMG/` assets; no new images sourced).
