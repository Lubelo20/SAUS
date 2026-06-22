# Universities Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Select 2–3 universities from the grid and compare them side-by-side on verified attributes in an overlay table.

**Architecture:** `compareSet[]` state; a Compare checkbox injected into each card via the existing `.uni-card` enhancement loop; a sticky `#compareBar`; a `#compareOverlay` table built from `loadUni` data. All in `apply/index.html`, reusing modal/table/button styles.

**Tech Stack:** Vanilla JS in `apply/index.html`; `loadUni(abbr)` (existing, cached); verify via `:8080` + Chrome.

## Global Constraints

- Max 3 universities; reuse existing classes; guard every field (em-dash fallback) — no null-deref.
- Card checkbox click must `stopPropagation` (cards have a uniGrid click→modal delegation).
- Don't change `loadUni`, the modal, or the static card markup beyond injecting the checkbox in the existing enhancement loop.
- git hangs in-sandbox (user commits); serve via `:8080`.

---

### Task 1: State, compare bar, and card checkbox

**Files:** Modify `apply/index.html` — add JS (compare state + bar) near `openUniModal`; inject checkbox in the `.uni-card` enhancement loop (~line 4355); `#compareBar` markup before `</body>` (or after `#uniGrid`); CSS.

**Interfaces:**
- Produces: `compareSet` (array of abbr), `toggleCompare(abbr)`, `clearCompare()`, `renderCompareBar()` — consumed by Task 2's `openCompare`.

- [ ] **Step 1:** Add state + functions (near the modal JS):
```js
var compareSet=[];
function toggleCompare(abbr){
  var i=compareSet.indexOf(abbr);
  if(i>-1)compareSet.splice(i,1);
  else if(compareSet.length>=3){ if(window.showToast)showToast('Compare up to 3 universities'); else alert('Compare up to 3 universities'); return; }
  else compareSet.push(abbr);
  syncCompareChecks(); renderCompareBar();
}
function clearCompare(){ compareSet=[]; syncCompareChecks(); renderCompareBar(); }
function syncCompareChecks(){
  document.querySelectorAll('.uni-card').forEach(function(card){
    var img=card.querySelector('img[alt]'); if(!img)return;
    var chk=card.querySelector('.compare-chk input'); if(chk)chk.checked=compareSet.indexOf(img.getAttribute('alt').trim())>-1;
  });
}
function renderCompareBar(){
  var bar=document.getElementById('compareBar'); if(!bar)return;
  if(!compareSet.length){bar.style.display='none';return;}
  bar.style.display='flex';
  bar.innerHTML='<div class="cmp-bar-chips">'+compareSet.map(function(a){return '<span class="cmp-chip">'+a+' <span class="cmp-chip-x" onclick="toggleCompare(\''+a+'\')" role="button" aria-label="Remove '+a+'">&times;</span></span>';}).join('')+'</div>'+
    '<div class="cmp-bar-actions"><button class="btn btn-gold btn-sm" '+(compareSet.length<2?'disabled':'')+' onclick="openCompare()">Compare ('+compareSet.length+')</button> <button class="cmp-clear" onclick="clearCompare()">Clear</button></div>';
}
```
- [ ] **Step 2:** In the `.uni-card` enhancement loop (`indexReady.then(function(){document.querySelectorAll('.uni-card').forEach(function(card){ ... })})`), after the existing abbr is computed, inject the checkbox:
```js
if(!card.querySelector('.compare-chk')){
  var lbl=document.createElement('label'); lbl.className='compare-chk';
  lbl.innerHTML='<input type="checkbox"'+(compareSet.indexOf(abbr)>-1?' checked':'')+'><span>Compare</span>';
  lbl.querySelector('input').addEventListener('click',function(e){e.stopPropagation();toggleCompare(abbr);});
  card.appendChild(lbl);
}
```
(read the loop first to use its existing `abbr` variable; `.uni-card` must be `position:relative` — add in CSS.)
- [ ] **Step 3:** Add `#compareBar` markup just before `</body>`: `<div id="compareBar" style="display:none"></div>`.
- [ ] **Step 4:** CSS:
```css
.uni-card{position:relative}
.compare-chk{position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:4px;font-size:11px;font-family:var(--ff-sans);color:var(--text-lt);background:rgba(255,255,255,.9);padding:2px 6px;border-radius:3px;cursor:pointer;z-index:2}
.compare-chk input{cursor:pointer}
#compareBar{position:fixed;left:0;right:0;bottom:0;z-index:1200;background:var(--navy);color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(0,0,0,.2)}
.cmp-bar-chips{display:flex;gap:8px;flex-wrap:wrap}
.cmp-chip{background:rgba(255,255,255,.12);padding:4px 10px;border-radius:14px;font-size:13px}
.cmp-chip-x{cursor:pointer;color:var(--gold-lt);font-weight:700;margin-left:2px}
.cmp-bar-actions{display:flex;align-items:center;gap:12px}
.cmp-clear{background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:13px;text-decoration:underline}
```
- [ ] **Step 5 (GATE):** Reload `apply/?cb=N`; tick 3 cards → bar shows 3 chips + "Compare (3)"; ticking a 4th is blocked; ✕ on a chip removes it; Clear empties the bar; clicking a checkbox does NOT open the modal; 26 cards + filters still work; console clean.

### Task 2: Compare overlay + table

**Files:** Modify `apply/index.html` — `#compareOverlay` markup near `#uniModal`; `openCompare/closeCompare/renderCompareTable`; CSS.

**Interfaces:** Consumes `compareSet`, `loadUni`.

