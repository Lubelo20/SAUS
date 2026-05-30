# SAUS Separate Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `index_1.html` (a single-file SPA) into 8 self-contained HTML files — one per page — using a folder-per-page structure, with all CSS and JS inline in each file.

**Architecture:** Each output file duplicates the full `<head>` CSS, shared header/nav/footer, and page-specific content. Navigation changes from JS `showPage()` calls to standard `<a href>` links. A small inline IIFE reads `window.location.pathname` on load to set the `.active` class on the correct nav item.

**Tech Stack:** Pure HTML5, CSS3, vanilla JavaScript. No build tools. Local testing via `python3 -m http.server`.

**Source file:** `index_1.html` — do not modify it; treat it as read-only reference.

---

## Shared boilerplate reference

All 8 pages share identical header, nav, footer, and script blocks with the following changes from `index_1.html`. Tasks 3–10 reference this section — do not repeat the source lookup in each task.

### `<head>` (lines 1–11 of `index_1.html`, then full `<style>` block lines 13–1038)

Copy the `<head>` verbatim but change the `<title>` per page (shown in each task). The `<style>` block (lines 13–1038) is copied verbatim. Delete the three CSS rules that powered the SPA page-switching — they are dead code in the multi-page version:

```css
/* DELETE these three rules from the <style> block */
.page{display:none;min-height:100vh;padding-top:var(--total-top);animation:pgIn .35s var(--ease)}
.page.active{display:block}
@keyframes pgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
```

### `#topbar` — copy verbatim (lines 1040–1068, no changes needed)

### `#header` — updated (replace `onclick` with links)

```html
<!-- ══════ OFFICIAL HEADER ══════ -->
<div id="header">
  <div class="header-inner">
    <a href="/" class="header-seal" title="SAUS Official Seal" style="text-decoration:none">
      <div class="seal-top-stripe"></div>
      <div class="header-seal-inner">
        <div class="seal-globe">🌍</div>
        <div class="seal-text">SAUS</div>
        <div class="seal-stars">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
      </div>
    </a>
    <a href="/" class="header-ident" style="text-decoration:none">
      <div class="header-ident-main">South African <em>Union of Students</em></div>
      <div class="header-ident-sub">SAUS — Official National Representative Body in Higher Education</div>
    </a>
    <div class="header-divider"></div>
    <div class="header-established">
      <span>Established</span>
      <strong>2006</strong>
      <span>9th Congress</span>
    </div>
    <div class="header-right">
      <a href="/contact/" class="header-contact-btn">Contact SAUS</a>
      <button class="hamburger" onclick="toggleMenu()" id="ham">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</div>
```

### `#navbar` — updated (`button` → `a`, add `data-page`)

```html
<!-- ══════ NAVIGATION ══════ -->
<nav id="navbar">
  <div class="nav-inner">
    <div class="nav-links">
      <a href="/" class="nav-item" data-page="home">Home</a>
      <a href="/about/" class="nav-item" data-page="about">About SAUS</a>
      <a href="/campaigns/" class="nav-item" data-page="campaigns">Campaigns</a>
      <a href="/leadership/" class="nav-item" data-page="leadership">Leadership</a>
      <a href="/news/" class="nav-item" data-page="news">Newsroom</a>
      <a href="/events/" class="nav-item" data-page="events">Events</a>
      <a href="/gallery/" class="nav-item" data-page="gallery">Gallery</a>
      <a href="/contact/" class="nav-item" data-page="contact">Contact</a>
    </div>
    <span class="nav-ref">REF: SAUS/GOV/2026</span>
  </div>
</nav>
```

### `#mnav` — updated (`button` → `a`, add `data-page`)

```html
<!-- Mobile Nav -->
<div class="mobile-nav" id="mnav">
  <a href="/" class="mobile-nav-item" data-page="home" onclick="closeMobile()">Home</a>
  <a href="/about/" class="mobile-nav-item" data-page="about" onclick="closeMobile()">About SAUS</a>
  <a href="/campaigns/" class="mobile-nav-item" data-page="campaigns" onclick="closeMobile()">Campaigns</a>
  <a href="/leadership/" class="mobile-nav-item" data-page="leadership" onclick="closeMobile()">Leadership</a>
  <a href="/news/" class="mobile-nav-item" data-page="news" onclick="closeMobile()">Newsroom</a>
  <a href="/events/" class="mobile-nav-item" data-page="events" onclick="closeMobile()">Events</a>
  <a href="/gallery/" class="mobile-nav-item" data-page="gallery" onclick="closeMobile()">Gallery</a>
  <a href="/contact/" class="mobile-nav-item" data-page="contact" onclick="closeMobile()">Contact</a>
</div>
```

