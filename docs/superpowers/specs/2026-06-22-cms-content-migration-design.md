# CMS Content Migration — Leadership · News · Events · Campaigns — Design

**Date:** 2026-06-22
Follows the verified News wiring (`2026-06-21-cms-site-wiring`). Migrates the **existing hardcoded public-site content** into the CMS and wires each public page to render from it — so the CMS becomes the source of truth. Pattern is identical to News, repeated for 4 content types.

## Goal

For Leadership, News, Events, Campaigns: (1) seed the real content currently hardcoded in `index.html` into the CMS, (2) expose a public read endpoint, (3) render each public page from the CMS with graceful fallback to the existing hardcoded markup.

## Architecture (3 parts × 4 types)

```
CMS server  src/routes/public.ts   + GET /api/public/{leadership,events,campaigns}   (news exists)
CMS server  prisma/seed-content.js  creates LeadershipProfile/NewsArticle/Event/Campaign rows from index.html content
Public site assets/saus-cms.js      + renderLeadership()/renderEvents()/renderCampaigns()  (renderNews exists)
Public site index.html              add container ids on the 4 pages so renderers have a target
```

## Part 1 — Seed (`saus-admin/server/prisma/seed-content.js`)

- Look up the admin user once: `const author = await prisma.user.findFirst({ where:{ role:'SUPER_ADMIN' } })` → use its `id` for `authorId` (news) / `createdById` (events, campaigns). LeadershipProfile needs no user.
- **Idempotent:** before creating each row, check existence by natural key (NewsArticle/Event/Campaign by `title`, LeadershipProfile by `name`); skip if present. Safe to re-run.
- **Cleanup:** delete the throwaway demo article titled exactly `SAUS Welcomes 2027 University Applications` and any `ContactMessage` rows with email `student@example.com` or `thabo@example.com` (the test submissions).
- Content is **extracted verbatim** from `index.html` (do not invent): 6 NEC profiles from `#page-leadership`, 7 items from `#page-news`, events from `#page-events`, campaigns from `#page-campaigns`. Preserve names, positions, dates, titles, excerpts, and image paths (`leadership/LeadersIMG/…`, etc.).
- Field mapping:
  - **LeadershipProfile:** name, position, university (nullable), photo (existing path), bio (the card blurb if any), email (nullable), order (0..n top-to-bottom as on the page), `isActive:true`, necYear (e.g. `'2025-2026'`).
  - **NewsArticle:** title, slug (`slugify(title)+'-'+i`), excerpt, content (use the item body text; if only a headline exists, repeat the excerpt as content — content is required), coverImage (nullable), `status:'PUBLISHED'`, `publishedAt:new Date(<item date>)`, authorId, readTimeMinutes (`Math.max(1, Math.ceil(words/200))`).
  - **Event:** title, slug, description (Text), shortDescription, venue/city/province (nullable), `startDate:new Date(<event date>)` (required — if a date is a range/approx, use the start), endDate (nullable), bannerImage (nullable), `status:'PUBLISHED'`, createdById.
  - **Campaign:** title, slug, description (Text), graphic (nullable), ctaLabel/ctaUrl (nullable), `status:'PUBLISHED'`, createdById.
- Log a summary (created vs skipped per type). End with `await prisma.$disconnect()`.

## Part 2 — Public endpoints (`src/routes/public.ts`)

Add three handlers (no auth, safe fields only, mirror `/news`):
- `GET /leadership` → `prisma.leadershipProfile.findMany({ where:{isActive:true}, orderBy:{order:'asc'}, select:{ id,name,position,university,photo,bio,email,necYear } })`.
- `GET /events` → `prisma.event.findMany({ where:{status:'PUBLISHED'}, orderBy:{startDate:'desc'}, take:24, select:{ id,title,slug,shortDescription,description,bannerImage,venue,city,province,startDate,endDate,registrationUrl } })`.
- `GET /campaigns` → `prisma.campaign.findMany({ where:{status:'PUBLISHED'}, orderBy:{createdAt:'desc'}, take:24, select:{ id,title,slug,description,graphic,ctaLabel,ctaUrl,startDate,endDate } })`.
- Each wrapped in try/catch → 500 json, returning `{ data: [...] }`.

## Part 3 — Public-site wiring (`assets/saus-cms.js` + `index.html`)

- Add container ids in `index.html` (the renderer swaps `innerHTML` of these; keep existing markup as the fallback if the fetch fails):
  - `#page-leadership` profile grid → `id="leadershipGrid"`
  - `#page-events` list → `id="eventsList"`
  - `#page-campaigns` list → `id="campaignsList"`
- In `saus-cms.js`, add `renderLeadership()`, `renderEvents()`, `renderCampaigns()` following `renderNews()` exactly: fetch the endpoint; if `data.length` swap `innerHTML` with cards built to match the existing markup classes (so styling is unchanged); on empty/error do nothing (keep hardcoded). Call all four in `init()`.
- **Card markup must reuse the existing CSS classes** on each page (inspect `#page-leadership`/`#page-events`/`#page-campaigns` for the card structure and replicate it) so CMS-rendered content looks identical to the hardcoded version. `esc()` all interpolated text.

## Error handling / non-regression

- Every render is wrapped: any failure (CMS down, CORS, empty) → leave the page's hardcoded markup untouched. Verified for News already.
- Endpoints expose only published/active rows and the whitelisted fields above.
- Seed is idempotent; never duplicates.

## Files

- Create: `saus-admin/server/prisma/seed-content.js`.
- Modify: `saus-admin/server/src/routes/public.ts` (+3 endpoints), `assets/saus-cms.js` (+3 renderers, call in init), `index.html` (+3 container ids).

## Verification (CMS running on :4400, dashboard :3300)

1. `node prisma/seed-content.js` → "created" counts; re-run → all "skipped" (idempotent); test article gone.
2. Public site: `/leadership` shows the 6 NEC from CMS; `/events`, `/campaigns`, `/news` show the migrated content. Each matches the prior hardcoded look.
3. Dashboard lists the same content; editing an item changes the public page after reload.
4. Stop API → every page falls back to hardcoded; console clean.

## Success criteria

- All four content sets exist in the CMS (via idempotent seed) and render on the public pages from the CMS, visually identical to the hardcoded versions, with clean fallback when the API is down. Test/demo rows removed.
