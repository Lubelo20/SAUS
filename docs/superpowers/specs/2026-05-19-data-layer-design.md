# SAUS Data Layer — Design Spec

**Date:** 2026-05-19
**Status:** Approved
**Approach:** A — Incremental (tabs → courses → generate.js)

---

## Overview

Three coordinated improvements to the data layer of the SAUS Apply portal (`apply/index.html`):

1. **Modal tab additions** — Add Admissions, NSFAS and Contact tabs to the university detail modal, fetching data from the existing JSON files in `/data/universities/`.
2. **UNI_COURSES expansion** — Expand the inline `UNI_COURSES` JS object to 8–12 representative courses per university across all 26 institutions; sync `courses.json` files to match.
3. **generate.js improvements** — Audit and correct admissions, NSFAS and contact data for all 26 universities; re-run the generator to produce accurate JSON files.

---

## Section 1 — Modal Tab Additions

### New tabs

Three tabs added after the existing "Courses" tab in the university detail modal:

| Tab | Source file | Key content |
|-----|-------------|-------------|
| Admissions | `admissions.json` | Application window, fee + waiver, min APS, APS note, required documents checklist, international students note, Apply CTA |
| NSFAS | `nsfas.json` | Accreditation badge, financial aid office name/email/phone, myNSFAS application note, additional bursaries list |
| Contact | `contact.json` | General / admissions / financial aid contact cards, postal address, social media links |

### HTML changes — tab nav

```html
<!-- added after existing Courses tab button -->
<button class="modal-tab-btn" data-tab="admissions" onclick="switchModalTab('admissions',this)">Admissions</button>
<button class="modal-tab-btn" data-tab="nsfas" onclick="switchModalTab('nsfas',this)">NSFAS</button>
<button class="modal-tab-btn" data-tab="contact" onclick="switchModalTab('contact',this)">Contact</button>
```

### HTML changes — tab panels

Three new `<div class="modal-tab-panel" data-panel="admissions|nsfas|contact">` sections added inside the modal body alongside the existing overview and courses panels.

Each panel initially contains a loading skeleton. Content is injected by JS after fetch.

### JavaScript — data loading

```
window._uniTabCache = {}   // keyed by "<abbr>:<tab>"
```

`switchModalTab(tab, btn)` is extended: when `tab` is one of `admissions`, `nsfas`, or `contact`, it calls `loadUniTab(tab, abbr)`.

`loadUniTab(tab, abbr)`:
1. Returns immediately if `_uniTabCache[abbr+':'+tab]` exists (renders cached data)
2. Otherwise shows skeleton in the panel
3. Fetches `/data/universities/${abbr}/${tab}.json`
4. On success: caches response, calls `renderAdmissionsTab` / `renderNsfasTab` / `renderContactTab`
5. On error: shows a one-line "Could not load data — try again" message in the panel

**Loading is lazy** — each tab's JSON is only fetched when first clicked for a given university. Overview and Courses continue to load from the existing inline JS objects unchanged.

### Render functions

**`renderAdmissionsTab(data, abbr)`**
- Application period pill (opens → closes)
- Fee badge (e.g. "R100 application fee") + fee waiver chip if applicable
- Min APS badge
- APS note (italic, below badge)
- Required documents — `<ul>` checklist
- International students note (if `internationalStudents.accepted`)
- "Apply Now →" CTA button linking to `data.applyUrl`

**`renderNsfasTab(data, abbr)`**
- Green "NSFAS Accredited" badge (or red "Not Accredited")
- Financial aid office name, email, phone
- Application note paragraph
- Additional funding — `<ul>` list (empty state: "No additional institutional bursaries listed")

**`renderContactTab(data, abbr)`**
- Three contact cards: General, Admissions, Financial Aid — each showing phone + email
- Postal address block
- Social media icon links (Facebook, Twitter/X, Instagram, LinkedIn)

### Error handling

Fetch errors are caught per-tab. A failed tab shows inline error text; the other tabs are unaffected. No global error state.

---

## Section 2 — UNI_COURSES Expansion

### Target

8–12 courses per university, all 26 institutions. Each entry:

