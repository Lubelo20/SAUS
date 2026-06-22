# CMS Pages — NSFAS — Design

**Date:** 2026-06-22
Fourth/last CMS-Pages sub-project. Reuses the generic `Page` model + routes (PR #4). **NSFAS is a STANDALONE page** (`nsfas/index.html`, ~1021 lines), not an SPA section — so `assets/saus-cms.js` must be **linked into `nsfas/index.html`** (it currently is not), and the renderer guards on an NSFAS marker.

## Data contract — `content` JSON for slug "nsfas"

Same per-section shape as About/Home. Every section is `{ ref, title, lead, items: [...] }`. Subagents READ `nsfas/index.html` and extract every string **verbatim** (decode HTML entities to real characters).

```
{
  "hero":      { "ref", "title", "lead" },
  "covers":    { "ref", "title", "lead", "items": [ { "title", "text" } ] },   // "What NSFAS Covers"
  "qualify":   { "ref", "title", "lead", "items": [ { "title", "text" } ] },   // "Do You Qualify?" criteria
  "documents": { "ref", "title", "lead", "items": [ { "title", "text" } ] },   // "Required Documents" (6)
  "steps":     { "ref", "title", "lead", "items": [ { "title", "text" } ] },   // "Application Steps" (7)
  "dates":     { "ref", "title", "lead", "items": [ { "label", "value" } ] },  // "Important Dates"
  "tips":      { "ref", "title", "lead", "items": [ { "text" } ] },            // "Tips & Common Mistakes"
  "help":      { "ref", "title", "lead", "items": [ { "title", "text" } ] }    // "Get Help" contacts
}
```
If a section has no `ref`/`lead` in the markup, store `""`. For each `items[]`, map the section's repeated block (card/step/doc/date-row/tip/contact) to the listed fields; put the primary text in `text` (or `value` for dates) and the heading in `title` (or `label` for dates). Icons/colours/links/step-numbers are chrome — NOT stored.

## Deliverables

### A — Server seed (`saus-admin/server/prisma/seed-pages-nsfas.js`)
Idempotent upsert of slug `nsfas` (`title:'NSFAS Guide'`), `content` = the JSON above with all strings extracted **verbatim** from `nsfas/index.html` (read the whole file; sections at the headings: What NSFAS Covers ~L334, Do You Qualify ~L396, Required Documents ~L508, Application Steps ~L598 with 7 steps L609–696, Important Dates ~L713, Tips ~L782, Get Help ~L899). Mirror `seed-pages-about.js`. Report the section keys + item counts.

### B — Dashboard editor
- `saus-admin/client/src/app/dashboard/pages/nsfas/page.tsx` — bespoke editor mirroring the About editor (collapsible sections, `GET/PUT /api/pages/nsfas`, Bearer, react-hot-toast, `normalize()`, repeatable rows with add/remove/reorder). One collapsible section per top-level key (hero + covers/qualify/documents/steps/dates/tips/help), each with its ref/title/lead + its repeatable items ({title,text}, or {label,value} for dates, {text} for tips). Form state shape == the JSON contract exactly.
- `saus-admin/client/src/app/dashboard/pages/page.tsx` — make **NSFAS** a live link (`href:'/dashboard/pages/nsfas'`, `ready:true`).

### C — Public wiring
- `nsfas/index.html`:
  - **Link the client** before `</body>`: `<script src="/assets/saus-cms.js" defer></script>` (match how index.html links it).
  - Add `data-cms` on each section's singleton `ref`/`title`/`lead` nodes (`hero.ref`, `covers.title`, `qualify.lead`, … per the JSON paths). Add a repeatable container id per section: `#nsfasCovers`, `#nsfasQualify`, `#nsfasDocuments`, `#nsfasSteps`, `#nsfasDates`, `#nsfasTips`, `#nsfasHelp` (on the element wrapping that section's repeated blocks). Keep existing markup as fallback. (Hero `data-cms="hero.title"` etc.)
- `assets/saus-cms.js` `renderNsfasPage()` — mirror `renderAboutPage()`: **guard on a NSFAS marker** (e.g. `document.getElementById('nsfasSteps')` or a body/page id present only on the NSFAS page) so it no-ops elsewhere; fetch `/public/page/nsfas`; set `textContent` of `[data-cms]` singletons via `getPath`; clone-and-fill each `#nsfas<Section>` container from its `items[]` (clone the existing child, rewrite its text nodes, preserving chrome); no-op on failure. Call `renderNsfasPage()` in `init()`. (The other renderers already no-op when their targets are absent, so loading saus-cms.js on the NSFAS page is safe.)

## Verification (CMS running)
1. `node prisma/seed-pages-nsfas.js` → `/api/public/page/nsfas` returns the JSON (all 7 sections + counts).
2. Dashboard → Pages → NSFAS: loads all values; edit hero + a step → Save → reload `nsfas/index.html` → changes show; layout unchanged; API down → hardcoded; console clean.

## Success criteria
NSFAS guide content fully editable in the CMS; the standalone page renders from CMS with fallback; no regression. Completes the CMS-editable-pages set (About, Home, Contact, NSFAS).
