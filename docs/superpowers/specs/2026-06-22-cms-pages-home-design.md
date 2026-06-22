# CMS Pages — Home — Design

**Date:** 2026-06-22
Second page in the CMS-Pages series (pattern established by About, PR #4). **Reuses the generic `Page` model + `/api/pages/:slug` + `/api/public/page/:slug` — no new server routes.** Only a seed, a dashboard editor, and public wiring for slug `home`.

## Data contract — `content` JSON for slug "home"

```json
{
  "hero": { "ref": "SAUS/OFFICIAL/2026 · National Representative Body",
            "title": "Empowering Student Voices. Advancing Higher Education.",
            "lead": "The South African Union of Students (SAUS) is the official representative body for students across all 26 public universities in the Republic of South Africa. Education is a constitutional right — we ensure it is treated as such." },
  "stats": [ { "num": "26", "label": "Public Universities Represented" },
             { "num": "2006", "label": "Year of Establishment" },
             { "num": "9th", "label": "National Executive Congress (2025)" },
             { "num": "1M+", "label": "Students Represented" } ],
  "mandate": { "ref": "SAUS/MANDATE/2026", "title": "What We Stand For",
               "lead": "SAUS was constituted to consolidate and strengthen student representation in governance of Higher Education and Training across all 26 public universities in South Africa.",
               "pillars": [ { "title": "Mission", "text": "To consolidate and strengthen students' views …" },
                            { "title": "Vision", "text": "A unified, equitable, non-sexist, non-racial, and democratic education system …" },
                            { "title": "Equity & Justice", "text": "Advocating for fair, inclusive, and accessible education …" },
                            { "title": "Unity & Solidarity", "text": "Building collective student strength …" } ],
               "quote": { "text": "Education is a right, not a privilege — SAUS ensures every student, regardless of background, has access to affordable, quality, and inclusive higher education.",
                          "cite": "South African Union of Students — Constitutional Mandate" } },
  "campaigns": { "ref": "SAUS/CAMPAIGNS/2025–2026", "title": "Priority Campaign Areas",
                 "lead": "The following campaigns represent the foremost policy advocacy priorities of the 9th National Executive Committee as resolved at the National Elective Congress, 2025.",
                 "cards": [ { "title": "NSFAS Reform", "text": "Redesigning the National Student Financial Aid Scheme …" },
                            { "title": "Historical Debt Relief", "text": "Compelling government to clear historical student debt …" },
                            { "title": "GBV on Campuses", "text": "Investigating GBV and Femicide policies across all 26 institutions …" } ] },
  "eventsCta": { "ref": "SAUS/EVENTS/2026", "title": "Upcoming Engagements",
                 "lead": "National congresses, student leadership summits, policy town halls, and campus activations across the Republic of South Africa." }
}
```
All strings extracted **verbatim** from `index.html` `#page-home` (lines ~113–344). Icons/colours/CTA buttons/the logos marquee/the recent-statements teaser are NOT in the JSON (chrome / already-CMS news). Stat `num` flattened to plain strings (`9th`, `1M+`) — same convention as About.

## Deliverables

### A — Server (seed only)
`saus-admin/server/prisma/seed-pages-home.js` — idempotent `prisma.page.upsert({ where:{slug:'home'}, … })`, `title:'Home'`, `content` = the JSON above (verbatim from `#page-home`). Mirror `seed-pages-about.js`. (No route/model changes — the generic ones exist.)

### B — Dashboard editor
- `saus-admin/client/src/app/dashboard/pages/home/page.tsx` — bespoke editor mirroring the JSON: hero (ref/title/lead), stats[4] {num,label}, mandate (ref/title/lead + pillars[4] {title,text} + quote {text,cite}), campaigns (ref/title/lead + cards[3] {title,text}), eventsCta (ref/title/lead). Same shape/conventions as the About editor (`GET/PUT /api/pages/home`, Bearer `saus_token`, `react-hot-toast`, design-system classes, collapsible sections, add/remove/reorder rows, `normalize()` default-merge).
- `saus-admin/client/src/app/dashboard/pages/page.tsx` — make the **Home** card a live link to `/dashboard/pages/home` (remove its "Coming soon" disabled state).

### C — Public wiring
- `index.html` `#page-home` — add `data-cms` hooks on singletons (`hero.ref/title/lead`, `mandate.ref/title/lead`, `mandate.quote.text/cite`, `campaigns.ref/title/lead`, `eventsCta.ref/title/lead`) and repeatable container ids: `#homeStats` (`.stat-grid`), `#homePillars` (`.pillar-grid`), `#homeCampaigns` (the campaigns `.grid-3`). Keep existing markup as fallback.
- `assets/saus-cms.js` `renderHomePage()` — same pattern as `renderAboutPage()`: guard on `#page-home`; fetch `/public/page/home`; set `textContent` of `[data-cms]` nodes via `getPath`; clone-and-fill the repeatable containers (stat-cell → num/label; pillar → h4/p; info-card → h4/p) preserving icon/colour chrome; no-op on failure. Call in `init()`. (Reuse the existing `getPath`/`rebuild` helpers from the About work if present.)

## Verification

1. `node prisma/seed-pages-home.js` → `/api/public/page/home` returns the JSON.
2. Dashboard → Pages → Home: form loads all values; edit hero title + a pillar → Save → reload public home → changes show; layout unchanged; API down → hardcoded; console clean.

## Success criteria

Home content fully editable in the CMS; public home renders from CMS with fallback; no regression. Same pattern as About — confirms reusability for Contact/NSFAS.
