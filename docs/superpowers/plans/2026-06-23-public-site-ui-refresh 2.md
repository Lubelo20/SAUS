# Public-Site UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the SAUS public site to look clean and professional by upgrading the shared design system (`assets/saus.css`) and rolling it across all 10 pages — Refined Institutional brand + photo-overlay hero + airy/soft sections.

**Architecture:** Almost all changes live in the single shared stylesheet `assets/saus.css`, so they propagate to every page that links it. Pages with duplicated inline `<style>` (the 5 section pages, plus partial overrides in apply/nsfas) are brought onto the shared system by removing/trimming their inline duplicates. Markup changes are limited to hero blocks and a few class/structure tweaks.

**Tech Stack:** Vanilla HTML/CSS/JS (no framework, no build). Google Fonts (EB Garamond, Source Sans 3). Local preview via `python3 -m http.server 8080`. Verification via Chrome browser automation (screenshots + computed-style measurement).

## Global Constraints

- Live official site — preserve ALL existing content and copy; never fabricate names, figures, or statements.
- Keep the SAUS brand palette: `--navy #0A1628`, `--navy-mid #122040`, `--navy-light #1E3160`, `--green #00692F`, `--green-lt #00873E`, `--red #A8200D`, `--gold #C9A227`, `--gold-lt #E8C04A`, `--cream #F7F6F2`, `--stone #EEECEA`.
- Fonts: `--ff-serif:'EB Garamond'` (headings), `--ff-sans:'Source Sans 3'` (body), `--ff-mono:'Source Code Pro'` (codes).
- Do NOT break: the unified header (just shipped), the `apply/` university detail modal (historically fragile), CMS rendering hooks in `assets/saus-cms.js` (`#newsList`, `#leadershipGrid`, `#eventsList`, `#campaignsList`, `#galleryGroups`, `#ann`, `data-cms` ids), and the contact/guidance forms.
- Preserve accessibility: AA contrast, `:focus-visible`, skip links, `prefers-reduced-motion` guards.
- Keep the existing cross-page `@view-transition` + `html{scrollbar-gutter:stable}` additions.
- After every `saus.css` edit, hard-refresh (⌘⇧R) in the browser — the stylesheet is cached.
- Serve over HTTP (`:8080`); do not `file://` open (breaks `apply/` fetches). iCloud: paths may need materialising.
- Header geometry is already uniform across pages — do not alter `#topbar/#header/#navbar` heights or the canonical header block.

---

## File Structure

- `assets/saus.css` — the shared design system. Primary file for tokens, typography, spacing, cards, section headers, buttons, stats, hero. ~Most tasks touch this.
- `index.html` — home page; hero markup + section-header/card class usage.
- `about/index.html`, `contact/index.html` — saus.css-driven; verify-only + minor class tweaks.
- `nsfas/index.html`, `apply/index.html` — link saus.css but have page-specific inline CSS; trim conflicting inline rules.
- `campaigns/index.html`, `leadership/index.html`, `news/index.html`, `events/index.html`, `gallery/index.html` — duplicated inline design-system CSS; remove the duplicated header/system rules so saus.css governs, keep page-specific styles.

Each task ends with an independently verifiable browser deliverable + a commit.

---

## Task 1: Spacing scale + typography refinement (saus.css)

**Files:**
- Modify: `assets/saus.css` (`:root` token block near top; base `body`/heading rules)

**Interfaces:**
- Produces: spacing tokens `--space-1..--space-24` and a refined type scale used by all later tasks. Existing tokens (`--navy`, `--ff-serif`, `--topbar-h`, etc.) are unchanged.

- [ ] **Step 1: Baseline screenshot of home**

Serve and capture current state for before/after:
```bash
cd /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS
pkill -f "http.server 8080" 2>/dev/null; nohup python3 -m http.server 8080 >/tmp/saus_http.log 2>&1 & disown
```
Open `http://localhost:8080/`, screenshot (reference only).

