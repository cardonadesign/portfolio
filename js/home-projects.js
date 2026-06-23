gsap.registerPlugin(ScrollTrigger);

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
