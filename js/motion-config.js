// ═══════════════════════════════════════════════════════════════════════════
// MOTION HIERARCHY — "Deliberate Reveal" system
// Peso = Importância: headline chega devagar, metadata chega rápido.
// Direção = Categoria: primário sobe de baixo (y), labels entram da esquerda (x).
// ═══════════════════════════════════════════════════════════════════════════

window.MOTION = {
  hero_headline: { y: 60, duration: 1.0,  ease: 'power3.out' },
  section_title: { y: 40, duration: 0.85, ease: 'power3.out' },
  label:         { x: -16, duration: 0.65, ease: 'power2.out' },
  body_text:     { y: 20,  duration: 0.75, ease: 'power2.out' },
  image:         { y: 24,  scale: 0.97, duration: 0.9, ease: 'power2.out' },
  cta:           { y: 12,  duration: 0.5,  ease: 'power2.out' },
  metadata:      { y: 8,   duration: 0.45, ease: 'power1.out' },
};