```js
{ name: '', qual: '', type: '', faculty: '', aps: 0, duration: '', desc: '' }
```

### Coverage strategy

| University type | Target count | Focus |
|----------------|--------------|-------|
| Research universities (UCT, WITS, SU, UP, UJ, UKZN, RU) | Already 12–14 — no change | — |
| Comprehensive universities (NMU, UFS, UWC, WSU, NWU, UFH, UL, UNIVEN, UniZ, SMU, SPU, UMP) | 8–10 | Core faculties: commerce, education, humanities, science |
| Universities of Technology (CPUT, DUT, TUT, VUT, MUT, CUT) | 8–10 | Applied qualifications: National Diplomas, BTechs, BEngTechs |
| Distance / specialist (UNISA) | 8 | Representative spread across 8 colleges |

### Sync rule

After updating `UNI_COURSES` in `apply/index.html`, the corresponding `data/universities/*/courses.json` for every university is updated to exactly match. `generate.js` is the canonical source for the JSON files; `UNI_COURSES` is updated to match `generate.js` output.

---

## Section 3 — generate.js Improvements

### Scope

`generate.js` is the single source of truth for all 130 JSON files (26 universities × 5 file types). This pass audits and corrects data across three file types:

### admissions.json — corrections per university

- Application opening and closing dates (accurate 2026 dates per institution)
- Application fee (R100–R200, university-specific)
- `feeWaiver: true/false`
- `minimumAPS` (numeric, matching UNI_DATA aps range lower bound)
- `apsNote` — any NBT / additional test requirements
- `applyUrl` — direct application portal URL
- `requiredDocuments` — standardised 5-item baseline:
  1. Certified SA ID or passport
  2. Certified matric certificate or statement of results
  3. Grade 11 and Grade 12 school report
  4. Proof of residence
  5. Completed application form
  Plus university-specific additions (e.g. portfolio for design programmes)
- `internationalStudents.accepted` and `.note`

### nsfas.json — corrections per university

- `accredited: true` for all 26 (all public universities are NSFAS-accredited)
- `financialAidOffice` — correct department name
- `email` — real financial aid email per university
- `phone` — real financial aid phone number per university
- `applicationNote` — standardised note referencing myNSFAS portal
- `additionalFunding` — institution-specific bursaries/grants where they exist

### contact.json — corrections per university

- `general.phone` and `general.email` — main switchboard / registrar
- `admissions.phone` and `admissions.email` — undergraduate admissions office
- `financialAid.phone` and `financialAid.email` — synced with nsfas.json
- `address` — accurate postal address
- `social` — Facebook, Twitter/X, Instagram, LinkedIn URLs where available

### Workflow

Edit data in `generate.js` → run `node data/generate.js` → all 130 JSON files regenerated. No manual edits to individual JSON files.

---

## File Change Summary

| File | Change type |
|------|-------------|
| `apply/index.html` | Add 3 tab buttons, 3 tab panels, loading skeletons, `loadUniTab()`, 3 render functions, extend `switchModalTab()`, add `_uniTabCache` |
| `apply/index.html` | Expand `UNI_COURSES` to 8–12 courses per university for all universities currently below 8 courses |
| `data/generate.js` | Correct admissions, NSFAS, contact and courses data for all 26 universities |
| `data/universities/*/admissions.json` | Regenerated by generate.js |
| `data/universities/*/nsfas.json` | Regenerated by generate.js |
| `data/universities/*/contact.json` | Regenerated by generate.js |
| `data/universities/*/courses.json` | Regenerated by generate.js |

No new files created. No changes to other pages.

---

## Testing

- Serve project root with `python3 -m http.server 8080` and open `http://localhost:8080/apply/`
- Click "View Details" on any university card — Overview and Courses tabs load instantly
- Click Admissions / NSFAS / Contact tabs — loading skeleton appears briefly, then data renders
- Click the same tab a second time — no network request (cached)
- Click a different university — cache is per-abbr, correct data loads for each
- Disable network (DevTools) — error state appears in tab panel, other tabs unaffected

---

Developed by **Lubelo Tech Solutions** for the South African Union of Students (SAUS).
