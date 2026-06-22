# Universities Portal — Richer Detail Modal — Design

**Date:** 2026-06-21
**Sub-project 2 of 5** in the Universities-portal program. Builds on sub-project 1 (data accuracy). Out of scope: APS→qualify matcher, comparison, search/filters (later sub-projects); **residences** (no data — deferred to a future data-research task).

## Goal

Expand the university detail modal in `apply/index.html` from 2 tabs (Overview, Courses) to 5 by surfacing data the portal already has but never shows — application details, NSFAS/bursaries, and contact — so a student can evaluate and act on a university without leaving the modal.

## Approach (chosen: A — three new tabs)

Reuse the existing modal tab system (`switchModalTab`). Add **Admissions · Funding · Contact** tab buttons + panels alongside Overview/Courses. `loadUni` gains two fetches (`contact.json`, `nsfas.json`). Three render functions populate the new panels from the merged data.

## Architecture / data flow

```
openUniModal(abbr) → loadUni(abbr)
  loadUni now fetches: info.json + courses.json + admissions.json + contact.json + nsfas.json
    (each new fetch .catch(()=>({})) — a missing/failed file never breaks the modal)
  merged d = { ...info, courses, ...admissions, contact, nsfas, _verified }
  → renderOverview(d) [existing]  renderModalCourses(d.courses) [existing]
  → renderAdmissions(d)  renderFunding(d)  renderContact(d)  [new]
Tabs: Overview · Courses · Admissions · Funding · Contact  (switchModalTab unchanged mechanism)
```

`loadUni` currently merges `info`+`courses`+`admissions`. Add: `fetch(DATA_BASE+abbr+'/contact.json').then(r=>r.json()).catch(()=>({}))` and the same for `nsfas.json`; attach as `merged.contact` and `merged.nsfas`.

## Components — the three new render functions

All output uses existing modal/badge/tag/stat classes; no new visual language. Every field access is guarded (skip a row/section when its data is absent).

**`renderAdmissions(d)`** → `#modalAdmissions` panel:
- Application window: `d.applicationPeriod.opens` → `d.applicationPeriod.closes` (intake `d.applicationPeriod.intakeYear`). If `d._verified?.fields?.applicationOpens?.confidence === 'unconfirmed'` (or `applicationCloses`), render a muted note: "2027 dates not yet officially published — confirm on the university's site."
- Application fee: `R{d.applicationFee}` or **"Free to apply"** when `0`; add "Fee waiver available" when `d.feeWaiver`.
- Minimum APS: `d.minimumAPS` + `d.apsNote` (caveats).
- Required documents: `d.requiredDocuments[]` as a ticked list (skip if empty).
- International students: `d.internationalStudents.note` (skip if absent).
- Primary **Apply Online** button → `d.apply || d.applyUrl`.

**`renderFunding(d)`** → `#modalFunding` panel:
- NSFAS: green "NSFAS accredited" badge when `d.nsfas.accredited`; show `d.nsfas.applicationNote` + financial-aid `email`/`phone`.
- Bursaries: cards from `d.nsfas.additionalFunding[]` — `name`, `type` chip, `value`, `criteria`, link (`url`) labelled "Details". Empty/absent → "See the university's financial-aid page for bursary options."

**`renderContact(d)`** → `#modalContact` panel:
- Admissions + Financial Aid + General: `phone` (tel: link) and `email` (mailto: link), each row skipped if absent.
- Postal `address`.
- Social: `d.contact.social` facebook/twitter/instagram as small icon links, when present.

## Error handling

- Missing `contact.json`/`nsfas.json` → `{}` → those tabs render a graceful "information not available" state; modal still works.
- Any absent field → its row/section is omitted, never a broken render (the `#modalLogoAbbr`-style null-deref bug that previously killed the modal must not recur — guard every `getElementById`/field).
- Tabs are independent: a failure rendering one panel must not block the others (wrap each render call in try/catch logging a console.warn).

## Files

- Modify: `apply/index.html` — (1) `loadUni` two extra fetches + merge; (2) modal markup: 3 tab buttons + 3 panel divs; (3) 3 render functions; (4) call them from `openUniModal` success path; (5) small CSS for funding/contact rows reusing existing tokens.

## Verification

No test runner (static portal); verify in the live browser:
1. Load `apply/`; open 3 universities spanning cases: **UCT** (has bursaries + full contact), **UFS** (now "Free to apply"), **UNISA** (unconfirmed-date note shows).
2. Click all five tabs each; confirm Admissions/Funding/Contact render correct data; Overview + Courses still work.
3. Console clean; all 26 cards still load; modal open/close still works.

## Scope boundary

Delivers: the 3 new tabs + 2 fetches + render functions + the unconfirmed-date note (folds in the deferred UNISA item). Does NOT add residences, comparison, APS-matcher, or search changes.

## Success criteria

- Modal shows 5 working tabs; Admissions/Funding/Contact display correct per-university data from existing JSON.
- "Free to apply" shows for fee `0`; bursary cards list `additionalFunding`; contact emails/phones are clickable.
- UNISA shows the unconfirmed-date note; confirmed universities don't.
- No regressions: Overview/Courses tabs, 26-card grid, modal open/close, zero console errors.
