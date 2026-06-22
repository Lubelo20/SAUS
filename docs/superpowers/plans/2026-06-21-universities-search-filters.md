# Universities Unified Search & Filters — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Combine live search (name + courses) + province + type + free-to-apply into one filter with a result count and no-matches state.

**Architecture:** `filterState` + `applyFilters()` AND-ing all criteria over `.uni-card`s; `fee` added to `_index.json`; background course index; new type/free controls. All in `apply/index.html` + a one-off data script.

**Tech Stack:** Vanilla JS, static JSON; verify via `:8080` + Chrome.

## Global Constraints
- AND logic; live debounced search; guard `UNI_INDEX[abbr]` (skip if missing); course index optional/graceful; **no `alert()`/blocking dialogs**; reuse `.filter-pill` styling; git commits hang (user commits).

---

### Task 1: Add `fee` to `_index.json`
**Files:** Create `data/_addfee.js`; Modify `data/universities/_index.json`.
- [ ] **Step 1:** Write `data/_addfee.js`:
```js
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'universities');
const idx=JSON.parse(fs.readFileSync(path.join(dir,'_index.json'),'utf8'));
idx.universities.forEach(u=>{ try{ const a=JSON.parse(fs.readFileSync(path.join(dir,u.abbr,'admissions.json'),'utf8')); if(a.applicationFee!=null)u.fee=a.applicationFee; }catch(e){ console.warn('skip',u.abbr); } });
fs.writeFileSync(path.join(dir,'_index.json'),JSON.stringify(idx,null,2)+'\n');
console.log('fee added to',idx.universities.filter(u=>u.fee!=null).length,'entries');
```
- [ ] **Step 2:** Run `node data/_addfee.js` → "fee added to 26 entries". Validate: `node -e "const d=require('./data/universities/_index.json');console.log(d.universities.find(u=>u.abbr==='UFS').fee, d.universities.find(u=>u.abbr==='UP').fee)"` → `0 300`.

### Task 2: filterState + applyFilters + course index + rewire
**Files:** Modify `apply/index.html` — replace `filterUnis`/`doSearch` bodies; add `filterState`/`applyFilters`/`clearFilters`/`buildCourseIdx`; debounce search.
- [ ] **Step 1:** Add near `filterUnis` (replace both functions):
```js
var filterState={q:'',province:'all',type:'all',freeOnly:false};
function applyFilters(){
  var q=filterState.q, shown=0, total=0;
  document.querySelectorAll('.uni-card').forEach(function(card){
    var img=card.querySelector('img[alt]'); if(!img)return; total++;
    var abbr=img.getAttribute('alt').trim(); var u=UNI_INDEX[abbr]||{};
    var okProv=filterState.province==='all'||card.dataset.province===filterState.province;
    var okType=filterState.type==='all'||u.type===filterState.type;
    var okFree=!filterState.freeOnly||u.fee===0;
    var name=((card.querySelector('.uni-card-name')||{}).textContent||'').toLowerCase();
    var idx=(window._courseIdx&&window._courseIdx[abbr])||'';
    var okQ=!q||name.indexOf(q)>-1||idx.indexOf(q)>-1||card.textContent.toLowerCase().indexOf(q)>-1;
    var show=okProv&&okType&&okFree&&okQ;
    card.style.display=show?'':'none'; if(show)shown++;
  });
  var c=document.getElementById('filterCount'); if(c)c.textContent='Showing '+shown+' of '+total+' universities';
  var nr=document.getElementById('noResults'); if(nr)nr.style.display=shown===0?'block':'none';
}
function filterUnis(province,btn){
  filterState.province=province;
  document.querySelectorAll('.uni-filter-bar .filter-pill').forEach(function(p){p.classList.remove('active');});
  if(btn)btn.classList.add('active'); applyFilters();
}
function setTypeFilter(type,btn){
  filterState.type=type;
  document.querySelectorAll('#typeFilters .filter-pill').forEach(function(p){p.classList.remove('active');});
  if(btn)btn.classList.add('active'); applyFilters();
}
function toggleFreeFilter(btn){ filterState.freeOnly=!filterState.freeOnly; if(btn)btn.classList.toggle('active',filterState.freeOnly); applyFilters(); }
function clearFilters(){
  filterState={q:'',province:'all',type:'all',freeOnly:false};
  var hs=document.getElementById('heroSearch'); if(hs)hs.value='';
  document.querySelectorAll('.filter-pill').forEach(function(p){p.classList.remove('active');});
  var allP=document.querySelector('.uni-filter-bar .filter-pill'); if(allP)allP.classList.add('active');
  var allT=document.querySelector('#typeFilters .filter-pill'); if(allT)allT.classList.add('active');
  applyFilters();
}
function doSearch(){ document.getElementById('universities').scrollIntoView({behavior:'smooth'}); }
function buildCourseIdx(){
  if(typeof UNI_INDEX==='undefined')return;
  window._courseIdx={};
  Object.keys(UNI_INDEX).forEach(function(abbr){
    fetch(DATA_BASE+abbr+'/courses.json').then(function(r){return r.json();}).then(function(list){
      var u=UNI_INDEX[abbr]||{};
      window._courseIdx[abbr]=((Array.isArray(list)?list.map(function(c){return (c.name||'')+' '+(c.qual||'')+' '+(c.faculty||'');}).join(' '):'')+' '+((u.type)||'')).toLowerCase();
    }).catch(function(){window._courseIdx[abbr]='';});
  });
}
```
- [ ] **Step 2:** Wire the search box live (debounced) — replace the `heroSearch` keydown listener block:
```js
var _searchT;
document.getElementById('heroSearch').addEventListener('input',function(){ filterState.q=this.value.trim().toLowerCase(); clearTimeout(_searchT); _searchT=setTimeout(applyFilters,200); });
document.getElementById('heroSearch').addEventListener('keydown',function(e){if(e.key==='Enter')doSearch();});
```
- [ ] **Step 3:** Kick off the course index after `indexReady` resolves (add `.then(buildCourseIdx)` chained off `indexReady`, or call `buildCourseIdx()` inside the existing `indexReady.then(...)` card-enhancement block after the loop).
- [ ] **Step 4 (GATE):** `node -e "1"`; reload `apply/?cb=N`; province pills still filter; type "cape" updates live; console clean; 26 cards present.