### `#footer` — updated (footer nav `button` → `a`)

Copy lines 2027–2087 verbatim except replace the Navigation column buttons:

```html
<!-- replace the footer Navigation column buttons with: -->
<div class="footer-col-title">Navigation</div>
<a href="/">Home</a>
<a href="/about/">About SAUS</a>
<a href="/campaigns/">Campaigns</a>
<a href="/leadership/">NEC Leadership</a>
<a href="/news/">Newsroom</a>
<a href="/events/">Events</a>
<a href="/gallery/">Gallery</a>
<a href="/contact/">Contact</a>
```

### `#cookie` — copy verbatim (lines 2093–2099)

### Shared `<script>` block (goes in every page)

```html
<script>
(function(){
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const map = {
    '/':            'home',
    '/about':       'about',
    '/campaigns':   'campaigns',
    '/leadership':  'leadership',
    '/news':        'news',
    '/events':      'events',
    '/gallery':     'gallery',
    '/contact':     'contact'
  };
  const id = Object.keys(map).find(k => path.endsWith(k)) || 'home';
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(n => {
    if(n.dataset.page === id) n.classList.add('active');
  });
})();

function toggleMenu(){
  const m=document.getElementById('mnav');
  m.classList.toggle('open');
  const h=document.getElementById('ham');
  const open=m.classList.contains('open');
  h.children[0].style.transform=open?'rotate(45deg) translateY(7px)':'none';
  h.children[1].style.opacity=open?'0':'1';
  h.children[2].style.transform=open?'rotate(-45deg) translateY(-7px)':'none';
}
function closeMobile(){document.getElementById('mnav').classList.remove('open')}

window.addEventListener('DOMContentLoaded',()=>{
  if(!localStorage.getItem('saus_gov_cookie')){
    setTimeout(()=>document.getElementById('cookie').classList.add('show'),1800);
  }
});
function acceptC(){localStorage.setItem('saus_gov_cookie','accepted');document.getElementById('cookie').classList.remove('show')}
function declineC(){localStorage.setItem('saus_gov_cookie','declined');document.getElementById('cookie').classList.remove('show')}
</script>
```

---

## Task 1: Create folder structure and start local server

**Files:** None created yet — shell commands only.

- [ ] **Step 1: Create the 7 sub-page directories**

```bash
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/about
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/campaigns
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/leadership
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/news
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/events
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/gallery
mkdir -p /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS/contact
```

- [ ] **Step 2: Start a local server for testing**

```bash
cd /Users/ndumisomngomezulu/Documents/LTS/Clients/SAUS && python3 -m http.server 8080
```

Leave this running in a terminal tab. All pages will be reachable at `http://localhost:8080/`.

---

## Task 2: Create `index.html` (Home page)

**Files:**
- Create: `index.html`
- Source content: `index_1.html` lines 1134–1366 (the `#page-home` div contents, without the outer `<div class="page active" id="page-home">` wrapper)

- [ ] **Step 1: Build the file**

Assemble `index.html` from top to bottom:

1. `<head>` — copy lines 1–11 of `index_1.html`. Set title:
   ```html
   <title>South African Union of Students — Official National Student Representative Body</title>
   ```
2. `<style>` — copy lines 13–1038 verbatim, then delete the three `.page` rules listed in the shared boilerplate reference above.
3. `</head><body>` — line 1039.
4. `#topbar` — copy lines 1040–1068 verbatim.
5. `#header` — use the updated block from the shared boilerplate reference.
6. `#navbar` — use the updated block from the shared boilerplate reference.
7. `#mnav` — use the updated block from the shared boilerplate reference.
8. `<main>` — open tag, then paste the contents of `#page-home` (lines 1135–1365 of `index_1.html`), then `</main>`. Do **not** include the `<div class="page active" id="page-home">` or its closing tag.
9. `#footer` — copy lines 2027–2087, replacing the footer nav buttons as shown in the shared boilerplate reference.
10. `#cookie` — copy lines 2093–2099 verbatim.
11. Shared `<script>` block — paste from shared boilerplate reference.
12. `</body></html>`

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/`. Check:
- Page loads with correct content
- Logo displays
- All nav links are `<a>` elements
- "Home" nav item is highlighted (`.active`)
- Cookie banner appears after ~2 seconds on first visit
- Hamburger opens mobile nav

---

## Task 3: Create `about/index.html`

**Files:**
- Create: `about/index.html`
- Source content: `index_1.html` lines 1368–1454 (contents of `#page-about`, without the wrapper div)

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>About SAUS — South African Union of Students</title>
   ```
2. `<main>` content: lines 1368–1454 of `index_1.html` (no wrapper div)

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/about/`. Check:
- Correct page content loads
- "About SAUS" nav item is highlighted
- Logo displays (path resolves correctly)
- All links work

