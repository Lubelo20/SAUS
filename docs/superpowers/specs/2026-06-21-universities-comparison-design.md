# Universities Portal — Side-by-Side Comparison — Design

**Date:** 2026-06-21
**Sub-project 4 of 5** (built before the APS-matcher because it relies only on high-confidence verified data, not the per-course APS we only spot-checked). Builds on sub-projects 1 (data accuracy) + 2 (richer modal / `loadUni`). Out of scope: APS→qualify matcher, search/filter upgrades, residences.

## Goal

Let a student select 2–3 of the 26 universities from the grid and compare them side-by-side on the verified attributes (location, type, founded, students, application dates, fee, minimum APS, faculties, NSFAS), with an Apply link per university — so they can choose without opening each modal separately.

## Approach (chosen: card checkbox → sticky compare bar → overlay table)

A `☐ Compare` control on each university card adds it to a `compareSet` (max 3). A sticky bottom bar shows the picks as removable chips with a "Compare (n)" button. The button opens a full-screen overlay containing a side-by-side table (universities as columns, attributes as rows). All in `apply/index.html`, reusing existing modal/table/button styling.

## Architecture / data flow

```
card ☐ Compare → toggleCompare(abbr)  → updates compareSet[] (≤3) → renderCompareBar()
#compareBar (fixed bottom, hidden when empty): chips (abbr ✕) + "Compare (n)" btn (enabled ≥2) + Clear
"Compare (n)" → openCompare(): Promise.all(compareSet.map(loadUni)) → renderCompareTable(unis) → show #compareOverlay
chip ✕ → toggleCompare(abbr) (removes) ; Clear → clearCompare()
```

- `compareSet`: module-level `[]` of abbrs. `toggleCompare(abbr)`: add if absent & length<3 (else toast "Compare up to 3"); remove if present; then `renderCompareBar()` + sync any card checkbox states.
- `loadUni(abbr)` already exists and caches; reused unchanged. The overlay reads the merged object (`d.admissions.applicationPeriod`, `d.admissions.applicationFee`, `d.admissions.minimumAPS`, `d.admissions._verified`, `d.faculties`, `d.nsfas.accredited`, `d.name/type/city/students/founded/apply`).

## Components

**Card checkbox** — in the card builder, add top-right: `<label class="compare-chk"><input type="checkbox" onclick="event.stopPropagation();toggleCompare('<ABBR>')"> Compare</label>`. Checked iff `compareSet.includes(abbr)`. `stopPropagation` so it never triggers the card's modal/link handlers (the uniGrid click delegation).

**`#compareBar`** — fixed bottom bar, `display:none` when `compareSet.length===0`. Renders chips `${abbr} <span onclick=toggleCompare>✕</span>`, a `Compare (${n})` button (`disabled` when `<2`) calling `openCompare()`, and a `Clear` link calling `clearCompare()`.

**`#compareOverlay` + `renderCompareTable(unis)`** — full-screen overlay (same `.open` show/hide pattern as the detail modal; Esc/✕/backdrop closes via `closeCompare()`). Table inside `.cmp-table-wrap` (overflow-x:auto):
- Header row: one cell per university (logo img + name + abbr).
- Attribute rows (label cell + one cell per uni): Location, Type, Founded, Students, Application opens, Application closes, Application fee ("Free to apply" when `0`), Minimum APS, Faculties (count), NSFAS (accredited yes/no), and an Apply row (Apply Online button → `d.apply||d.admissions.applyUrl`).
- Unconfirmed dates (`d.admissions._verified.fields.applicationOpens.confidence==='unconfirmed'`) render the muted "confirm on site" hint, consistent with the modal.

## Error handling

- Each university column built in its own try/catch; a failed `loadUni` → that column shows "Data unavailable", others still render.
- Every cell guards missing fields with an em-dash (`—`) fallback; no null-deref (consistent with the modal-bug lesson — guard every access).
- 4th selection ignored with a toast; selecting the same twice toggles off.

## Files

- Modify: `apply/index.html` — (1) card builder: add the Compare checkbox; (2) `compareSet` + `toggleCompare/clearCompare/renderCompareBar`; (3) `#compareBar` markup; (4) `#compareOverlay` markup; (5) `openCompare/closeCompare/renderCompareTable`; (6) CSS for bar/overlay/table reusing tokens.

## Verification

Live browser (no test runner):
1. Tick UCT, UFS, WITS → bar shows 3 chips + "Compare (3)".
2. Click Compare → overlay table renders 3 columns with correct verified values (UFS "Free to apply"; differing dates/APS/faculty counts).
3. Add UNISA case → its date cells show the unconfirmed hint.
4. Remove a chip (✕) updates bar + table-on-reopen; Clear empties bar; 4th pick blocked with toast.
5. No regressions: detail modal still opens, 26-card grid + filters work, console clean. Mobile: table scrolls horizontally.

## Success criteria

- Select 2–3 universities from the grid; sticky bar reflects selection (max 3, removable, Clear).
- Overlay shows a correct side-by-side table of verified attributes + Apply links; "Free to apply" and unconfirmed-date hints render right.
- No regressions to modal/grid/filters; zero console errors; usable on mobile.
