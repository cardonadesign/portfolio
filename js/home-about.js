gsap.registerPlugin(ScrollTrigger);

gsap.from('.ap-header-title', {
  scrollTrigger: { trigger: '.home-about', start: 'top 90%' },
  y: 16,
  opacity: 0,
  duration: 0.7,
  ease: 'power2.out',
});

gsap.from('.ap-image-placeholder', {
  scrollTrigger: { trigger: '.home-about .ap-content', start: 'top 85%' },
  y: 24,
  opacity: 0,
  duration: 0.9,
  ease: 'power3.out',
});

gsap.from(['.ap-name', '.ap-bio', '.ap-capabilities'], {
  scrollTrigger: { trigger: '.home-about .ap-info-col', start: 'top 85%' },
  y: 16,
  opacity: 0,
  duration: 0.8,
  stagger: 0.12,
  ease: 'power3.out',
});

gsap.from('.home-about .ap-tag', {
  scrollTrigger: { trigger: '.home-about .ap-tags', start: 'top 92%' },
  y: 8,
  opacity: 0,
  duration: 0.5,
  stagger: 0.04,
  ease: 'power2.out',
});
