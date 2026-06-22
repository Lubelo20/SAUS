# Universities Richer Detail Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the university detail modal from 2 tabs to 5 (Overview · Courses · Admissions · Funding · Contact) by surfacing existing `admissions`/`contact`/`nsfas` data.

**Architecture:** Reuse the modal's existing tab system. `loadUni` gains two guarded fetches (`contact.json`, `nsfas.json`); three new render functions populate three new panels; called from `openUniModal`'s success path.

**Tech Stack:** Vanilla JS in `apply/index.html`; static JSON in `/data/universities/`; verify via `python3 -m http.server 8080` + Chrome.

## Global Constraints

- No new dependencies; reuse existing modal/badge/tag/stat CSS classes — no new visual language.
- GUARD EVERY field access and `getElementById` — a null-deref previously killed this modal; it must not recur.
- Each new fetch `.catch(()=>({}))`; each render call wrapped so one panel's failure can't block others.
- Don't touch the Overview/Courses tabs, the card grid, or `loadUni`'s existing merge of info/courses/admissions.
- Environment: git commits hang in-sandbox (hand off to user); serve via `:8080`.

---

### Task 1: loadUni fetches contact + nsfas; add the 3 tabs + panels

**Files:**
- Modify: `apply/index.html` — `loadUni` (~line 4212-4226); modal tab-bar + panels markup; `openUniModal`.

**Interfaces:**
- Produces: merged `d` now has `d.contact` (object) and `d.nsfas` (object); three empty panels `#modalAdmissions`, `#modalFunding`, `#modalContact`; three tab buttons with `data-tab="admissions|funding|contact"`.

- [ ] **Step 1:** In `loadUni`, extend the `Promise.all([...])` to add two fetches after the admissions one:
```js
fetch(DATA_BASE+abbr+'/contact.json').then(function(r){return r.json();}).catch(function(){return {};}),
fetch(DATA_BASE+abbr+'/nsfas.json').then(function(r){return r.json();}).catch(function(){return {};})
```
and in the `.then(function(res){...})` merge, capture them: destructure the 5th/6th results as `contact`/`nsfas` and add `merged.contact=contact; merged.nsfas=nsfas;` before `_uniCache[abbr]=merged;return merged;`. (Read the exact current `Promise.all` arg list + the merge callback first; preserve existing fields.)
- [ ] **Step 2:** In the modal markup, find the tab buttons (`grep -n 'modal-tab-btn' apply/index.html`). After the Courses tab button, add three buttons matching the EXACT existing pattern, e.g.:
```html
<button class="modal-tab-btn" data-tab="admissions" onclick="switchModalTab('admissions',this)">Admissions</button>
<button class="modal-tab-btn" data-tab="funding" onclick="switchModalTab('funding',this)">Funding</button>
<button class="modal-tab-btn" data-tab="contact" onclick="switchModalTab('contact',this)">Contact</button>
```
(match the actual onclick signature the Overview/Courses buttons use — confirm by reading them.)
- [ ] **Step 3:** After the Courses panel div, add three panels matching the existing panel pattern (same wrapper class, `style="display:none"` like the inactive Courses panel): `<div id="modalAdmissions" ...></div>`, `<div id="modalFunding" ...></div>`, `<div id="modalContact" ...></div>`.
- [ ] **Step 4 (GATE):** Reload `apply/?cb=N`; open a modal; confirm 5 tab buttons appear and clicking each switches panels (empty for now) without console errors; Overview/Courses still work; all 26 cards still load.

### Task 2: renderAdmissions / renderFunding / renderContact + wire into openUniModal

**Files:**
- Modify: `apply/index.html` — add 3 functions near `openUniModal`; call them in its success `.then`.

**Interfaces:**
- Consumes: merged `d` from Task 1; panels from Task 1.

