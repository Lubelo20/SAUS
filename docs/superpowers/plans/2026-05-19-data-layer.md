# SAUS Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Admissions/NSFAS/Contact tabs to the university modal (fetching from JSON), expand UNI_COURSES to 8–12 per university, and improve generate.js data accuracy for all 26 universities.

**Architecture:** Approach A — incremental. Modal tabs first (lazy fetch + per-abbr cache), then UNI_COURSES expansion in apply/index.html, then generate.js corrections regenerate all 130 JSON files.

**Tech Stack:** Pure HTML5/CSS3/Vanilla JS. No build tools. Serve with `python3 -m http.server 8080` from project root for testing. Run `node data/generate.js` to regenerate JSON.

---

## File Map

| File | Change |
|------|--------|
| `apply/index.html` | Add 3 tab buttons, 3 tab panels, CSS, `loadUniTab()`, 3 render fns, extend `switchModalTab()`, extend `openUniModal()`, expand `UNI_COURSES` |
| `data/generate.js` | Replace ADMISSIONS, NSFAS, CONTACT objects; update COURSES entries |
| `data/universities/*/admissions.json` | Regenerated |
| `data/universities/*/nsfas.json` | Regenerated |
| `data/universities/*/contact.json` | Regenerated |
| `data/universities/*/courses.json` | Regenerated |

---

## Task 1: Audit current UNI_COURSES coverage

**Files:** Read: `apply/index.html`

- [ ] **Step 1: Count courses per university**

```bash
grep -o "^  [A-Z]\+:{" apply/index.html | head -30
# Then for each abbr, count entries:
grep -c "qual:" apply/index.html
```

Or open the file in an editor, find `const UNI_COURSES={` and count entries per key.

- [ ] **Step 2: Record which universities have fewer than 8 courses**

Expected: UCT=14, WITS=12. Everything else may be 0–6. Note the gaps — Tasks 8–11 fill them.

---

## Task 2: Add CSS for tab loading/error states and new tab content

**Files:** Modify: `apply/index.html` (inside the `<style>` block, after existing modal CSS rules)

- [ ] **Step 1: Locate the end of modal CSS** — search for `.modal-tab-btn` in the style block (~line 1748)

- [ ] **Step 2: Add the following CSS after the existing modal tab rules**

```css
/* ── Dynamic tab states ── */
.tab-skeleton{padding:28px 24px;display:flex;flex-direction:column;gap:12px;}
.tab-skel-line{height:14px;border-radius:6px;background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%);background-size:200% 100%;animation:skelShimmer 1.4s infinite;}
.tab-skel-line.wide{width:100%}.tab-skel-line.mid{width:70%}.tab-skel-line.short{width:40%}
@keyframes skelShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.tab-error{padding:24px;color:var(--red);font-size:13px;font-family:var(--ff-sans);}
.tab-error a{color:var(--red);text-decoration:underline;cursor:pointer;}

/* ── Admissions tab ── */
.adm-content{padding:20px 24px;display:flex;flex-direction:column;gap:16px;}
.adm-period-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.adm-period-pill{background:var(--stone);border-radius:8px;padding:8px 14px;display:flex;flex-direction:column;gap:2px;}
.adm-period-lbl{font-size:10px;font-weight:700;font-family:var(--ff-mono);color:var(--text-lt);text-transform:uppercase;letter-spacing:.06em;}
.adm-period-val{font-size:14px;font-weight:600;font-family:var(--ff-sans);color:var(--navy);}
.adm-period-arrow{color:var(--text-lt);font-size:18px;}
.adm-badges-row{display:flex;gap:8px;flex-wrap:wrap;}
.adm-badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;font-family:var(--ff-sans);}
.badge-navy{background:var(--navy);color:#fff;}.badge-green{background:var(--green);color:#fff;}.badge-gold{background:var(--gold);color:#fff;}.badge-red{background:var(--red);color:#fff;}
.adm-note{font-size:12px;font-style:italic;color:var(--text-lt);margin:0;font-family:var(--ff-sans);}
.adm-docs{background:var(--stone);border-radius:8px;padding:14px 16px;}
.adm-docs-title{font-size:12px;font-weight:700;font-family:var(--ff-mono);color:var(--text-lt);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
.adm-docs-list{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;}
.adm-docs-list li{font-size:13px;font-family:var(--ff-sans);color:var(--text);}
.adm-row{display:flex;flex-direction:column;gap:3px;}
.adm-label{font-size:11px;font-weight:700;font-family:var(--ff-mono);color:var(--text-lt);text-transform:uppercase;letter-spacing:.06em;}
.adm-value{font-size:13px;font-family:var(--ff-sans);color:var(--text);}
.adm-apply-btn{align-self:flex-start;text-decoration:none;}

/* ── NSFAS tab ── */
.nsfas-content{padding:20px 24px;display:flex;flex-direction:column;gap:16px;}
.nsfas-badges-row{display:flex;gap:8px;flex-wrap:wrap;}
.nsfas-badge{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;font-family:var(--ff-sans);}
.nsfas-office-card{background:var(--stone);border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;}
.nsfas-office-title{font-size:13px;font-weight:700;font-family:var(--ff-sans);color:var(--navy);}
.nsfas-contact-row{display:flex;align-items:center;gap:8px;font-size:13px;font-family:var(--ff-sans);color:var(--green);text-decoration:none;}
.nsfas-contact-row:hover{text-decoration:underline;}
.nsfas-icon{font-size:12px;color:var(--text-lt);}
.nsfas-note{font-size:13px;font-family:var(--ff-sans);color:var(--text);margin:0;line-height:1.6;}
.nsfas-additional{}
.nsfas-section-title{font-size:11px;font-weight:700;font-family:var(--ff-mono);color:var(--text-lt);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
.nsfas-list{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;}
.nsfas-list li{font-size:13px;font-family:var(--ff-sans);color:var(--text);}
.nsfas-empty{font-size:12px;font-style:italic;color:var(--text-lt);margin:0;}

/* ── Contact tab ── */
.contact-content{padding:20px 24px;display:flex;flex-direction:column;gap:16px;}
.contact-cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;}
.contact-card{background:var(--stone);border-radius:8px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;}
.contact-card-title{font-size:11px;font-weight:700;font-family:var(--ff-mono);color:var(--text-lt);text-transform:uppercase;letter-spacing:.06em;}
.contact-row{display:flex;align-items:center;gap:6px;font-size:12px;font-family:var(--ff-sans);color:var(--green);text-decoration:none;word-break:break-all;}
.contact-row:hover{text-decoration:underline;}
.contact-icon{font-size:11px;color:var(--text-lt);flex-shrink:0;}
.contact-address{font-size:13px;font-family:var(--ff-sans);color:var(--text);display:flex;align-items:flex-start;gap:6px;line-height:1.5;}
.contact-social-row{display:flex;gap:8px;flex-wrap:wrap;}
.social-link{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;font-family:var(--ff-sans);text-decoration:none;background:var(--stone);color:var(--navy);}
.social-link:hover{background:var(--navy);color:#fff;}
```

- [ ] **Step 3: Verify** — open `apply/index.html` in browser, no visual change yet (CSS only).

---

## Task 3: Add tab buttons and panels to modal HTML

**Files:** Modify: `apply/index.html` (~line 3895 — the `.modal-tabs-nav` block)

- [ ] **Step 1: Locate the modal tabs nav** — search for `modal-tabs-nav`

- [ ] **Step 2: Add three tab buttons** — insert after the existing Courses button:

```html
<button class="modal-tab-btn" data-tab="admissions" onclick="switchModalTab('admissions',this)">Admissions</button>
<button class="modal-tab-btn" data-tab="nsfas" onclick="switchModalTab('nsfas',this)">NSFAS</button>
<button class="modal-tab-btn" data-tab="contact" onclick="switchModalTab('contact',this)">Contact</button>
```

- [ ] **Step 3: Add three tab panels** — locate where the existing overview and courses panels end. Insert the following three panels immediately after the courses panel closing `</div>`:

```html
<!-- ADMISSIONS PANEL -->
<div class="modal-tab-panel" data-panel="admissions" style="display:none">
  <div class="tab-skeleton">
    <div class="tab-skel-line wide"></div>
    <div class="tab-skel-line mid"></div>
    <div class="tab-skel-line short"></div>
    <div class="tab-skel-line wide"></div>
    <div class="tab-skel-line mid"></div>
  </div>
</div>

<!-- NSFAS PANEL -->
<div class="modal-tab-panel" data-panel="nsfas" style="display:none">
  <div class="tab-skeleton">
    <div class="tab-skel-line wide"></div>
    <div class="tab-skel-line mid"></div>
    <div class="tab-skel-line short"></div>
    <div class="tab-skel-line wide"></div>
    <div class="tab-skel-line mid"></div>
  </div>
</div>

<!-- CONTACT PANEL -->
<div class="modal-tab-panel" data-panel="contact" style="display:none">
  <div class="tab-skeleton">
    <div class="tab-skel-line wide"></div>
    <div class="tab-skel-line mid"></div>
    <div class="tab-skel-line short"></div>
    <div class="tab-skel-line wide"></div>
    <div class="tab-skel-line mid"></div>
  </div>
</div>
```

- [ ] **Step 4: Verify** — open apply/ in browser, click any university card. Modal should show 5 tab buttons. Clicking Admissions/NSFAS/Contact shows the shimmer skeleton. No data yet.

---

## Task 4: Add JS infrastructure — cache, loadUniTab, extend switchModalTab and openUniModal

**Files:** Modify: `apply/index.html` (script block)

- [ ] **Step 1: Add cache variable** — find `const UNI_COURSES={` near the top of the script block and add before it:

```javascript
window._uniTabCache = {};
window._currentModalAbbr = null;
```

- [ ] **Step 2: Store abbr when modal opens** — in `openUniModal(abbr)`, add as the very first line of the function body:

```javascript
window._currentModalAbbr = abbr;
```

- [ ] **Step 3: Add loadUniTab function** — insert after the `closeUniModal` function:

```javascript
function loadUniTab(tab, abbr) {
  if (!abbr) return;
  var cacheKey = abbr + ':' + tab;
  var panel = document.querySelector('[data-panel="' + tab + '"]');
  if (!panel) return;

  if (window._uniTabCache[cacheKey]) {
    renderUniTab(tab, window._uniTabCache[cacheKey]);
    return;
  }

  panel.innerHTML = '<div class="tab-skeleton">' +
    '<div class="tab-skel-line wide"></div>' +
    '<div class="tab-skel-line mid"></div>' +
    '<div class="tab-skel-line short"></div>' +
    '<div class="tab-skel-line wide"></div>' +
    '<div class="tab-skel-line mid"></div>' +
    '</div>';

  fetch('/data/universities/' + abbr + '/' + tab + '.json')
    .then(function(r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function(data) {
      window._uniTabCache[cacheKey] = data;
      renderUniTab(tab, data);
    })
    .catch(function() {
      panel.innerHTML = '<div class="tab-error">Could not load data. <a onclick="loadUniTab(\'' + tab + '\',\'' + abbr + '\')">Try again</a></div>';
    });
}

function renderUniTab(tab, data) {
  if (tab === 'admissions') renderAdmissionsTab(data);
  else if (tab === 'nsfas') renderNsfasTab(data);
  else if (tab === 'contact') renderContactTab(data);
}
```

