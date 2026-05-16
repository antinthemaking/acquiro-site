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

  // Stat strip — count-up animation. The whole strip is observed as one
  // unit; when it enters the viewport, every cell fades + lifts (with
  // staggered CSS transition-delay) and each number ticks from 0 → its
  // data-target value. Prefix/suffix wrap the animated digit
  // (e.g. "$", "M+", "+").
  const statStrip = document.querySelector('.stat-strip');
  if (statStrip && 'IntersectionObserver' in window) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countUp = (el) => {
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      if (reduceMotion || isNaN(target)) {
        el.textContent = `${prefix}${target}${suffix}`;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(target * easeOut(progress));
        el.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      el.textContent = `${prefix}0${suffix}`;
      requestAnimationFrame(tick);
    };
    const fireStats = () => {
      const cells = statStrip.querySelectorAll('.reveal-stat');
      cells.forEach((cell, idx) => {
        cell.classList.add('is-visible');
        const num = cell.querySelector('.stat-cell__num[data-target]');
        if (num) setTimeout(() => countUp(num), idx * 100);
      });
    };
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fireStats();
          statIo.unobserve(statStrip);
        }
      });
    }, { threshold: 0.1 });
    statIo.observe(statStrip);
  }

  // iClosed Lift Widget — deferred load. The script is injected only
  // after the visitor has been on the page for at least 5 seconds AND
  // has scrolled at least once. Either condition alone is not enough.
  // This keeps the floating popup from appearing on initial paint and
  // ensures it only fires once the visitor is actively engaging.
  (() => {
    const DELAY_MS = 5000;
    let timeElapsed = false;
    let hasScrolled = false;
    let injected = false;
    const inject = () => {
      if (injected || !timeElapsed || !hasScrolled) return;
      injected = true;
      const s = document.createElement('script');
      s.src = 'https://app.iclosed.io/assets/widget.js';
      s.async = true;
      s.setAttribute('data-cta-widget', 'Er8y9zH76J7h');
      document.head.appendChild(s);
    };
    setTimeout(() => { timeElapsed = true; inject(); }, DELAY_MS);
    const onScroll = () => {
      if (window.scrollY <= 0) return;
      hasScrolled = true;
      window.removeEventListener('scroll', onScroll);
      inject();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // Infinite Funnel — stage-detail panel.
  // Hovering (or focusing) a node updates the persistent panel on the right;
  // leaving reverts to the default hint. On touch devices we use tap to set
  // a sticky active state instead, since hover doesn't apply.
  const funnel = document.querySelector('.funnel');
  const stageDetail = document.querySelector('.stage-detail');
  if (funnel && stageDetail) {
    const nodes = funnel.querySelectorAll('.funnel__node[data-stage]');
    const panes = stageDetail.querySelectorAll('.stage-detail__pane');
    const defaultPane = stageDetail.querySelector('.stage-detail__pane--default');
    const isTouch = window.matchMedia('(hover: none)').matches;

    const setActive = (stageId) => {
      let matched = false;
      panes.forEach((p) => {
        const isMatch = p.dataset.stage === stageId;
        p.classList.toggle('is-active', isMatch);
        if (isMatch) matched = true;
      });
      if (defaultPane) defaultPane.classList.toggle('is-active', !matched);
      nodes.forEach((n) => n.classList.toggle('is-active', n.dataset.stage === stageId));
      funnel.classList.toggle('has-active', !!stageId);
    };

    const clearActive = () => {
      panes.forEach((p) => p.classList.remove('is-active'));
      if (defaultPane) defaultPane.classList.add('is-active');
      nodes.forEach((n) => n.classList.remove('is-active'));
      funnel.classList.remove('has-active');
    };

    // On mobile, the .stage-detail hover panel is hidden in favour of
    // the .funnel-accordion list below the diagram. Tapping a node
    // expands the matching accordion item and smoothly scrolls it into
    // view, giving touch users a single, predictable interaction.
    const expandAccordionFor = (stageId) => {
      const all = document.querySelectorAll('.funnel-accordion details');
      let target = null;
      all.forEach((d) => {
        if (d.dataset.stage === stageId) {
          target = d;
        } else {
          d.open = false;
        }
      });
      if (target) {
        target.open = true;
        // requestAnimationFrame lets the open transition start before
        // we scroll, so the height change is part of the smooth motion.
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    };

    nodes.forEach((node) => {
      const stageId = node.dataset.stage;

      if (isTouch) {
        // Tap stays sticky for the hidden panel state AND drives the
        // mobile accordion expansion + scroll.
        node.addEventListener('click', () => {
          setActive(stageId);
          expandAccordionFor(stageId);
        });
      } else {
        node.addEventListener('mouseenter', () => setActive(stageId));
        node.addEventListener('mouseleave', clearActive);
        node.addEventListener('focus',  () => setActive(stageId));
        node.addEventListener('blur',   clearActive);
      }
    });
  }
})();
