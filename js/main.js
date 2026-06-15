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
// HEADER SCROLL BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════

const header = document.querySelector('.site-header');

if (header && !header.classList.contains('scrolled')) {
  const hero    = document.querySelector('.hero');
  const trigger = hero ? hero.offsetHeight * 0.75 : 80;

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > trigger);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVE NAV LINK
// ═══════════════════════════════════════════════════════════════════════════

const page = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-link').forEach(a => {
  const href = a.getAttribute('href') || '';
  if (href === page || (page === '' && href === 'index.html')) {
    a.setAttribute('aria-current', 'page');
  }
});

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
