# SAUS Public-Site — Phase 0 (Shared CSS) + Phase 1 (Polish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the duplicated inline CSS from the five public pages into one shared `assets/saus.css` (proving visual parity), then fix the homepage hero gap and run a polish pass — all with zero regressions.

**Architecture:** The 5 public pages each carry their own `<style>` block and duplicated header/footer markup. Phase 0 lifts the shared layer into `assets/saus.css` linked by every page, leaving page-specific rules inline. Phase 1 then fixes concrete defects, written once in the shared file.

**Tech Stack:** Static HTML/CSS/JS, no build step, no dependencies beyond Google Fonts. Verification is visual in Chrome at 390/768/1280 via the local `python3 -m http.server 8080`.

## Global Constraints

- No build step; no new runtime dependencies on the public site.
- Brand is fixed: palette (`--navy/--green/--gold/--red/--cream…`), fonts (EB Garamond / Source Sans 3 / Source Code Pro), the SAUS seal. No identity changes.
- Preserve key content verbatim: spokesperson Thato Masekoa +27 79 129 5948; Secretariat@saus.org.za; footer "Developed by Lubelo Tech Solutions"; POPIA Act 4 of 2013; domain www.saus.org.za.
- `assets/saus.css` is linked with a **root-absolute** path (`/assets/saus.css`) so sub-folder pages resolve it.
- Environment: serve via `python3 -m http.server 8080`; git on this iCloud repo is slow — run git with the sandbox disabled and allow long timeouts.
- "Verification" here = visual parity in-browser (no test runner exists for static pages). Each task's gate is a screenshot comparison, not a unit test.

---

### Task 1: Establish the parity baseline

**Files:**
- Create: `docs/superpowers/baseline/` (screenshots, git-ignored or committed as reference)

**Interfaces:**
- Produces: a set of "before" screenshots used as the parity oracle for Task 3.

- [ ] **Step 1:** Ensure the server runs: `python3 -m http.server 8080` from project root; confirm `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index.html` → `200`.
- [ ] **Step 2:** In Chrome, capture full-page screenshots at widths 1280, 768, 390 for each page: `/index.html`, `/apply/`, `/nsfas/`, `/about/`, `/contact/`. Save them as the baseline (name `before-<page>-<width>.png`).
- [ ] **Step 3:** No commit (screenshots are reference only). Proceed.

### Task 2: Identify the shared CSS layer and reconcile drift

**Files:**
- Read: `index.html:13-1174` (style block) and the `<style>` blocks of `apply/index.html`, `nsfas/index.html`, `about/index.html`, `contact/index.html`

**Interfaces:**
- Produces: a definitive list of CSS rules that are shared across pages (the content of `assets/saus.css`), with drift conflicts resolved.

- [ ] **Step 1:** Extract each page's `<style>` block to scratch files and diff them pairwise to separate the **shared layer** (tokens, `#topbar/#header/#navbar`, `#mnav/#ham`, footer, `.btn*`, `.grid-*`, `.wrap`, base typography, cookie, toast) from **page-specific** rules (hero variants, apply cards/modal/APS, nsfas blocks, contact form).
- [ ] **Step 2:** For every rule that differs between pages (drift), choose the correct/most-recent version. Record each decision in a short note in the plan's task log so it is auditable.
- [ ] **Step 3:** No commit yet — this task produces the reconciled rule set used by Task 3.

### Task 3: Create `assets/saus.css` and link all pages (parity gate)

**Files:**
- Create: `assets/saus.css`
- Modify: `index.html`, `apply/index.html`, `nsfas/index.html`, `about/index.html`, `contact/index.html` (replace shared rules with `<link>`; keep page-specific `<style>`)

**Interfaces:**
- Consumes: the reconciled shared rule set from Task 2.
- Produces: one shared stylesheet; each page links `/assets/saus.css` and retains only page-specific inline CSS.

