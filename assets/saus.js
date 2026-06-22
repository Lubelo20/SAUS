/* SAUS — shared progressive enhancements (loaded with `defer` on every page).
 *
 * Intentionally minimal. A scroll-reveal effect was prototyped here but
 * removed: hiding content with opacity until a scroll event risks leaving
 * sections invisible if the reveal doesn't fire, which is unacceptable for an
 * official public site. Visual polish is handled entirely in CSS (saus.css:
 * card elevation, button micro-interactions, prefers-reduced-motion) where it
 * can never hide content.
 *
 * This file is the place to add future enhancements that DEGRADE GRACEFULLY —
 * i.e. the page must remain fully usable and all content visible if this
 * script never runs. */
(function () {
  'use strict';
  // No-op today. Kept (and linked from all pages) as the shared JS entry point.
})();
