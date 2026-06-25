// ═══════════════════════════════════════════════════════════════════════════
// HERO — Frosted Glass Gradient (mouse-reactive GLSL shader)
// ═══════════════════════════════════════════════════════════════════════════

(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (typeof THREE === 'undefined') { console.warn('[hero.js] Three.js não carregou'); canvas.style.display = 'none'; return; }

  // ── Default config ───────────────────────────────────────────────────────

  const DEFAULTS = {
    color1:     [0.788, 0.231, 0.184],
    color2:     [0.090, 0.078, 0.078],
    colorBg:    [0.090, 0.078, 0.078],
    spread:      1.60,
    speed:       0.0,
    mouseStr:    0.28,
    grain:       0.55,
    stripeFreq:  0,
    stripeAmt:   0,
  };

  function loadConfig()  { return Object.assign({}, DEFAULTS); }
  function saveConfig()  {}

  const cfg = loadConfig();

  // ── Three.js setup ───────────────────────────────────────────────────────

  let W = canvas.parentElement.offsetWidth  || window.innerWidth;
  let H = canvas.parentElement.offsetHeight || window.innerHeight;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  } catch (e) { canvas.style.display = 'none'; return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new THREE.PlaneGeometry(2, 2);

  // ── Uniforms ─────────────────────────────────────────────────────────────

  const uniforms = {
    u_resolution: { value: new THREE.Vector2(W, H) },
    u_time:       { value: 0.0 },
    u_mouse:      { value: new THREE.Vector2(0.5, 0.5) },
    u_color1:     { value: new THREE.Vector3(...cfg.color1) },
    u_color2:     { value: new THREE.Vector3(...cfg.color2) },
    u_colorBg:    { value: new THREE.Vector3(...cfg.colorBg) },
    u_spread:     { value: cfg.spread },
    u_speed:      { value: cfg.speed },
    u_mouseStr:   { value: cfg.mouseStr },
    u_mouseVel:   { value: 0.0 },
    u_grain:      { value: cfg.grain },
    u_stripeFreq: { value: cfg.stripeFreq },
    u_stripeAmt:  { value: cfg.stripeAmt },
  };

  // ── Shader ───────────────────────────────────────────────────────────────

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;

      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_mouse;
      uniform vec3  u_color1;
      uniform vec3  u_color2;
      uniform vec3  u_colorBg;
      uniform float u_spread;
      uniform float u_speed;
      uniform float u_mouseStr;
      uniform float u_mouseVel;
      uniform float u_grain;
      uniform float u_stripeFreq;
      uniform float u_stripeAmt;

      #define PI 3.14159265358979

      float orb(vec2 p, vec2 center, float r) {
        vec2 d = p - center;
        return exp(-dot(d, d) / (r * r));
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv     = gl_FragCoord.xy / u_resolution;
        float aspect = u_resolution.x / u_resolution.y;

        float t = u_time * u_speed;

        // Portrait blend factor: 0 em landscape (aspect≥1), 1 em portrait (aspect≤0.5)
        float t_port = clamp((1.0 - aspect) / 0.5, 0.0, 1.0);

        // Posições âncora interpoladas entre landscape e portrait
        vec2 p1Base = mix(vec2(0.28, 0.62), vec2(0.42, 0.35), t_port);
        vec2 p2Base = mix(vec2(0.72, 0.38), vec2(0.58, 0.72), t_port);

        // Ambient orb positions (0-1 space)
        vec2 p1 = vec2(
          p1Base.x + sin(t * 0.71) * 0.14,
          p1Base.y + cos(t * 0.53) * 0.14
        );
        vec2 p2 = vec2(
          p2Base.x + cos(t * 0.63) * 0.13,
          p2Base.y + sin(t * 0.79) * 0.13
        );
        vec2 pm = u_mouse;

        // Aspect-corrected UV for circular distance
        vec2 uvAR = vec2(uv.x * aspect, uv.y);
        vec2 p1AR = vec2(p1.x * aspect, p1.y);
        vec2 p2AR = vec2(p2.x * aspect, p2.y);
        vec2 pmAR = vec2(pm.x * aspect, pm.y);

        // Spread maior em portrait para melhor cobertura vertical
        float r = mix(u_spread, u_spread * 1.25, t_port) * 0.65;

        float o1 = orb(uvAR, p1AR, r * 1.3);
        float o2 = orb(uvAR, p2AR, r * 1.1);
        float om = orb(uvAR, pmAR, r * 0.95) * u_mouseStr * u_mouseVel;

        // Blend orb colors over base — all driven by mouse velocity
        vec3 col = u_colorBg;
        col = mix(col, u_color1, clamp(o1 * u_mouseVel * 0.35, 0.0, 1.0));
        col = mix(col, u_color2, clamp(o2 * 0.9 * u_mouseVel, 0.0, 1.0));

        // Mouse hotspot — focused cursor glow
        vec3 hotspot = u_color1 * 1.1;
        col = mix(col, hotspot, clamp(om, 0.0, 1.0));

        // ── Ribbed glass effect ──────────────────────────────────────────
        if (u_stripeAmt > 0.001) {
          // Soft vertical sine stripes
          float stripe = sin(uv.x * u_stripeFreq * PI * 2.0) * 0.5 + 0.5;
          // Sharpen slightly without aliasing
          stripe = smoothstep(0.25, 0.75, stripe);
          // Map to a brightness multiplier around 1.0
          float s = mix(0.82, 1.18, stripe);
          col = mix(col, col * s, u_stripeAmt);
        }

        // ── Film grain ───────────────────────────────────────────────────
        if (u_grain > 0.001) {
          // Animated grain (changes each frame)
          vec2 gUV = uv + vec2(fract(u_time * 3.71), fract(u_time * 2.33));
          float gr  = hash(gUV) * 2.0 - 1.0;
          col += gr * u_grain * 0.055;
        }

        col = clamp(col, 0.0, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ── Mouse / touch → lerped uniform ───────────────────────────────────────

  let targetMouse  = { x: 0.5, y: 0.5 };
  let currentMouse = { x: 0.5, y: 0.5 };

  function onMouseMove(e) {
    targetMouse.x =  e.clientX / window.innerWidth;
    targetMouse.y = 1.0 - e.clientY / window.innerHeight;
  }

  function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    targetMouse.x =  touch.clientX / window.innerWidth;
    targetMouse.y = 1.0 - touch.clientY / window.innerHeight;
  }

  window.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });

  // ── Resize ───────────────────────────────────────────────────────────────

  const resizeObserver = new ResizeObserver(() => {
    W = canvas.parentElement.offsetWidth;
    H = canvas.parentElement.offsetHeight;
    renderer.setSize(W, H);
    uniforms.u_resolution.value.set(W, H);
  });
  resizeObserver.observe(canvas.parentElement);

  // ── Public API for gradient-editor.js ────────────────────────────────────

  function getConfig() {
    return {
      color1:     uniforms.u_color1.value.toArray(),
      color2:     uniforms.u_color2.value.toArray(),
      colorBg:    uniforms.u_colorBg.value.toArray(),
      spread:     uniforms.u_spread.value,
      speed:      uniforms.u_speed.value,
      mouseStr:   uniforms.u_mouseStr.value,
      grain:      uniforms.u_grain.value,
      stripeFreq: uniforms.u_stripeFreq.value,
      stripeAmt:  uniforms.u_stripeAmt.value,
    };
  }

  function applyConfig(c) {
    if (c.color1)     uniforms.u_color1.value.set(c.color1[0],  c.color1[1],  c.color1[2]);
    if (c.color2)     uniforms.u_color2.value.set(c.color2[0],  c.color2[1],  c.color2[2]);
    if (c.colorBg)    uniforms.u_colorBg.value.set(c.colorBg[0], c.colorBg[1], c.colorBg[2]);
    if (c.spread      !== undefined) uniforms.u_spread.value     = c.spread;
    if (c.speed       !== undefined) uniforms.u_speed.value      = c.speed;
    if (c.mouseStr    !== undefined) uniforms.u_mouseStr.value   = c.mouseStr;
    if (c.grain       !== undefined) uniforms.u_grain.value      = c.grain;
    if (c.stripeFreq  !== undefined) uniforms.u_stripeFreq.value = c.stripeFreq;
    if (c.stripeAmt   !== undefined) uniforms.u_stripeAmt.value  = c.stripeAmt;
    saveConfig(getConfig());
  }

  window._hero = { uniforms, getConfig, applyConfig, saveConfig, DEFAULTS };

  // ── Animation loop ────────────────────────────────────────────────────────

  const clock = new THREE.Clock();
  let frameId = null;

  let prevMouse = { x: 0.5, y: 0.5 };
  let mouseVel  = 0.0;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderer.render(scene, camera);
    return;
  }

  function animate() {
    frameId = requestAnimationFrame(animate);

    uniforms.u_time.value = clock.getElapsedTime();

    // Smooth mouse follow
    currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
    currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;
    uniforms.u_mouse.value.set(currentMouse.x, currentMouse.y);

    // Mouse velocity → drives glow intensity
    const dx = currentMouse.x - prevMouse.x;
    const dy = currentMouse.y - prevMouse.y;
    const spd = Math.sqrt(dx * dx + dy * dy);
    mouseVel += (Math.min(spd * 80, 1.0) - mouseVel) * 0.08;
    uniforms.u_mouseVel.value = mouseVel;
    prevMouse.x = currentMouse.x;
    prevMouse.y = currentMouse.y;

    renderer.render(scene, camera);
  }

  // Pause when hero scrolls out of view
  let intersectionObserver = null;
  const hero = document.querySelector('.page-home');
  if (hero && typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!frameId) animate();
      } else {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    }, { threshold: 0 });
    intersectionObserver.observe(hero);
  }

  animate();

  // ── Cleanup on unload ─────────────────────────────────────────────────────

  window.addEventListener('beforeunload', function () {
    cancelAnimationFrame(frameId);
    frameId = null;
    resizeObserver.disconnect();
    if (intersectionObserver) intersectionObserver.disconnect();
    window.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('touchmove', onTouchMove);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  });
})();