- [ ] **Step 1:** Add overlay markup near the detail modal: `<div class="modal-overlay" id="compareOverlay"><div class="modal-box" style="max-width:900px"><button class="modal-close" onclick="closeCompare()" aria-label="Close">&times;</button><h3 style="padding:20px 24px 0;font-family:var(--ff-serif)">Compare universities</h3><div class="cmp-table-wrap" id="compareBody"></div></div></div>` (match the detail modal's overlay/box class names — read `#uniModal` to confirm; reuse `.open` mechanics).
- [ ] **Step 2:** Add functions:
```js
function closeCompare(){var o=document.getElementById('compareOverlay');if(o)o.classList.remove('open');document.body.style.overflow='';}
function openCompare(){
  if(compareSet.length<2)return;
  var o=document.getElementById('compareOverlay');o.classList.add('open');document.body.style.overflow='hidden';
  document.getElementById('compareBody').innerHTML='<p style="padding:20px 24px">Loading…</p>';
  Promise.all(compareSet.map(function(a){return loadUni(a).then(function(d){return d;}).catch(function(){return {abbr:a,_err:true};});})).then(renderCompareTable);
}
function cmpCell(d,fn){ try{ if(d._err)return '&mdash;'; var v=fn(d); return (v==null||v==='')?'&mdash;':v; }catch(e){return '&mdash;';} }
function renderCompareTable(unis){
  var rows=[
    ['Location',function(d){return esc((d.city||''));}],
    ['Type',function(d){return esc(d.type);}],
    ['Founded',function(d){return esc(d.founded);}],
    ['Students',function(d){return d.students!=null?esc(d.students.toLocaleString?d.students.toLocaleString():d.students):'';}],
    ['Applications open',function(d){var ap=(d.admissions||{}).applicationPeriod||{};var u=(((d.admissions||{})._verified||{}).fields||{});var note=(u.applicationOpens||{}).confidence==='unconfirmed'?' <span class="cmp-unconf">(confirm on site)</span>':'';return ap.opens?esc(ap.opens)+note:'';}],
    ['Applications close',function(d){var ap=(d.admissions||{}).applicationPeriod||{};return ap.closes?esc(ap.closes):'';}],
    ['Application fee',function(d){var f=(d.admissions||{}).applicationFee;return f===0?'Free':(f!=null?'R'+esc(f):'');}],
    ['Minimum APS',function(d){var m=(d.admissions||{}).minimumAPS;return m!=null?esc(m):'';}],
    ['Faculties',function(d){return (d.faculties||[]).length||'';}],
    ['NSFAS',function(d){return (d.nsfas||{}).accredited?'Accredited':'&mdash;';}],
    ['Apply',function(d){var a=d.apply||((d.admissions||{}).applyUrl);return a?'<a class="btn btn-green btn-sm" href="'+esc(a)+'" target="_blank" rel="noopener">Apply</a>':'';}]
  ];
  var head='<tr><th></th>'+unis.map(function(d){return '<th>'+(d.logo?'<img src="logos/'+esc(d.logo)+'" alt="'+esc(d.abbr)+'" style="height:28px;display:block;margin:0 auto 4px">':'')+'<div>'+esc(d.name||d.abbr)+'</div></th>';}).join('')+'</tr>';
  var body=rows.map(function(r){return '<tr><td class="cmp-rowlabel">'+r[0]+'</td>'+unis.map(function(d){return '<td>'+cmpCell(d,r[1])+'</td>';}).join('')+'</tr>';}).join('');
  document.getElementById('compareBody').innerHTML='<table class="cmp-table">'+head+body+'</table>';
}
```
- [ ] **Step 3:** CSS:
```css
.cmp-table-wrap{overflow-x:auto;padding:16px 24px 24px}
.cmp-table{width:100%;border-collapse:collapse;font-size:13px;min-width:480px}
.cmp-table th,.cmp-table td{border:1px solid var(--border);padding:10px 12px;text-align:center;vertical-align:middle}
.cmp-table th{background:var(--navy);color:#fff;font-family:var(--ff-serif);font-size:13.5px}
.cmp-rowlabel{background:var(--stone);font-weight:600;text-align:left;font-family:var(--ff-mono);font-size:11.5px;text-transform:uppercase;color:var(--text-mid)}
.cmp-unconf{color:var(--red-lt);font-size:11px}
```
- [ ] **Step 4 (GATE):** Reload; tick UCT+UFS+WITS → Compare → overlay table shows 3 columns, correct verified values (UFS fee "Free"); add UNISA → its open-date cell shows "(confirm on site)"; close works (✕); detail modal + grid still work; console clean; on a narrow window the table scrolls horizontally.

### Task 3: Final verification
- [ ] **Step 1:** Spot-check a 2-university compare (e.g. WITS vs UP) — values match the corrected JSON; Apply links open official URLs.
- [ ] **Step 2:** Confirm zero console errors; hand staged changes to user to commit.

---

## Self-Review
- **Spec coverage:** Task 1 = state/bar/checkbox; Task 2 = overlay/table incl. "Free"/unconfirmed hints + per-column guards; Task 3 = verify. All spec sections covered.
- **Placeholder scan:** Functions are complete; only the markup-anchor reads (enhancement loop, `#uniModal` class names) are deferred to in-step reads — not vague placeholders.
- **Consistency:** `compareSet`/`toggleCompare`/`clearCompare`/`renderCompareBar` (Task 1) consumed by `openCompare`/`renderCompareTable` (Task 2); `esc()` (from the modal work) reused; `d.admissions.*`/`d.faculties`/`d.nsfas`/`d.apply` match the `loadUni` merge.
