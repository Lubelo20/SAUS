# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Client project for **SAUS — South African Union of Students**, developed by Lubelo Tech Solutions. SAUS is the official national student representative body for all 26 public universities in South Africa, established April 2006.

The repo is **three connected subsystems**:

1. **Public website** — static HTML/CSS/JS (no framework), deployed on Vercel.
2. **Data pipeline** (`data/`) — a Node generator that emits per-university JSON, consumed by the `apply/` portal.
3. **Admin CMS** (`saus-admin/`) — a full-stack Next.js + Express/Prisma + Postgres app. **Deploy-ready but not yet deployed.**

The public site does **not** pull content from the CMS yet — they are only linked by a "Staff Login" button. Wiring CMS content into the public pages is unbuilt work.

## Layout

| Path | Purpose |
|------|---------|
| `index.html` | The live public website — main single-page application (~147KB) |
| `apply/index.html` | University discovery/comparison portal — **data-driven**, the only public page that fetches at runtime |
| `nsfas/index.html` | NSFAS financial-aid guide — static informational content |
| `about/`, `contact/`, `campaigns/`, `events/`, `gallery/`, `leadership/`, `news/`, `home/` | Section assets and, in some cases, standalone page documents |
| `data/` | University data pipeline (`generate.js`) and generated JSON output |
| `saus-admin/` | Admin CMS (`client/` Next.js + `server/` Express/Prisma) |
| `SAUS_Website_Development_Document.html` | Design/brand brief and development spec |
| `SAUS_Content_Audit.html` | Content sign-off tracker (NEC names/photos, dates, refs) |

## Viewing / Testing

The public site is static — no build step. Because the project lives in iCloud Documents (files can be evicted and direct reads time out), prefer serving over HTTP:

```bash
python3 -m http.server 8080   # from project root → http://localhost:8080
```

Serving (not `open`ing the file) also makes `apply/`'s `fetch()` calls to `/data/universities/` resolve correctly.

## Architecture — public site (`index.html`)

Vanilla HTML/CSS/JS single-page application, no framework or dependencies beyond Google Fonts.

**Page system:** Named pages (`home`, `about`, `campaigns`, `leadership`, `news`, `events`, `gallery`, `contact`) are rendered simultaneously in the DOM. Only one has the `.active` class at a time. Navigation calls `showPage(id)` which toggles `.active` and syncs the nav highlights. `apply/` and `nsfas/` are separate standalone documents linked out from the nav, not virtual pages.

**Fixed header stack (three tiers):**
1. `#topbar` — utility bar with SA flag, quick links
2. `#header` — main header with seal, org name, contact CTA
3. `#navbar` — navigation bar with page links

The CSS variable `--total-top` accounts for all three tiers; every `.page` uses `padding-top: var(--total-top)`.

**Mobile nav:** `#mnav` toggled by `toggleMenu()` / hamburger `#ham`; hidden on desktop.

**Form / Toast:** `submitForm()` shows a toast — no backend, purely cosmetic.

**Cookie consent:** appears after first visit; stored in `localStorage` key `saus_gov_cookie`.

**Staff Login resolver:** a script near `</body>` (mirrored in `index.html`, `nsfas/index.html`, `apply/index.html`) rewrites every `a.admin-link` to the admin CMS URL — `http://localhost:3100` on localhost, otherwise `https://saus-admin.vercel.app`. If the deployed admin URL changes, update all three files (search `saus-admin.vercel.app`).

## Data pipeline (`data/`)

- `data/generate.js` — Node script with hardcoded master data for all 26 universities. Run `node data/generate.js` to (re)generate output. **Edit the source data in `generate.js`, never the generated JSON directly.**
- Output: `data/universities/<ABBR>/` (one folder per university — UCT, WITS, SU, UP, …) each with `info.json`, `admissions.json`, `contact.json`, `nsfas.json`, `courses.json`, plus a master `data/universities/_index.json`.
- `data/shared/nsfas.json` — national NSFAS info (not university-specific). `data/schema/` is reserved/empty.
- `apply/index.html` consumes this at runtime: `DATA_BASE='/data/universities/'`, fetching `_index.json` then per-university `info`/`courses`/`admissions` JSON. University logos live in `apply/logos/`.

This generated JSON is the single source of truth for the apply portal.

## Admin CMS (`saus-admin/`)

Full-stack, **deploy-ready but not yet deployed** (so `saus-admin.vercel.app` currently 404s and the public Staff Login link doesn't resolve to a live app).

- **Client** (`saus-admin/client`, dev port **3100**): Next.js 14, React 18, TypeScript, Tailwind, Tiptap (rich text), SWR, Zustand, Axios. → deploys to **Vercel** (a 2nd project, Root Directory `saus-admin/client`).
- **Server** (`saus-admin/server`, dev port **4000**): Express + TypeScript + **Prisma/PostgreSQL**. **JWT auth** (bcrypt; token stored client-side as `saus_token`), 6 roles (`SUPER_ADMIN`, `SECRETARIAT`, `MARKETING`, `MEDIA`, `EDITOR`, `CONTRIBUTOR`). helmet/cors/rate-limit. → deploys to **Render** via `saus-admin/render.yaml`.
- **Database**: PostgreSQL on **Neon**.
- **Models** (`server/prisma/schema.prisma`): `User`, `NewsArticle`, `Event`, `Campaign`, `Document`, `MediaItem`, `LeadershipProfile`, `SiteSetting`, `Announcement`, `ActivityLog`, plus taxonomy models. Content has a draft → review → publish workflow.
- **Deploy order & full steps:** `saus-admin/DEPLOYMENT.md` (Database → Backend → Frontend → link public site). Seed admin login `admin@saus.org.za` / `Admin@SAUS2025!` — **defaults live in this public repo; change after first login or override with `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` on Render.**
- `.env` files are git-ignored; recreate from `saus-admin/.env.example` when developing.

## Design System

**Colour palette (CSS variables):**
- `--navy: #0A1628` / `--navy-mid: #122040` / `--navy-light: #1E3160`
- `--green: #00692F` / `--green-lt: #00873E`
- `--red: #A8200D` / `--red-lt: #CC2200`
- `--gold: #C9A227` / `--gold-lt: #E8C04A`
- `--cream: #F7F6F2` (page background), `--stone: #EEECEA`, `--white: #FFFFFF`

**Typography:**
- `--ff-serif: 'EB Garamond'` — headings, hero titles, pull-quotes
- `--ff-sans: 'Source Sans 3'` — body text, UI labels
- `--ff-mono: 'Source Code Pro'` — reference numbers, metadata, codes

**Grid helpers:** `.grid-2`, `.grid-3`, `.grid-4` with standard gaps. Layout container: `.wrap` at `max-width: 1200px`.

**Buttons:** `.btn` base + modifiers `.btn-navy`, `.btn-green`, `.btn-gold`, `.btn-outline-white`, `.btn-outline`, `.btn-sm`, `.btn-lg`.

## Key Content to Preserve

- Media spokesperson: **Thato Masekoa** — +27 79 129 5948
- Secretariat email: **Secretariat@saus.org.za**
- Legal compliance note: **POPIA Act 4 of 2013**
- Footer credit: **Developed by Lubelo Tech Solutions**
- Domain: **www.saus.org.za**

## Environment Gotchas (this machine)

- Project is in **iCloud Documents** — files go dataless/evicted and full reads can time out. Serve via the `:8080` HTTP server and curl paths to materialize them before `git add`.
- **Node v25 + iCloud** makes `npm run dev` / test runners hang inside the Claude Code sandbox (they run but never bind ports). Admin dev servers must be run from the user's own terminal.
