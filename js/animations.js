// ═══════════════════════════════════════════════════════════════════════════
// GSAP ANIMATIONS — Load Sequence + ScrollTrigger Reveals
// ═══════════════════════════════════════════════════════════════════════════

(function initAnimations() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero load sequence ──────────────────────────────────────────────────
  // Only runs if .hero exists on this page

  const hero = document.querySelector('.hero');

  if (hero) {
    // Set initial states
    gsap.set('.hero-badge',  { opacity: 0, y: 10 });
    gsap.set('.hero-line',   { opacity: 0, y: 48 });
    gsap.set('.hero-meta',   { opacity: 0, y: 10 });
    gsap.set('.hero-scroll', { opacity: 0 });

    const tl = gsap.timeline({ delay: 0.15 });

    tl.to('.hero-badge', {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out'
      })
      .to('.hero-line', {
        opacity: 1, y: 0, duration: 0.95,
        ease: 'power3.out', stagger: 0.1
      }, '-=0.35')
      .to('.hero-meta', {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out'
      }, '-=0.5')
      .to('.hero-scroll', {
        opacity: 1, duration: 0.6, ease: 'power2.out'
      }, '-=0.3');

    // Scroll indicator pulse
    gsap.to('.scroll-line', {
      scaleY: 0.55,
      transformOrigin: 'bottom center',
      duration: 0.85,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.8,
    });
  }

  // ── ScrollTrigger: single reveals ──────────────────────────────────────

  document.querySelectorAll('.reveal').forEach(el => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start:   'top 88%',
        once:    true,
      },
    });
  });

  // ── ScrollTrigger: staggered groups ────────────────────────────────────
  // Apply .reveal-group to a parent; its children animate in sequence

  document.querySelectorAll('.reveal-group').forEach(group => {
    const items = group.querySelectorAll(':scope > *');
    if (!items.length) return;

    gsap.from(items, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.09,
      scrollTrigger: {
        trigger: group,
        start:   'top 85%',
        once:    true,
      },
    });
  });

  // ── Page intro (non-hero pages) ─────────────────────────────────────────

  const pageIntro = document.querySelector('.page-intro');
  if (pageIntro && !hero) {
    gsap.set(['.page-label', '.page-title'], { opacity: 0, y: 20 });
    gsap.timeline({ delay: 0.1 })
      .to('.page-label', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to('.page-title', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');
  }

})();