- [ ] **Step 2: Add spacing scale to `:root` in `assets/saus.css`**

Add inside the existing `:root{ … }` token block (after the colour/size tokens):
```css
  /* spacing scale */
  --space-1:4px;  --space-2:8px;  --space-3:12px; --space-4:16px;
  --space-6:24px; --space-8:32px; --space-12:48px;--space-16:64px; --space-24:96px;
  /* section rhythm */
  --section-y:88px;        /* desktop vertical padding for major sections */
  --prose-measure:68ch;
```

- [ ] **Step 3: Refine base typography**

Locate the base `body` rule and the heading defaults in `assets/saus.css`. Ensure body line-height is 1.6 and set a consistent heading scale. Replace/confirm:
```css
body{font-family:var(--ff-sans);font-size:16px;line-height:1.6;color:var(--ink,#1A1A1A);background:var(--cream)}
h1,h2,h3{font-family:var(--ff-serif);color:var(--navy);line-height:1.1;font-weight:700}
h1{font-size:clamp(34px,4.4vw,52px);line-height:1.05;letter-spacing:.005em}
h2{font-size:clamp(26px,2.6vw,32px)}
h3{font-size:clamp(17px,1.6vw,19px);font-weight:600}
p{max-width:var(--prose-measure)}
.lead,.sec-header .lead{font-size:clamp(15px,1.4vw,18px);line-height:1.6;color:var(--text-mid,#5A5A5A)}
```
(If a selector already exists, edit its values rather than duplicating it. Do not set `max-width` on `p` inside cards/nav — scope is body prose; if it causes issues in cards, change to `.prose p` and add `prose` where needed. Verify in Step 5.)

- [ ] **Step 4: Hard-refresh and screenshot home + about**

Hard-refresh `http://localhost:8080/` and `/about/`. Confirm: headings use serif at the new sizes, body text is more readable (1.6 line-height), nothing overflows, cards/nav text not mangled by the `p` max-width.

- [ ] **Step 5: Fix any `p{max-width}` regressions**

If body paragraphs inside cards/nav/footer became too narrow, change the rule from `p{max-width:var(--prose-measure)}` to scope it: remove the global rule and instead add `max-width:var(--prose-measure)` only to `.hero p, .sec-header .lead, .page-intro p`. Re-verify in browser.

- [ ] **Step 6: Commit**

```bash
git add assets/saus.css
git commit -m "style: add spacing scale + refine typography in saus.css"
```

---

## Task 2: Airy soft card system (saus.css)

**Files:**
- Modify: `assets/saus.css` (card rules: `.panel`, `.info-card`, `.pillar`, and the news/event/campaign card classes used by `assets/saus-cms.js`)

**Interfaces:**
- Consumes: spacing tokens from Task 1.
- Produces: a unified `.card` look (soft shadow, rounded, hover-lift) shared by panels/info-cards/pillars and CMS cards.

- [ ] **Step 1: Locate existing card rules**

```bash
grep -nE '\.panel\{|\.info-card\{|\.pillar\{|news-card|event-card|campaign-card' assets/saus.css | head
```
Note the line numbers.

- [ ] **Step 2: Replace card base styling with the airy/soft look**

For each existing card class base rule (`.panel`, `.info-card`, `.pillar`, and the CMS `*-card` classes), set:
```css
.panel,.info-card,.pillar{
  background:#fff;
  border:0;
  border-radius:14px;
  box-shadow:0 8px 28px rgba(10,22,40,.09);
  padding:var(--space-6);
  transition:transform .18s var(--ease,ease),box-shadow .18s var(--ease,ease);
}
.panel:hover,.info-card:hover,.pillar:hover{
  transform:translateY(-2px);
  box-shadow:0 14px 36px rgba(10,22,40,.13);
}
```
Remove any heavy `border:1px solid …` / square-corner / flat-shadow declarations these classes previously had. Keep any layout-specific properties (flex/grid) intact.

