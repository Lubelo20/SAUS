# Universities Portal — Unified Search & Filters — Design

**Date:** 2026-06-21
**Sub-project 5 of 5.** Builds on sub-projects 1 (verified data) + 2 (`loadUni`/courses). Replaces the current province-only `filterUnis` + Enter-only `doSearch` (which reset each other) with one combined, live filter. Out of scope: APS→qualify matcher (#3, needs verified per-course APS first).

## Goal

Make the 26-university grid filterable by **live search (name + courses) AND province AND type AND free-to-apply**, all combined, with a result count and a no-matches state — so students can narrow down quickly.

## Approach

Single state + single function. `filterState = {q:'', province:'all', type:'all', freeOnly:false}`; `applyFilters()` shows/hides each card by AND-ing all active criteria, then updates `#filterCount` and toggles `#noResults`. All controls just set state and call `applyFilters()`.

## Data additions

1. **`_index.json` gains `fee`** (number) per entry — a one-off script copies each university's verified `admissions.json.applicationFee` into its `_index` entry. Enables the Free filter via `UNI_INDEX[abbr].fee===0` with no per-card admissions fetch.
2. **Course search index** — on portal load, background `Promise.all` fetches all 26 `courses.json`; builds `window._courseIdx[abbr]` = lowercased join of course names + faculties. Optional/graceful: search works on name/visible-text until it loads, then upgrades.

## Components

**`applyFilters()`** — for each `.uni-card`: read `abbr` from `img[alt]`; `u = UNI_INDEX[abbr]` (skip card if absent). Show iff ALL hold:
- province: `filterState.province==='all'` OR `u.province===filterState.province` (Other = not in the 4 named provinces, matching the existing pill).
- type: `filterState.type==='all'` OR `u.type===filterState.type`.
- freeOnly: `!filterState.freeOnly` OR `u.fee===0`.
- query: `!q` OR `cardName.includes(q)` OR `(_courseIdx[abbr]||'').includes(q)`.
Then set `card.style.display`; count shown; if 0 visible, show `#noResults`.

**Controls:**
- Hero `#heroSearch`: `oninput` (debounced ~200ms) sets `filterState.q` + `applyFilters()`; Enter scrolls to `#universities`.
- Province pills: set `filterState.province` + active class + `applyFilters()`.
- New **type pill row** (`#typeFilters`): All · Research University · Comprehensive University · University of Technology · Distance University · Health Sciences University (render only types present in `_index`).
- New **"Free to apply" toggle pill**: toggles `filterState.freeOnly` + active class.
- **`#filterCount`** line: "Showing N of 26 universities".
- **`#noResults`**: message + "Clear filters" button → resets `filterState`, clears search box, deactivates pills, `applyFilters()`.

## Error handling

- `UNI_INDEX[abbr]` missing → skip that card (don't crash).
- Course index optional; never blocks search.
- Debounce avoids per-keystroke thrash.
- No `alert()`/blocking dialogs.

## Files

- Modify: `apply/index.html` — `filterState` + `applyFilters()` + debounced search + new type/free pill markup + `#filterCount`/`#noResults` markup + CSS; replace bodies of `filterUnis`/`doSearch` to delegate to state+`applyFilters`.
- Modify: `data/universities/_index.json` — add `fee` per entry (via `data/_addfee.js`).
- Create: `data/_addfee.js` — copies `admissions.applicationFee` → `_index` `fee`.

## Verification

Live browser:
1. Type "medicine" → only universities whose course index matches remain (after index loads); clearing restores all.
2. Type = University of Technology → only UoTs; Free toggle → only `fee===0`; Province=Gauteng + Free → AND.
3. Result count updates; 0 matches → no-results + Clear resets everything.
4. No regressions: compare checkboxes + detail modal work on filtered cards; console clean; pills wrap on mobile.

## Success criteria

- Search (name + courses) + province + type + free all combine live; count + no-results work; Clear resets.
- `_index.json` has `fee`; course index loads in background with graceful fallback.
- No regressions to modal/compare/grid; zero console errors.
