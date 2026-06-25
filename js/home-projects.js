gsap.registerPlugin(ScrollTrigger);

// ── Home hero: clip-path reveal + fade sequence ─────────────────────────────

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const homeHero = document.querySelector('.home-hero');

  if (homeHero) {
    const tl = gsap.timeline({ delay: 0.1 });

    // Subtitle: quick fade (metadata level)
    gsap.set('.home-subtitle', { opacity: 0, y: 12 });

    // Title: clip-path reveal (headline weight — emerges from below)
    gsap.set('.home-title', { clipPath: 'inset(0 0 100% 0)', y: 40 });

    // Location + footer: fade in after title
    gsap.set('.home-location, .home-footer', { opacity: 0, y: 14 });

    tl.to('.home-subtitle', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' })
      .to('.home-title', {
        clipPath: 'inset(0 0 0% 0)',
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
      }, '-=0.2')
      .to('.home-location', { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, '-=0.55')
      .to('.home-footer', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4');

    // Hero text parallax: text moves slightly faster than scroll → depth separation
    gsap.to(homeHero, {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.page-home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }

}

// ── Work section reveals ────────────────────────────────────────────────────

gsap.from('.home-projects-label', {
  scrollTrigger: { trigger: '.home-projects', start: 'top 90%' },
  y: 16,
  opacity: 0,
  duration: 0.7,
  ease: 'power2.out',
});

gsap.from('.hp-card', {
  scrollTrigger: { trigger: '.home-projects-grid', start: 'top 85%' },
  y: 12,
  opacity: 0,
  duration: 0.85,
  stagger: 0.08,
  ease: 'power3.out',
});

gsap.from('.home-projects-cta', {
  scrollTrigger: { trigger: '.home-projects-cta', start: 'top 92%' },
  y: 12,
  opacity: 0,
  duration: 0.6,
  ease: 'power2.out',
});

// ── Contact footer: stagger reveal ─────────────────────────────────────────

(function () {
  const contactInner = document.querySelector('.ct-contact-inner');
  if (!contactInner) return;

  const contactParts = document.querySelectorAll('.ct-contact-sub, .ct-contact-headline, .ct-contact-btn, .ct-contact-social');
  if (!contactParts.length) return;

  gsap.set(contactParts, { opacity: 0, y: 24 });
  gsap.to(contactParts, {
    opacity: 1,
    y: 0,
    duration: 0.75,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: {
      trigger: contactInner,
      start: 'top 80%',
      once: true,
    },
  });
})();

// ── Scroll velocity tilt on cards ──────────────────────────────────────────
// Cards tilt slightly on the X axis based on scroll speed — communicates weight.

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  ScrollTrigger.create({
    onUpdate(self) {
      const velocity = self.getVelocity();
      const tilt = Math.max(-2, Math.min(2, velocity / 1000));
      gsap.to('.hp-card', {
        rotateX: tilt,
        transformPerspective: 800,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
  });
}