### Task 3: Type pills, Free toggle, count, no-results markup + CSS
**Files:** Modify `apply/index.html`.
- [ ] **Step 1:** After the `.uni-filter-bar` div (province pills), add:
```html
    <div class="uni-filter-bar" id="typeFilters">
      <button class="filter-pill active" onclick="setTypeFilter('all',this)">All Types</button>
      <button class="filter-pill" onclick="setTypeFilter('Research University',this)">Research</button>
      <button class="filter-pill" onclick="setTypeFilter('Comprehensive University',this)">Comprehensive</button>
      <button class="filter-pill" onclick="setTypeFilter('University of Technology',this)">University of Technology</button>
      <button class="filter-pill" onclick="setTypeFilter('Distance University',this)">Distance</button>
      <button class="filter-pill" onclick="setTypeFilter('Health Sciences University',this)">Health Sciences</button>
      <button class="filter-pill cmp-free-pill" onclick="toggleFreeFilter(this)">Free to apply</button>
    </div>
    <div id="filterCount" style="font-size:12.5px;color:var(--text-lt);font-family:var(--ff-mono);margin:4px 2px 0">Showing 26 of 26 universities</div>
```
- [ ] **Step 2:** After `#uniGrid` (its closing tag), add: `<div id="noResults" style="display:none;text-align:center;padding:40px 20px;color:var(--text-mid)"><p>No universities match your filters.</p><button class="btn btn-outline btn-sm" onclick="clearFilters()">Clear filters</button></div>`.
- [ ] **Step 3:** CSS (near `.filter-pill`): `#typeFilters{margin-top:8px}.cmp-free-pill.active{background:var(--green);border-color:var(--green);color:#fff}`.
- [ ] **Step 4 (GATE):** Reload; Type=University of Technology → only UoTs; Free pill → only fee 0; Province=Gauteng + Free → AND; count updates; filter to 0 → no-results + Clear resets all; compare + modal still work; console clean.

### Task 4: Final verification
- [ ] **Step 1:** Search "engineering" → universities with engineering courses remain (after index loads); "law" likewise; clearing search restores all.
- [ ] **Step 2:** Zero console errors; mobile pills wrap; hand staged changes to user to commit.

---
## Self-Review
- **Spec coverage:** T1 = fee in _index; T2 = filterState/applyFilters/course-index/rewire/debounce; T3 = type/free/count/no-results UI; T4 = verify. Covers all.
- **Placeholders:** none — full code given.
- **Consistency:** `filterState`/`applyFilters`/`UNI_INDEX[abbr]`/`window._courseIdx`/`#typeFilters`/`#filterCount`/`#noResults` consistent across tasks; `card.dataset.province` matches existing province mechanism; `u.type`/`u.fee` match the `_index` fields (fee added in T1).
