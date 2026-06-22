# Universities Portal — Data Accuracy Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web-verify and correct the 26 universities' data (apply URLs, 2027 dates, fees, min APS, core facts, faculty-level courses) against official `.ac.za` sources, with `_verified` confidence metadata, a small UI note for unconfirmed dates, and a change report.

**Architecture:** Parallel research agents (web search + fetch, official-source-first) return structured per-university data; their results are reconciled mechanically into the per-university JSON (now the authoritative source); a small `apply/index.html` change surfaces unconfirmed-date notes; a `VERIFICATION-2026-06.md` records every change.

**Tech Stack:** Static JSON data (`/data/universities/<ABBR>/`), vanilla-JS portal (`apply/index.html`), research agents with WebSearch/WebFetch. Local server `python3 -m http.server 8080` for spot-checks.

## Global Constraints

- Per-university JSON is the authoritative source of truth; `data/generate.js` is demoted (guard header, do not blindly re-run).
- Prefer official university domains (`*.ac.za`); on conflict, prefer `.ac.za` and record the conflict.
- Never mark a value "verified" without a source URL. Unconfirmed → keep existing value, flag `unconfirmed`.
- Verify fields: `applyUrl, prospectusUrl, website, applicationPeriod.opens, applicationPeriod.closes (2027), applicationFee, minimumAPS, name, city, province, founded, students, type, faculties`. Courses: faculty-level + ~5 flagship programmes only.
- No new runtime dependencies; brand/UI unchanged except the one date-note.
- Environment: git commits hang (hand off to user); serve via `python3 -m http.server 8080` for spot-checks; the apply portal/modal JS was recently repaired — must stay working.
- 26 universities: CPUT CUT DUT MUT NMU NWU RU SMU SPU SU TUT UCT UFH UFS UJ UKZN UL UMP UNISA UNIVEN UP UWC UniZ VUT WITS WSU.

---

### Task 1: Define the research output schema + dispatch research agents

**Files:**
- Reference: `data/universities/<ABBR>/{info,admissions}.json` (current values, for the agents to confirm/correct)

**Interfaces:**
- Produces: one structured `UniVerification` object per university, consumed by Task 2.

`UniVerification` (per university) JSON shape each agent must return:
```json
{
  "abbr": "UCT",
  "fields": {
    "website":          {"value":"https://www.uct.ac.za","confidence":"high","source":"https://..."},
    "applyUrl":         {"value":"https://myapps.uct.ac.za/","confidence":"high","source":"https://..."},
    "prospectusUrl":    {"value":"...","confidence":"medium","source":"https://..."},
    "applicationOpens": {"value":"1 April 2026","confidence":"unconfirmed","source":null,"note":"2027 dates not yet published"},
    "applicationCloses":{"value":"31 July 2026","confidence":"medium","source":"https://..."},
    "applicationFee":   {"value":100,"confidence":"medium","source":"https://..."},
    "minimumAPS":       {"value":36,"confidence":"medium","source":"https://...","note":"varies by faculty"},
    "city":{"value":"Cape Town","confidence":"high","source":"..."},
    "province":{"value":"Western Cape","confidence":"high","source":"..."},
    "founded":{"value":1829,"confidence":"high","source":"..."},
    "students":{"value":29000,"confidence":"medium","source":"..."},
    "type":{"value":"Research University","confidence":"high","source":"..."},
    "faculties":{"value":["Commerce","Engineering & the Built Environment","Health Sciences","Humanities","Law","Science"],"confidence":"high","source":"..."}
  },
  "coursesSpotCheck":[
    {"name":"MBChB","exists":true,"apsApprox":42,"source":"..."}
  ],
  "notes":"free text — conflicts, caveats"
}
```

- [ ] **Step 1:** Confirm the local server is up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/data/universities/_index.json` → `200`.
- [ ] **Step 2:** Dispatch research agents in batches (e.g. 5 agents × ~5 universities, or 1 per university if budget allows). Each agent prompt: "For each university below, visit its OFFICIAL site (prefer `<abbr>.ac.za`) and verify the fields in the `UniVerification` schema. Current values are provided — confirm or correct each. For EVERY field return value + confidence (high/medium/low/unconfirmed) + the exact source URL you used. For 2027 intake dates, if the university has not yet published 2027 dates, return confidence `unconfirmed` and keep the provided value. Spot-check ~5 flagship programmes (do they exist, rough APS). Return ONLY the JSON array of UniVerification objects." Pass each batch its universities' current `info.json`+`admissions.json` values inline.
- [ ] **Step 3 (GATE):** Collect all 26 `UniVerification` objects. Verify each has all required fields and that any field marked `high`/`medium` has a non-null `source`. Re-dispatch any university whose result is malformed or missing.
- [ ] **Step 4:** Save the raw collected results to `data/_verification-raw-2026-06.json` (intermediate artifact for auditing). No git commit (hand off later).

### Task 2: Reconcile + write corrected JSON with `_verified` metadata

**Files:**
- Modify: `data/universities/<ABBR>/info.json` (core facts, faculties)
- Modify: `data/universities/<ABBR>/admissions.json` (apply URL, dates, fee, min APS)
- Modify: `data/universities/_index.json` (mirror website/apply/core facts shown on cards)

**Interfaces:**
- Consumes: the 26 `UniVerification` objects from Task 1.
- Produces: corrected JSON + a `_verified` block in each `info.json` and `admissions.json`.

- [ ] **Step 1:** For each university, apply reconciliation per field: confirmed+differs → write new value; confirmed+matches → keep; unconfirmed → keep existing value. Track each change as `{abbr, field, old, new, confidence, source}` for the Task 5 report.
- [ ] **Step 2:** Add to each `info.json` and `admissions.json` a `_verified` block:
```json
"_verified": { "date": "2026-06-21", "method": "official-site",
  "fields": { "applyUrl": {"confidence":"high","source":"https://..."},
              "applicationOpens": {"confidence":"unconfirmed","source":null,"note":"2027 dates not yet published — value carried over"} } }
