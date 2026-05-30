# SAUS Admin CMS — Deployment Guide

The public website is static (already on Vercel). The admin is a **full‑stack app** with three parts that each need hosting:

| Part | Folder | Host (free tier) |
|------|--------|------------------|
| PostgreSQL database | — | **Neon** (or Supabase) |
| Backend API (Express + Prisma) | `saus-admin/server` | **Render** |
| Admin frontend (Next.js) | `saus-admin/client` | **Vercel** (2nd project) |

Deploy in this order: **Database → Backend → Frontend → link the public site.**

---

## 1. Database — Neon (2 min)

1. Sign up at <https://neon.tech> → **New Project** (name: `saus-cms`).
2. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/saus_cms?sslmode=require`).
3. Keep it — this is your `DATABASE_URL`.

---

## 2. Backend API — Render (5 min)

1. At <https://render.com> → **New → Blueprint** → connect the GitHub repo **Lubelo20/SAUS**.
2. Render reads `saus-admin/render.yaml` and creates the `saus-admin-api` service. Fill the prompted env vars:
   - `DATABASE_URL` → the Neon string from step 1
   - `JWT_SECRET` → any long random string (e.g. run `openssl rand -hex 32`)
   - `CLIENT_URL` → leave blank for now; set it in step 4 once the frontend URL exists
3. Deploy. The build automatically runs `prisma db push` (creates tables) and the seed (creates the admin user).
4. When live, note the API URL, e.g. **`https://saus-admin-api.onrender.com`**. Test it: visiting `…/health` should return `{"status":"ok"}`.

> No Blueprint? Create a **Web Service** manually: Root Dir `saus-admin/server`, Build `npm install && npm run build && npx prisma db push && npm run db:seed`, Start `npm start`, Health check `/health`, same env vars.

---

## 3. Admin frontend — Vercel (3 min)

1. Vercel → **Add New → Project** → import **Lubelo20/SAUS** again.
2. Set **Root Directory** = `saus-admin/client` (Vercel auto‑detects Next.js).
3. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://saus-admin-api.onrender.com/api` (your Render URL + `/api`)
4. Deploy. Note the frontend URL, e.g. **`https://saus-admin.vercel.app`**.

---

## 4. Connect the pieces

1. **Render → `saus-admin-api` → Environment**: set `CLIENT_URL` = your admin frontend URL
   (e.g. `https://saus-admin.vercel.app`). This authorises CORS so login works. Save → redeploy.
2. **Public site → "Staff Login" link**: in `index.html`, `nsfas/index.html`, and `apply/index.html`,
   the resolver near `</body>` chooses the admin URL. Replace the production URL
   `https://admin.saus.org.za` with your admin frontend URL, commit, and push — Vercel redeploys the public site.

---

## 5. First login

Open the admin frontend URL → **Sign in to Dashboard**:

- Email: `admin@saus.org.za`
- Password: `Admin@SAUS2025!`

**Change this password immediately.** (Override the seed defaults with `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` env vars on Render if you prefer different initial credentials.)

---

## Notes & limits

- **Uploaded files** (media/documents) are stored on the server's local disk. On Render's free tier the
  disk is ephemeral — uploads are lost on redeploy. For permanent storage, move uploads to S3/Cloudinary
  (the upload routes are in `server/src/routes/media.ts` and `documents.ts`).
- **Render free tier sleeps** after inactivity; the first request after idle takes ~30–50s to wake.
- Recreate local `.env` files from `.env.example` when developing — they are intentionally git‑ignored.