- [ ] **Step 1:** Write `assets/saus.css` with the reconciled shared layer from Task 2 (tokens first, then header stack, nav, footer, buttons, grid, typography, cookie, toast).
- [ ] **Step 2:** In each page, add `<link rel="stylesheet" href="/assets/saus.css">` in `<head>` after the Google Fonts link, and delete the now-shared rules from that page's inline `<style>`, leaving only page-specific rules.
- [ ] **Step 3 (GATE):** Re-capture screenshots at 1280/768/390 for all 5 pages and compare to the Task 1 baseline. They MUST match (allow only sub-pixel AA differences). If anything differs, a shared rule was mis-reconciled — fix `saus.css` until parity holds. **Do not proceed to Phase 1 until parity is exact.**
- [ ] **Step 4:** Commit. `git add assets/saus.css index.html apply/index.html nsfas/index.html about/index.html contact/index.html && git commit -m "refactor(ui): extract shared styles into assets/saus.css (no visual change)"`

---

### Task 4: Fix the homepage hero gap (Phase 1)

**Files:**
- Investigate then Modify: `index.html` between the home hero (`~:1274-1290`) and "Priority Campaign Areas" (`:1398`); fix lands in `assets/saus.css` if the rule is shared, else in the page's inline block.

**Interfaces:**
- Consumes: `assets/saus.css` from Task 3.

- [ ] **Step 1:** Reproduce: load `/index.html` at 1280, scroll past the hero; confirm the large empty band before "Priority Campaign Areas".
- [ ] **Step 2:** Inspect the markup/CSS in that range (e.g. an over-tall hero `min-height`, an empty section, or stray margin/padding) to find the exact rule causing the gap. Record the cause.
- [ ] **Step 3:** Apply the minimal fix (adjust the offending `min-height`/margin/empty element). Prefer a fix in `assets/saus.css` if the rule is shared.
- [ ] **Step 4 (GATE):** Reload at 1280/768/390; confirm the gap is gone and the hero→campaigns transition is tight, with no new regression on other pages that share the rule.
- [ ] **Step 5:** Commit. `git add -A && git commit -m "fix(ui): remove empty band between homepage hero and campaigns"`

### Task 5: Per-page polish audit and fixes (Phase 1)

**Files:**
- Modify: `assets/saus.css` and/or page inline blocks as defects dictate.

**Interfaces:**
- Consumes: `assets/saus.css`.

- [ ] **Step 1:** Walk each page (`/index.html`, `/apply/`, `/nsfas/`, `/about/`, `/contact/`) at 1280 and list concrete defects: inconsistent section spacing, misalignment, missing hover/focus states, broken/missing images, orphaned headings. Record the list in the task log.
- [ ] **Step 2:** Fix each defect with the smallest change; shared fixes go in `assets/saus.css`.
- [ ] **Step 3 (GATE):** Re-verify each fixed area visually; confirm no regression to neighbouring pages.
- [ ] **Step 4:** Commit. `git add -A && git commit -m "fix(ui): polish pass — spacing, alignment, hover/focus, image fixes"`

---

## Self-Review

- **Spec coverage:** Covers spec Phase 0 (shared `saus.css` + parity gate) and Phase 1 (hero gap + polish audit). Phases 2 (mobile), 3 (a11y + apply polish + contact form), 4 (visual refresh) are deferred to their own plans, as the spec's phase ordering requires.
- **Placeholder scan:** Steps that can't be pre-coded (CSS extraction content, the hero-gap root cause) are honestly framed as investigate→fix→verify with a recorded-cause requirement, not vague "handle it" placeholders. No "TBD/TODO".
- **Consistency:** `assets/saus.css` path, the 5 page list, and the verification widths (1280/768/390) are used identically throughout.

## Follow-on plans (not in this plan)
1. Phase 2 — mobile/responsive (topbar collapse, header wrap, grid stacking, touch targets).
2. Phase 3 — accessibility AA + apply-portal polish + contact form (incl. `saus-admin` `POST /api/contact` + `ContactMessage` model — a separate testable backend plan).
3. Phase 4 — visual refresh (motion, cards, imagery) within brand.