- [ ] **Step 1:** Add the three render functions (guard every field; reuse existing classes):
```js
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function renderAdmissions(d){
  var el=document.getElementById('modalAdmissions'); if(!el)return;
  var ap=d.applicationPeriod||{}; var h='';
  var unconf=d._verified&&d._verified.fields&&((d._verified.fields.applicationOpens||{}).confidence==='unconfirmed'||(d._verified.fields.applicationCloses||{}).confidence==='unconfirmed');
  h+='<div class="adm-block"><h4>Application window'+(ap.intakeYear?' ('+esc(ap.intakeYear)+' intake)':'')+'</h4><p>'+(ap.opens?esc(ap.opens):'TBC')+' &ndash; '+(ap.closes?esc(ap.closes):'TBC')+'</p>';
  if(unconf)h+='<p class="adm-note">Dates not yet officially published &mdash; confirm on the university’s site.</p>';
  h+='</div>';
  h+='<div class="adm-block"><h4>Application fee</h4><p>'+(d.applicationFee===0?'Free to apply':(d.applicationFee!=null?'R'+esc(d.applicationFee):'See site'))+(d.feeWaiver?' &middot; fee waiver available':'')+'</p></div>';
  if(d.minimumAPS!=null)h+='<div class="adm-block"><h4>Minimum APS</h4><p>'+esc(d.minimumAPS)+(d.apsNote?' &middot; '+esc(d.apsNote):'')+'</p></div>';
  if(Array.isArray(d.requiredDocuments)&&d.requiredDocuments.length){h+='<div class="adm-block"><h4>Required documents</h4><ul class="adm-list">'+d.requiredDocuments.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>';}
  if(d.internationalStudents&&d.internationalStudents.note)h+='<div class="adm-block"><h4>International students</h4><p>'+esc(d.internationalStudents.note)+'</p></div>';
  var apply=d.apply||d.applyUrl; if(apply)h+='<a class="btn btn-green btn-sm" href="'+esc(apply)+'" target="_blank" rel="noopener">Apply Online</a>';
  el.innerHTML=h;
}
function renderFunding(d){
  var el=document.getElementById('modalFunding'); if(!el)return;
  var n=d.nsfas||{}; var h='';
  if(n.accredited)h+='<div class="fund-badge">NSFAS accredited</div>';
  if(n.applicationNote)h+='<p class="adm-note">'+esc(n.applicationNote)+'</p>';
  if(n.email||n.phone)h+='<p>Financial aid: '+(n.email?'<a href="mailto:'+esc(n.email)+'">'+esc(n.email)+'</a>':'')+(n.phone?' &middot; <a href="tel:'+esc((n.phone+'').replace(/\s/g,''))+'">'+esc(n.phone)+'</a>':'')+'</p>';
  var f=Array.isArray(n.additionalFunding)?n.additionalFunding:[];
  if(f.length){h+='<h4>Bursaries &amp; scholarships</h4>'+f.map(function(b){return '<div class="fund-card"><div class="fund-card-head"><strong>'+esc(b.name)+'</strong>'+(b.type?'<span class="badge">'+esc(b.type)+'</span>':'')+'</div>'+(b.value?'<p class="fund-value">'+esc(b.value)+'</p>':'')+(b.criteria?'<p>'+esc(b.criteria)+'</p>':'')+(b.url?'<a href="'+esc(b.url)+'" target="_blank" rel="noopener">Details &rarr;</a>':'')+'</div>';}).join('');}
  else h+='<p>See the university’s financial-aid page for bursary options.</p>';
  el.innerHTML=h;
}
function renderContact(d){
  var el=document.getElementById('modalContact'); if(!el)return;
  var c=d.contact||{}; var h='';
  function row(label,o){ if(!o||(!o.phone&&!o.email))return ''; return '<div class="contact-row"><strong>'+label+'</strong>'+(o.email?' <a href="mailto:'+esc(o.email)+'">'+esc(o.email)+'</a>':'')+(o.phone?' &middot; <a href="tel:'+esc((o.phone+'').replace(/\s/g,''))+'">'+esc(o.phone)+'</a>':'')+'</div>'; }
  h+=row('Admissions',c.admissions)+row('Financial aid',c.financialAid)+row('General',c.general);
  if(c.address)h+='<div class="contact-row"><strong>Address</strong> '+esc(c.address)+'</div>';
  var s=c.social||{}; var links=Object.keys(s).filter(function(k){return s[k];}).map(function(k){return '<a href="'+esc(s[k])+'" target="_blank" rel="noopener">'+k+'</a>';});
  if(links.length)h+='<div class="contact-row"><strong>Social</strong> '+links.join(' &middot; ')+'</div>';
  if(!h)h='<p>Contact details not available.</p>';
  el.innerHTML=h;
}
```
- [ ] **Step 2:** In `openUniModal`'s success `.then(function(d){...})`, after the existing render calls, add (wrapped so one failure can't block others):
```js
try{renderAdmissions(d);}catch(e){console.warn('admissions',e);}
try{renderFunding(d);}catch(e){console.warn('funding',e);}
try{renderContact(d);}catch(e){console.warn('contact',e);}
```
- [ ] **Step 3:** Add small CSS near the modal styles (reuse tokens): `.adm-block{margin-bottom:16px}.adm-block h4{font-size:12px;text-transform:uppercase;color:var(--text-lt);margin-bottom:4px}.adm-note{font-size:12.5px;color:var(--text-lt)}.adm-list{margin:4px 0 0 18px}.fund-badge{display:inline-block;background:rgba(0,105,47,.1);color:var(--green);font-weight:600;font-size:12px;padding:4px 10px;border-radius:3px;margin-bottom:10px}.fund-card{border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:10px}.fund-card-head{display:flex;justify-content:space-between;align-items:center;gap:8px}.fund-value{color:var(--green);font-weight:600;font-size:13px}.contact-row{padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px}`
- [ ] **Step 4 (GATE):** Reload; open **UCT** (bursaries + full contact), **UFS** ("Free to apply"), **UNISA** (unconfirmed-date note). Click all 5 tabs each. Confirm each panel renders correct data; Overview/Courses unchanged; console clean; 26 cards still load; modal open/close works.

### Task 3: Final verification

- [ ] **Step 1:** Spot-check 2 more universities (e.g. WITS, NWU) — open modal, click through tabs, verify fee/dates/bursaries/contact match the corrected JSON.
- [ ] **Step 2:** Confirm no console errors across the session; hand staged changes to the user to commit.

---

## Self-Review
- **Spec coverage:** Task 1 = data flow + tab scaffolding; Task 2 = the 3 render functions + unconfirmed-date note + wiring + CSS; Task 3 = verification. Covers all spec sections.
- **Placeholder scan:** Render functions are complete code; markup steps reference the exact existing pattern (to be read in-step) — no vague placeholders.
- **Consistency:** `d.contact`/`d.nsfas` produced in Task 1, consumed in Task 2; panel IDs `#modalAdmissions/#modalFunding/#modalContact` and `data-tab` values consistent across tasks; `esc()` defined once, used by all three.
