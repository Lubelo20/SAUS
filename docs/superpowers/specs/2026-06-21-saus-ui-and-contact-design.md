# SAUS Public-Site UI Program + Contact Form — Design

**Date:** 2026-06-21
**Scope:** Public website UI (polish, mobile/responsive, new features, visual refresh) on a shared-stylesheet foundation, plus a working contact form routed through the saus-admin API.
**Out of scope this round:** CMS→public content syndication; deduping header/footer *markup*; admin CMS deployment.

## Goal

Improve the public SAUS website across four axes the client asked for — polish/bug-fixes, mobile responsiveness, new features, and a visual refresh — without a build step or new runtime dependencies, and without altering the official SAUS brand identity (palette, typography, seal). Make the contact form actually deliver messages via the existing Express/Prisma backend.

## Approach (chosen: B — shared stylesheet first)

The five public pages (`index.html`, `apply/index.html`, `nsfas/index.html`, `about/index.html`, `contact/index.html`) each carry their **own inline `<style>` block** and their **own copy** of the topbar/header/navbar/footer markup. There is no shared stylesheet. Every visual fix today must be repeated 5× and the blocks have already drifted.

The work therefore starts by extracting the shared CSS into one file, so all later phases are written once and apply everywhere. Header/footer **markup** stays duplicated for now (clean markup dedup needs a build step or JS injection, which conflicts with the no-build-step constraint).

## Architecture

```
/assets/saus.css   ← NEW single source of truth for shared styles
        ▲ linked by
index.html · apply/index.html · nsfas/index.html · about/index.html · contact/index.html
        each keeps a small inline <style> for page-specific layout only

saus-admin/server (Express + Prisma)
  └── POST /api/contact (public, rate-limited) → ContactMessage table (+ optional Secretariat email via nodemailer)
        ▲ fetch() from contact form, base URL via existing admin-URL resolver
```

### `assets/saus.css` — what it owns
- Design tokens: all `--navy/--green/--gold/--red/--cream…` vars, `--total-top`, font stacks
- Header stack: `#topbar`, `#header`, `#navbar`; mobile nav `#mnav`, `#ham`, `toggleMenu` styles
- Footer, buttons (`.btn` + modifiers), grid helpers (`.grid-2/3/4`, `.wrap`), shared typography, cookie banner, toast

### What stays inline per page
Page-specific layout only: hero variants, apply-portal university cards + modal + APS calculator, nsfas guide blocks.

## Phases (strictly ordered, each independently shippable + browser-verified)

### Phase 0 — Extract shared stylesheet (foundation)
1. Diff the 5 inline `<style>` blocks; identify the shared layer and reconcile drift (pick correct/most-recent rule per conflict).
2. Create `assets/saus.css`; replace the shared rules in each page with `<link rel="stylesheet" href="/assets/saus.css">` (root-absolute path; works from sub-folders).
3. **Safety gate:** verify every page renders identically to before (visual parity at 390/768/1280) BEFORE any improvement. No behavioural change in this phase.

### Phase 1 — Polish & fix
- Fix the empty gap between the homepage hero and "Priority Campaign Areas" (spacing/height bug).
- Per-page audit: section-spacing consistency, alignment, hover/focus states, broken/missing images, orphaned headings. Fix each, verify visually.

### Phase 2 — Mobile / responsive (largest real gap)
- **Topbar overlap (≤480px):** utility text wraps and the phone number clips. Collapse the utility bar to essentials on small screens.
- **Header org-name wrap:** "South African Union of Students" wraps awkwardly; make it scale cleanly.
- Verify all grids stack; verify apply-portal cards/modal and hamburger nav at 390 / 768 / 1024.
- Touch targets ≥44px.

### Phase 3 — New features
- **Accessibility (WCAG 2.1 AA):** alt text, colour-contrast fixes, keyboard focus order, skip-to-content link, ARIA on nav + apply modal.
- **Apply-portal polish:** tighten APS calculator + university cards/modal interactions.
- **Contact form (real):** see Contact Form section below.

### Phase 4 — Visual refresh
- Tasteful motion (scroll-reveal, hover transitions), richer card treatments, image overlays — strictly within existing brand (navy/green/gold/red; EB Garamond / Source Sans 3). No palette or identity change.

## Contact Form (routed via saus-admin API)

**Server (`saus-admin/server`):**
- Prisma model `ContactMessage { id, name, email, subject, message, ipAddress, userAgent, status (NEW/READ/ARCHIVED), createdAt }`.
- `POST /api/contact` — **public** (no auth), validated with zod, behind `express-rate-limit`. Persists the message; if SMTP env is configured, also emails `Secretariat@saus.org.za` via the existing `nodemailer` dependency. Returns `{ ok: true }`.
- CORS: ensure the public site origin is allowed for this route (it currently allows `CLIENT_URL`; the public site origin must also be permitted for `/api/contact`).

**Public form (`contact/index.html`):**
- `submitForm()` POSTs JSON to `${API_BASE}/contact`. `API_BASE` is a **new** small resolver, distinct from the existing staff-login resolver: the staff-login link points at the CMS *frontend* (`localhost:3100` / `saus-admin.vercel.app`), whereas the contact form needs the *API* (`localhost:4000/api` in dev, the deployed Render API `…/api` in prod). Both resolvers live near `</body>` and select by hostname.
- Client-side validation + inline error states (also serves the Phase-3 form polish).
- **Graceful degradation:** until the CMS/API is deployed, a failed/unreachable request shows a clear fallback ("couldn't send — email Secretariat@saus.org.za directly") rather than a silent success. The cosmetic-only behaviour is replaced by honest success/failure feedback.

**Dependency note:** real delivery only works once the saus-admin server is deployed (Neon + Render per `saus-admin/DEPLOYMENT.md`). The frontend + endpoint are built now and function immediately in local dev (server on :4000) and in production once deployed.

## Constraints & non-negotiables
- No build step; no new runtime dependencies on the public site.
- Preserve brand: palette, EB Garamond / Source Sans 3 / Source Code Pro, the SAUS seal, footer credit "Developed by Lubelo Tech Solutions", POPIA note.
- Preserve key content (spokesperson Thato Masekoa +27 79 129 5948, Secretariat@saus.org.za, domain www.saus.org.za).
- iCloud/Node gotchas: serve via `python3 -m http.server 8080` for the public site; the user runs the admin dev server (:4000) from their own terminal.

## Verification
- Front-end is static with no test runner: verification is **visual in the live browser at 390 / 768 / 1280** + markup/contrast checks.
- Phase 0 parity gate is mandatory before Phase 1.
- Contact endpoint: verified locally against the running :4000 server (message persists; success/fallback states both exercised).

## Success criteria
- One `assets/saus.css`; all 5 pages link it; no visual regressions after extraction.
- Homepage hero gap gone; topbar + header render cleanly on mobile; grids stack; touch targets ≥44px.
- Accessibility AA checks pass on key pages; apply portal interactions tightened.
- Contact form sends to the API with honest success/failure UX and a working fallback.
- Visual refresh applied within brand, no identity drift.
