/* ════════════════════════════════════════════════════════════════════
   SAUS — CMS hydration layer (progressive enhancement)

   The public site ships with hand-written static content. When the admin
   CMS API is reachable, this script REPLACES that static content with the
   latest published content from the CMS. When the API is unreachable
   (timeout, CORS, 404, network error, or simply not deployed yet), every
   page keeps its static content unchanged — nothing breaks.

   Endpoints (unauthenticated, published-only) provided by the server's
   /api/public route group:
     GET /api/public/news | events | campaigns | leadership | announcement
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  // Same resolver convention as the Staff-Login links across the site.
  var API = isLocal ? 'http://localhost:4000' : 'https://saus-admin-api.onrender.com';

  /* ---- helpers ---- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }

  /* Fetch JSON with a hard timeout. Resolves to the `data` payload on
     success, or null on ANY failure so callers fall back to static. */
  function fetchJSON(path, timeoutMs) {
    timeoutMs = timeoutMs || 4500;
    return new Promise(function (resolve) {
      var settled = false, ctrl = null;
      try { ctrl = new AbortController(); } catch (e) {}
      var timer = setTimeout(function () {
        if (!settled) { settled = true; if (ctrl) try { ctrl.abort(); } catch (e) {} resolve(null); }
      }, timeoutMs);
      var opts = { mode: 'cors', credentials: 'omit', cache: 'no-store' };
      if (ctrl) opts.signal = ctrl.signal;
      fetch(API + path, opts)
        .then(function (r) { return r && r.ok ? r.json() : null; })
        .then(function (j) {
          if (!settled) { settled = true; clearTimeout(timer); resolve(j && 'data' in j ? j.data : null); }
        })
        .catch(function () {
          if (!settled) { settled = true; clearTimeout(timer); resolve(null); }
        });
    });
  }

  /* ---- per-type card renderers (markup matches each page's design) ---- */
  var render = {
    // leadership → .team-card (leadership/index.html)
    leadership: function (p) {
      var photo = p.photo
        ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + ' — ' + esc(p.position) + '" loading="lazy" decoding="async">'
        : '<div class="team-card-initial" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--ff-serif);font-size:2.6rem;color:#fff;background:linear-gradient(135deg,var(--navy),var(--green))">' + esc((p.name || '?').charAt(0)) + '</div>';
      return '<div class="team-card"><div class="team-card-photo">' + photo + '</div>' +
        '<div class="team-card-body">' +
        '<div class="team-card-name">' + esc(p.name) + '</div>' +
        '<div class="team-card-role">' + esc(p.position) + '</div>' +
        (p.university ? '<div class="team-card-uni" style="font-size:12px;color:var(--text-lt);margin-top:2px">' + esc(p.university) + '</div>' : '') +
        '</div></div>';
    },
    // news → .news-item (news/index.html "Latest Statements" list)
    news: function (a) {
      var d = a.publishedAt ? new Date(a.publishedAt) : null;
      var day = d ? d.getDate() : '';
      var mon = '';
      try { mon = d ? d.toLocaleString('en-ZA', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2) : ''; } catch (e) {}
      var cat = (a.category && a.category.name) || 'Newsroom';
      return '<div class="news-item">' +
        '<div class="news-date-col"><div class="news-day">' + esc(day) + '</div><div class="news-month">' + esc(mon) + '</div></div>' +
        '<div style="flex:1">' +
        '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap"><div class="news-type">' + esc(cat) + '</div></div>' +
        '<div class="news-title">' + esc(a.title) + '</div>' +
        (a.excerpt ? '<div class="news-excerpt">' + esc(a.excerpt) + '</div>' : '') +
        '</div></div>';
    },
    // campaigns → .resolution card (campaigns/index.html)
    campaigns: function (c, i) {
      var num = ('0' + ((i || 0) + 1)).slice(-2);
      var dates = [fmtDate(c.startDate), fmtDate(c.endDate)].filter(Boolean).join(' – ');
      var cta = c.ctaUrl
        ? '<div class="resolution-footer"><a class="btn btn-green btn-sm" href="' + esc(c.ctaUrl) + '">' + esc(c.ctaLabel || 'Learn more') + ' →</a></div>' : '';
      return '<div class="resolution"><div class="resolution-head"><div class="res-num green">RES ' + num + '</div><div>' +
        '<div class="resolution-title">' + esc(c.title) + '</div>' +
        '<div class="resolution-meta"><span>Status: <strong>Active</strong></span>' + (dates ? '<span>' + esc(dates) + '</span>' : '') + '</div>' +
        '</div></div>' +
        (c.description ? '<div class="resolution-body"><p>' + esc(c.description) + '</p></div>' : '') +
        cta + '</div>';
    }
  };

  /* Map a CMS event to the shape the events page's renderer expects (EVTS). */
  function mapEvent(e) {
    var start = e.startDate ? String(e.startDate).slice(0, 10) : '';
    var past = false;
    try { past = e.endDate ? (new Date(e.endDate) < new Date()) : (start ? (new Date(start) < new Date()) : false); } catch (x) {}
    return {
      date: start,
      title: e.title || '',
      location: [e.venue, e.city, e.province].filter(Boolean).join(', '),
      time: '',
      category: 'SAUS Events',
      dot: past ? '#B8B5AE' : '#00692F',
      calBg: past ? '#7A7874' : '#00692F',
      badge: past ? 'Completed' : 'Upcoming',
      bCls: past ? 'badge-gray' : 'badge-green',
      desc: e.shortDescription || e.description || '',
      btn: e.registrationUrl ? 'Register to Attend →' : null,
      btnUrl: e.registrationUrl || null,
      btnCls: 'btn-green',
      past: past
    };
  }

  /* Replace a container's contents with rendered CMS items (only on a
     non-empty successful fetch). Optionally hides "fallback-only" nodes
     so static placeholders don't show alongside live data. */
  function hydrate(type, selector, renderFn, opts) {
    opts = opts || {};
    var el = document.querySelector(selector);
    if (!el) return Promise.resolve(false);
    return fetchJSON('/api/public/' + type).then(function (data) {
      if (Array.isArray(data) && data.length) {
        el.innerHTML = data.map(renderFn).join('');
        el.setAttribute('data-cms', 'live');
        (opts.hideWhenLive || []).forEach(function (sel) {
          document.querySelectorAll(sel).forEach(function (n) { n.style.display = 'none'; });
        });
        return true;
      }
      return false; // keep static fallback
    });
  }

  /* Site-wide announcement bar (pinned below the header). No-op if none. */
  function announcement() {
    if (document.querySelector('.cms-announce')) return;
    fetchJSON('/api/public/announcement').then(function (a) {
      if (!a || !a.message) return;
      var bar = document.createElement('div');
      bar.className = 'cms-announce cms-announce-' + esc((a.type || 'info').toLowerCase());
      bar.setAttribute('role', 'status');
      bar.innerHTML = '<div class="cms-announce-inner"><span class="cms-announce-msg">' + esc(a.message) + '</span>' +
        (a.ctaUrl ? ' <a class="cms-announce-cta" href="' + esc(a.ctaUrl) + '">' + esc(a.ctaLabel || 'Learn more') + ' →</a>' : '') +
        '<button class="cms-announce-x" aria-label="Dismiss announcement">×</button></div>';
      document.body.appendChild(bar);
      document.documentElement.classList.add('has-cms-announce');
      bar.querySelector('.cms-announce-x').addEventListener('click', function () {
        bar.remove(); document.documentElement.classList.remove('has-cms-announce');
      });
    });
  }

  window.SAUS_CMS = {
    API: API, esc: esc, fmtDate: fmtDate, fetchJSON: fetchJSON,
    render: render, mapEvent: mapEvent, hydrate: hydrate, announcement: announcement
  };
})();
