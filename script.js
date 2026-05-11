/* Acquiro — global page behaviors. Vanilla JS, no deps. */

(() => {
  'use strict';

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mark current nav link (supports both .site-nav__link and .nav-link)
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.site-nav__link, .nav-link').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const normalized = href.replace(/\/+$/, '') || '/';
    if (normalized === path) a.setAttribute('aria-current', 'page');
  });

  // Header pop-down — hidden at page top, slides in after ~80px scroll,
  // slides back out on return to top. rAF-throttled.
  const header = document.querySelector('.site-header');
  if (header) {
    const SCROLL_THRESHOLD = 80;
    let ticking = false;
    const updateHeaderState = () => {
      const y = window.scrollY;
      header.setAttribute('data-state', y > SCROLL_THRESHOLD ? 'scrolled' : 'hero');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    }, { passive: true });
    updateHeaderState();
  }

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
