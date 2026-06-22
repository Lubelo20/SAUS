# CMS Image Upload → Public Site — Design

**Date:** 2026-06-22
Closes the gap so an image uploaded in the CMS appears on the public site. Builds on the content migration + the media-URL fix. Public endpoints already select the image fields; this wires upload persistence + public rendering.

## Goal

Uploading a cover/banner/graphic on a News/Event/Campaign (or a photo in the Media Library) in the dashboard makes that image show on the corresponding public page — with no regression to existing image-less content.

## Three gaps being closed

1. **Editor "upload" is fake:** News/Events/Campaigns create+edit forms call `URL.createObjectURL(file)` (a throwaway `blob:` preview) instead of uploading. → wire a real upload.
2. **Public renderers show no images:** `newsCard`/`eventCard`/`campaignCard` in `assets/saus-cms.js` render text only. → render the image when present.
3. **Public media URLs unresolved:** `/api/public/media` returns the raw stored `url` (a filename for uploads). → resolve to absolute like `/api/media` already does.

## Part 1 — Real uploads (client)

**Reusable helper** — add `src/lib/upload.ts` (or co-locate if no `lib` exists) exporting:
```ts
export async function uploadFile(file: File): Promise<string> {
  const token = localStorage.getItem('saus_token');
  const body = new FormData(); body.append('file', file);
  const base = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:4400/api
  const res = await fetch(`${base}/media/upload`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body });
  if (!res.ok) throw new Error('Upload failed');
  const j = await res.json();
  return j.url as string; // absolute URL from the (fixed) media route
}
```
**Wire into editors** — in each of:
- `dashboard/news/create/page.tsx` + `dashboard/news/[id]/edit/page.tsx` (`coverImage`)
- `dashboard/events/create/page.tsx` + `dashboard/events/[id]/edit/page.tsx` (`bannerImage`)
- `dashboard/campaigns/create/page.tsx` + `dashboard/campaigns/[id]/edit/page.tsx` (`graphic`)

Replace the file-input `onChange` body that currently does `update('<field>', URL.createObjectURL(file))` with:
```ts
const file = e.target.files?.[0]; if (!file) return;
try { setUploading(true); const url = await uploadFile(file); update('<field>', url); }
catch { toast.error('Image upload failed'); }
finally { setUploading(false); }
```
Add a local `uploading` state and show "Uploading…" on the upload control while in flight. Keep the existing remove-image button. (Use whatever toast util the app already uses; if none, a simple inline error message.)

## Part 2 — Public display

**`src/routes/public.ts` `/media`** — resolve URLs (mirror the `/api/media` fix):
```ts
const baseUrl = process.env.APP_URL || 'http://localhost:4400';
const data = media.map(m => ({ ...m, url: m.url && m.url.startsWith('http') ? m.url : `${baseUrl}/uploads/${m.filename}` }));
```
Add `filename: true` to the `/media` `select` so the fallback has it. Return `{ data }`.

**`assets/saus-cms.js`** — render images only when present (`esc()` the URL):
- `newsCard`: if `a.coverImage`, prepend `<div class="news-cover"><img src="..." alt=""></div>` (or an inline-styled wrapper consistent with `.news-item`). Keep layout sane when absent.
- `eventCard`: if `e.bannerImage`, add a small thumbnail consistent with `.event-row`.
- `campaignCard`: if `c.graphic`, add the image in the resolution body.
Image markup uses `object-fit:cover`, bounded height, lazy `loading="lazy"`. No image → unchanged from today.

## Error handling / non-regression

- Renderers add an `<img>` only when the field is truthy → existing image-less content looks identical.
- Failed upload → toast/inline error, field unchanged (never store a broken URL).
- Public pages still fall back to hardcoded markup if the API is unreachable.
- Uploaded files served from the CMS (`<api host>/uploads/<file>`); cross-origin `<img>` loads need no CORS.

## Files

- Create: `saus-admin/client/src/lib/upload.ts`.
- Modify: 6 editor pages (news/events/campaigns × create+edit), `saus-admin/server/src/routes/public.ts` (`/media` resolve + `filename` select), `assets/saus-cms.js` (3 card functions).
- Apply client edits to the running copy `~/saus-dash-local/src` too (so it can be verified live); restart the dashboard to clear `.next` cache.

## Verification (CMS running)

1. Dashboard → News → edit an article → upload a cover image → save → public Newsroom shows it.
2. Same for an Event banner + a Campaign graphic.
3. Media Library → upload a photo → public Gallery shows it (absolute URL).
4. Existing image-less items unchanged; API down → hardcoded fallback; console clean.

## Success criteria

- Uploading any image type in the dashboard persists to the CMS and renders on the matching public page; no regression to image-less content or to the offline fallback.
