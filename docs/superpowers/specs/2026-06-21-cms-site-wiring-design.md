# CMS ↔ Public Site Wiring (News slice + forms) — Design

**Date:** 2026-06-21
**Sub-project 1 of N** of the CMS↔site integration. Spans two subsystems (`saus-admin/server` + public site). This round: **News content** + **both public forms → CMS**. Events/campaigns/leadership/announcements follow the identical pattern in later rounds.

## Goal

Let the public site display **published** News from the CMS (with graceful fallback to existing hardcoded content) and route **all public forms** (contact + apply guidance) to the CMS — without the live site ever regressing when the CMS is unavailable.

## Hard dependency / verification

The CMS server + Postgres must be running for end-to-end "fully working." It is **not deployed** and **cannot run in this sandbox** (Node-v25/iCloud server hang). So: this round **builds** the wiring; **verification is the user's** (run `saus-admin/server` on :4000 with a seeded published article, or deploy). The fallback design guarantees the public site keeps working regardless.

## Architecture

```
CMS server (Express+Prisma)
  src/routes/public.ts  (NO auth)  GET /api/public/news → published NewsArticle[] (safe fields only)
  POST /api/contact (existing) gains optional `source` ("contact"|"guidance") stored on ContactMessage
Public site
  assets/saus-cms.js  (defer):
    CMS_BASE = localhost:4000/api (dev) | https://saus-admin-api.onrender.com/api (prod)  [hostname resolver]
    fetchPublic(path) → GET CMS_BASE+path, returns JSON or throws
    renderNews()  → on success replace hardcoded newsroom cards; on ANY error leave hardcoded content
  apply/index.html submitGuidanceForm() → POST CMS_BASE/contact {source:"guidance", ...} + graceful fallback
```

## CMS server changes

1. **Prisma:** add `source String @default("contact")` to `ContactMessage`.
2. **`POST /api/contact`** (`src/routes/contact.ts`): accept `source` in the zod schema (enum, default "contact"); store it.
3. **`src/routes/public.ts`** (new, no `authenticate`):
   - `GET /news`: `prisma.newsArticle.findMany({ where:{status:'PUBLISHED'}, orderBy:{publishedAt:'desc'}, take:12, select:{id,title,slug,excerpt,coverImage,publishedAt, author:{select:{name}}, category:{select:{name}}} })` → `{data:[...]}`. Select only safe fields (no body/internal).
   - Register in `index.ts`: `app.use('/api/public', publicRoutes)`. Public `/api/public` is covered by the existing CORS allowlist (CLIENT_URL + PUBLIC_SITE_URL) and the global `/api` rate limit.

## Public site changes

1. **`assets/saus-cms.js`** (new):
   - `CMS_BASE` via hostname (localhost/127.0.0.1/'' → `http://localhost:4000/api`, else `https://saus-admin-api.onrender.com/api`).
   - `fetchPublic(path)`: `fetch(CMS_BASE+path).then(r=>r.ok?r.json():Promise.reject(r))`.
   - `renderNews()`: `fetchPublic('/public/news').then(j => { if(!j.data||!j.data.length) return; replaceNewsroom(j.data); }).catch(()=>{/* keep hardcoded */})`. `replaceNewsroom` builds cards matching the existing newsroom card markup and swaps them into the news container; guards missing fields; dates formatted; cover image optional.
   - Auto-run on `DOMContentLoaded`.
   - Linked with `defer` on `index.html` (the SPA newsroom) — and any standalone `news/` page if present.
2. **Guidance form** (`apply/index.html` `submitGuidanceForm()`): replace the mailto construction with a `fetch` POST to `${CMS_BASE}/contact` (CMS_BASE re-derived locally, same resolver), body `{name, email, subject, message, source:'guidance'}` (fold province/aps/field/phone into `message`), with the same validation + success/"email Secretariat" fallback UX as the contact form. POPIA consent still required.

## Error handling / non-regression

- Any CMS fetch failure (offline, CORS, 5xx) → caught → existing hardcoded content stays; no console error surfaced to the user.
- Forms: failed POST → graceful "couldn't send — email Secretariat@saus.org.za" toast (existing pattern); never a silent success.
- Public endpoints expose only published, safe fields — no drafts, no author email/internal data.

## Files

- `saus-admin/server/prisma/schema.prisma` (add `source`), `src/routes/contact.ts` (accept source), `src/routes/public.ts` (new), `src/index.ts` (register).
- `assets/saus-cms.js` (new), `index.html` (link saus-cms.js; ensure newsroom container is selectable), `apply/index.html` (guidance form → CMS).

## Verification (user-run CMS)

1. Run CMS on :4000 (`prisma db push` adds `source`; seed/create a PUBLISHED article). Public site newsroom shows it; stop the CMS → newsroom reverts to hardcoded (no error).
2. Submit contact form → `ContactMessage` with `source:"contact"`; submit guidance form → `ContactMessage` with `source:"guidance"`.
3. No regressions: site loads fully with CMS down; console clean.

## Success criteria

- `/api/public/news` returns only published, safe-field articles; public site renders them when available, falls back cleanly when not.
- Both forms POST to the CMS with the correct `source`; graceful failure UX.
- Zero regression to the public site when the CMS is unavailable.