- [ ] **Step 3: Reduced-motion guard**

Ensure (add if missing):
```css
@media (prefers-reduced-motion:reduce){
  .panel,.info-card,.pillar{transition:none}
  .panel:hover,.info-card:hover,.pillar:hover{transform:none}
}
```

- [ ] **Step 4: Hard-refresh and verify cards on home + campaigns + news**

Hard-refresh `/`, `/campaigns/`, `/news/`. NOTE: campaigns/news have inline CSS that may still override — that's expected and handled in Task 7/8. On home/about the cards should now be borderless, rounded, soft-shadowed, lifting on hover. Screenshot home cards.

- [ ] **Step 5: Commit**

```bash
git add assets/saus.css
git commit -m "style: airy soft card system (borderless, soft shadow, hover lift)"
```

---

## Task 3: Section headers, stats, buttons (saus.css)

**Files:**
- Modify: `assets/saus.css` (`.sec-header`/section-head pattern, stat classes, `.btn` variants)

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: reusable `.sec-header` (kicker + serif h2), `.stat` row styling, refined `.btn`.

- [ ] **Step 1: Standardise the section header**

Add/replace:
```css
.sec-header{margin-bottom:var(--space-8)}
.sec-header .kicker,.kicker{
  display:inline-flex;align-items:center;gap:8px;
  font:600 11px/1 var(--ff-sans);letter-spacing:.16em;text-transform:uppercase;color:var(--gold)
}
.kicker::before{content:'';width:24px;height:2px;background:var(--gold)}
.sec-header h2{margin-top:var(--space-3)}
```

- [ ] **Step 2: Airy stat row**

Add/replace stat styling (used on home/about/nsfas):
```css
.stat b,.stat .num{display:block;font-family:var(--ff-serif);font-weight:700;font-size:clamp(28px,3vw,36px);color:var(--navy);line-height:1}
.stat span,.stat .label{font:600 10px/1 var(--ff-sans);letter-spacing:.1em;text-transform:uppercase;color:var(--text-mid,#5A5A5A)}
```

- [ ] **Step 3: Refine buttons**

Locate `.btn` and variants; ensure consistent radius + micro-lift:
```css
.btn{display:inline-flex;align-items:center;gap:8px;border-radius:6px;font:600 14px/1 var(--ff-sans);padding:12px 22px;transition:transform .15s,background .2s,box-shadow .2s;border:0;cursor:pointer}
.btn:hover{transform:translateY(-1px)}
.btn-navy{background:var(--navy);color:#fff}.btn-navy:hover{background:var(--navy-light)}
.btn-gold{background:var(--gold);color:var(--navy)}.btn-gold:hover{background:var(--gold-lt)}
.btn-outline{background:transparent;border:1.5px solid var(--navy);color:var(--navy)}
.btn-outline-white{background:transparent;border:1.5px solid rgba(255,255,255,.5);color:#fff}
.btn-sm{padding:8px 16px;font-size:13px}.btn-lg{padding:15px 28px;font-size:15px}
@media (prefers-reduced-motion:reduce){.btn:hover{transform:none}}
```
Keep any existing variant names the pages already use; only adjust values, don't rename.

- [ ] **Step 4: Hard-refresh and verify on home + contact**

Confirm section headers show the gold kicker+rule, buttons have consistent radius and hover, stats look airy. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add assets/saus.css
git commit -m "style: standardise section headers, stats, buttons"
```

---

## Task 4: Home hero refresh (index.html + saus.css)

**Files:**
- Modify: `assets/saus.css` (hero classes)
- Modify: `index.html` (home hero block markup — locate the `#page-home` hero section)

