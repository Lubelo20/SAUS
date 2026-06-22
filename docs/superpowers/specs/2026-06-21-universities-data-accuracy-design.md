# Universities Portal — Data Accuracy Foundation — Design

**Date:** 2026-06-21
**Sub-project 1 of 5** in the Universities-portal program (decomposed from "make it accurate and continue developing"). This sub-project is the **foundation**; later sub-projects (richer modal, APS→qualify matcher, comparison, better search/filters) build on the accurate data and are out of scope here.

## Goal

Web-verify and correct the data behind the Universities portal (`apply/index.html`) against official university sources, so the application dates, fees, APS minimums, links, and core facts students act on are trustworthy — with explicit, honest metadata about what was verified, from where, and what's still provisional.

## Approach (chosen: A — research agents → edit JSON directly)

The portal reads per-university JSON from `/data/universities/<ABBR>/` at runtime. Those files become the **authoritative source of truth**. Research agents verify fields against official `.ac.za` sites; results are reconciled into the JSON with `_verified` metadata. `data/generate.js` (the original generator) is demoted to a guarded archive so it can't blindly clobber the hand-verified data.

## Architecture / data flow

```
Research agents (batched over 26 unis, web search + fetch, official-source-first)
   └─ per-uni structured result: { field: {value, sourceUrl, confidence} }
         ↓ reconcile (mechanical, per field)
   /data/universities/<ABBR>/{info,admissions,courses}.json  ← corrected + _verified block
         ↓
   apply/index.html (unchanged data-loading; small UI note for unconfirmed dates)
         +
   data/VERIFICATION-2026-06.md   (human-reviewable per-uni change report)
   data/generate.js               (guard header: do not blindly regenerate)
```

## Fields verified (per university)

**Action fields (highest value):** `applyUrl`, `prospectusUrl`, `website`, application **opens/closes** (2027 intake), `applicationFee`, `minimumAPS`.
**Core facts:** `name`, `city`, `province`, `founded`, `students`, `type`, `faculties`.
**Courses:** faculty-level correctness + spot-check of ~5 flagship programmes per university (incl. rough APS). NOT line-by-line for all ~1,000 courses.

Each agent returns, per field: `{ value, sourceUrl, confidence: high | medium | low | unconfirmed }`, preferring the official university domain; on source conflict, note it and prefer the `.ac.za` page.

**Reliability expectation:** apply URLs / websites / core facts → high; fees / min APS → medium-high (APS varies by programme; capture the general minimum); 2027 open/close dates → variable (may be unpublished → flagged).

## Reconciliation rules (per field)

- Confirmed + differs → update value, mark verified.
- Confirmed + matches → keep, mark verified.
- Unconfirmed → **keep existing value, mark unverified** (user decision).

## Verification metadata

Extends the existing `_datesUpdated` / `apsNote` pattern. Each file gains:
```json
"_verified": {
  "date": "2026-06-21",
  "method": "official-site",
  "fields": {
    "applyUrl":         { "confidence": "high",        "source": "https://…ac.za/apply" },
    "applicationOpens": { "confidence": "unconfirmed", "source": null,
                          "note": "2027 dates not yet published — value carried from prior cycle" }
  }
}
```
`courses.json` gains a top-level `"_coursesVerified": "faculty-level + flagship sample (2026-06)"`.

## UI change (small)

For any **date** field flagged `unconfirmed`, the portal/modal renders a subtle inline note: *"Confirm 2027 dates on the university's site."* No badges elsewhere; verified data displays normally. This is the only frontend change in this sub-project. Implemented in `apply/index.html` where dates are rendered (card + modal), driven by reading the `_verified` metadata.

## Error handling

- Agent returns null / low / unconfirmed → keep existing, flag.
- Conflicting sources → prefer official `.ac.za`; record the conflict in the report.
- Fetch failure / rate limit → retry once; still failing → `unconfirmed`.
- Never write a value with no source as "verified."

## Source of truth & generate.js

- Per-university JSON is authoritative going forward.
- `data/generate.js` gets a header comment: the JSON has been hand-verified (2026-06); do not re-run without merging. Where quick, mirror corrected key values back into its master objects to limit drift.

## Verification (how we know it's right)

No automated correctness test exists for external data, so:
1. The cited official sources in `VERIFICATION-2026-06.md`.
2. Live spot-check of 3–4 universities in the portal + modal after update: dates/fees/links render; links resolve to the correct official pages.
3. Integrity: page still loads all 26 cards; modal still works; no JSON parse errors (the modal/portal JS we just repaired stays working).

## Scope boundary

Delivers: corrected JSON + `_verified` metadata + `_coursesVerified` marker + the small unconfirmed-date UI note + `VERIFICATION-2026-06.md` + `generate.js` guard. Does **not** deliver comparison / APS-matcher / richer-modal / search upgrades (later sub-projects).

## Success criteria

- All 26 universities have a `_verified` block dated 2026-06 with per-field confidence + sources.
- Action fields (apply URL, dates, fee, min APS) verified or explicitly flagged for every university.
- Unconfirmed dates carry the existing value + a UI "confirm on site" note.
- `VERIFICATION-2026-06.md` lists every change with source URLs.
- Portal loads all 26 cards and the detail modal works post-update (no regressions).
