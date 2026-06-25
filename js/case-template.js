// ═══════════════════════════════════════════════════════════════════════════
// CASE TEMPLATE ANIMATIONS — layout novo com sidebar sticky
// ═══════════════════════════════════════════════════════════════════════════

(function initCaseTemplateAnimations() {
  const page = document.querySelector('.ct-page');
  if (!page || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

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
        trigger: page,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }

  // ── Hero load sequence ──────────────────────────────────────────────────

  const heroMeta = document.querySelectorAll('.ct-hero-company, .ct-hero-title, .ct-hero-product');
  if (heroMeta.length) {
    gsap.set(heroMeta, { opacity: 0, y: 24 });
    gsap.to(heroMeta, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.15,
      delay: 0.25,
    });
  }

  // ── Hero meta: dissolve ao longo de toda a saída do hero ─────────────────
  // scrub: true = diretamente linkado ao scroll, sem lag que cause snap.
  // Range cobre todo o percurso do hero saindo da viewport (top→bottom).

  const ctHero = document.querySelector('.ct-hero');
  if (ctHero && heroMeta.length) {
    gsap.to(heroMeta, {
      opacity: 0,
      y: -16,
      ease: 'none',
      immediateRender: false, // não sobrescreve a animação de entrada ao ser criado
      scrollTrigger: {
        trigger: ctHero,
        start: 'top top',
        end:   'bottom top',
        scrub: true,
      },
    });
  }

  // ── Text sections: line indicator → label → body ────────────────────────
  // Each label gets a 1px marker line that grows before the text slides in.

  document.querySelectorAll('.ct-section').forEach(section => {
    const label = section.querySelector('.ct-section-label');
    const body  = section.querySelector('.ct-section-body');

    // Inject line marker before label text
    if (label && !label.querySelector('.ct-label-line')) {
      const line = document.createElement('span');
      line.className = 'ct-label-line';
      label.insertAdjacentElement('afterbegin', line);
    }

    const labelLine = label ? label.querySelector('.ct-label-line') : null;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        once: true,
      },
    });

    if (label) {
      gsap.set(label, { opacity: 0, x: -16 });
      // Label slides in; line draws concurrently as the label materializes
      tl.to(label, { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' });
    }

    if (labelLine) {
      // '<' = concurrent with label entrance; line draws as label fades in
      tl.to(labelLine, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, '<');
    }

    if (body) {
      gsap.set(body, { opacity: 0, y: 18 });
      tl.to(body, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');
    }
  });

  // ── Sidebar scroll fade: intro recedes as user dives into content ─────────
  // The "brief" fades back once the work takes over — not gone, just quieter.

  const ctIntroText = document.querySelector('.ct-intro-text');
  if (ctIntroText) {
    gsap.to(ctIntroText, {
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: '.ct-main',
        start: 'top 30%',
        end: 'top -40%',
        scrub: 1,
      },
    });
  }

  // ── Image rows: scale + fade on scroll ─────────────────────────────────

  document.querySelectorAll('.ct-img-row').forEach(row => {
    gsap.set(row, { opacity: 0, scale: 0.97, transformOrigin: 'center bottom' });
    gsap.to(row, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // ── Gallery head labels: fade in ────────────────────────────────────────

  document.querySelectorAll('.ct-gallery-head').forEach(head => {
    gsap.set(head, { opacity: 0, y: 12 });
    gsap.to(head, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: head,
        start: 'top 90%',
        once: true,
      },
    });
  });

  // ── Next project CTA: scale up on scroll ───────────────────────────────

  const nextCard = document.querySelector('.ct-next-card');
  if (nextCard) {
    gsap.set(nextCard, { opacity: 0, y: 24 });
    gsap.to(nextCard, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: nextCard,
        start: 'top 90%',
        once: true,
      },
    });
  }

  // ── Contact section: stagger fade in ───────────────────────────────────

  const contactParts = document.querySelectorAll('.ct-contact-sub, .ct-contact-headline, .ct-contact-btn, .ct-contact-social');
  if (contactParts.length) {
    gsap.set(contactParts, { opacity: 0, y: 24 });
    gsap.to(contactParts, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.ct-contact-inner',
        start: 'top 80%',
        once: true,
      },
    });
  }

})();
