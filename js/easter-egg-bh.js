(function () {
  const trigger = document.getElementById('bh-trigger');
  const card    = document.getElementById('bh-card');
  if (!trigger || !card || typeof gsap === 'undefined') return;

  const isTouch = window.matchMedia('(hover: none)').matches;

  // Move card to body to escape overflow:hidden on .page-home
  document.body.appendChild(card);

  // ── Trocar entre 'polaroid' e 'blob' para comparar ao vivo ──
  const VARIANT = 'polaroid';

  const CARD_W = 220;
  const BELOW  = 20; // gap entre cursor e borda superior do card

  // GSAP quickTo: smooth following sem criar tween a cada mousemove
  const quickLeft = gsap.quickTo(card, 'left', { duration: 0.22, ease: 'power2.out' });
  const quickTop  = gsap.quickTo(card, 'top',  { duration: 0.22, ease: 'power2.out' });

  function clampLeft(mouseX) {
    return Math.max(8, Math.min(mouseX - CARD_W / 2, window.innerWidth - CARD_W - 8));
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANTE A: Polaroid Drop
  // Card aparece abaixo do cursor com elastic spring,
  // depois segue o mouse suavemente
  // ─────────────────────────────────────────────────────────────
  function showPolaroid(e) {
    // Posição inicial: sem lag para não aparecer em lugar errado
    gsap.set(card, { left: clampLeft(e.clientX), top: e.clientY + BELOW });
    gsap.killTweensOf(card);
    card.style.pointerEvents = 'auto';
    gsap.fromTo(card,
      { y: -18, opacity: 0, transformOrigin: 'center top' },
      { y: 0,   opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.42)' }
    );
  }

  function movePolaroid(e) {
    quickLeft(clampLeft(e.clientX));
    quickTop(e.clientY + BELOW);
  }

  function hidePolaroid() {
    gsap.killTweensOf(card);
    gsap.to(card, {
      y: -14, opacity: 0,
      duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        card.style.pointerEvents = 'none';
        gsap.set(card, { y: 0 });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANTE B: Morphing Blob
  // clip-path circle expande a partir do topo do card
  // ─────────────────────────────────────────────────────────────
  function showBlob(e) {
    gsap.set(card, { left: clampLeft(e.clientX), top: e.clientY + BELOW });
    gsap.killTweensOf(card);
    card.style.pointerEvents = 'auto';
    gsap.fromTo(card,
      { clipPath: 'circle(0% at 50% 0%)', opacity: 1 },
      { clipPath: 'circle(160% at 50% 0%)', duration: 0.5, ease: 'power3.out' }
    );
  }

  function moveBlob(e) {
    quickLeft(clampLeft(e.clientX));
    quickTop(e.clientY + BELOW);
  }

  function hideBlob() {
    gsap.killTweensOf(card);
    gsap.to(card, {
      clipPath: 'circle(0% at 50% 0%)',
      duration: 0.35, ease: 'power3.in',
      onComplete: () => {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        gsap.set(card, { clearProps: 'clipPath' });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Desktop listeners
  // ─────────────────────────────────────────────────────────────
  if (!isTouch) {
    const show = VARIANT === 'polaroid' ? showPolaroid : showBlob;
    const move = VARIANT === 'polaroid' ? movePolaroid : moveBlob;
    const hide = VARIANT === 'polaroid' ? hidePolaroid : hideBlob;

    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mousemove',  move);
    trigger.addEventListener('mouseleave', hide);
  }

  // ─────────────────────────────────────────────────────────────
  // Mobile: tap toggle
  // ─────────────────────────────────────────────────────────────
  if (isTouch) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = card.classList.toggle('is-visible');
      card.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) {
        const rect = trigger.getBoundingClientRect();
        const mobileW = Math.min(260, window.innerWidth * 0.8);
        card.style.width = mobileW + 'px';
        card.style.left  = Math.max(8, rect.left + rect.width / 2 - mobileW / 2) + 'px';
        card.style.top   = (rect.bottom + 12) + 'px';
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (!trigger.contains(e.target) && !card.contains(e.target)) {
        card.classList.remove('is-visible');
        card.setAttribute('aria-hidden', 'true');
      }
    }, { passive: true });
  }
})();
