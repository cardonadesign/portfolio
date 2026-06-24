// ═══════════════════════════════════════════════════════════════════════════
// NAVBAR — unified behavior (all pages)
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var header     = document.querySelector('.site-header');
  var menuBtn    = document.querySelector('.nav-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  // ── Active link detection ─────────────────────────────────────────────────

  var page = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('is-active');
    }
  });

  // ── Scroll: hide on scroll down, show on scroll up ────────────────────────

  var lastY    = window.scrollY;
  var ticking  = false;
  var THRESHOLD = 80;

  function onScroll() {
    var y = window.scrollY;

    if (header) {
      header.classList.toggle('scrolled', y > 20);

      if (y > lastY && y > THRESHOLD) {
        header.classList.add('nav-hidden');
      } else {
        header.classList.remove('nav-hidden');
      }
    }

    lastY   = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // ── Mobile menu toggle ────────────────────────────────────────────────────

  function closeMenu() {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    if (header) header.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var isOpen = menuBtn.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      if (header) header.classList.toggle('menu-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href') || '';

        if (href.startsWith('mailto:') || href.startsWith('tel:')) {
          closeMenu();
          return;
        }

        e.preventDefault();
        closeMenu();

        mobileMenu.addEventListener('transitionend', function onEnd(ev) {
          if (ev.propertyName !== 'transform') return;
          mobileMenu.removeEventListener('transitionend', onEnd);
          window.location.href = href;
        });
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.classList.contains('is-open')) {
        closeMenu();
        menuBtn.focus();
      }
    });
  }
})();