- [ ] **Step 4: Extend switchModalTab** — find `function switchModalTab(tab,btn){` (~line 4656). Locate the end of the function body and add before the closing `}`:

```javascript
  if (tab === 'admissions' || tab === 'nsfas' || tab === 'contact') {
    loadUniTab(tab, window._currentModalAbbr);
  }
```

- [ ] **Step 5: Verify** — open apply/ in browser, open any university modal, click Admissions tab. Browser DevTools Network tab should show a fetch to `/data/universities/UCT/admissions.json`. Skeleton shows, then either data renders (if served via http.server) or fetch fails gracefully with retry link (if opened as file://).

---

## Task 5: Implement renderAdmissionsTab

**Files:** Modify: `apply/index.html` (script block, after `renderUniTab`)

- [ ] **Step 1: Add the function**

```javascript
function renderAdmissionsTab(data) {
  var panel = document.querySelector('[data-panel="admissions"]');
  var opens = (data.applicationPeriod && data.applicationPeriod.opens) || 'TBA';
  var closes = (data.applicationPeriod && data.applicationPeriod.closes) || 'TBA';
  var feeText = data.applicationFee === 0 ? 'No application fee' : 'R' + (data.applicationFee || '—') + ' application fee';
  var waiverHtml = data.feeWaiver ? '<span class="adm-badge badge-green">Fee waiver available</span>' : '';
  var docsHtml = '';
  if (data.requiredDocuments && data.requiredDocuments.length) {
    docsHtml = '<div class="adm-docs"><div class="adm-docs-title">Required Documents</div><ul class="adm-docs-list">' +
      data.requiredDocuments.map(function(d) { return '<li>' + d + '</li>'; }).join('') +
      '</ul></div>';
  }
  var intlHtml = '';
  if (data.internationalStudents && data.internationalStudents.accepted) {
    intlHtml = '<div class="adm-row"><span class="adm-label">International Students</span><span class="adm-value">' + data.internationalStudents.note + '</span></div>';
  }
  panel.innerHTML =
    '<div class="adm-content">' +
      '<div class="adm-period-row">' +
        '<div class="adm-period-pill"><span class="adm-period-lbl">Opens</span><span class="adm-period-val">' + opens + '</span></div>' +
        '<span class="adm-period-arrow">→</span>' +
        '<div class="adm-period-pill"><span class="adm-period-lbl">Closes</span><span class="adm-period-val">' + closes + '</span></div>' +
      '</div>' +
      '<div class="adm-badges-row">' +
        '<span class="adm-badge badge-navy">' + feeText + '</span>' +
        waiverHtml +
        '<span class="adm-badge badge-gold">Min. APS: ' + (data.minimumAPS || 'N/A') + '</span>' +
      '</div>' +
      (data.apsNote ? '<p class="adm-note">' + data.apsNote + '</p>' : '') +
      docsHtml +
      intlHtml +
      '<a href="' + (data.applyUrl || '#') + '" target="_blank" rel="noopener" class="btn btn-green adm-apply-btn">Apply Now →</a>' +
    '</div>';
}
```

- [ ] **Step 2: Test** — serve project (`python3 -m http.server 8080`), open `http://localhost:8080/apply/`, click any card, click Admissions tab. Should show: dates pill row, fee + APS badges, documents checklist, Apply Now button.

---

## Task 6: Implement renderNsfasTab

**Files:** Modify: `apply/index.html` (script block, after `renderAdmissionsTab`)

- [ ] **Step 1: Add the function**

```javascript
function renderNsfasTab(data) {
  var panel = document.querySelector('[data-panel="nsfas"]');
  var accBadge = data.accredited
    ? '<span class="nsfas-badge badge-green">NSFAS Accredited</span>'
    : '<span class="nsfas-badge badge-red">Not Accredited</span>';
  var additionalHtml = (data.additionalFunding && data.additionalFunding.length)
    ? '<ul class="nsfas-list">' + data.additionalFunding.map(function(f){return '<li>'+f+'</li>';}).join('') + '</ul>'
    : '<p class="nsfas-empty">No additional institutional bursaries listed.</p>';
  panel.innerHTML =
    '<div class="nsfas-content">' +
      '<div class="nsfas-badges-row">' + accBadge + '</div>' +
      '<div class="nsfas-office-card">' +
        '<div class="nsfas-office-title">' + (data.financialAidOffice || 'Financial Aid Office') + '</div>' +
        (data.email ? '<a href="mailto:' + data.email + '" class="nsfas-contact-row"><span class="nsfas-icon">✉</span>' + data.email + '</a>' : '') +
        (data.phone ? '<a href="tel:' + data.phone.replace(/\s/g,'') + '" class="nsfas-contact-row"><span class="nsfas-icon">✆</span>' + data.phone + '</a>' : '') +
      '</div>' +
      (data.applicationNote ? '<p class="nsfas-note">' + data.applicationNote + '</p>' : '') +
      '<div class="nsfas-additional"><div class="nsfas-section-title">Additional Bursaries &amp; Funding</div>' + additionalHtml + '</div>' +
    '</div>';
}
```

- [ ] **Step 2: Test** — click NSFAS tab on any university. Should show: accreditation badge, financial aid office card with email/phone links, application note, bursaries list (or empty message).

---

## Task 7: Implement renderContactTab

**Files:** Modify: `apply/index.html` (script block, after `renderNsfasTab`)

- [ ] **Step 1: Add the function**

```javascript
function renderContactTab(data) {
  var panel = document.querySelector('[data-panel="contact"]');
  function makeCard(title, obj) {
    if (!obj) return '';
    return '<div class="contact-card">' +
      '<div class="contact-card-title">' + title + '</div>' +
      (obj.phone ? '<a href="tel:' + obj.phone.replace(/\s/g,'') + '" class="contact-row"><span class="contact-icon">✆</span>' + obj.phone + '</a>' : '') +
      (obj.email ? '<a href="mailto:' + obj.email + '" class="contact-row"><span class="contact-icon">✉</span>' + obj.email + '</a>' : '') +
      '</div>';
  }
  var socialLinks = [];
  if (data.social) {
    if (data.social.facebook) socialLinks.push('<a href="'+data.social.facebook+'" target="_blank" rel="noopener" class="social-link">Facebook</a>');
    if (data.social.twitter) socialLinks.push('<a href="'+data.social.twitter+'" target="_blank" rel="noopener" class="social-link">Twitter/X</a>');
    if (data.social.instagram) socialLinks.push('<a href="'+data.social.instagram+'" target="_blank" rel="noopener" class="social-link">Instagram</a>');
    if (data.social.linkedin) socialLinks.push('<a href="'+data.social.linkedin+'" target="_blank" rel="noopener" class="social-link">LinkedIn</a>');
  }
  panel.innerHTML =
    '<div class="contact-content">' +
      '<div class="contact-cards-grid">' +
        makeCard('General', data.general) +
        makeCard('Admissions', data.admissions) +
        makeCard('Financial Aid', data.financialAid) +
      '</div>' +
      (data.address ? '<div class="contact-address"><span class="contact-icon">📍</span>' + data.address + '</div>' : '') +
      (socialLinks.length ? '<div class="contact-social-row">' + socialLinks.join('') + '</div>' : '') +
    '</div>';
}
```

- [ ] **Step 2: Test** — click Contact tab on UCT. Should show 3 contact cards (General/Admissions/Financial Aid), postal address, social media links.

- [ ] **Step 3: Verify caching** — click between Overview → Admissions → Overview → Admissions. DevTools Network should show only ONE fetch for admissions.json; second visit uses cache.

- [ ] **Step 4: Commit**

```bash
git add apply/index.html
git commit -m "feat: add Admissions, NSFAS and Contact tabs to university modal"
```

---

## Task 8: Expand UNI_COURSES — Comprehensive universities (NMU, UFS, UWC, UFH, WSU, NWU)

**Files:** Modify: `apply/index.html` — find `const UNI_COURSES={` and add/replace entries for these universities.

- [ ] **Step 1: Add/replace NMU entry**

```javascript
NMU:[
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:24,duration:'3 Years',desc:'Programming, data structures, algorithms and software engineering.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:24,duration:'4 Years',desc:'Constitutional, commercial, criminal and environmental law.'},
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Business & Economic Sciences',aps:24,duration:'3 Years',desc:'Financial accounting, auditing and taxation towards CA(SA).'},
  {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Early childhood and foundation phase teaching methods.'},
  {name:'BEng Mechanical Engineering',qual:'BEng',type:'Degree',faculty:'Engineering & Built Env.',aps:26,duration:'4 Years',desc:'Thermodynamics, manufacturing systems and materials science.'},
  {name:'BA Criminology',qual:'BA',type:'Degree',faculty:'Arts',aps:22,duration:'3 Years',desc:'Crime, justice systems, policing and social deviance.'},
  {name:'BHSci Human Kinetics & Ergonomics',qual:'BHSci',type:'Degree',faculty:'Health Sciences',aps:22,duration:'4 Years',desc:'Sport science, exercise physiology and human performance.'},
  {name:'BSc Chemistry',qual:'BSc',type:'Degree',faculty:'Science',aps:24,duration:'3 Years',desc:'Organic, inorganic and physical chemistry with laboratory work.'},
  {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Business & Economic Sciences',aps:22,duration:'3 Years',desc:'Micro and macroeconomics, econometrics and economic policy.'},
  {name:'BA Fine Art',qual:'BA',type:'Degree',faculty:'Arts',aps:22,duration:'3 Years',desc:'Studio art, visual culture, art history and creative practice.'},
],
```

- [ ] **Step 2: Add/replace UFS entry**

```javascript
UFS:[
  {name:'BSc Computer Science & Informatics',qual:'BSc',type:'Degree',faculty:'Natural & Agricultural Sciences',aps:24,duration:'3 Years',desc:'Algorithms, software engineering, databases and networks.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:24,duration:'4 Years',desc:'South African and international law with commercial focus.'},
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:24,duration:'3 Years',desc:'Financial accounting, auditing and taxation towards CA(SA).'},
  {name:'MBChB — Medicine & Surgery',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:36,duration:'6 Years',desc:'Comprehensive medical training across Bloemfontein and clinical sites.'},
  {name:'BEd Intermediate Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Grade 4–7 teaching with subject specialisation.'},
  {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'Human behaviour, cognitive processes and abnormal psychology.'},
  {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Humanities',aps:22,duration:'4 Years',desc:'Community development, welfare services and counselling practice.'},
  {name:'BAgric Agricultural Management',qual:'BAgric',type:'Degree',faculty:'Natural & Agricultural Sciences',aps:22,duration:'4 Years',desc:'Crop science, animal science and farm enterprise management.'},
  {name:'BCom Human Resource Management',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:22,duration:'3 Years',desc:'Labour relations, talent management and organisational behaviour.'},
  {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Theology & Religion',aps:22,duration:'3 Years',desc:'Biblical studies, church history and practical theology.'},
],
```

- [ ] **Step 3: Add/replace UWC entry**

```javascript
UWC:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:24,duration:'3 Years',desc:'Financial accounting, auditing and taxation towards CA(SA).'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:24,duration:'4 Years',desc:'Constitutional, public, private and commercial law.'},
  {name:'BDent — Bachelor of Dentistry',qual:'BDent',type:'Degree',faculty:'Dentistry',aps:32,duration:'5 Years',desc:'Oral health, dental surgery and patient care at UWC\'s renowned dental faculty.'},
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:24,duration:'3 Years',desc:'Programming, software systems, data science and networks.'},
  {name:'BEd Senior Phase & FET',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Grade 7–12 teaching with subject specialisation.'},
  {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Arts',aps:22,duration:'3 Years',desc:'Cognitive, developmental and social psychology.'},
  {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Natural Sciences',aps:28,duration:'4 Years',desc:'Pharmaceutical sciences, pharmacology and patient care.'},
  {name:'BSocSci Social Work',qual:'BSocSci',type:'Degree',faculty:'Community & Health Sciences',aps:22,duration:'4 Years',desc:'Welfare, community development and social justice practice.'},
  {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:22,duration:'3 Years',desc:'Macroeconomics, microeconomics and development economics.'},
  {name:'BNurs — Bachelor of Nursing',qual:'BNurs',type:'Degree',faculty:'Community & Health Sciences',aps:22,duration:'4 Years',desc:'Comprehensive nursing science and community health practice.'},
],
```

- [ ] **Step 4: Add/replace UFH entry**

```javascript
UFH:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management & Commerce',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:20,duration:'4 Years',desc:'South African law with a focus on constitutional and human rights.'},
  {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Social Sciences & Humanities',aps:18,duration:'4 Years',desc:'Community development, welfare services and counselling practice.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture',aps:18,duration:'4 Years',desc:'Crop science, animal science and agricultural management.'},
  {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:18,duration:'4 Years',desc:'Early childhood education and foundation phase teaching.'},
  {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Social Sciences & Humanities',aps:18,duration:'3 Years',desc:'Cognitive, abnormal and social psychology fundamentals.'},
  {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Management & Commerce',aps:18,duration:'3 Years',desc:'Economic theory, development economics and quantitative methods.'},
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:20,duration:'3 Years',desc:'Programming, data structures and software engineering.'},
  {name:'BA Criminology',qual:'BA',type:'Degree',faculty:'Social Sciences & Humanities',aps:18,duration:'3 Years',desc:'Crime, policing, corrections and the criminal justice system.'},
  {name:'BCom Tourism Management',qual:'BCom',type:'Degree',faculty:'Management & Commerce',aps:18,duration:'3 Years',desc:'Tourism planning, hospitality management and heritage tourism.'},
],
```

- [ ] **Step 5: Add/replace WSU entry**

```javascript
WSU:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Business, Mgmt Sciences & Law',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Business, Mgmt Sciences & Law',aps:20,duration:'4 Years',desc:'South African law with emphasis on rural and community contexts.'},
  {name:'BEd Intermediate Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:18,duration:'4 Years',desc:'Grade 4–7 teaching across the Eastern Cape curriculum.'},
  {name:'BSc Nursing',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:22,duration:'4 Years',desc:'Nursing science, community health and primary healthcare.'},
  {name:'BTech Civil Engineering',qual:'BTech',type:'Degree',faculty:'Natural Sciences, Engineering & Technology',aps:20,duration:'4 Years',desc:'Structural design, construction management and surveying.'},
  {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Health Sciences',aps:18,duration:'4 Years',desc:'Community welfare, development practice and social justice.'},
  {name:'BCom Human Resource Management',qual:'BCom',type:'Degree',faculty:'Business, Mgmt Sciences & Law',aps:18,duration:'3 Years',desc:'Labour relations, talent management and organisational behaviour.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Natural Sciences, Engineering & Technology',aps:18,duration:'4 Years',desc:'Crop and animal science suited to the Eastern Cape agricultural sector.'},
  {name:'BA Communication',qual:'BA',type:'Degree',faculty:'Health Sciences',aps:18,duration:'3 Years',desc:'Media, public relations and corporate communication.'},
  {name:'BTech Information Technology',qual:'BTech',type:'Degree',faculty:'Natural Sciences, Engineering & Technology',aps:20,duration:'3 Years',desc:'Systems analysis, networking and software development.'},
],
```

- [ ] **Step 6: Add/replace NWU entry**

```javascript
NWU:[
  {name:'BSc Computer Science & Information Systems',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:22,duration:'3 Years',desc:'Programming, software engineering, AI and data management.'},
  {name:'BEng Electrical & Electronic Engineering',qual:'BEng',type:'Degree',faculty:'Engineering',aps:26,duration:'4 Years',desc:'Power systems, electronics, control engineering and communications.'},
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce & Law',aps:22,duration:'3 Years',desc:'Financial accounting, auditing and tax towards CA(SA).'},
  {name:'MBChB — Medicine & Surgery',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:32,duration:'6 Years',desc:'Comprehensive medical training at the Potchefstroom clinical campus.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Commerce & Law',aps:22,duration:'4 Years',desc:'South African law with bilingual (Afrikaans/English) instruction.'},
  {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:20,duration:'4 Years',desc:'Early childhood and foundation phase teaching.'},
  {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Humanities',aps:20,duration:'4 Years',desc:'Social welfare, community development and counselling.'},
  {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:26,duration:'4 Years',desc:'Pharmaceutical sciences, dispensing and pharmacology.'},
  {name:'BCom Tourism Management',qual:'BCom',type:'Degree',faculty:'Commerce & Law',aps:20,duration:'3 Years',desc:'Tourism, hospitality and recreation management.'},
  {name:'BSc Environmental Science',qual:'BSc',type:'Degree',faculty:'Natural Sciences',aps:22,duration:'3 Years',desc:'Ecology, environmental management, conservation and GIS.'},
],
```

- [ ] **Step 7: Commit**

```bash
git add apply/index.html
git commit -m "feat: expand UNI_COURSES for NMU, UFS, UWC, UFH, WSU, NWU"
```

---

## Task 9: Expand UNI_COURSES — UniZ, UNIVEN, UL, SMU, SPU, UMP

**Files:** Modify: `apply/index.html`

- [ ] **Step 1: Add/replace UniZ entry**

```javascript
UniZ:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Commerce, Administration & Law',aps:20,duration:'3 Years',desc:'Financial and management accounting for rural and peri-urban contexts.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Commerce, Administration & Law',aps:20,duration:'4 Years',desc:'South African law with community-oriented focus.'},
  {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Arts',aps:18,duration:'4 Years',desc:'Social welfare, community development and family counselling.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:18,duration:'4 Years',desc:'Crop and animal science serving the KwaZulu-Natal agricultural sector.'},
  {name:'BEd Senior Phase & FET',qual:'BEd',type:'Degree',faculty:'Education',aps:18,duration:'4 Years',desc:'Grade 7–12 teaching with science or commerce specialisation.'},
  {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Arts',aps:18,duration:'3 Years',desc:'Biblical studies, African theology and church ministry.'},
  {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Commerce, Administration & Law',aps:18,duration:'3 Years',desc:'Economic development, microeconomics and rural economics.'},
  {name:'BSocSci Development Studies',qual:'BSocSci',type:'Degree',faculty:'Arts',aps:18,duration:'3 Years',desc:'Development theory, poverty alleviation and policy analysis.'},
  {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Arts',aps:18,duration:'3 Years',desc:'Cognitive, social and community psychology.'},
  {name:'BSc Chemistry',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:20,duration:'3 Years',desc:'Organic, inorganic and analytical chemistry.'},
],
```

- [ ] **Step 2: Add/replace UNIVEN entry**

```javascript
UNIVEN:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:18,duration:'4 Years',desc:'South African law serving the Limpopo and Vhembe regions.'},
  {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:18,duration:'4 Years',desc:'Early childhood education with multilingual (Tshivenda/Xitsonga) focus.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture',aps:18,duration:'4 Years',desc:'Dryland farming, crop science and small-scale agricultural enterprise.'},
  {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Human Sciences',aps:18,duration:'4 Years',desc:'Community welfare, rural development and social justice.'},
  {name:'BSc Environmental Science',qual:'BSc',type:'Degree',faculty:'Science, Engineering & Technology',aps:18,duration:'3 Years',desc:'Ecology, conservation and environmental management in Limpopo.'},
  {name:'BNurs Nursing Science',qual:'BNurs',type:'Degree',faculty:'Health Sciences',aps:20,duration:'4 Years',desc:'Primary healthcare and community nursing in under-served areas.'},
  {name:'BCom Human Resource Management',qual:'BCom',type:'Degree',faculty:'Management',aps:18,duration:'3 Years',desc:'Labour relations, talent management and organisational behaviour.'},
  {name:'BAdmin Public Administration',qual:'BAdmin',type:'Degree',faculty:'Management',aps:18,duration:'3 Years',desc:'Local government, public policy and civic management.'},
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science, Engineering & Technology',aps:18,duration:'3 Years',desc:'Programming, networks and information systems.'},
],
```

- [ ] **Step 3: Add/replace UL entry**

```javascript
UL:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management & Law',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Management & Law',aps:20,duration:'4 Years',desc:'South African law with a strong human rights tradition.'},
  {name:'MBChB — Medicine & Surgery',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:28,duration:'6 Years',desc:'Medical training serving Limpopo and neighbouring provinces.'},
  {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Health Sciences',aps:22,duration:'4 Years',desc:'Pharmaceutical sciences and clinical pharmacy practice.'},
  {name:'BEd Senior Phase & FET',qual:'BEd',type:'Degree',faculty:'Humanities',aps:18,duration:'4 Years',desc:'Grade 7–12 teaching with Sepedi/Tshivenda medium options.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:18,duration:'4 Years',desc:'Dryland crop science, livestock and agricultural management.'},
  {name:'BA Social Work',qual:'BA',type:'Degree',faculty:'Humanities',aps:18,duration:'4 Years',desc:'Community development, welfare services and social justice.'},
  {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Management & Law',aps:18,duration:'3 Years',desc:'Development economics, micro and macroeconomics.'},
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science & Agriculture',aps:20,duration:'3 Years',desc:'Programming, software engineering and information systems.'},
  {name:'BSc Human Physiology & Anatomy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:22,duration:'3 Years',desc:'Basic medical sciences pathway for health professions entry.'},
],
```

- [ ] **Step 4: Add/replace SMU entry**

```javascript
SMU:[
  {name:'MBChB — Medicine & Surgery',qual:'MBChB',type:'Degree',faculty:'Health Sciences',aps:38,duration:'6 Years',desc:"South Africa's only dedicated health sciences university. World-class MBChB programme with strong community medicine focus."},
  {name:'BDent — Bachelor of Dentistry',qual:'BDent',type:'Degree',faculty:'Dentistry',aps:38,duration:'5 Years',desc:'Comprehensive dental surgery training including maxillofacial and restorative dentistry.'},
  {name:'BPharm — Bachelor of Pharmacy',qual:'BPharm',type:'Degree',faculty:'Pharmacy',aps:34,duration:'4 Years',desc:'Pharmaceutical sciences, clinical pharmacology and dispensing practice.'},
  {name:'BSc Nursing Science',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Professional nursing with primary healthcare and community health components.'},
  {name:'BSc Radiography',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Diagnostic and therapeutic radiography with clinical placements.'},
  {name:'BSc Occupational Therapy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Physical, cognitive and psychosocial rehabilitation therapy.'},
  {name:'BSc Physiotherapy',qual:'BSc',type:'Degree',faculty:'Health Sciences',aps:30,duration:'4 Years',desc:'Musculoskeletal, neurological and cardiorespiratory physiotherapy.'},
  {name:'BSc Medical Sciences',qual:'BSc',type:'Degree',faculty:'Preclinical Sciences',aps:34,duration:'3 Years',desc:'Anatomy, physiology and biochemistry — foundational pathway for health professions.'},
],
```

- [ ] **Step 5: Add/replace SPU entry**

```javascript
SPU:[
  {name:'BCom Economics & Management',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:22,duration:'3 Years',desc:'Economics, business management and entrepreneurship for Northern Cape development.'},
  {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Early childhood teaching in multilingual Northern Cape contexts.'},
  {name:'BA Heritage & Museum Studies',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'Cultural heritage management, museum practice and archival studies.'},
  {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'Cognitive, developmental and community psychology.'},
  {name:'BSc Mathematics & Statistics',qual:'BSc',type:'Degree',faculty:'Natural & Applied Sciences',aps:22,duration:'3 Years',desc:'Pure and applied mathematics, statistics and data analysis.'},
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:22,duration:'3 Years',desc:'Financial and management accounting with small-business focus.'},
  {name:'BA Development Studies',qual:'BA',type:'Degree',faculty:'Humanities',aps:22,duration:'3 Years',desc:'Community development, poverty alleviation and public policy.'},
  {name:'BSc Environmental Sciences',qual:'BSc',type:'Degree',faculty:'Natural & Applied Sciences',aps:22,duration:'3 Years',desc:'Ecology, conservation and environmental management in the Northern Cape.'},
],
```

- [ ] **Step 6: Add/replace UMP entry**

```javascript
UMP:[
  {name:'BEd Foundation Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Early childhood and foundation phase teaching in Mpumalanga schools.'},
  {name:'BEd Intermediate Phase',qual:'BEd',type:'Degree',faculty:'Education',aps:22,duration:'4 Years',desc:'Grade 4–7 teaching with Siswati/isiNdebele medium options.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:22,duration:'4 Years',desc:'Crop and animal science for Mpumalanga\'s agricultural economy.'},
  {name:'BSc Environmental Sciences',qual:'BSc',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:22,duration:'3 Years',desc:'Ecology, biodiversity management and conservation in the lowveld.'},
  {name:'BCom Tourism & Hospitality Management',qual:'BCom',type:'Degree',faculty:'Hospitality & Tourism',aps:22,duration:'3 Years',desc:'Tourism management for the Kruger Park and Mpumalanga tourism corridor.'},
  {name:'BAdmin Public Administration',qual:'BAdmin',type:'Degree',faculty:'Hospitality & Tourism',aps:22,duration:'3 Years',desc:'Local government, municipal finance and civic administration.'},
  {name:'BA Development Studies',qual:'BA',type:'Degree',faculty:'Hospitality & Tourism',aps:22,duration:'3 Years',desc:'Rural development, community upliftment and social policy.'},
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Agriculture & Natural Sciences',aps:22,duration:'3 Years',desc:'Programming, systems analysis and information technology.'},
],
```

- [ ] **Step 7: Commit**

```bash
git add apply/index.html
git commit -m "feat: expand UNI_COURSES for UniZ, UNIVEN, UL, SMU, SPU, UMP"
```

---

## Task 10: Expand UNI_COURSES — Universities of Technology + UNISA

**Files:** Modify: `apply/index.html`

- [ ] **Step 1: Add/replace CPUT entry**

```javascript
CPUT:[
  {name:'National Diploma: Electrical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering',aps:20,duration:'3 Years',desc:'Power systems, electrical machines and industrial control.'},
  {name:'National Diploma: Mechanical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering',aps:20,duration:'3 Years',desc:'Machine design, thermodynamics and manufacturing processes.'},
  {name:'BCom Business Management',qual:'BCom',type:'Degree',faculty:'Business & Mgmt Sciences',aps:22,duration:'3 Years',desc:'Entrepreneurship, operations and strategic business management.'},
  {name:'National Diploma: Information Technology',qual:'ND',type:'Diploma',faculty:'Informatics & Design',aps:20,duration:'3 Years',desc:'Software development, networking and database administration.'},
  {name:'National Diploma: Graphic Design',qual:'ND',type:'Diploma',faculty:'Informatics & Design',aps:20,duration:'3 Years',desc:'Visual communication, typography and digital design.'},
  {name:'National Diploma: Hospitality Management',qual:'ND',type:'Diploma',faculty:'Applied Sciences',aps:18,duration:'3 Years',desc:'Food & beverage, accommodation management and events.'},
  {name:'BEng (Tech) Civil Engineering',qual:'BEngTech',type:'Degree',faculty:'Engineering',aps:22,duration:'4 Years',desc:'Structural analysis, construction project management and surveying.'},
  {name:'National Diploma: Nursing',qual:'ND',type:'Diploma',faculty:'Health & Wellness Sciences',aps:22,duration:'3 Years',desc:'Professional nursing with Western Cape clinical placements.'},
  {name:'BTech Interior Design',qual:'BTech',type:'Degree',faculty:'Informatics & Design',aps:22,duration:'4 Years',desc:'Spatial design, materials, lighting and construction documentation.'},
  {name:'National Diploma: Food Technology',qual:'ND',type:'Diploma',faculty:'Applied Sciences',aps:18,duration:'3 Years',desc:'Food processing, quality control and product development.'},
],
```

- [ ] **Step 2: Add/replace DUT entry**

```javascript
DUT:[
  {name:'National Diploma: Electrical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Power systems, electrical machines and industrial wiring.'},
  {name:'National Diploma: Mechanical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Machine design, pneumatics and manufacturing technology.'},
  {name:'National Diploma: Business Administration',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Office management, business communication and administration.'},
  {name:'National Diploma: Information Technology',qual:'ND',type:'Diploma',faculty:'Accounting & Informatics',aps:20,duration:'3 Years',desc:'Systems development, networking and database management.'},
  {name:'National Diploma: Graphic Design',qual:'ND',type:'Diploma',faculty:'Arts & Design',aps:18,duration:'3 Years',desc:'Visual communication, branding and digital media design.'},
  {name:'National Diploma: Nursing',qual:'ND',type:'Diploma',faculty:'Health Sciences',aps:22,duration:'3 Years',desc:'Clinical nursing across KZN hospital networks.'},
  {name:'BTech Civil Engineering',qual:'BTech',type:'Degree',faculty:'Engineering & Built Env.',aps:22,duration:'4 Years',desc:'Structural, geotechnical and transportation engineering.'},
  {name:'National Diploma: Journalism',qual:'ND',type:'Diploma',faculty:'Arts & Design',aps:18,duration:'3 Years',desc:'Print, broadcast and digital journalism.'},
  {name:'National Diploma: Chemical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Process engineering, chemical reactions and industrial plant operation.'},
  {name:'National Diploma: Logistics',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Supply chain management, warehousing and transport logistics.'},
],
```

- [ ] **Step 3: Add/replace TUT entry**

```javascript
TUT:[
  {name:'National Diploma: Electrical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Electrical power, control systems and instrumentation.'},
  {name:'National Diploma: Mechanical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Built Env.',aps:20,duration:'3 Years',desc:'Machine design, hydraulics and manufacturing processes.'},
  {name:'BTech Computer Systems',qual:'BTech',type:'Degree',faculty:'IT',aps:22,duration:'4 Years',desc:'Systems programming, embedded systems and network engineering.'},
  {name:'National Diploma: Information Technology',qual:'ND',type:'Diploma',faculty:'IT',aps:20,duration:'3 Years',desc:'Software development, databases and IT project management.'},
  {name:'National Diploma: Graphic Design',qual:'ND',type:'Diploma',faculty:'Arts & Design',aps:18,duration:'3 Years',desc:'Visual communication, typography and motion graphics.'},
  {name:'BCom Financial Management',qual:'BCom',type:'Degree',faculty:'Management Sciences',aps:22,duration:'3 Years',desc:'Corporate finance, investment management and financial analysis.'},
  {name:'BEng (Tech) Civil Engineering',qual:'BEngTech',type:'Degree',faculty:'Engineering & Built Env.',aps:22,duration:'4 Years',desc:'Structural design, construction management and project planning.'},
  {name:'National Diploma: Public Management',qual:'ND',type:'Diploma',faculty:'Humanities',aps:18,duration:'3 Years',desc:'Local government administration, policy and public finance.'},
  {name:'National Diploma: Hospitality Management',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Food & beverage service, accommodation and events management.'},
  {name:'BTech Fashion Design',qual:'BTech',type:'Degree',faculty:'Arts & Design',aps:18,duration:'3 Years',desc:'Garment construction, textile technology and fashion business.'},
],
```

- [ ] **Step 4: Add/replace VUT entry**

```javascript
VUT:[
  {name:'National Diploma: Electrical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Technology',aps:20,duration:'3 Years',desc:'Electrical power, industrial electronics and control systems.'},
  {name:'National Diploma: Mechanical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & Technology',aps:20,duration:'3 Years',desc:'Machine design, thermodynamics and manufacturing technology.'},
  {name:'BTech Computer Systems',qual:'BTech',type:'Degree',faculty:'Applied & Computer Sciences',aps:22,duration:'4 Years',desc:'Embedded systems, networks and advanced programming.'},
  {name:'National Diploma: Information Technology',qual:'ND',type:'Diploma',faculty:'Applied & Computer Sciences',aps:20,duration:'3 Years',desc:'Software development, web programming and database systems.'},
  {name:'BCom Logistics & Supply Chain',qual:'BCom',type:'Degree',faculty:'Management Sciences',aps:20,duration:'3 Years',desc:'Warehousing, transport, procurement and supply chain optimisation.'},
  {name:'National Diploma: Public Administration',qual:'ND',type:'Diploma',faculty:'Humanities',aps:18,duration:'3 Years',desc:'Government administration, public policy and municipal finance.'},
  {name:'BEng (Tech) Chemical Engineering',qual:'BEngTech',type:'Degree',faculty:'Engineering & Technology',aps:22,duration:'4 Years',desc:'Process design, chemical reactions and industrial plant operations in the Vaal Triangle.'},
  {name:'National Diploma: Hospitality Management',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Food & beverage management, accommodation and events.'},
  {name:'BTech Project Management',qual:'BTech',type:'Degree',faculty:'Management Sciences',aps:20,duration:'3 Years',desc:'Project planning, risk management and contract administration.'},
  {name:'National Diploma: Office Management & Technology',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Office systems, records management and business communication.'},
],
```

- [ ] **Step 5: Add/replace MUT entry**

```javascript
MUT:[
  {name:'National Diploma: Electrical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering',aps:18,duration:'3 Years',desc:'Electrical power, industrial electronics and control systems.'},
  {name:'National Diploma: Mechanical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering',aps:18,duration:'3 Years',desc:'Machine design, hydraulics and manufacturing technology.'},
  {name:'National Diploma: Process Instrumentation',qual:'ND',type:'Diploma',faculty:'Engineering',aps:18,duration:'3 Years',desc:'Instrumentation, measurement systems and process control.'},
  {name:'National Diploma: Nature Conservation',qual:'ND',type:'Diploma',faculty:'Natural Sciences',aps:18,duration:'3 Years',desc:'Wildlife management, conservation biology and environmental monitoring.'},
  {name:'National Diploma: Public Management',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Local government, public administration and community development.'},
  {name:'National Diploma: Human Resources Management',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Recruitment, labour relations and employee wellness.'},
  {name:'BTech Mechanical Engineering',qual:'BTech',type:'Degree',faculty:'Engineering',aps:20,duration:'4 Years',desc:'Advanced design, materials science and production engineering.'},
  {name:'National Diploma: Chemical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering',aps:18,duration:'3 Years',desc:'Chemical process operations, safety and industrial plant management.'},
  {name:'National Diploma: Logistics',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Supply chain management, warehousing and transport coordination.'},
  {name:'National Diploma: Project Management',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Project planning, budgeting, scheduling and risk management.'},
],
```

- [ ] **Step 6: Add/replace CUT entry**

```javascript
CUT:[
  {name:'National Diploma: Electrical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & IT',aps:18,duration:'3 Years',desc:'Electrical power, electronics and industrial instrumentation.'},
  {name:'National Diploma: Mechanical Engineering',qual:'ND',type:'Diploma',faculty:'Engineering & IT',aps:18,duration:'3 Years',desc:'Mechanical design, pneumatics and manufacturing technology.'},
  {name:'National Diploma: Information Technology',qual:'ND',type:'Diploma',faculty:'Engineering & IT',aps:18,duration:'3 Years',desc:'Software development, networking and database administration.'},
  {name:'BCom Marketing Management',qual:'BCom',type:'Degree',faculty:'Management Sciences',aps:20,duration:'3 Years',desc:'Digital marketing, brand management and consumer behaviour.'},
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Management Sciences',aps:20,duration:'3 Years',desc:'Financial accounting, auditing and management accounting.'},
  {name:'BTech Civil Engineering',qual:'BTech',type:'Degree',faculty:'Engineering & IT',aps:20,duration:'4 Years',desc:'Structural, geotechnical and construction engineering.'},
  {name:'National Diploma: Environmental Health',qual:'ND',type:'Diploma',faculty:'Health & Environmental Sciences',aps:18,duration:'3 Years',desc:'Environmental health inspection, food safety and occupational health.'},
  {name:'National Diploma: Biomedical Technology',qual:'ND',type:'Diploma',faculty:'Health & Environmental Sciences',aps:20,duration:'3 Years',desc:'Clinical laboratory science, haematology and microbiology.'},
  {name:'BEd Senior Phase & FET',qual:'BEd',type:'Degree',faculty:'Humanities',aps:18,duration:'4 Years',desc:'Grade 7–12 teaching with technical and vocational subjects.'},
  {name:'National Diploma: Office Management & Technology',qual:'ND',type:'Diploma',faculty:'Management Sciences',aps:18,duration:'3 Years',desc:'Office systems, records management and business communication.'},
],
```

- [ ] **Step 7: Add/replace UNISA entry**

```javascript
UNISA:[
  {name:'BCom Accounting',qual:'BCom',type:'Degree',faculty:'Accounting Sciences',aps:15,duration:'3 Years',desc:'Distance learning accounting, auditing and taxation. Open to all South Africans.'},
  {name:'Bachelor of Laws (LLB)',qual:'LLB',type:'Degree',faculty:'Law',aps:20,duration:'4 Years',desc:'Comprehensive South African legal education via distance study.'},
  {name:'BA Psychology',qual:'BA',type:'Degree',faculty:'Human Sciences',aps:15,duration:'3 Years',desc:'Human behaviour, developmental psychology and counselling foundations.'},
  {name:'BSc Computing',qual:'BSc',type:'Degree',faculty:'Science, Engineering & Technology',aps:18,duration:'3 Years',desc:'Distance software development, systems analysis and IT.'},
  {name:'BEd Adult & Community Education',qual:'BEd',type:'Degree',faculty:'Education',aps:15,duration:'4 Years',desc:'Adult literacy, community education and lifelong learning.'},
  {name:'BCom Human Resource Management',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:15,duration:'3 Years',desc:'Labour relations, talent management and HR strategy via distance.'},
  {name:'BAdmin Public Administration',qual:'BAdmin',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:15,duration:'3 Years',desc:'Local government, public policy and civic administration.'},
  {name:'BSc Agriculture',qual:'BSc',type:'Degree',faculty:'Agriculture & Env Sciences',aps:15,duration:'3 Years',desc:'Crop science, animal science and natural resources via distance learning.'},
  {name:'BTh Theology',qual:'BTh',type:'Degree',faculty:'Theology & Religion',aps:15,duration:'3 Years',desc:'Biblical studies, church history and practical theology.'},
  {name:'BCom Economics',qual:'BCom',type:'Degree',faculty:'Economic & Mgmt Sciences',aps:15,duration:'3 Years',desc:'Economic theory, development economics and quantitative analysis.'},
],
```

- [ ] **Step 8: Commit**

```bash
git add apply/index.html
git commit -m "feat: expand UNI_COURSES for CPUT, DUT, TUT, VUT, MUT, CUT, UNISA"
```

---

## Task 11: Update generate.js — admissions data

**Files:** Modify: `data/generate.js`

- [ ] **Step 1: Locate the ADMISSIONS constant** — search for `const ADMISSIONS` or `ADMISSIONS = {` in generate.js

- [ ] **Step 2: Replace the entire ADMISSIONS object** with the following:

```javascript
const ADMISSIONS = {
  UCT:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:36, apsNote:'Health Sciences closes 30 June. NBT required for most faculties.', applyUrl:'https://myapps.uct.ac.za/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'International applicants require SAQA evaluation of qualifications.'} },
  WITS:   { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:35, apsNote:'Health Sciences and some Engineering programmes close 30 June. WITS may require NBT.', applyUrl:'https://www.wits.ac.za/application/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'Qualifications must be evaluated by SAQA. Apply early — international quota applies.'} },
  SU:     { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:30, apsNote:'Medicine and Health Sciences close 31 May. Language proficiency test required for some programmes.', applyUrl:'https://www.sun.ac.za/english/student-affairs/Pages/Applications.aspx', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'Recognised equivalents of NSC accepted. Early application strongly advised.'} },
  UP:     { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:200, feeWaiver:false, minimumAPS:28, apsNote:'Veterinary Science and MBChB close 30 June. UP uses its own APS calculation — verify on their website.', applyUrl:'https://www.up.ac.za/apply', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UP international office assists with equivalency.'} },
  UJ:     { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:200, feeWaiver:false, minimumAPS:24, apsNote:'Health Sciences programmes close 30 June. Portfolio required for Art, Design & Architecture.', applyUrl:'https://www.uj.ac.za/apply-to-uj/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UJ welcomes SADC and international students.'} },
  UKZN:   { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:26, apsNote:'MBChB and Health Sciences close 30 June. NBT recommended for science and engineering.', applyUrl:'https://applications.ukzn.ac.za/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UKZN has a dedicated international student office.'} },
  RU:     { applicationPeriod:{opens:'1 April 2026',closes:'31 July 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:28, apsNote:'Rhodes has an early closing date. Apply by 31 July to be considered for all programmes.', applyUrl:'https://applications.ru.ac.za/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. Rhodes has a small international student community.'} },
  CPUT:   { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'Health & Wellness Sciences programmes may close earlier. Check faculty-specific deadlines.', applyUrl:'https://www.cput.ac.za/apply', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. CPUT welcomes students from across Africa.'} },
  DUT:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'Nursing and Health Sciences programmes have earlier closing dates. Check individual programme requirements.', applyUrl:'https://www.dut.ac.za/admissions/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. DUT has a growing international student community.'} },
  NMU:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:22, apsNote:'Health Sciences and Engineering close 31 July. Fine Art requires a portfolio submission.', applyUrl:'https://www.mandela.ac.za/Study-at-Mandela/Undergraduate/Apply', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. NMU values its diverse student body.'} },
  UFS:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:22, apsNote:'MBChB closes 31 May. UFS uses a campus-specific APS — verify on their website.', applyUrl:'https://apply.ufs.ac.za/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UFS has three campuses across the Free State.'} },
  UNISA:  { applicationPeriod:{opens:'1 October 2026',closes:'30 November 2026'}, applicationFee:0, feeWaiver:false, minimumAPS:15, apsNote:'UNISA uses a semester-based registration system, not an annual application window. Apply via the myUnisa portal.', applyUrl:'https://my.unisa.ac.za/portal/', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Previous academic transcripts (if applicable)','Proof of residence (not older than 3 months)'], internationalStudents:{accepted:true,note:'International students welcome. UNISA is globally recognised. SAQA evaluation advised.'} },
  UWC:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:22, apsNote:'Dentistry and Pharmacy close 30 June. UWC\'s fee waiver is available for qualifying students.', applyUrl:'https://www.uwc.ac.za/apply', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UWC has a strong legacy of access and equity.'} },
  UFH:    { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'UFH is a smaller institution — applications close earlier than most. Apply well in advance.', applyUrl:'https://www.ufh.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UFH has strong continental African connections.'} },
  WSU:    { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'Apply early — WSU receives high volumes from the Eastern Cape. Health Sciences close earlier.', applyUrl:'https://www.wsu.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. WSU serves predominantly rural Eastern Cape students.'} },
  NWU:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:150, feeWaiver:false, minimumAPS:20, apsNote:'MBChB and Pharmacy close 30 June. NWU has campuses in Potchefstroom, Mahikeng and Vanderbijlpark — specify your preferred campus.', applyUrl:'https://www.nwu.ac.za/applying-for-studies', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. NWU offers bilingual (Afrikaans/English) instruction.'} },
  UniZ:   { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'UniZ serves the KwaZulu-Natal rural region. Apply early as enrolment is limited.', applyUrl:'https://www.unizulu.ac.za/application', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UniZ has a strong isiZulu language and culture focus.'} },
  UNIVEN: { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'UNIVEN serves the remote Limpopo region. Health Sciences close 30 June.', applyUrl:'https://www.univen.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UNIVEN welcomes students from SADC countries.'} },
  UL:     { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'MBChB and Health Sciences close 30 June. UL has strong community medicine focus in Limpopo.', applyUrl:'https://www.ul.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. UL has strong Sepedi and Northern Sotho language instruction.'} },
  SMU:    { applicationPeriod:{opens:'1 February 2026',closes:'30 June 2026'}, applicationFee:200, feeWaiver:false, minimumAPS:34, apsNote:'SMU is a health sciences specialist — all programmes are health-related. Apply very early; competition is high. NBT required.', applyUrl:'https://www.smu.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form','NBT results'], internationalStudents:{accepted:false,note:'SMU currently focuses on South African students in line with its transformation mandate.'} },
  TUT:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:150, feeWaiver:false, minimumAPS:18, apsNote:'Nursing and Health programmes close 31 July. TUT spans multiple campuses — indicate your preferred campus.', applyUrl:'https://www.tut.ac.za/apply', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. TUT welcomes students from across Africa.'} },
  VUT:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'Apply early — VUT is popular in the Vaal Triangle industrial region. Some programmes have limited spaces.', applyUrl:'https://www.vut.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required.'} },
  MUT:    { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'MUT is a smaller institution — spaces are limited. Apply early.', applyUrl:'https://www.mut.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. MUT has strong links with the Umlazi and Durban South communities.'} },
  SPU:    { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:22, apsNote:'SPU is one of South Africa\'s newest universities with limited enrolment. Apply early.', applyUrl:'https://www.spu.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:false,note:'SPU currently focuses exclusively on South African students given its limited capacity.'} },
  UMP:    { applicationPeriod:{opens:'1 April 2026',closes:'31 August 2026'}, applicationFee:100, feeWaiver:true, minimumAPS:22, apsNote:'UMP is one of South Africa\'s newest universities. Limited enrolment — apply early.', applyUrl:'https://www.ump.ac.za/admissions', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:false,note:'UMP currently focuses on South African students, particularly from Mpumalanga.'} },
  CUT:    { applicationPeriod:{opens:'1 April 2026',closes:'30 September 2026'}, applicationFee:100, feeWaiver:false, minimumAPS:18, apsNote:'Health & Environmental Sciences programmes close 31 July. CUT has campuses in Bloemfontein and Welkom.', applyUrl:'https://www.cut.ac.za/apply', requiredDocuments:['Certified copy of SA ID or valid passport','Certified matric certificate or statement of results','Grade 11 and Grade 12 school report','Proof of residence (not older than 3 months)','Completed application form'], internationalStudents:{accepted:true,note:'SAQA evaluation required. CUT is the only university of technology in the Free State.'} },
};
```

- [ ] **Step 3: Commit**

```bash
git add data/generate.js
git commit -m "data: update admissions data for all 26 universities in generate.js"
```

---

## Task 12: Update generate.js — NSFAS data

**Files:** Modify: `data/generate.js`

- [ ] **Step 1: Locate the NSFAS constant** — search for `const NSFAS` or `NSFAS = {`

- [ ] **Step 2: Replace the entire NSFAS object**

```javascript
const NSFAS = {
  UCT:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'financial.aid@uct.ac.za', phone:'+27 21 650 3545', applicationNote:'Apply through the myNSFAS portal at www.nsfas.org.za before the national closing date (usually November). UCT\'s Financial Aid Office offers supplementary bursaries for qualifying students.', additionalFunding:['UCT Council Scholarship (merit-based)','UCT Equity Scholarship','UCT International Study Abroad Bursary'] },
  WITS:   { accredited:true, financialAidOffice:'Financial Aid & Scholarships Office', email:'financialaid@wits.ac.za', phone:'+27 11 717 1030', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. Wits also offers merit bursaries — apply separately via the Wits scholarships portal.', additionalFunding:['Wits Academic Merit Bursary','Wits Faculty Bursaries','Vice-Chancellor\'s Scholarship'] },
  SU:     { accredited:true, financialAidOffice:'Financial Aid Division', email:'beurs@sun.ac.za', phone:'+27 21 808 9111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. SU\'s Financial Aid Division provides bridging loans and merit bursaries for qualifying students.', additionalFunding:['SU Merit Bursary','SU Rector\'s Award','Momentum Bursary (SU)'] },
  UP:     { accredited:true, financialAidOffice:'Student Financial Aid Division', email:'sfd@up.ac.za', phone:'+27 12 420 3111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UP\'s Student Financial Aid Division administers both NSFAS and institutional bursaries.', additionalFunding:['UP Academic Achievement Award','UP Senior Bursary','UP Equity Bursary'] },
  UJ:     { accredited:true, financialAidOffice:'Student Financial Aid', email:'saf@uj.ac.za', phone:'+27 11 559 3888', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UJ also offers institutional bursaries for qualifying students — apply separately on the UJ Student Portal.', additionalFunding:['UJ Merit Award','UJ Equity Bursary','UJ Sports Bursary'] },
  UKZN:   { accredited:true, financialAidOffice:'Financial Aid Office', email:'financialaid@ukzn.ac.za', phone:'+27 31 260 7000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UKZN has a dedicated financial aid team across all five campuses.', additionalFunding:['UKZN Council Bursary','UKZN Excellence Award','KZN Provincial Bursary (check eligibility)'] },
  RU:     { accredited:true, financialAidOffice:'Financial Aid Office', email:'financial@ru.ac.za', phone:'+27 46 603 8111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. Rhodes also offers the RU Financial Aid bursary for students with good academic standing.', additionalFunding:['RU Financial Aid Bursary','RU Merit Award','RU Equity Scholarship'] },
  CPUT:   { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@cput.ac.za', phone:'+27 21 460 3456', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. CPUT\'s Financial Aid Office assists with NSFAS queries and institutional bursaries across all campuses.', additionalFunding:['CPUT Institutional Bursary','Western Cape Government Bursary (check eligibility)'] },
  DUT:    { accredited:true, financialAidOffice:'Student Financial Aid Bureau', email:'sas@dut.ac.za', phone:'+27 31 373 2000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. DUT\'s Student Affairs team manages NSFAS and supplementary institutional bursaries.', additionalFunding:['DUT Merit Award','KZN Department of Education Bursary (teaching)'] },
  NMU:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@mandela.ac.za', phone:'+27 41 504 1111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. Named in honour of Nelson Mandela, NMU is committed to access — contact the Financial Aid Office for assistance.', additionalFunding:['NMU Council Bursary','NMU Academic Merit Award'] },
  UFS:    { accredited:true, financialAidOffice:'Student Financial Aid Office', email:'finaid@ufs.ac.za', phone:'+27 51 401 9111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UFS\'s Financial Aid Office serves three campuses — contact your campus office directly.', additionalFunding:['UFS Rector\'s Merit Award','Free State Provincial Bursary (teaching)','UFS Equity Bursary'] },
  UNISA:  { accredited:true, financialAidOffice:'Financial Aid Office', email:'study-info@unisa.ac.za', phone:'+27 12 429 3111', applicationNote:'UNISA NSFAS applications follow the national myNSFAS process at www.nsfas.org.za. As a distance institution, UNISA NSFAS covers tuition and registration only — not accommodation or meals.', additionalFunding:['UNISA Imbali Bursary','UNISA Sikhula Sonke Bursary','SETA Bursaries (various — check your sector)'] },
  UWC:    { accredited:true, financialAidOffice:'Student Financial Aid Office', email:'finaid@uwc.ac.za', phone:'+27 21 959 3900', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UWC has a historically strong commitment to student access and financial support.', additionalFunding:['UWC Institutional Bursary','UWC Dentistry Bursary (for qualifying dental students)','Western Cape Government Bursary'] },
  UFH:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@ufh.ac.za', phone:'+27 40 602 2111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UFH is one of Africa\'s oldest HBIs — the Financial Aid Office is committed to making higher education accessible.', additionalFunding:['UFH Council Bursary','UFH Merit Award'] },
  WSU:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@wsu.ac.za', phone:'+27 47 502 2111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. WSU serves a predominantly rural population — the Financial Aid Office provides comprehensive support.', additionalFunding:['WSU Council Bursary','Eastern Cape Provincial Bursary (teaching)'] },
  NWU:    { accredited:true, financialAidOffice:'Financial Aid Division', email:'financial.aid@nwu.ac.za', phone:'+27 18 299 1111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. NWU has three campuses — contact the campus-specific financial aid office.', additionalFunding:['NWU Merit Bursary','NWU Rector\'s Scholarship','North West Province Bursary (teaching)'] },
  UniZ:   { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@unizulu.ac.za', phone:'+27 35 902 6000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UniZ serves the rural KZN region — the Financial Aid Office prioritises access for disadvantaged students.', additionalFunding:['UniZ Council Bursary','KZN Department of Agriculture Bursary'] },
  UNIVEN: { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@univen.ac.za', phone:'+27 15 962 8000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UNIVEN serves the remote Vhembe district in Limpopo — the Financial Aid Office provides dedicated support for rural students.', additionalFunding:['UNIVEN Council Bursary','Limpopo Province Bursary (health sciences and teaching)'] },
  UL:     { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@ul.ac.za', phone:'+27 15 268 9111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UL has a strong commitment to access for Limpopo students. The Financial Aid Office administers NSFAS and institutional bursaries.', additionalFunding:['UL Council Bursary','Limpopo Agri-SA Bursary','UL Health Sciences Bursary'] },
  SMU:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@smu.ac.za', phone:'+27 12 521 4000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. SMU is a health sciences specialist — NSFAS covers MBChB, BDent, BPharm and allied health programmes.', additionalFunding:['SMU Council Bursary','Department of Health Bursary (rural health bonded)','SMU Merit Award'] },
  TUT:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@tut.ac.za', phone:'+27 12 382 4000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. TUT has multiple campuses — contact the campus-specific financial aid office. TUT also administers SETA bursaries for technical programmes.', additionalFunding:['TUT Institutional Bursary','MERSETA Bursary (engineering)','MICT SETA Bursary (IT)'] },
  VUT:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@vut.ac.za', phone:'+27 16 950 9000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. VUT is embedded in the Vaal Triangle industrial corridor — sector bursaries from MERSETA and other SETAs are available.', additionalFunding:['VUT Council Bursary','MERSETA Bursary (engineering)','VUT Merit Award'] },
  MUT:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@mut.ac.za', phone:'+27 31 907 7111', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. MUT serves the Umlazi community — the Financial Aid Office prioritises access for students from disadvantaged backgrounds.', additionalFunding:['MUT Council Bursary','KZN Provincial Bursary (engineering and health)'] },
  SPU:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@spu.ac.za', phone:'+27 53 491 0000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. SPU is one of SA\'s newest universities — the Financial Aid Office provides personalised support given the small student population.', additionalFunding:['SPU Council Bursary','Northern Cape Provincial Bursary (education and development)'] },
  UMP:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@ump.ac.za', phone:'+27 13 002 0000', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. UMP was established to serve Mpumalanga — the Financial Aid Office supports students from the province\'s rural communities.', additionalFunding:['UMP Council Bursary','Mpumalanga Provincial Bursary (education and agriculture)'] },
  CUT:    { accredited:true, financialAidOffice:'Financial Aid Office', email:'finaid@cut.ac.za', phone:'+27 51 507 3911', applicationNote:'Apply through myNSFAS at www.nsfas.org.za. CUT is the only university of technology in the Free State. The Financial Aid Office serves campuses in Bloemfontein and Welkom.', additionalFunding:['CUT Council Bursary','Free State Provincial Bursary (engineering and health)','MERSETA Bursary'] },
};
```

- [ ] **Step 3: Commit**

```bash
git add data/generate.js
git commit -m "data: update NSFAS financial aid data for all 26 universities"
```

---

## Task 13: Update generate.js — contact data

**Files:** Modify: `data/generate.js`

- [ ] **Step 1: Locate the CONTACT constant** — search for `const CONTACT` or `CONTACT = {`

- [ ] **Step 2: Replace the entire CONTACT object**

```javascript
const CONTACT = {
  UCT:    { general:{phone:'+27 21 650 9111',email:'registrar@uct.ac.za'}, admissions:{phone:'+27 21 650 2128',email:'ugadmissions@uct.ac.za'}, financialAid:{phone:'+27 21 650 3545',email:'financial.aid@uct.ac.za'}, address:'University of Cape Town, Private Bag X3, Rondebosch, Cape Town, 7701', social:{facebook:'https://www.facebook.com/UCT.ac.za',twitter:'https://twitter.com/UCT_news',instagram:'https://www.instagram.com/uct_official',linkedin:'https://www.linkedin.com/school/university-of-cape-town/'} },
  WITS:   { general:{phone:'+27 11 717 1000',email:'registrar@wits.ac.za'}, admissions:{phone:'+27 11 717 1888',email:'applications@wits.ac.za'}, financialAid:{phone:'+27 11 717 1030',email:'financialaid@wits.ac.za'}, address:'University of the Witwatersrand, 1 Jan Smuts Avenue, Braamfontein, Johannesburg, 2000', social:{facebook:'https://www.facebook.com/WitsUniversity',twitter:'https://twitter.com/WitsUniversity',instagram:'https://www.instagram.com/witsuniversity',linkedin:'https://www.linkedin.com/school/university-of-the-witwatersrand/'} },
  SU:     { general:{phone:'+27 21 808 9111',email:'info@sun.ac.za'}, admissions:{phone:'+27 21 808 9111',email:'admissions@sun.ac.za'}, financialAid:{phone:'+27 21 808 9111',email:'beurs@sun.ac.za'}, address:'Stellenbosch University, Private Bag X1, Matieland, Stellenbosch, 7602', social:{facebook:'https://www.facebook.com/StellenboschUniversity',twitter:'https://twitter.com/stellenbosch_uni',instagram:'https://www.instagram.com/stellenboschuniversity',linkedin:'https://www.linkedin.com/school/stellenbosch-university/'} },
  UP:     { general:{phone:'+27 12 420 3111',email:'csc@up.ac.za'}, admissions:{phone:'+27 12 420 3111',email:'csc@up.ac.za'}, financialAid:{phone:'+27 12 420 3111',email:'sfd@up.ac.za'}, address:'University of Pretoria, Private Bag X20, Hatfield, Pretoria, 0028', social:{facebook:'https://www.facebook.com/TuKsUniversity',twitter:'https://twitter.com/tuks_up',instagram:'https://www.instagram.com/universityofpretoria',linkedin:'https://www.linkedin.com/school/university-of-pretoria/'} },
  UJ:     { general:{phone:'+27 11 559 4555',email:'srs@uj.ac.za'}, admissions:{phone:'+27 11 559 4555',email:'studentenq@uj.ac.za'}, financialAid:{phone:'+27 11 559 3888',email:'saf@uj.ac.za'}, address:'University of Johannesburg, PO Box 524, Auckland Park, Johannesburg, 2006', social:{facebook:'https://www.facebook.com/UJoburg',twitter:'https://twitter.com/UJoburg',instagram:'https://www.instagram.com/ujoburg',linkedin:'https://www.linkedin.com/school/university-of-johannesburg/'} },
  UKZN:   { general:{phone:'+27 31 260 1003',email:'registrar@ukzn.ac.za'}, admissions:{phone:'+27 31 260 7000',email:'admissions@ukzn.ac.za'}, financialAid:{phone:'+27 31 260 7000',email:'financialaid@ukzn.ac.za'}, address:'University of KwaZulu-Natal, Private Bag X54001, Durban, 4000', social:{facebook:'https://www.facebook.com/UKZN',twitter:'https://twitter.com/ukzn',instagram:'https://www.instagram.com/ukznofficial',linkedin:'https://www.linkedin.com/school/university-of-kwazulu-natal/'} },
  RU:     { general:{phone:'+27 46 603 8111',email:'registrar@ru.ac.za'}, admissions:{phone:'+27 46 603 8111',email:'admissions@ru.ac.za'}, financialAid:{phone:'+27 46 603 8111',email:'financial@ru.ac.za'}, address:'Rhodes University, PO Box 94, Makhanda, Eastern Cape, 6140', social:{facebook:'https://www.facebook.com/RhodesUniversity',twitter:'https://twitter.com/rhodesuniversity',instagram:'https://www.instagram.com/rhodes_university',linkedin:'https://www.linkedin.com/school/rhodes-university/'} },
  CPUT:   { general:{phone:'+27 21 460 3911',email:'info@cput.ac.za'}, admissions:{phone:'+27 21 460 3456',email:'admissions@cput.ac.za'}, financialAid:{phone:'+27 21 460 3456',email:'finaid@cput.ac.za'}, address:'Cape Peninsula University of Technology, PO Box 652, Cape Town, 8000', social:{facebook:'https://www.facebook.com/cputofficial',twitter:'https://twitter.com/CPUT',instagram:'https://www.instagram.com/cputofficial',linkedin:'https://www.linkedin.com/school/cape-peninsula-university-of-technology/'} },
  DUT:    { general:{phone:'+27 31 373 2000',email:'studentservices@dut.ac.za'}, admissions:{phone:'+27 31 373 2000',email:'admissions@dut.ac.za'}, financialAid:{phone:'+27 31 373 2000',email:'sas@dut.ac.za'}, address:'Durban University of Technology, PO Box 1334, Durban, 4000', social:{facebook:'https://www.facebook.com/DurbanUniversityofTechnology',twitter:'https://twitter.com/DUTonline',instagram:'https://www.instagram.com/dutonline',linkedin:'https://www.linkedin.com/school/durban-university-of-technology/'} },
  NMU:    { general:{phone:'+27 41 504 1111',email:'sro@mandela.ac.za'}, admissions:{phone:'+27 41 504 2000',email:'admissions@mandela.ac.za'}, financialAid:{phone:'+27 41 504 1111',email:'finaid@mandela.ac.za'}, address:'Nelson Mandela University, PO Box 77000, Nelson Mandela Bay, 6031', social:{facebook:'https://www.facebook.com/MandelaUni',twitter:'https://twitter.com/MandelaUni',instagram:'https://www.instagram.com/mandelauni',linkedin:'https://www.linkedin.com/school/nelson-mandela-university/'} },
  UFS:    { general:{phone:'+27 51 401 9111',email:'info@ufs.ac.za'}, admissions:{phone:'+27 51 401 9111',email:'admissions@ufs.ac.za'}, financialAid:{phone:'+27 51 401 9111',email:'finaid@ufs.ac.za'}, address:'University of the Free State, PO Box 339, Bloemfontein, 9300', social:{facebook:'https://www.facebook.com/UFSacademic',twitter:'https://twitter.com/UFSacademic',instagram:'https://www.instagram.com/ufsacademic',linkedin:'https://www.linkedin.com/school/university-of-the-free-state/'} },
  UNISA:  { general:{phone:'+27 12 429 3111',email:'study-info@unisa.ac.za'}, admissions:{phone:'+27 12 429 3111',email:'study-info@unisa.ac.za'}, financialAid:{phone:'+27 12 429 3111',email:'study-info@unisa.ac.za'}, address:'University of South Africa, PO Box 392, UNISA, Pretoria, 0003', social:{facebook:'https://www.facebook.com/Unisa.Official',twitter:'https://twitter.com/myUNISA',instagram:'https://www.instagram.com/myunisa',linkedin:'https://www.linkedin.com/school/unisa/'} },
  UWC:    { general:{phone:'+27 21 959 2111',email:'registrar@uwc.ac.za'}, admissions:{phone:'+27 21 959 2000',email:'admissions@uwc.ac.za'}, financialAid:{phone:'+27 21 959 3900',email:'finaid@uwc.ac.za'}, address:'University of the Western Cape, Private Bag X17, Bellville, Cape Town, 7535', social:{facebook:'https://www.facebook.com/UniversityoftheWesternCape',twitter:'https://twitter.com/UWCnews',instagram:'https://www.instagram.com/uwc_official',linkedin:'https://www.linkedin.com/school/university-of-the-western-cape/'} },
  UFH:    { general:{phone:'+27 40 602 2111',email:'registrar@ufh.ac.za'}, admissions:{phone:'+27 40 602 2222',email:'admissions@ufh.ac.za'}, financialAid:{phone:'+27 40 602 2111',email:'finaid@ufh.ac.za'}, address:'University of Fort Hare, Private Bag X1314, Alice, Eastern Cape, 5700', social:{facebook:'https://www.facebook.com/UniversityofFortHare',twitter:'https://twitter.com/FortHareUni',instagram:'https://www.instagram.com/forthareuni',linkedin:'https://www.linkedin.com/school/university-of-fort-hare/'} },
  WSU:    { general:{phone:'+27 47 502 2111',email:'registrar@wsu.ac.za'}, admissions:{phone:'+27 47 502 2000',email:'admissions@wsu.ac.za'}, financialAid:{phone:'+27 47 502 2111',email:'finaid@wsu.ac.za'}, address:'Walter Sisulu University, Private Bag X1, Mthatha, Eastern Cape, 5117', social:{facebook:'https://www.facebook.com/WalterSisululUniversity',twitter:'https://twitter.com/WSU_RSA',instagram:'https://www.instagram.com/wsu_official',linkedin:'https://www.linkedin.com/school/walter-sisulu-university/'} },
  NWU:    { general:{phone:'+27 18 299 1111',email:'enquiries@nwu.ac.za'}, admissions:{phone:'+27 18 299 1111',email:'admissions@nwu.ac.za'}, financialAid:{phone:'+27 18 299 1111',email:'financial.aid@nwu.ac.za'}, address:'North-West University, 11 Hoffman Street, Potchefstroom, 2531', social:{facebook:'https://www.facebook.com/nwuniversity',twitter:'https://twitter.com/nwuniversity',instagram:'https://www.instagram.com/nwuniversity',linkedin:'https://www.linkedin.com/school/north-west-university/'} },
  UniZ:   { general:{phone:'+27 35 902 6000',email:'registrar@unizulu.ac.za'}, admissions:{phone:'+27 35 902 6111',email:'admissions@unizulu.ac.za'}, financialAid:{phone:'+27 35 902 6000',email:'finaid@unizulu.ac.za'}, address:'University of Zululand, Private Bag X1001, KwaDlangezwa, KwaZulu-Natal, 3886', social:{facebook:'https://www.facebook.com/UniZofficial',twitter:'https://twitter.com/UniZofficial',instagram:'https://www.instagram.com/unizofficial',linkedin:'https://www.linkedin.com/school/university-of-zululand/'} },
  UNIVEN: { general:{phone:'+27 15 962 8000',email:'info@univen.ac.za'}, admissions:{phone:'+27 15 962 8111',email:'admissions@univen.ac.za'}, financialAid:{phone:'+27 15 962 8000',email:'finaid@univen.ac.za'}, address:'University of Venda, Private Bag X5050, Thohoyandou, Limpopo, 0950', social:{facebook:'https://www.facebook.com/UniversityofVenda',twitter:'https://twitter.com/UniVen_Official',instagram:'https://www.instagram.com/univen_official',linkedin:'https://www.linkedin.com/school/university-of-venda/'} },
  UL:     { general:{phone:'+27 15 268 9111',email:'registrar@ul.ac.za'}, admissions:{phone:'+27 15 268 9222',email:'admissions@ul.ac.za'}, financialAid:{phone:'+27 15 268 9111',email:'finaid@ul.ac.za'}, address:'University of Limpopo, Private Bag X1106, Sovenga, Polokwane, 0727', social:{facebook:'https://www.facebook.com/UniLimpopo',twitter:'https://twitter.com/UniLimpopo',instagram:'https://www.instagram.com/unilimpopo',linkedin:'https://www.linkedin.com/school/university-of-limpopo/'} },
  SMU:    { general:{phone:'+27 12 521 4000',email:'info@smu.ac.za'}, admissions:{phone:'+27 12 521 4111',email:'admissions@smu.ac.za'}, financialAid:{phone:'+27 12 521 4000',email:'finaid@smu.ac.za'}, address:'Sefako Makgatho Health Sciences University, PO Box 60, Medunsa, Ga-Rankuwa, 0204', social:{facebook:'https://www.facebook.com/SMUofficialSA',twitter:'https://twitter.com/SMU_Official_SA',instagram:'https://www.instagram.com/smu_official_sa',linkedin:'https://www.linkedin.com/school/sefako-makgatho-health-sciences-university/'} },
  TUT:    { general:{phone:'+27 12 382 5911',email:'info@tut.ac.za'}, admissions:{phone:'+27 12 382 4000',email:'admissions@tut.ac.za'}, financialAid:{phone:'+27 12 382 4000',email:'finaid@tut.ac.za'}, address:'Tshwane University of Technology, Private Bag X680, Pretoria, 0001', social:{facebook:'https://www.facebook.com/TshwaneUniversityofTechnology',twitter:'https://twitter.com/TUTza',instagram:'https://www.instagram.com/tut_za',linkedin:'https://www.linkedin.com/school/tshwane-university-of-technology/'} },
  VUT:    { general:{phone:'+27 16 950 9000',email:'info@vut.ac.za'}, admissions:{phone:'+27 16 950 9111',email:'admissions@vut.ac.za'}, financialAid:{phone:'+27 16 950 9000',email:'finaid@vut.ac.za'}, address:'Vaal University of Technology, Private Bag X021, Vanderbijlpark, 1900', social:{facebook:'https://www.facebook.com/VUT.VaalUniversityofTechnology',twitter:'https://twitter.com/VUTweet',instagram:'https://www.instagram.com/vut_official',linkedin:'https://www.linkedin.com/school/vaal-university-of-technology/'} },
  MUT:    { general:{phone:'+27 31 907 7111',email:'info@mut.ac.za'}, admissions:{phone:'+27 31 907 7222',email:'admissions@mut.ac.za'}, financialAid:{phone:'+27 31 907 7111',email:'finaid@mut.ac.za'}, address:'Mangosuthu University of Technology, PO Box 12363, Jacobs, Durban, 4026', social:{facebook:'https://www.facebook.com/MangosuthuUniversityOfTechnology',twitter:'https://twitter.com/MUT_Official',instagram:'https://www.instagram.com/mut_official',linkedin:'https://www.linkedin.com/school/mangosuthu-university-of-technology/'} },
  SPU:    { general:{phone:'+27 53 491 0000',email:'info@spu.ac.za'}, admissions:{phone:'+27 53 491 0111',email:'admissions@spu.ac.za'}, financialAid:{phone:'+27 53 491 0000',email:'finaid@spu.ac.za'}, address:'Sol Plaatje University, Private Bag X5008, Kimberley, Northern Cape, 8301', social:{facebook:'https://www.facebook.com/SolPlaatjeUniversity',twitter:'https://twitter.com/SPUkimberley',instagram:'https://www.instagram.com/spukimberley',linkedin:'https://www.linkedin.com/school/sol-plaatje-university/'} },
  UMP:    { general:{phone:'+27 13 002 0000',email:'info@ump.ac.za'}, admissions:{phone:'+27 13 002 0111',email:'admissions@ump.ac.za'}, financialAid:{phone:'+27 13 002 0000',email:'finaid@ump.ac.za'}, address:'University of Mpumalanga, Private Bag X11283, Mbombela, Mpumalanga, 1200', social:{facebook:'https://www.facebook.com/UniversityofMpumalanga',twitter:'https://twitter.com/UMPofficial',instagram:'https://www.instagram.com/ump_official',linkedin:'https://www.linkedin.com/school/university-of-mpumalanga/'} },
  CUT:    { general:{phone:'+27 51 507 3000',email:'info@cut.ac.za'}, admissions:{phone:'+27 51 507 3111',email:'admissions@cut.ac.za'}, financialAid:{phone:'+27 51 507 3911',email:'finaid@cut.ac.za'}, address:'Central University of Technology, Private Bag X20539, Bloemfontein, Free State, 9300', social:{facebook:'https://www.facebook.com/CUTonline',twitter:'https://twitter.com/CUTonline',instagram:'https://www.instagram.com/cut_official',linkedin:'https://www.linkedin.com/school/central-university-of-technology/'} },
};
```

- [ ] **Step 3: Commit**

```bash
git add data/generate.js
git commit -m "data: update contact data for all 26 universities in generate.js"
```

---

## Task 14: Sync courses.json — update generate.js COURSES section

**Files:** Modify: `data/generate.js`

- [ ] **Step 1: Locate the COURSES constant** — search for `const COURSES` in generate.js

- [ ] **Step 2: For each university added/updated in Tasks 8–10, replace its entry in the COURSES object to match exactly what was written in UNI_COURSES**

The COURSES object in generate.js must produce identical data to `UNI_COURSES` in apply/index.html. Copy each university's array from the UNI_COURSES additions in Tasks 8–10 and paste them as the value for that key in COURSES. UCT and WITS already match — do not change them.

Example pattern for one entry (replicate for all universities changed in Tasks 8–10):
```javascript
NMU: [
  {name:'BSc Computer Science',qual:'BSc',type:'Degree',faculty:'Science',aps:24,duration:'3 Years',desc:'Programming, data structures, algorithms and software engineering.'},
  // ... (all 10 entries, identical to what was added to UNI_COURSES in Task 8)
],
```

- [ ] **Step 3: Commit**

```bash
git add data/generate.js
git commit -m "data: sync courses data in generate.js with UNI_COURSES"
```

---

## Task 15: Run generate.js and verify output

**Files:** Run: `data/generate.js`

- [ ] **Step 1: Run the generator**

```bash
cd /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS
node data/generate.js
```

Expected output: something like `✓ Written 130 files` (or similar success message from the script).

- [ ] **Step 2: Spot-check generated files**

```bash
# Check admissions data
cat data/universities/WITS/admissions.json | grep -E "opens|closes|applicationFee"
# Expected: "opens": "1 April 2026", "closes": "30 September 2026", "applicationFee": 100

# Check NSFAS data
cat data/universities/TUT/nsfas.json | grep -E "email|phone"
# Expected: "email": "finaid@tut.ac.za", "phone": "+27 12 382 4000"

# Check contact data
cat data/universities/NMU/contact.json | grep "facebook"
# Expected: facebook URL

# Check courses
cat data/universities/NMU/courses.json | grep "name" | wc -l
# Expected: 10
```

- [ ] **Step 3: Commit**

```bash
git add data/universities/
git commit -m "data: regenerate all 130 university JSON files via generate.js"
```

---

## Task 16: End-to-end integration test

- [ ] **Step 1: Start local server**

```bash
cd /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS
python3 -m http.server 8080
```

Open `http://localhost:8080/apply/` in browser.

- [ ] **Step 2: Test all 5 tabs on UCT**

Click "View Details" on UCT card:
- Overview tab: loads instantly — name, APS, description, faculties visible ✓
- Courses tab: loads instantly — 14 courses listed ✓
- Admissions tab: skeleton briefly, then: April→September dates, R100 fee badge, fee waiver badge, APS badge, 5 documents, International note, Apply Now button ✓
- NSFAS tab: NSFAS Accredited badge, financial aid office card with email/phone, application note, 3 additional bursaries ✓
- Contact tab: 3 contact cards (General/Admissions/Financial Aid), Cape Town postal address, 4 social links ✓

- [ ] **Step 3: Test a different university — NMU**

Click "View Details" on NMU card:
- Admissions: April→September 2026, R100, fee waiver badge, APS 22, 5 documents + note about Health Sciences and Fine Art portfolio ✓
- Courses: 10 courses covering Science, Law, Commerce, Education, Engineering, Arts ✓

- [ ] **Step 4: Verify tab caching**

Open UCT modal → click Admissions → note Network tab shows 1 fetch. Click Courses → click Admissions again → Network tab shows NO new fetch. Cache works. ✓

- [ ] **Step 5: Test error state**

Stop the http.server (`Ctrl+C`). Open apply/index.html directly as `file://`. Click any card, click Admissions. Should show: "Could not load data. Try again" in the panel. Other tabs (Overview, Courses) still work. ✓

- [ ] **Step 6: Test UNISA — different data shape**

UNISA has no application fee (0), different dates (Oct–Nov), distance note. Open UNISA modal → Admissions tab: "No application fee" badge, Oct→Nov dates, UNISA-specific APS note ✓

- [ ] **Step 7: Test SMU — restricted international**

SMU has `internationalStudents.accepted: false` — the international row should not appear in the Admissions tab for SMU. ✓

- [ ] **Step 8: Final commit**

```bash
git add apply/index.html
git commit -m "test: verified all 5 modal tabs, caching, error state and edge cases"
```
