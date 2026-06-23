// ═══════════════════════════════════════════════════════════════════════════
// GLASS EDITOR — Dev-only control panel
// Activate: Ctrl+Shift+G  or  add ?edit to URL
// ═══════════════════════════════════════════════════════════════════════════

(function initGlassEditor() {

  const hasURLParam = new URLSearchParams(location.search).has('edit');
  let panel = null;
  let isDragging = false;
  let dragOffX = 0, dragOffY = 0;

  // ── Color scheme presets ──────────────────────────────────────────────────

  const SCHEMES = {
    'Bloom': {
      color1: [0.65, 0.25, 0.70], color2: [0.85, 0.30, 0.55], colorBg: [0.18, 0.12, 0.28],
    },
    'Ocean': {
      color1: [0.15, 0.35, 0.80], color2: [0.10, 0.65, 0.75], colorBg: [0.05, 0.08, 0.22],
    },
    'Ember': {
      color1: [0.85, 0.30, 0.10], color2: [0.90, 0.60, 0.10], colorBg: [0.15, 0.06, 0.04],
    },
    'Mint': {
      color1: [0.20, 0.75, 0.55], color2: [0.15, 0.55, 0.80], colorBg: [0.04, 0.14, 0.12],
    },
    'Mono': {
      color1: [0.70, 0.70, 0.70], color2: [0.45, 0.45, 0.45], colorBg: [0.08, 0.08, 0.08],
    },
  };

  // ── Color helpers ─────────────────────────────────────────────────────────

  function vec3ToHex(v) {
    return '#' + v.map(c => Math.round(Math.min(1, Math.max(0, c)) * 255)
      .toString(16).padStart(2, '0')).join('');
  }

  function hexToVec3(h) {
    const n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  // ── CSS ───────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('ge-styles')) return;
    const style = document.createElement('style');
    style.id = 'ge-styles';
    style.textContent = `
      #ge-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 440px;
        background: rgba(8, 8, 6, 0.97);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px;
        font-family: 'PP Mori', system-ui, sans-serif;
        font-size: 13px;
        color: #dddbd5;
        z-index: 99999;
        box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
        user-select: none;
        overflow: hidden;
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }
      #ge-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        cursor: grab;
      }
      #ge-header:active { cursor: grabbing }
      .ge-title-wrap { display: flex; align-items: center; gap: 10px; }
      .ge-title-icon {
        width: 22px; height: 22px;
        background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
        border-radius: 5px;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; flex-shrink: 0;
      }
      .ge-title { font-size: 12px; font-weight: 500; letter-spacing: 0.02em; color: rgba(255,255,255,0.75); }
      .ge-subtitle { font-size: 10px; color: rgba(255,255,255,0.28); letter-spacing: 0.05em; text-transform: uppercase; }
      #ge-close {
        background: none; border: none;
        color: rgba(255,255,255,0.3);
        cursor: pointer; font-size: 18px;
        padding: 2px 6px; border-radius: 5px; line-height: 1;
        transition: color 0.15s, background 0.15s;
      }
      #ge-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
      #ge-body {
        padding: 20px;
        display: flex; flex-direction: column; gap: 22px;
        max-height: calc(100vh - 160px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.1) transparent;
      }
      #ge-body::-webkit-scrollbar { width: 4px; }
      #ge-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      .ge-section { display: flex; flex-direction: column; gap: 11px; }
      .ge-section-label {
        font-size: 10px; font-weight: 500;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: rgba(255,255,255,0.25);
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 1px;
      }
      .ge-row { display: flex; align-items: center; gap: 12px; }
      .ge-lbl { font-size: 12px; color: rgba(255,255,255,0.42); min-width: 148px; flex-shrink: 0; }
      /* Color picker row */
      .ge-color-row { display: flex; align-items: center; gap: 12px; }
      .ge-swatch {
        position: relative;
        width: 32px; height: 24px;
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.15);
        flex-shrink: 0;
        cursor: pointer;
      }
      .ge-swatch input[type="color"] {
        position: absolute;
        inset: -6px;
        width: calc(100% + 12px); height: calc(100% + 12px);
        border: none; padding: 0; cursor: pointer; opacity: 1;
      }
      .ge-hex {
        font-size: 11px; color: rgba(255,255,255,0.38);
        letter-spacing: 0.06em; min-width: 58px;
        font-variant-numeric: tabular-nums;
      }
      /* Sliders */
      .ge-slider {
        flex: 1;
        -webkit-appearance: none; appearance: none;
        height: 3px; border-radius: 99px;
        background: rgba(255,255,255,0.12);
        outline: none; cursor: pointer;
      }
      .ge-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 15px; height: 15px;
        border-radius: 50%; background: #fff;
        cursor: pointer; box-shadow: 0 0 8px rgba(0,0,0,0.6);
      }
      .ge-slider::-moz-range-thumb {
        width: 15px; height: 15px;
        border-radius: 50%; background: #fff;
        cursor: pointer; border: none;
      }
      .ge-val {
        font-size: 11px; color: rgba(255,255,255,0.35);
        min-width: 40px; text-align: right;
        font-variant-numeric: tabular-nums;
      }
      /* Chips */
      .ge-chips { display: flex; flex-wrap: wrap; gap: 7px; }
      .ge-chip {
        padding: 6px 14px; border-radius: 99px;
        font-size: 12px; cursor: pointer;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.52);
        transition: background 0.15s, border-color 0.15s, color 0.15s;
        font-family: inherit;
      }
      .ge-chip:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); color: #fff; }
      .ge-chip.active { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.45); color: #c084fc; }
      /* Footer */
      .ge-foot { display: flex; gap: 8px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06); }
      .ge-foot-btn {
        flex: 1; padding: 10px 10px; border-radius: 8px;
        font-size: 12px; font-weight: 500; cursor: pointer;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.58);
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        font-family: inherit; text-align: center;
      }
      .ge-foot-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); color: #fff; }
      .ge-foot-btn.primary {
        background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.35); color: #c084fc;
      }
      .ge-foot-btn.primary:hover { background: rgba(168,85,247,0.25); }
      /* Toast */
      #ge-toast {
        position: fixed; bottom: 90px; right: 24px;
        padding: 9px 16px;
        background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.35);
        border-radius: 8px; font-size: 12px; color: #c084fc;
        font-family: 'PP Mori', system-ui, sans-serif;
        z-index: 100000; opacity: 0; transform: translateY(8px);
        transition: opacity 0.2s, transform 0.2s; pointer-events: none;
      }
      #ge-toast.show { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
  }

  // ── Build panel ───────────────────────────────────────────────────────────

  function buildPanel() {
    const cfg = window._hero ? window._hero.getConfig() : {};

    const c1Hex  = vec3ToHex(cfg.color1  || [0.65, 0.25, 0.70]);
    const c2Hex  = vec3ToHex(cfg.color2  || [0.85, 0.30, 0.55]);
    const cBgHex = vec3ToHex(cfg.colorBg || [0.18, 0.12, 0.28]);

    const schemeChips = Object.keys(SCHEMES).map(name =>
      `<button class="ge-chip" data-scheme="${name}">${name}</button>`
    ).join('');

    const el = document.createElement('div');
    el.id = 'ge-panel';
    el.innerHTML = `
      <div id="ge-header">
        <div class="ge-title-wrap">
          <div class="ge-title-icon">✦</div>
          <div>
            <div class="ge-title">Glass Editor</div>
            <div class="ge-subtitle">Frosted Gradient</div>
          </div>
        </div>
        <button id="ge-close" title="Fechar">×</button>
      </div>
      <div id="ge-body">

        <div class="ge-section">
          <div class="ge-section-label">Cores</div>

          <div class="ge-color-row">
            <span class="ge-lbl">Cor principal</span>
            <div class="ge-swatch" style="background:${c1Hex}">
              <input type="color" id="ge-c1" value="${c1Hex}">
            </div>
            <span class="ge-hex" id="ge-c1-hex">${c1Hex}</span>
          </div>

          <div class="ge-color-row">
            <span class="ge-lbl">Cor secundária</span>
            <div class="ge-swatch" style="background:${c2Hex}">
              <input type="color" id="ge-c2" value="${c2Hex}">
            </div>
            <span class="ge-hex" id="ge-c2-hex">${c2Hex}</span>
          </div>

          <div class="ge-color-row">
            <span class="ge-lbl">Fundo</span>
            <div class="ge-swatch" style="background:${cBgHex}">
              <input type="color" id="ge-cbg" value="${cBgHex}">
            </div>
            <span class="ge-hex" id="ge-cbg-hex">${cBgHex}</span>
          </div>
        </div>

        <div class="ge-section">
          <div class="ge-section-label">Textura</div>

          <div class="ge-row">
            <span class="ge-lbl">Grain</span>
            <input type="range" class="ge-slider" id="ge-grain"
              min="0" max="1" step="0.01" value="${(cfg.grain || 0.35).toFixed(2)}">
            <span class="ge-val" id="ge-grain-v">${(cfg.grain || 0.35).toFixed(2)}</span>
          </div>

          <div class="ge-row">
            <span class="ge-lbl">Listras (frequência)</span>
            <input type="range" class="ge-slider" id="ge-sfreq"
              min="0" max="60" step="1" value="${cfg.stripeFreq || 18}">
            <span class="ge-val" id="ge-sfreq-v">${cfg.stripeFreq || 18}</span>
          </div>

          <div class="ge-row">
            <span class="ge-lbl">Listras (intensidade)</span>
            <input type="range" class="ge-slider" id="ge-samt"
              min="0" max="1" step="0.01" value="${(cfg.stripeAmt || 0.25).toFixed(2)}">
            <span class="ge-val" id="ge-samt-v">${(cfg.stripeAmt || 0.25).toFixed(2)}</span>
          </div>
        </div>

        <div class="ge-section">
          <div class="ge-section-label">Luz & Movimento</div>

          <div class="ge-row">
            <span class="ge-lbl">Spread (tamanho orbs)</span>
            <input type="range" class="ge-slider" id="ge-spread"
              min="0.3" max="2.5" step="0.05" value="${(cfg.spread || 1.0).toFixed(2)}">
            <span class="ge-val" id="ge-spread-v">${(cfg.spread || 1.0).toFixed(2)}</span>
          </div>

          <div class="ge-row">
            <span class="ge-lbl">Velocidade animação</span>
            <input type="range" class="ge-slider" id="ge-speed"
              min="0" max="0.3" step="0.005" value="${(cfg.speed || 0.08).toFixed(3)}">
            <span class="ge-val" id="ge-speed-v">${(cfg.speed || 0.08).toFixed(3)}</span>
          </div>

          <div class="ge-row">
            <span class="ge-lbl">Força do mouse</span>
            <input type="range" class="ge-slider" id="ge-mstr"
              min="0" max="2" step="0.05" value="${(cfg.mouseStr || 1.0).toFixed(2)}">
            <span class="ge-val" id="ge-mstr-v">${(cfg.mouseStr || 1.0).toFixed(2)}</span>
          </div>
        </div>

        <div class="ge-section">
          <div class="ge-section-label">Esquemas de cor</div>
          <div class="ge-chips" id="ge-schemes">${schemeChips}</div>
        </div>

        <div class="ge-foot">
          <button class="ge-foot-btn" id="ge-copy">Copiar config</button>
          <button class="ge-foot-btn primary" id="ge-export">Exportar padrão</button>
          <button class="ge-foot-btn" id="ge-reset">↺ Reset</button>
        </div>

      </div>
    `;
    return el;
  }

  // ── Wire controls ─────────────────────────────────────────────────────────

  function wireControls() {
    if (!window._hero) return;

    function qs(sel) { return panel.querySelector(sel); }

    // Color pickers
    [
      ['ge-c1',  'ge-c1-hex',  'color1'],
      ['ge-c2',  'ge-c2-hex',  'color2'],
      ['ge-cbg', 'ge-cbg-hex', 'colorBg'],
    ].forEach(([inputId, hexId, key]) => {
      const input   = qs(`#${inputId}`);
      const hexEl   = qs(`#${hexId}`);
      const swatchEl = input.parentElement;
      if (!input) return;
      input.addEventListener('input', () => {
        const hex = input.value;
        const v3  = hexToVec3(hex);
        swatchEl.style.background = hex;
        hexEl.textContent = hex;
        window._hero.applyConfig({ [key]: v3 });
      });
    });

    // Range sliders
    [
      ['ge-grain',  'ge-grain-v',  'grain',      2],
      ['ge-sfreq',  'ge-sfreq-v',  'stripeFreq', 0],
      ['ge-samt',   'ge-samt-v',   'stripeAmt',  2],
      ['ge-spread', 'ge-spread-v', 'spread',     2],
      ['ge-speed',  'ge-speed-v',  'speed',      3],
      ['ge-mstr',   'ge-mstr-v',   'mouseStr',   2],
    ].forEach(([id, valId, key, digits]) => {
      const sl = qs(`#${id}`);
      const vl = qs(`#${valId}`);
      if (!sl) return;
      sl.addEventListener('input', () => {
        const v = parseFloat(sl.value);
        vl.textContent = v.toFixed(digits);
        window._hero.applyConfig({ [key]: v });
      });
    });

    // Color scheme chips
    qs('#ge-schemes').querySelectorAll('.ge-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const scheme = SCHEMES[btn.dataset.scheme];
        window._hero.applyConfig(scheme);
        syncColorPickers();
        qs('#ge-schemes').querySelectorAll('.ge-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Copy config (JSON)
    qs('#ge-copy').addEventListener('click', async () => {
      const json = JSON.stringify(window._hero.getConfig(), null, 2);
      try { await navigator.clipboard.writeText(json); showToast('Config JSON copiado!'); }
      catch (_) { prompt('Copie o config:', json); }
    });

    // Export default (JS snippet to paste into hero.js)
    qs('#ge-export').addEventListener('click', async () => {
      const cfg = window._hero.getConfig();
      const lines = Object.entries(cfg).map(([k, v]) => {
        const val = Array.isArray(v)
          ? `[${v.map(n => n.toFixed(4)).join(', ')}]`
          : (Number.isInteger(v) ? v : parseFloat(v).toFixed(4));
        return `    ${k}: ${val},`;
      });
      const snippet =
        `// Cole dentro de DEFAULTS em js/hero.js:\nconst DEFAULTS = {\n${lines.join('\n')}\n};`;
      try { await navigator.clipboard.writeText(snippet); showToast('Snippet copiado! Cole em hero.js → DEFAULTS'); }
      catch (_) { prompt('Copie e cole em hero.js → DEFAULTS:', snippet); }
    });

    // Reset
    qs('#ge-reset').addEventListener('click', () => {
      window._hero.applyConfig(window._hero.DEFAULTS);
      try { localStorage.removeItem('mc-glass'); } catch (_) {}
      syncColorPickers();
      syncSliders();
      qs('#ge-schemes').querySelectorAll('.ge-chip').forEach(b => b.classList.remove('active'));
      showToast('Reset para padrão');
    });

    // Close
    qs('#ge-close').addEventListener('click', () => { panel.remove(); panel = null; });
  }

  function syncColorPickers() {
    if (!window._hero || !panel) return;
    function qs(sel) { return panel.querySelector(sel); }
    const cfg = window._hero.getConfig();
    [
      ['ge-c1',  'ge-c1-hex',  cfg.color1],
      ['ge-c2',  'ge-c2-hex',  cfg.color2],
      ['ge-cbg', 'ge-cbg-hex', cfg.colorBg],
    ].forEach(([inputId, hexId, v3]) => {
      const hex     = vec3ToHex(v3);
      const input   = qs(`#${inputId}`);
      const hexEl   = qs(`#${hexId}`);
      if (input) { input.value = hex; input.parentElement.style.background = hex; }
      if (hexEl) hexEl.textContent = hex;
    });
  }

  function syncSliders() {
    if (!window._hero || !panel) return;
    function qs(sel) { return panel.querySelector(sel); }
    const d = window._hero.DEFAULTS;
    [
      ['ge-grain',  'ge-grain-v',  d.grain,      2],
      ['ge-sfreq',  'ge-sfreq-v',  d.stripeFreq, 0],
      ['ge-samt',   'ge-samt-v',   d.stripeAmt,  2],
      ['ge-spread', 'ge-spread-v', d.spread,     2],
      ['ge-speed',  'ge-speed-v',  d.speed,      3],
      ['ge-mstr',   'ge-mstr-v',   d.mouseStr,   2],
    ].forEach(([id, valId, val, digits]) => {
      const sl = qs(`#${id}`);
      const vl = qs(`#${valId}`);
      if (sl) sl.value = val;
      if (vl) vl.textContent = parseFloat(val).toFixed(digits);
    });
  }

  // ── Drag ─────────────────────────────────────────────────────────────────

  function makeDraggable() {
    const header = panel.querySelector('#ge-header');
    if (!header) return;
    header.addEventListener('mousedown', e => {
      if (e.target.id === 'ge-close') return;
      isDragging = true;
      const rect = panel.getBoundingClientRect();
      dragOffX = e.clientX - rect.left;
      dragOffY = e.clientY - rect.top;
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging || !panel) return;
      panel.style.right  = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left   = Math.max(0, e.clientX - dragOffX) + 'px';
      panel.style.top    = Math.max(0, e.clientY - dragOffY) + 'px';
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(msg) {
    let toast = document.getElementById('ge-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ge-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ── Open ──────────────────────────────────────────────────────────────────

  function openPanel() {
    if (panel) return;
    if (!window._hero) { setTimeout(openPanel, 150); return; }
    injectStyles();
    panel = buildPanel();
    document.body.appendChild(panel);
    wireControls();
    makeDraggable();
  }

  // ── Keyboard shortcut ─────────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
      e.preventDefault();
      if (panel) { panel.remove(); panel = null; } else { openPanel(); }
    }
  });

  if (hasURLParam) setTimeout(openPanel, 150);

})();
