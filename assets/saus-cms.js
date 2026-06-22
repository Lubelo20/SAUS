/* SAUS — public CMS client. Progressive enhancement: pulls PUBLISHED content
 * from the saus-admin API and swaps it into the static page. If the CMS is
 * unreachable (offline, not deployed, CORS, error), every render is a no-op and
 * the page keeps its existing hardcoded content — the live site never regresses. */
(function () {
  'use strict';
  var h = location.hostname;
  var CMS_BASE = (h === 'localhost' || h === '127.0.0.1' || h === '')
    ? 'http://localhost:4400/api'
    : 'https://saus-admin-api.onrender.com/api'; // update to your deployed Render URL

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fetchPublic(path) {
    return fetch(CMS_BASE + path).then(function (r) { return r.ok ? r.json() : Promise.reject(r); });
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function newsCard(a) {
    var d = a.publishedAt ? new Date(a.publishedAt) : null;
    var day = d ? d.getDate() : '';
    var mon = d ? (MONTHS[d.getMonth()] + " '" + String(d.getFullYear()).slice(2)) : '';
    var type = (a.category && a.category.name) || 'News';
    var cover = a.coverImage
      ? '<img src="' + esc(a.coverImage) + '" alt="" loading="lazy" style="width:100%;height:160px;object-fit:cover;border-radius:2px;display:block;margin-bottom:10px">'
      : '';
    return '<div class="news-item">'
      + '<div class="news-date-col"><div class="news-day">' + esc(day) + '</div><div class="news-month">' + esc(mon) + '</div></div>'
      + '<div style="flex:1">'
      + cover
      + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap"><div class="news-type">' + esc(type) + '</div></div>'
      + '<h3 style="font-family:var(--ff-serif);font-size:18px;color:var(--navy);margin-bottom:6px">' + esc(a.title) + '</h3>'
      + (a.excerpt ? '<p style="font-size:14px;color:var(--text-mid);line-height:1.6">' + esc(a.excerpt) + '</p>' : '')
      + '</div></div>';
  }

  function renderNews() {
    var el = document.getElementById('newsList');
    if (!el) return;
    fetchPublic('/public/news').then(function (j) {
      if (!j || !j.data || !j.data.length) return; // empty → keep hardcoded
      el.innerHTML = j.data.map(newsCard).join('');
    }).catch(function () { /* CMS unavailable → keep existing hardcoded content */ });
  }

  // ── Leadership ─────────────────────────────────────────────
  function initials(name) {
    return String(name || '').split(/\s+/).filter(Boolean).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }
  function leaderCard(l) {
    var avatar = l.photo
      ? '<div class="leader-avatar-sm"><img src="' + esc(l.photo) + '" alt="' + esc(l.name) + '"></div>'
      : '<div class="leader-avatar-sm" style="background:linear-gradient(135deg,var(--navy),var(--green))">' + esc(initials(l.name)) + '</div>';
    return '<div class="leader-card-sm">'
      + avatar
      + '<div class="leader-name">' + esc(l.name) + '</div>'
      + '<div class="leader-role">' + esc(l.position) + '</div>'
      + (l.university ? '<div class="leader-uni">' + esc(l.university) + '</div>' : '')
      + '</div>';
  }
  function renderLeadership() {
    var el = document.getElementById('leadershipGrid');
    if (!el) return;
    fetchPublic('/public/leadership').then(function (j) {
      if (!j || !j.data || !j.data.length) return;
      el.innerHTML = j.data.map(leaderCard).join('');
    }).catch(function () { /* keep hardcoded */ });
  }

  // ── Events ─────────────────────────────────────────────────
  function eventCard(e) {
    var d = e.startDate ? new Date(e.startDate) : null;
    var mon = d ? MONTHS[d.getMonth()] : '';
    var day = d ? ('0' + d.getDate()).slice(-2) : '';
    var loc = [e.venue, e.city, e.province].filter(Boolean).join(', ');
    var pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    var thumb = e.bannerImage
      ? '<img src="' + esc(e.bannerImage) + '" alt="" loading="lazy" style="width:96px;height:72px;object-fit:cover;border-radius:2px;display:block;flex:none">'
      : '';
    return '<div class="event-row">'
      + '<div class="event-cal"><div class="event-cal-month">' + esc(mon) + '</div><div class="event-cal-day">' + esc(day) + '</div></div>'
      + thumb
      + '<div style="flex:1">'
      + '<div class="event-body-title">' + esc(e.title) + '</div>'
      + (loc ? '<div class="event-meta"><span class="event-meta-icon">' + pin + esc(loc) + '</span></div>' : '')
      + '<div class="event-desc">' + esc(e.shortDescription || e.description) + '</div>'
      + '</div></div>';
  }
  function renderEvents() {
    var el = document.getElementById('eventsList');
    if (!el) return;
    fetchPublic('/public/events').then(function (j) {
      if (!j || !j.data || !j.data.length) return;
      el.innerHTML = j.data.map(eventCard).join('');
    }).catch(function () { /* keep hardcoded */ });
  }

  // ── Campaigns ──────────────────────────────────────────────
  function campaignCard(c, i) {
    var num = 'RES ' + ('0' + (i + 1)).slice(-2);
    var paras = String(c.description || '').split(/\n+/).filter(Boolean).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');
    var graphic = c.graphic
      ? '<img src="' + esc(c.graphic) + '" alt="" loading="lazy" style="width:100%;max-height:240px;object-fit:cover;border-radius:2px;display:block;margin-bottom:14px">'
      : '';
    return '<div class="resolution">'
      + '<div class="resolution-head">'
      + '<div class="res-num green">' + esc(num) + '</div>'
      + '<div><div class="resolution-title">' + esc(c.title) + '</div></div>'
      + '</div>'
      + '<div class="resolution-body">' + graphic + paras + '</div>'
      + '</div>';
  }
  function renderCampaigns() {
    var el = document.getElementById('campaignsList');
    if (!el) return;
    fetchPublic('/public/campaigns').then(function (j) {
      if (!j || !j.data || !j.data.length) return;
      el.innerHTML = j.data.map(campaignCard).join('');
    }).catch(function () { /* keep hardcoded */ });
  }

  // ── Gallery ────────────────────────────────────────────────
  function galleryTile(m) {
    return '<div style="aspect-ratio:1;border-radius:2px;overflow:hidden;border:1px solid var(--border)">'
      + '<img src="' + esc(m.url) + '" alt="' + esc(m.alt || '') + '" style="width:100%;height:100%;object-fit:cover;display:block"></div>';
  }
  function galleryGroup(name, items) {
    var ref = 'SAUS/GAL — ' + name;
    return '<div class="sec-header"><div class="ref">' + esc(ref) + '</div><h2>' + esc(name) + '</h2></div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:56px">'
      + items.map(galleryTile).join('')
      + '</div>';
  }
  function renderGallery() {
    var el = document.getElementById('galleryGroups');
    if (!el) return;
    fetchPublic('/public/media').then(function (j) {
      if (!j || !j.data || !j.data.length) return; // empty → keep hardcoded
      var order = [];
      var groups = {};
      j.data.forEach(function (m) {
        var name = (m.album && m.album.name) || 'Gallery';
        if (!groups[name]) { groups[name] = []; order.push(name); }
        groups[name].push(m);
      });
      el.innerHTML = order.map(function (name) {
        return galleryGroup(name, groups[name]);
      }).join('');
    }).catch(function () { /* keep hardcoded */ });
  }

  // ── Announcement bar ───────────────────────────────────────
  function renderAnnouncement() {
    var el = document.getElementById('ann');
    if (!el) return;
    fetchPublic('/public/announcement').then(function (j) {
      if (!j || !j.data) return; // no active announcement → keep hardcoded
      var a = j.data;
      var p = el.querySelector('p');
      if (p) p.innerHTML = esc(a.message);
      var badge = el.querySelector('.announcement-badge');
      if (badge && a.type) {
        var labels = { info: 'Official Notice', success: 'Official Notice', warning: 'Notice', urgent: 'Urgent Notice' };
        badge.textContent = labels[a.type] || 'Official Notice';
      }
    }).catch(function () { /* keep hardcoded */ });
  }

  // ── About page ─────────────────────────────────────────────
  // Reads from a path like 'a.b.0.c' on an object; returns undefined if absent.
  function getPath(obj, path) {
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  // Rebuild a container's children from an array `arr`. For each item we clone
  // the matching original child (preserving fixed visual chrome — icons,
  // accent colours, timeline dots — which are NOT in the CMS JSON) and rewrite
  // only the editable text nodes via the `fill` callback. Items beyond the
  // original count reuse the last original as a template.
  function rebuild(container, arr, fill) {
    if (!container || !arr || !arr.length) return; // missing → keep hardcoded
    var templates = Array.prototype.slice.call(container.children);
    if (!templates.length) return;
    var frag = document.createDocumentFragment();
    arr.forEach(function (item, i) {
      var tpl = templates[i] || templates[templates.length - 1];
      var node = tpl.cloneNode(true);
      try { fill(node, item); } catch (e) { /* leave clone as-is */ }
      frag.appendChild(node);
    });
    container.innerHTML = '';
    container.appendChild(frag);
  }
  function setText(node, sel, val) {
    if (val == null) return;
    var t = node.querySelector(sel);
    if (t) t.textContent = String(val);
  }

  function renderAboutPage() {
    if (!document.getElementById('page-about')) return;
    fetchPublic('/public/page/about').then(function (j) {
      if (!j || !j.data) return; // empty → keep hardcoded
      var c = j.data;

      // Singletons: set textContent of each [data-cms] node from its JSON path.
      var nodes = document.querySelectorAll('#page-about [data-cms]');
      Array.prototype.forEach.call(nodes, function (el) {
        var v = getPath(c, el.getAttribute('data-cms'));
        if (v != null && typeof v !== 'object') el.textContent = String(v);
      });

      // Repeatables — rebuild children, preserving fixed chrome per original markup.
      rebuild(document.getElementById('aboutStats'), c.stats, function (node, s) {
        var num = node.querySelector('.stat-num');
        if (num && s.num != null) num.textContent = String(s.num);
        var label = node.querySelector('.stat-label');
        if (label && s.label != null) label.textContent = String(s.label);
      });

      rebuild(document.getElementById('aboutProfileRows'),
        c.profile && c.profile.rows, function (node, r) {
          var tds = node.querySelectorAll('td');
          if (tds[0] && r.field != null) tds[0].textContent = String(r.field);
          if (tds[1] && r.details != null) tds[1].textContent = String(r.details);
        });

      rebuild(document.getElementById('aboutValues'),
        c.values && c.values.cards, function (node, card) {
          setText(node, 'h4', card.title);
          setText(node, 'p', card.text);
        });

      rebuild(document.getElementById('aboutTimeline'),
        c.history && c.history.timeline, function (node, t) {
          setText(node, '.timeline-year', t.year);
          setText(node, '.timeline-title', t.title);
          setText(node, '.timeline-body', t.body);
        });

      rebuild(document.getElementById('aboutContinental'),
        c.continental && c.continental.cards, function (node, card) {
          setText(node, 'h4', card.title);
          setText(node, 'p', card.text);
        });
    }).catch(function () { /* CMS unavailable → keep existing hardcoded content */ });
  }

  function renderHomePage() {
    if (!document.getElementById('page-home')) return;
    fetchPublic('/public/page/home').then(function (j) {
      if (!j || !j.data) return; // empty → keep hardcoded
      var c = j.data;

      // Singletons: set textContent of each [data-cms] node from its JSON path.
      var nodes = document.querySelectorAll('#page-home [data-cms]');
      Array.prototype.forEach.call(nodes, function (el) {
        var v = getPath(c, el.getAttribute('data-cms'));
        if (v != null && typeof v !== 'object') el.textContent = String(v);
      });

      // Repeatables — rebuild children, preserving fixed chrome per original markup.
      rebuild(document.getElementById('homeStats'), c.stats, function (node, s) {
        setText(node, '.stat-num', s.num);
        setText(node, '.stat-label', s.label);
      });

      rebuild(document.getElementById('homePillars'),
        c.mandate && c.mandate.pillars, function (node, p) {
          setText(node, 'h4', p.title);
          setText(node, 'p', p.text);
        });

      rebuild(document.getElementById('homeCampaigns'),
        c.campaigns && c.campaigns.cards, function (node, card) {
          setText(node, 'h4', card.title);
          setText(node, 'p', card.text);
        });
    }).catch(function () { /* CMS unavailable → keep existing hardcoded content */ });
  }

  function renderContactPage() {
    if (!document.getElementById('page-contact')) return;
    fetchPublic('/public/page/contact').then(function (j) {
      if (!j || !j.data) return; // empty → keep hardcoded
      var c = j.data;

      // Singletons: set textContent of each [data-cms] node from its JSON path.
      var nodes = document.querySelectorAll('#page-contact [data-cms]');
      Array.prototype.forEach.call(nodes, function (el) {
        var v = getPath(c, el.getAttribute('data-cms'));
        if (v != null && typeof v !== 'object') el.textContent = String(v);
      });
      // No repeatables on this page.
    }).catch(function () { /* CMS unavailable → keep existing hardcoded content */ });
  }

  function init() { renderNews(); renderLeadership(); renderEvents(); renderCampaigns(); renderGallery(); renderAnnouncement(); renderAboutPage(); renderHomePage(); renderContactPage(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