---

## Task 4: Create `campaigns/index.html`

**Files:**
- Create: `campaigns/index.html`
- Source content: `index_1.html` lines 1456–1613 (contents of `#page-campaigns`, without the wrapper div)

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>Campaigns — South African Union of Students</title>
   ```
2. `<main>` content: lines 1456–1613 of `index_1.html` (no wrapper div)

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/campaigns/`. Check:
- Correct page content loads
- "Campaigns" nav item is highlighted

---

## Task 5: Create `leadership/index.html`

**Files:**
- Create: `leadership/index.html`
- Source content: `index_1.html` lines 1615–1716 (contents of `#page-leadership`, without the wrapper div)

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>NEC Leadership — South African Union of Students</title>
   ```
2. `<main>` content: lines 1615–1716 of `index_1.html` (no wrapper div)

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/leadership/`. Check:
- Correct page content loads
- "Leadership" nav item is highlighted

---

## Task 6: Create `news/index.html`

**Files:**
- Create: `news/index.html`
- Source content: `index_1.html` lines 1718–1828 (contents of `#page-news`, without the wrapper div)

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>Newsroom — South African Union of Students</title>
   ```
2. `<main>` content: lines 1718–1828 of `index_1.html` (no wrapper div)

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/news/`. Check:
- Correct page content loads
- "Newsroom" nav item is highlighted

---

## Task 7: Create `events/index.html`

**Files:**
- Create: `events/index.html`
- Source content: `index_1.html` lines 1830–1908 (contents of `#page-events`, without the wrapper div)

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>Events — South African Union of Students</title>
   ```
2. `<main>` content: lines 1830–1908 of `index_1.html` (no wrapper div)

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/events/`. Check:
- Correct page content loads
- "Events" nav item is highlighted

---

## Task 8: Create `gallery/index.html`

**Files:**
- Create: `gallery/index.html`
- Source content: `index_1.html` lines 1910–1942 (contents of `#page-gallery`, without the wrapper div)

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>Gallery — South African Union of Students</title>
   ```
2. `<main>` content: lines 1910–1942 of `index_1.html` (no wrapper div)

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/gallery/`. Check:
- Correct page content loads
- "Gallery" nav item is highlighted

---

## Task 9: Create `contact/index.html`

**Files:**
- Create: `contact/index.html`
- Source content: `index_1.html` lines 1944–2026 (contents of `#page-contact`, without the wrapper div)

This is the only page with `#toast` and `submitForm()`.

- [ ] **Step 1: Build the file**

Same assembly as Task 2 with these differences:

1. Title:
   ```html
   <title>Contact — South African Union of Students</title>
   ```
2. `<main>` content: lines 1944–2026 of `index_1.html` (no wrapper div)
4. After `#footer`, add the toast element (line 2090):
   ```html
   <div id="toast">✅ Your enquiry has been submitted. Reference number: SAUS/ENQ/2026/001. We will respond within 2 business days.</div>
   ```
5. After the shared `<script>` block, add `submitForm()`:
   ```js
   function submitForm(){
     const t=document.getElementById('toast');
     t.classList.add('show');
     setTimeout(()=>t.classList.remove('show'),5000);
   }
   ```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8080/contact/`. Check:
- Correct page content loads
- "Contact" nav item is highlighted
- Submitting the enquiry form shows the toast for 5 seconds

---

## Task 10: Cross-page navigation check

- [ ] **Step 1: Click through every nav link**

Starting at `http://localhost:8080/`:
1. Click each nav item — confirm correct page loads and that nav item highlights
2. Click the SAUS seal and logo text — both should navigate to `/`
3. Click "Contact SAUS" header button — should navigate to `/contact/`
4. On mobile width (<768px): open hamburger, click each mobile nav item, confirm it navigates and closes the menu
5. Click each footer nav link — confirm correct destination

- [ ] **Step 2: Check breadcrumbs (if any page has them)**

Some pages include breadcrumb bars with `onclick="showPage(...)"` spans. If you find any, replace each one:
```html
<!-- before -->
<span onclick="showPage('about')">About SAUS</span>

<!-- after -->
<a href="/about/">About SAUS</a>
```

- [ ] **Step 3: Confirm cookie banner on fresh visit**

In an incognito window, open any page. The cookie banner should appear after ~2 seconds. Accept it, then reload — it should not reappear.
