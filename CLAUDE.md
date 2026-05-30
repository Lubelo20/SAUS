# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Client website for **SAUS — South African Union of Students**, developed by Lubelo Tech Solutions. SAUS is the official national student representative body for all 26 public universities in South Africa, established April 2006.

## Files

| File | Purpose |
|------|---------|
| `index_1.html` | The live website — a self-contained single-page application |
| `SAUS_Website_Development_Document.html` | Design/brand brief and development spec |
| `sauslogo.jpeg` | SAUS logo asset |

## Viewing / Testing

No build step. Open `index_1.html` directly in a browser:

```bash
open index_1.html
```

## Architecture — `index_1.html`

The website is a **pure HTML/CSS/JS single-page application** with no framework or dependencies beyond Google Fonts.

**Page system:** Eight named pages (`home`, `about`, `campaigns`, `leadership`, `news`, `events`, `gallery`, `contact`) are rendered simultaneously in the DOM. Only one has the `.active` class at a time. Navigation calls `showPage(id)` which toggles `.active` and syncs the nav highlights.

**Fixed header stack (three tiers):**
1. `#topbar` — 38px utility bar with SA flag, quick links
2. `#header` — 88px main header with seal, org name, contact CTA
3. `#navbar` — 52px navigation bar with page links

The CSS variable `--total-top: 178px` accounts for all three tiers; every `.page` uses `padding-top: var(--total-top)`.

**Mobile nav:** `#mnav` toggled by `toggleMenu()` / hamburger `#ham`; hidden on desktop.

**Form / Toast:** `submitForm()` shows `#toast` for 5 seconds — no backend, purely cosmetic.

**Cookie consent:** `#cookie` appears after 1.8s on first visit; stored in `localStorage` key `saus_gov_cookie`.

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
