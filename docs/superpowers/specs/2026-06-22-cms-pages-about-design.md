# CMS Pages — About (the pattern) — Design

**Date:** 2026-06-22
First of the "every site page editable in the CMS" sub-projects (Home/About/Contact/NSFAS). **About** establishes the reusable pattern: one `Page` model (slug + JSON `content`), a bespoke per-page editor, a public endpoint, and a `saus-cms.js` renderer that fills the existing static layout from the CMS with graceful fallback. **Fully structured** — every text element is editable; fixed visual chrome (icons, colours, layout) stays in the static page.

## Architecture

```
Server  prisma: model Page { id, slug @unique, title, content Json, updatedAt }
Server  routes/pages.ts (AUTH)  GET /api/pages/:slug · PUT /api/pages/:slug   (dashboard editor)
Server  routes/public.ts        GET /api/public/page/:slug → { data: content }  (public, no auth)
Server  prisma/seed-pages-about.js  upsert Page slug="about" with content extracted verbatim from index.html
Client  app/dashboard/pages/page.tsx       list of editable Pages (nav: CONTENT → "Pages", under Leadership)
Client  app/dashboard/pages/about/page.tsx bespoke About editor form (reads/writes content JSON)
Public  index.html #page-about              add ids/data-cms hooks on each editable element
Public  assets/saus-cms.js  renderAboutPage()  fill elements from /public/page/about; no-op on failure
```

## Data contract — `content` JSON for slug "about"

```json
{
  "hero": { "ref": "SAUS/ABOUT/2026 · Institutional Overview",
            "title": "About the South African Union of Students",
            "lead": "A constitutional overview of SAUS — its establishment, mandate, institutional history, and continental standing as South Africa's official national student body." },
  "stats": [ { "num": "26", "label": "Public Universities Represented" },
             { "num": "2006", "label": "Year of Establishment" },
             { "num": "9th", "label": "National Executive Congress" },
             { "num": "1M+", "label": "Students Represented" } ],
  "profile": { "ref": "SAUS/PROFILE/2026", "title": "Institutional Profile",
               "lead": "SAUS is the only body mandated to represent all students across all 26 public universities in the Republic of South Africa.",
               "rows": [ { "field": "Full Designation", "details": "South African Union of Students (SAUS)" }, … 10 rows verbatim from the table ] },
  "mission": "To consolidate and strengthen students' views …",
  "vision": "A unified, equitable, non-sexist, non-racial, democratic … education system …",
  "values": { "ref": "SAUS/VALUES/2026", "title": "Core Values", "lead": "The values that govern …",
              "cards": [ { "title": "Non-Racial", "text": "Opposing all forms …" }, … 6 cards ] },
  "history": { "ref": "SAUS/HISTORY/2026", "title": "Historical Background", "lead": "SAUS represents a historic milestone …",
               "intro": "Students have played an instrumental role …",
               "timeline": [ { "year": "1960s", "title": "Emergence of Student Structures", "body": "…" }, … 7 items ] },
  "continental": { "ref": "SAUS/CONTINENTAL/2026", "title": "Continental Presence", "lead": "SAUS situates …",
                   "cards": [ { "title": "Pan-African Solidarity", "text": "…" }, … 3 cards ],
                   "quote": { "text": "The struggles of South African students …", "cite": "SAUS 9th National Congress — Continental Solidarity Resolution, 2025" } }
}
```
All strings extracted **verbatim** from `index.html` `#page-about` (lines ~354–582). Icons/colours/the sidebar/CTA behaviour are NOT in the JSON — they stay in the static page.

## Server

1. **Prisma `Page` model** (above) → `prisma db push` (no destructive change). Add `Page[]`-free; standalone.
2. **`routes/pages.ts`** (mount `/api/pages`, `router.use(authenticate)` + EDITABLE_ROLES): `GET /:slug` → the Page (404 if absent); `PUT /:slug` → upsert `{ title, content }` (zod: content is any-object), log ActivityLog. Register in `index.ts`.
3. **`routes/public.ts`** add `GET /public/page/:slug` (no auth) → `prisma.page.findUnique({where:{slug}})` → `{ data: page?.content ?? null }`.
4. **`prisma/seed-pages-about.js`** — idempotent upsert of slug `about` with the JSON above (title "About SAUS").

## Client (dashboard)

5. **Nav:** add a "Pages" item to the CONTENT group in `components/layout/Sidebar.tsx`, under Leadership (icon e.g. `FileText`), → `/dashboard/pages`.
6. **`app/dashboard/pages/page.tsx`** — a simple card/list of editable pages (About, Home, Contact, NSFAS) linking to each editor; only About is wired now (others show "coming soon" / link disabled).
7. **`app/dashboard/pages/about/page.tsx`** — bespoke editor: `GET /api/pages/about`, render a form mirroring the JSON (text inputs/textareas for hero/mission/vision/section refs+titles+leads; repeatable row editors for stats[4], profile.rows, values.cards[6], history.timeline[7], continental.cards[3], + quote). Add/remove/reorder rows. Save → `PUT /api/pages/about`. Reuse `.input`/`.label`/`.btn`/`.card` + toast. Group fields under section headings; collapsible sections welcome.

## Public wiring

8. **`index.html` `#page-about`** — add stable hooks so the renderer can target each element without changing layout: give editable text nodes `data-cms` attributes (e.g. `data-cms="hero.title"`, `data-cms="stats.0.num"`, `data-cms="values.cards.2.text"`) OR ids; repeatable groups get a container id (`#aboutStats`, `#aboutProfileRows`, `#aboutValues`, `#aboutTimeline`, `#aboutContinental`). Keep all existing markup as fallback.
9. **`assets/saus-cms.js` `renderAboutPage()`** — fetch `/public/page/about`; if `data`, set text of each `[data-cms]` node from the JSON path, and rebuild each repeatable container's children from its array (matching the existing card/row/timeline markup + classes). On empty/error: no-op (keep hardcoded). Call in `init()` (guard: only runs if `#page-about` exists).

## Error handling / non-regression

- Every field render is guarded; missing JSON path → leave the static value. Whole renderer no-ops on fetch failure → page unchanged when CMS down.
- Public endpoint exposes only the page content JSON (no internal fields).
- Editor validates non-empty title; content saved as-is.

## Verification (CMS running)

1. `prisma db push` + `node prisma/seed-pages-about.js` → `GET /api/public/page/about` returns the JSON.
2. Dashboard → CONTENT → Pages → About: form shows all current values; edit the hero title + a core-value text + add a timeline item → Save.
3. Reload public About page → the edits appear; layout unchanged; API down → original hardcoded content shows; console clean.

## Success criteria

- About page content fully editable in the CMS via structured fields; public About renders from the CMS, visually identical, with clean fallback. Pattern (Page model + `/api/pages` + `/public/page/:slug` + per-page editor + `renderAboutPage`) is reusable for Home/Contact/NSFAS next.
