// theme-toggle.js — light / dark mode switch for activities that ship a light palette.
//
// Load it as a plain <script> in <head> (NOT at the end of <body>), so the saved
// theme is applied before the first paint and the page never flashes dark→light:
//   <script src="../../../theme-toggle.js"></script>
//
// It sets <html data-theme="light"|"dark">. The activity's own <style> block holds
// the light overrides, scoped under html[data-theme="light"]. Dark is the default.
// The choice is saved per browser (localStorage 'ac-theme'); ?theme=light|dark in
// the URL overrides it for that visit without saving.
//
// The button goes at the end of .site-header (or into an element with
// [data-theme-toggle-slot], if the page has one). Pages without either get no
// button. If this file is missing, the page simply stays dark.
(function () {
  'use strict';
  var KEY = 'ac-theme';
  var root = document.documentElement;

  function saved() {
    try {
      var q = new URLSearchParams(location.search).get('theme');
      if (q === 'light' || q === 'dark') return q;
      var v = localStorage.getItem(KEY);
      return v === 'light' ? 'light' : 'dark';
    } catch (e) { return 'dark'; }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var light = theme === 'light';
    btn.setAttribute('aria-checked', String(light));
    btn.title = light ? 'Light mode is on — click for dark mode' : 'Light mode is off — click to turn it on';
  }

  apply(saved());

  var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  // Button styling lives here so every page gets the same control. Colours come
  // from the page's theme, with fallbacks.
  var CSS = [
    '.theme-toggle{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;padding:0 .9rem;',
    'border-radius:999px;cursor:pointer;font:700 .78rem/1 var(--font-mono,monospace);letter-spacing:.04em;',
    'text-transform:uppercase;background:rgba(255,255,255,.08);color:#e9e0ff;',
    'border:1.5px solid rgba(168,92,255,.55);transition:background-color .2s,border-color .2s,color .2s;',
    'touch-action:manipulation;flex-shrink:0}',
    '.theme-toggle:hover{background:rgba(168,92,255,.22);border-color:#a85cff}',
    '.theme-toggle:focus-visible{outline:3px solid #2ff3e0;outline-offset:2px}',
    '.theme-toggle .tt-sun{display:none}',
    'html[data-theme="light"] .theme-toggle{background:#fff;color:#2a1260;border-color:#c9b8f0}',
    'html[data-theme="light"] .theme-toggle:hover{background:#f3ecff;border-color:#8b2fe0}',
    'html[data-theme="light"] .theme-toggle:focus-visible{outline-color:#8b2fe0}',
    'html[data-theme="light"] .theme-toggle .tt-sun{display:inline-flex}',
    'html[data-theme="light"] .theme-toggle .tt-moon{display:none}',
    // Sit at the far right of the header, after the decorative code window
    // (which is hidden on phones, when the toggle takes the auto margin itself).
    '.site-header>.theme-toggle{margin-left:auto}',
    '.site-header>.header-code~.theme-toggle{margin-left:0}',
    '@media (max-width:600px){.site-header>.header-code~.theme-toggle{margin-left:auto}}',
    // A short cross-fade while the theme changes, skipped for reduced motion.
    '@media (prefers-reduced-motion:no-preference){html.theme-switching *,html.theme-switching *::before,',
    'html.theme-switching *::after{transition:background-color .25s ease,color .25s ease,border-color .25s ease,box-shadow .25s ease !important}}'
  ].join('');

  function mount() {
    var host = document.querySelector('[data-theme-toggle-slot]') || document.querySelector('.site-header');
    if (!host || document.querySelector('.theme-toggle')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('role', 'switch');
    btn.innerHTML = '<span class="tt-moon" aria-hidden="true">' + MOON + '</span>' +
                    '<span class="tt-sun" aria-hidden="true">' + SUN + '</span>' +
                    '<span class="theme-toggle-text">Light mode</span>';
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.classList.add('theme-switching');
      apply(next);
      setTimeout(function () { root.classList.remove('theme-switching'); }, 300);
      try { localStorage.setItem(KEY, next); } catch (e) { /* private mode: still switches for this visit */ }
    });
    host.appendChild(btn);
    apply(root.getAttribute('data-theme') || 'dark');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.ThemeToggle = { set: function (t) { apply(t === 'light' ? 'light' : 'dark'); } };
})();