```
- [ ] **Step 3 (GATE — JSON integrity):** Validate every edited file parses: `for f in data/universities/*/*.json data/universities/_index.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" || echo "BAD: $f"; done` → no `BAD` lines.
- [ ] **Step 4:** No git commit (hand off). Proceed.

### Task 3: Courses faculty-level marker + flagship corrections

**Files:**
- Modify: `data/universities/<ABBR>/courses.json` (add marker; correct any flagship APS clearly wrong)
- Modify: `data/universities/<ABBR>/info.json` (faculties already corrected in Task 2 — confirm consistency)

**Interfaces:**
- Consumes: `coursesSpotCheck` from Task 1 results.

- [ ] **Step 1:** Add a top-level marker to each `courses.json`: `"_coursesVerified": "faculty-level + flagship sample (2026-06)"`.
- [ ] **Step 2:** For each flagship programme the research flagged as wrong (doesn't exist, or APS clearly off), correct or remove that single course entry; record the change for the report. Do NOT mass-edit untouched courses.
- [ ] **Step 3 (GATE):** Re-run the JSON parse check from Task 2 Step 3 → no `BAD` lines.

### Task 4: Surface unconfirmed-date note in the portal

**Files:**
- Modify: `apply/index.html` (the JS that renders application dates on the card and in the modal)

**Interfaces:**
- Consumes: the `_verified` block written in Task 2.

- [ ] **Step 1:** Locate where dates render: the card builder (uses `admissions` opens/closes) and `openUniModal`/`loadUni` (modal). Find the exact lines via `grep -n "opens\|closes\|applicationPeriod\|deadline" apply/index.html`.
- [ ] **Step 2:** When a university's `admissions._verified.fields.applicationOpens.confidence === 'unconfirmed'` (or `applicationCloses`), render a subtle inline note next to the date: `<span class="date-unconfirmed" title="2027 dates not yet officially published">· confirm on the university's site</span>`. Add a small muted style for `.date-unconfirmed` (e.g. `font-size:11px;color:var(--text-lt)`).
- [ ] **Step 3 (GATE):** Reload `http://localhost:8080/apply/?cb=N`; confirm: all 26 cards still load; the modal still opens with correct name/courses; a university with unconfirmed dates shows the note; a university with confirmed dates does NOT. Check console: no new errors.

### Task 5: Verification report + generate.js guard

**Files:**
- Create: `data/VERIFICATION-2026-06.md`
- Modify: `data/generate.js` (header guard comment)

- [ ] **Step 1:** Write `data/VERIFICATION-2026-06.md`: intro + a per-university section with a table `| field | old → new | confidence | source |` for every changed/verified field, plus a list of fields left `unconfirmed`.
- [ ] **Step 2:** Add a header comment at the top of `data/generate.js`: `/* ⚠️ 2026-06: the per-university JSON in data/universities/ has been HAND-VERIFIED against official sources (see VERIFICATION-2026-06.md). Do NOT re-run this generator without first merging those corrections back into the master objects below — it will clobber verified data. */`
- [ ] **Step 3:** Where quick, mirror the corrected `INDEX`/`ADMISSIONS` key values into `generate.js`'s master objects to limit drift (best-effort; not blocking).

### Task 6: Live spot-check + no-regression verification

**Files:** none (verification only)

- [ ] **Step 1:** In the browser, spot-check 3–4 universities spanning types/provinces (e.g. UCT, WITS, UNISA, WSU): open each card + modal; confirm dates/fee/min-APS render; click "Apply Online"/"Visit Website" and confirm the URLs are the official ones in the `_verified` source.
- [ ] **Step 2:** Confirm no regressions: portal loads all 26 cards; province filters work; the detail modal opens with correct name + course count; console has no errors.
- [ ] **Step 3:** Summarize results; hand the staged changes to the user to commit (git commits hang in-sandbox on this machine).

---

## Self-Review

- **Spec coverage:** Task 1 = research method/fields; Task 2 = reconciliation + `_verified`; Task 3 = courses faculty-level marker; Task 4 = unconfirmed-date UI note; Task 5 = report + generate.js guard; Task 6 = verification. All spec sections covered.
- **Placeholder scan:** No TBD/TODO; the research content is genuinely external (agents fetch it), framed as schema + gates, not vague placeholders.
- **Consistency:** `UniVerification` field names and the `_verified` shape are used identically across Tasks 1, 2, 4. JSON-integrity gate reused in Tasks 2 & 3.

## Follow-on sub-projects (not in this plan)
Richer detail modal · APS→qualify matcher · university comparison · better search & filters.