**Interfaces:**
- Consumes: tokens, buttons, kicker from Tasks 1–3.
- Produces: `.hero`/`.hero-photo` classes used by the home hero (and reusable for other pages' heroes later).

- [ ] **Step 1: Locate the current home hero markup**

```bash
grep -nE 'hero|Empowering Student' index.html | head
```
Identify the hero container inside `#page-home`.

- [ ] **Step 2: Add refined hero CSS to `assets/saus.css`**

```css
.hero-photo{position:relative;display:flex;align-items:center;min-height:clamp(360px,52vh,560px);
  background-position:center;background-size:cover;padding:var(--space-16) 0}
.hero-photo::before{content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,rgba(10,22,40,.92) 0%,rgba(10,22,40,.72) 45%,rgba(10,22,40,.25) 100%)}
.hero-photo .wrap{position:relative}
.hero-photo .kicker{color:var(--gold-lt)}
.hero-photo h1{color:#fff;margin:var(--space-3) 0 var(--space-4);max-width:18ch}
.hero-photo .hero-lead{color:rgba(255,255,255,.85);max-width:52ch;margin-bottom:var(--space-6);font-size:clamp(15px,1.5vw,18px)}
.hero-actions{display:flex;gap:var(--space-3);flex-wrap:wrap}
@media (max-width:640px){
  .hero-photo::before{background:linear-gradient(180deg,rgba(10,22,40,.85),rgba(10,22,40,.92))}
  .hero-photo h1{max-width:100%}
}
```

- [ ] **Step 3: Update the home hero markup in `index.html`**

Restructure the hero container to (preserve the real existing headline/lead copy and the existing photo path — substitute the actual values currently in the file):
```html
<section class="hero-photo" style="background-image:url('/gallery/galleryIMG/img1.jpg')">
  <div class="wrap">
    <div class="kicker">National Representative Body</div>
    <h1><!-- existing headline copy, unchanged --></h1>
    <p class="hero-lead"><!-- existing lead copy, unchanged --></p>
    <div class="hero-actions">
      <a href="/apply/" class="btn btn-gold">Explore universities</a>
      <a href="/nsfas/" class="btn btn-outline-white">NSFAS guide</a>
    </div>
  </div>
</section>
```
Use the real background image already referenced on the home page (check the current hero's `style`/`img`); do not invent a new asset. Keep any existing IDs the SPA/CMS relies on.

- [ ] **Step 4: Hard-refresh and verify the home hero**

Hard-refresh `/`. Confirm: photo with left→right navy gradient, gold kicker, white serif H1 (legible), lead, gold + ghost buttons. Check mobile width (resize ~414px): hero stacks, gradient darkens, text legible. Screenshot both.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/saus.css
git commit -m "feat: refined photo hero on home page"
```

---

## Task 5: Home sections + section rhythm, full home verification

**Files:**
- Modify: `index.html` (apply `.sec-header`/`.kicker` to section intros; ensure section vertical padding uses `--section-y`)
- Modify: `assets/saus.css` (`.page`/section padding if needed)

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: a finished reference home page.

- [ ] **Step 1: Apply section padding token**

In `assets/saus.css`, ensure major content sections use the airy rhythm. Locate `.page` / section wrappers and set vertical padding to `var(--section-y)` (scale on mobile):
```css
.section,.page-section{padding-top:var(--section-y);padding-bottom:var(--section-y)}
@media (max-width:640px){:root{--section-y:52px}}
```
(Adjust selector to the actual section wrapper class used in `index.html`.)

- [ ] **Step 2: Convert home section intros to the kicker + serif h2 pattern**

For each home section heading in `index.html`, wrap as:
```html
<div class="sec-header">
  <div class="kicker">What we do</div>
  <h2><!-- existing section title, unchanged --></h2>
</div>
```
Keep all existing content; only restructure the heading wrapper. Do not touch CMS containers (`#newsList`, `#eventsList`, `#campaignsList`, `#leadershipGrid`, `#galleryGroups`, `#ann`).

- [ ] **Step 3: Full home verification (desktop + mobile)**

Hard-refresh `/`. Verify end-to-end at 1440px and ~414px:
- hero, sections, cards, stats, buttons all reflect the new system
- spacing feels airy, hierarchy clear
- CMS-driven sections still render (news/events/campaigns/leadership/gallery/announcement)
- header unchanged, no console errors, apply link works
Screenshot desktop + mobile.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/saus.css
git commit -m "style: airy section rhythm + section headers on home (reference page done)"
```

---

## Task 6: Roll out to about + contact (saus.css-driven pages)

**Files:**
- Modify: `about/index.html`, `contact/index.html` (section-header wrappers, hero if present, class alignment)

**Interfaces:**
- Consumes: full design system (Tasks 1–5). These pages already link saus.css, so most changes are automatic; this task aligns structure.

- [ ] **Step 1: Verify automatic inheritance**

Hard-refresh `/about/` and `/contact/`. They should already show new cards/type/spacing/buttons. Note anything that looks off (old inline overrides, missing kickers).

- [ ] **Step 2: Apply `.sec-header` + `.kicker` pattern**

Update section headings in both files to the `sec-header`/`kicker` structure (as Task 5 Step 2). Preserve all copy and any `data-cms` hooks.

- [ ] **Step 3: Hero (if present)**

If about/contact have a hero/intro band, apply `.hero-photo` (or a lighter cream `.hero` variant) consistently. Use existing images only.

- [ ] **Step 4: Verify desktop + mobile**

Hard-refresh both; confirm consistency with home; check forms on contact still submit (frontend). Screenshot.

- [ ] **Step 5: Commit**

```bash
git add about/index.html contact/index.html
git commit -m "style: apply refreshed design system to about + contact"
```

---

## Task 7: Align nsfas + apply (trim conflicting inline CSS)

**Files:**
- Modify: `nsfas/index.html`, `apply/index.html` (remove inline rules that override the refreshed saus.css cards/sections/type; keep page-specific styles + the apply portal CSS)

**Interfaces:**
- Consumes: design system (Tasks 1–5). Removes inline overrides so the shared look applies.

- [ ] **Step 1: Inventory conflicting inline rules**

```bash
for f in nsfas/index.html apply/index.html; do echo "== $f =="; \
 awk '/<style/{s=1} s{print} /<\/style>/{s=0}' "$f" \
 | grep -oE '\.(panel|info-card|pillar|sec-header|btn[a-z-]*|stat)[^{]*\{[^}]*\}' | head -40; done
```
List rules that duplicate/diverge from saus.css cards/buttons/section-headers/stats.

- [ ] **Step 2: Remove the duplicated card/button/section/stat declarations**

Delete those inline declarations from each file's `<style>` so saus.css governs them. KEEP: apply's portal-specific CSS (filters, university grid, the detail modal), nsfas stats bar and page-specific layout, and any `:root` token definitions the page needs.

- [ ] **Step 3: Verify apply portal still fully works**

Hard-refresh `/apply/`. CRITICAL: open a university detail modal — confirm it still loads (name, faculties, courses, Apply/Prospectus/Visit). Confirm the 26-card grid + filters work, guidance form posts. Screenshot.

- [ ] **Step 4: Verify nsfas**

Hard-refresh `/nsfas/`. Confirm cards/sections now match the new system, the guide content intact, no duplicated text. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add nsfas/index.html apply/index.html
git commit -m "style: align nsfas + apply to refreshed shared design system"
```

---

## Task 8: Bring section pages onto the shared system

**Files:**
- Modify: `campaigns/index.html`, `leadership/index.html`, `news/index.html`, `events/index.html`, `gallery/index.html` (remove duplicated design-system inline CSS; keep page-specific styles; they already link saus.css)

**Interfaces:**
- Consumes: full design system. Removes the inline duplicates that currently mask saus.css on these pages.

- [ ] **Step 1: Identify the duplicated block per page**

For each page, the inline `<style>` contains a near-complete copy of the old design system (tokens, header, cards, buttons, sections). The header rules were already aligned; now remove the CARD / BUTTON / SECTION-HEADER / STAT / TYPOGRAPHY duplicates so the refreshed saus.css applies.
```bash
for d in campaigns leadership news events gallery; do echo "== $d =="; \
 grep -nE '\.(panel|info-card|pillar|resolution|card)[^{]*\{|\.btn|sec-header|\.stat' "$d/index.html" | head; done
```

- [ ] **Step 2: Remove duplicated system rules (keep page-specific)**

Per page, delete the inline card/button/section/stat/type rules that duplicate saus.css. KEEP rules unique to that page's content (e.g., leadership profile grid, gallery album layout, resolution/timeline components) — but update their card chrome to reference the shared look (borderless/soft-shadow/rounded) or remove their box styling so the shared `.panel`/`.info-card` applies. Work ONE page at a time, verifying after each.

- [ ] **Step 3: Verify each page (desktop + mobile) after its edit**

After each page: hard-refresh, confirm content intact, cards match the new airy/soft look, headings use kicker+serif, no duplicated text, CMS-driven sections (news/events/campaigns/leadership/gallery) still render from `assets/saus-cms.js`. Screenshot each.

- [ ] **Step 4: Commit (per page or grouped)**

```bash
git add campaigns/index.html leadership/index.html news/index.html events/index.html gallery/index.html
git commit -m "style: bring section pages onto refreshed shared design system"
```

---

## Task 9: Full-site consistency + accessibility verification pass

**Files:**
- Modify: `assets/saus.css` or any page, only to fix issues found.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a verified, consistent site.

- [ ] **Step 1: Sweep all 10 pages at desktop (1440px)**

Visit `/`, `/about/`, `/contact/`, `/nsfas/`, `/apply/`, `/campaigns/`, `/leadership/`, `/news/`, `/events/`, `/gallery/`. Confirm: consistent hero/section/card treatment, uniform header, airy spacing, no broken images, no console errors. Screenshot each (or zoom regions).

- [ ] **Step 2: Sweep key pages at mobile (~414px)**

Resize and check `/`, `/apply/`, `/nsfas/`, `/campaigns/`: hero stacks, cards single-column, header consistent, no overflow.

- [ ] **Step 3: Accessibility checks**

Confirm: `:focus-visible` rings visible on tab, skip links work, headings hierarchy sane, colour contrast AA on new text-on-photo/hero. Spot-check with keyboard nav.

- [ ] **Step 4: Functional regression checks**

Apply university modal opens; contact + guidance forms submit (frontend); CMS sections render; cross-page nav + view-transition smooth.

- [ ] **Step 5: Fix any issues found, then final commit**

```bash
git add -A
git commit -m "style: full-site UI refresh — consistency + a11y verification fixes"
```

---

## Self-Review

- **Spec coverage:** spacing (T1), typography (T1), colour restraint (T1/T3 + cream/white sections via T5), cards (T2), section headers (T3/T5), hero (T4), buttons/stats (T3), imagery (T2 radius + T4 hero), motion/reduced-motion (T2/T3/T4), rollout home-first (T1–T5) then all (T6–T8), inline-CSS removal (T7/T8), guardrails + a11y (T9). All spec sections mapped.
- **Placeholder scan:** code blocks give concrete CSS; markup steps say "preserve existing copy / use existing image" rather than inventing — this is intentional because exact copy/paths must be read from the live files at implementation time, not guessed.
- **Type/name consistency:** class names (`.hero-photo`, `.sec-header`, `.kicker`, `.hero-actions`, `.btn-*`, `.panel/.info-card/.pillar`, `.stat`) used consistently across tasks; CMS container ids preserved verbatim.

## Notes for the implementer

- Read the actual rule in `assets/saus.css` before replacing — adjust values in place; don't duplicate selectors.
- One page at a time in Tasks 7–8; the apply modal is the highest-risk item — verify it explicitly.
- Commits work in-sandbox when backgrounded; if `git` hangs, clear `.git/index.lock` and retry, or hand the commit to the user.
