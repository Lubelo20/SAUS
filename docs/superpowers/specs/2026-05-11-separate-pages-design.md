# SAUS Website — Separate Pages Design

**Date:** 2026-05-11
**Status:** Approved

## Overview

Split the current single-file SPA (`index_1.html`) into 8 separate, fully self-contained HTML files — one per page — using a folder-per-page structure. Each file is standalone: all CSS and JavaScript inline, no shared external files.

## File Structure

```
SAUS/
├── index.html              ← Home
├── about/index.html
├── campaigns/index.html
├── leadership/index.html
├── news/index.html
├── events/index.html
├── gallery/index.html
├── contact/index.html
└── sauslogo.jpeg
```

`index_1.html` is retained as the reference source and is not modified.

## Anatomy of Each Page File

Every file is self-contained and follows this structure:

```
<head>
  Google Fonts <link>
  Full <style> block (shared CSS, identical in all 8 files)
</head>
<body>
  #topbar
  #header
  #navbar         (active item set by inline script via data-page attribute)
  #mnav           (mobile nav)

  <main>
    [this page's content sections only]
  </main>

  #footer
  [#toast — on contact/index.html only]
  #cookie

  <script>
    active nav script
    toggleMenu()
    acceptC() / declineC()
    [submitForm() on contact page only]
  </script>
</body>
```

## Navigation Changes

| Before | After |
|--------|-------|
| `<button onclick="showPage('about')">` | `<a href="/about/" class="nav-item" data-page="about">` |
| `showPage()` function | Removed |
| `PAGES` array | Removed |
| `.page { display:none }` / `.page.active { display:block }` | Removed — each file shows its own content by default |
| Footer nav `<button onclick="showPage(...)">` | `<a href="/about/">` etc. |
| Breadcrumb `<span onclick="showPage(...)">` inside page content | `<a href="/about/">` etc. |

## Active Nav State Script

Each nav item and mobile nav item receives a `data-page` attribute matching its page id. An inline IIFE runs on every page load:

```js
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
```

## Page Content Mapping

Each page file contains only the section(s) from `index_1.html` that correspond to that page's `id="page-X"` div, unwrapped from the `.page` container.

| File | Source element in `index_1.html` |
|------|----------------------------------|
| `index.html` | `#page-home` contents |
| `about/index.html` | `#page-about` contents |
| `campaigns/index.html` | `#page-campaigns` contents |
| `leadership/index.html` | `#page-leadership` contents |
| `news/index.html` | `#page-news` contents |
| `events/index.html` | `#page-events` contents |
| `gallery/index.html` | `#page-gallery` contents |
| `contact/index.html` | `#page-contact` contents |

## What Is Removed From Each Page

- `showPage()` function
- `PAGES` array
- All `.page` wrapper divs and their `display:none` / `.active` toggling CSS
- `window.scroll` listener (empty in original)
- `#toast` and `submitForm()` — kept only in `contact/index.html`

## What Is Kept On Every Page

- Full CSS (identical copy)
- `#topbar`, `#header`, `#navbar`, `#mnav`, `#footer`
- `toggleMenu()` / `closeMobile()`
- `#cookie` banner + `acceptC()` / `declineC()`
