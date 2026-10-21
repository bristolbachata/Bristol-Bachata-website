/* noncritical.js - loaded with `defer`; nothing here is needed for first paint */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const onLoad = (fn) =>
    document.readyState === 'complete' ? fn() : addEventListener('load', fn, { once: true });

  /* Footer year */
  $('#year').textContent = new Date().getFullYear();

  /* Mobile menu */
  const menuBtn = $('#menu-btn');
  const mobileMenu = $('#mobile-menu');

  function setMenu(open) {
    mobileMenu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.firstElementChild.className = `fa-solid ${open ? 'fa-xmark' : 'fa-bars'} text-2xl`;
  }

  menuBtn.addEventListener('click', () => setMenu(mobileMenu.classList.contains('hidden')));
  mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* Desktop dropdown: close on outside click, link click or Escape */
  const dropdown = $('.nav-dropdown');

  document.addEventListener('click', (e) => {
    if ((dropdown.open && !dropdown.contains(e.target)) || e.target.closest('.nav-menu a')) {
      dropdown.open = false;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.open) {
      dropdown.open = false;
      $('summary', dropdown).focus();
    }
  });

  /* Open an accordion when a link points at it (e.g. footer "Privacy Policy") */
  function openTarget(hash) {
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    if (target && target.tagName === 'DETAILS') target.open = true;
  }
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) openTarget(link.getAttribute('href'));
  });
  openTarget(location.hash);

  /* Scroll reveal: only hides sections that are still below the fold */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    $$('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
  }

  /* Hero video: start after the page has loaded, skipped on Data Saver / reduced motion */
  onLoad(() => {
    const video = $('#hero-video');
    const connection = navigator.connection || {};
    if (!video || connection.saveData || reduceMotion) return;

    setTimeout(() => {
      video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
      video.src = video.dataset.src;
      video.load();
      video.play().catch(() => {});
    }, 1500);
  });

  /* Cookie consent. The choice is stored in this browser only and asked again after ~6 months.
     Nothing optional runs today. To add analytics/marketing later, load the script inside the
     'bb-consent' listener at the bottom, only when the matching flag is true. */
  const KEY = 'bb_cookie_consent';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const banner = $('#cookie-banner');
  const mainView = $('#cc-main');
  const prefsView = $('#cc-prefs');
  const analytics = $('#cc-analytics');
  const marketing = $('#cc-marketing');

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return saved && Date.now() - saved.ts < MAX_AGE ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function announce(consent) {
    window.bbConsent = consent;
    window.dispatchEvent(new CustomEvent('bb-consent', { detail: consent }));
  }

  function saveConsent(analyticsOn, marketingOn) {
    const consent = { necessary: true, analytics: analyticsOn, marketing: marketingOn, ts: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
    announce(consent);
    banner.hidden = true;
  }

  function showBanner(prefs, focus) {
    const current = readConsent() || {};
    analytics.checked = !!current.analytics;
    marketing.checked = !!current.marketing;
    mainView.hidden = prefs;
    prefsView.hidden = !prefs;
    banner.hidden = false;
    if (focus) $(prefs ? '[data-cc="save"]' : '[data-cc="accept"]').focus({ preventScroll: true });
  }

  banner.addEventListener('click', (e) => {
    const action = e.target.closest('[data-cc]')?.dataset.cc;
    if (action === 'accept') saveConsent(true, true);
    else if (action === 'reject') saveConsent(false, false);
    else if (action === 'save') saveConsent(analytics.checked, marketing.checked);
    else if (action === 'manage') showBanner(true, true);
  });

  $$('[data-cookie-settings]').forEach((el) =>
    el.addEventListener('click', () => showBanner(true, true))
  );

  window.addEventListener('bb-consent', (e) => {
    // if (e.detail.analytics) { /* load analytics script here */ }
    // if (e.detail.marketing) { /* load marketing pixel here */ }
  });

  const saved = readConsent();
  if (saved) announce(saved);
  else onLoad(() => showBanner(false, false));
})();
