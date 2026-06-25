// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════════════════

const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch && dot && ring) {
  document.documentElement.classList.add('has-custom-cursor');

  let mouse = { x: -100, y: -100 };
  let pos   = { x: -100, y: -100 };

  // Dot follows mouse exactly
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // Ring follows with lerp (smooth lag)
  (function lerpRing() {
    pos.x += (mouse.x - pos.x) * 0.12;
    pos.y += (mouse.y - pos.y) * 0.12;
    ring.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    requestAnimationFrame(lerpRing);
  })();

  // Hover expand on interactives
  document.querySelectorAll('a, button, .project-card, [data-cursor-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hovered'));
  });

  // Click squish
  window.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
  window.addEventListener('mouseup',   () => ring.classList.remove('is-clicking'));

  // Cursor color swap: white on dark hero, dark on light content
  const hero = document.querySelector('.hero');
  if (hero) {
    function updateCursorColor() {
      const inHero = window.scrollY < hero.offsetHeight - 80;
      dot.style.background   = inHero ? 'var(--hero-text)' : 'var(--text)';
      ring.style.borderColor = inHero ? 'var(--hero-text)' : 'var(--text)';
    }
    window.addEventListener('scroll', updateCursorColor, { passive: true });
    updateCursorColor();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTERNAL LINKS
// ═══════════════════════════════════════════════════════════════════════════

document.querySelectorAll('a[href^="http"]').forEach(a => {
  try {
    if (new URL(a.href).hostname !== location.hostname) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  } catch (_) {}
});

// ═══════════════════════════════════════════════════════════════════════════
// MAGNETIC CTAs
// Buttons pull gently toward the cursor; snap back with elastic ease on leave.
// Only runs on non-touch devices where GSAP is available.
// ═══════════════════════════════════════════════════════════════════════════

if (!isTouch && typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.home-footer-cta, .nav-resume, .ct-contact-btn, .ct-next-btn').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    });
  });
}
