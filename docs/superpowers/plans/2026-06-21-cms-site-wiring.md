# CMS↔Site Wiring (News + forms) Implementation Plan

> REQUIRED SUB-SKILL: superpowers:executing-plans. Checkboxes track progress. Verification is USER-RUN (CMS not runnable in sandbox).

**Goal:** Public site shows published CMS News (with fallback) and routes both public forms to the CMS.

**Architecture:** New unauth `GET /api/public/news`; `ContactMessage.source`; `assets/saus-cms.js` client + newsroom render with fallback; guidance form → CMS.

## Global Constraints
- No regression when CMS down (catch → keep hardcoded). No `alert()`/blocking dialogs. Safe fields only on public endpoint. CMS_BASE resolver: localhost:4000/api dev, https://saus-admin-api.onrender.com/api prod. git commits hang (user commits).

---
### Task 1: CMS server — source field + public news endpoint
- [ ] **Step 1:** `prisma/schema.prisma` — add to `ContactMessage`: `source String @default("contact")`.
- [ ] **Step 2:** `src/routes/contact.ts` — add `source: z.enum(['contact','guidance']).default('contact')` to the zod schema; include `source: parsed.data.source` in `prisma.contactMessage.create`.
- [ ] **Step 3:** Create `src/routes/public.ts` (NO authenticate): `GET /news` → `prisma.newsArticle.findMany({where:{status:'PUBLISHED'},orderBy:{publishedAt:'desc'},take:12,select:{id:true,title:true,slug:true,excerpt:true,coverImage:true,publishedAt:true,author:{select:{name:true}},category:{select:{name:true}}}})` → `res.json({data:articles})`; wrap in try/catch → 500 json.
- [ ] **Step 4:** `src/index.ts` — `import publicRoutes from './routes/public';` and `app.use('/api/public', publicRoutes);` (after other routes).
- [ ] **Step 5 (USER):** `npx prisma db push` (adds source col); `npm run build` typechecks. (Can't run in sandbox.)

### Task 2: Public site — saus-cms.js + newsroom render
- [ ] **Step 1:** Create `assets/saus-cms.js` (CMS_BASE resolver, fetchPublic, renderNews replacing `#newsList` children on success, catch→keep hardcoded; run on DOMContentLoaded).
- [ ] **Step 2:** `index.html` — add `id="newsList"` to the News List container (line ~913, the `<div>` right after `<!-- News List -->`); add `<script src="/assets/saus-cms.js" defer></script>` before `</body>`.
- [ ] **Step 3 (GATE):** Load `index.html` with CMS DOWN → newsroom shows existing hardcoded items, console clean (fetch error caught silently).

### Task 3: Guidance form → CMS
- [ ] **Step 1:** `apply/index.html` — rewrite `submitGuidanceForm()` to validate (non-blocking, no alert), POST to `${CMS_BASE}/contact` with `{name,email,subject,message,source:'guidance'}` (fold phone/province/field/aps/help into message), show success on ok / "email Secretariat" fallback on error; keep ref number.
- [ ] **Step 2 (GATE):** Load apply, submit guidance form with CMS down → fallback message (no alert, no crash); console clean.

### Task 4: Verification (user-run CMS)
- [ ] Run CMS :4000 + seed a PUBLISHED article → newsroom shows it; submit both forms → ContactMessage rows with source contact/guidance.
