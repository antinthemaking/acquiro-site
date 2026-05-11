/* Acquiro — global page behaviors. Vanilla JS, no deps. */

(() => {
  'use strict';

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mark current nav link
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.site-nav__link').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const normalized = href.replace(/\/+$/, '') || '/';
    if (normalized === path) a.setAttribute('aria-current', 'page');
  });

  // Scroll-reveal: any element with .reveal becomes visible when intersecting.
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  }
})();
