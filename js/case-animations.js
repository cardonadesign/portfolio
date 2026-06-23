// ═══════════════════════════════════════════════════════════════════════════
// CASE PAGE ANIMATIONS — scroll microinteractions
// Inspirado em portfolios editoriais (ex: pego.work)
// ═══════════════════════════════════════════════════════════════════════════

(function initCaseAnimations() {
  const casePage = document.querySelector('.case-page');
  if (!casePage || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // ── Scroll progress bar ─────────────────────────────────────────────────

  const progressBar = document.querySelector('.case-progress-bar');
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: casePage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }

  // ── Hero load sequence ──────────────────────────────────────────────────

  const introTl = gsap.timeline({ delay: 0.12 });

  gsap.set(['.case-tag', '.case-title', '.case-deck', '.case-stat', '.case-back'], {
    opacity: 0,
    y: 24,
  });

  introTl
    .to('.case-back', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' })
    .to('.case-tag', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25')
    .to('.case-title', { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.3')
    .to('.case-deck', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.55')
    .to('.case-stat', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
    }, '-=0.45');

  // ── Stat counter ────────────────────────────────────────────────────────

  document.querySelectorAll('.case-stat-value[data-count]').forEach(el => {
    const raw = el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isDecimal = raw.includes(',') || raw.includes('.');
    const target = parseFloat(raw.replace(',', '.'));

    if (Number.isNaN(target)) return;

    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el.closest('.case-stat') || el,
        start: 'top 90%',
        once: true,
      },
      onStart() {
        el.closest('.case-stat')?.classList.add('is-active');
      },
      onUpdate() {
        const current = isDecimal
          ? obj.val.toFixed(2).replace('.', ',')
          : Math.round(obj.val);
        el.textContent = `${prefix}${current}${suffix}`;
      },
    });
  });

  // ── Full-bleed media: parallax + scale ──────────────────────────────────

  document.querySelectorAll('.case-reveal-media').forEach(media => {
    const inner = media.querySelector('.case-bleed-inner') || media;
    const target = inner.querySelector('img, .case-image-placeholder') || inner;

    gsap.set(target, { scale: 1.08 });

    gsap.to(target, {
      scale: 1,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: media,
        start: 'top 92%',
        once: true,
      },
    });

    gsap.to(target, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: media,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  });

  // ── Text rows: label + body split reveal ────────────────────────────────

  document.querySelectorAll('.case-reveal-row').forEach(row => {
    const label = row.querySelector('.case-row-label');
    const body  = row.querySelector('.case-row-body');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: 'top 82%',
        once: true,
      },
    });

    if (label) {
      gsap.set(label, { opacity: 0, x: -16 });
      tl.to(label, { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' });
    }

    if (body) {
      gsap.set(body, { opacity: 0, y: 20 });
      tl.to(body, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.45');
    }

    ScrollTrigger.create({
      trigger: row,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => row.classList.add('is-active'),
      onEnterBack: () => row.classList.add('is-active'),
      onLeave: () => row.classList.remove('is-active'),
      onLeaveBack: () => row.classList.remove('is-active'),
    });
  });

  // ── More projects stagger ─────────────────────────────────────────────────

  const moreGrid = document.querySelector('.case-more-grid');
  if (moreGrid) {
    const cards = moreGrid.querySelectorAll('.case-more-card');
    gsap.set(cards, { opacity: 0, y: 24 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.07,
      scrollTrigger: {
        trigger: moreGrid,
        start: 'top 88%',
        once: true,
      },
    });
  }

})();
