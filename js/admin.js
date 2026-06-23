(function () {
  var config = window.PROJECT_ACCESS || {};
  var adminPasswordHash = config.adminPasswordHash || '';

  var projectMeta = {
    'projeto-a': 'Reconstrução de E-commerce de Assinatura',
    'projeto-b': 'Risk & Credit Management',
    'projeto-c': 'Investment App',
    'projeto-d': 'Financial Payment Module',
    'projeto-e': 'Reverse Logistics Module',
  };

  // Local state cloned from config
  var state = {};
  Object.keys(projectMeta).forEach(function (id) {
    var p = ((config.projects || {})[id]) || {};
    state[id] = {
      locked: p.locked !== undefined ? p.locked : false,
      passwordHash: p.passwordHash || '',
    };
  });

  function sha256(text) {
    var encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  // ── Gate ──────────────────────────────────────────────────────────────────
  var gate = document.getElementById('admin-gate');
  var panel = document.getElementById('admin-panel');
  var gateForm = document.getElementById('gate-form');
  var gateInput = document.getElementById('gate-input');
  var gateError = document.getElementById('gate-error');

  gateInput.focus();

  gateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    gateError.hidden = true;
    var submitBtn = gateForm.querySelector('button[type=submit]');
    submitBtn.disabled = true;

    sha256(gateInput.value).then(function (hash) {
      if (hash === adminPasswordHash) {
        gate.hidden = true;
        panel.hidden = false;
        renderProjects();
      } else {
        gateError.hidden = false;
        gateInput.select();
        submitBtn.disabled = false;
      }
    }).catch(function () {
      gateError.textContent = 'Erro ao verificar senha. Tente novamente.';
      gateError.hidden = false;
      submitBtn.disabled = false;
    });
  });

  // ── Render projects ────────────────────────────────────────────────────────
  function renderProjects() {
    var grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    Object.keys(projectMeta).forEach(function (id) {
      var s = state[id];

      var card = document.createElement('div');
      card.className = 'project-card ' + (s.locked ? 'is-locked' : 'is-unlocked');
      card.dataset.id = id;

      // Header
      var header = document.createElement('div');
      header.className = 'card-header';

      var info = document.createElement('div');
      info.className = 'card-info';

      var cardId = document.createElement('span');
      cardId.className = 'card-id';
      cardId.textContent = id;

      var cardName = document.createElement('span');
      cardName.className = 'card-name';
      cardName.textContent = projectMeta[id];

      info.appendChild(cardId);
      info.appendChild(cardName);

      var toggleWrap = document.createElement('div');
      toggleWrap.className = 'toggle-wrap';

      var labelText = document.createElement('span');
      labelText.className = 'toggle-label-text';
      labelText.textContent = s.locked ? 'Bloqueado' : 'Liberado';

      var label = document.createElement('label');
      label.className = 'toggle';
      label.setAttribute('aria-label', (s.locked ? 'Bloquear' : 'Liberar') + ' ' + projectMeta[id]);

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = s.locked;
      checkbox.dataset.id = id;
      checkbox.setAttribute('role', 'switch');
      checkbox.setAttribute('aria-checked', String(s.locked));

      var slider = document.createElement('span');
      slider.className = 'toggle-slider';

      label.appendChild(checkbox);
      label.appendChild(slider);

      toggleWrap.appendChild(labelText);
      toggleWrap.appendChild(label);

      header.appendChild(info);
      header.appendChild(toggleWrap);

      // Password row
      var passRow = document.createElement('div');
      passRow.className = 'card-password';
      passRow.hidden = !s.locked;

      var passLabel = document.createElement('span');
      passLabel.className = 'card-password-label';
      passLabel.textContent = 'Hash da senha';

      var passInput = document.createElement('input');
      passInput.type = 'text';
      passInput.className = 'card-password-input';
      passInput.value = s.passwordHash;
      passInput.placeholder = 'Cole o hash SHA-256 (npm run hash-password)';
      passInput.dataset.id = id;
      passInput.setAttribute('autocomplete', 'off');
      passInput.setAttribute('aria-label', 'Hash da senha de ' + projectMeta[id]);

      passRow.appendChild(passLabel);
      passRow.appendChild(passInput);

      card.appendChild(header);
      card.appendChild(passRow);
      grid.appendChild(card);

      // Toggle locked
      checkbox.addEventListener('change', function () {
        var cardId = this.dataset.id;
        state[cardId].locked = this.checked;
        this.setAttribute('aria-checked', String(this.checked));
        updateCard(cardId);
        hideOutput();
      });

      // Password input
      passInput.addEventListener('input', function () {
        state[this.dataset.id].passwordHash = this.value;
        hideOutput();
      });
    });
  }

  function updateCard(id) {
    var s = state[id];
    var card = document.querySelector('.project-card[data-id="' + id + '"]');
    if (!card) return;
    card.className = 'project-card ' + (s.locked ? 'is-locked' : 'is-unlocked');
    var label = card.querySelector('.toggle-label-text');
    if (label) label.textContent = s.locked ? 'Bloqueado' : 'Liberado';
    var passRow = card.querySelector('.card-password');
    if (passRow) passRow.hidden = !s.locked;
  }

  // ── Bulk actions ───────────────────────────────────────────────────────────
  document.getElementById('unlock-all-btn').addEventListener('click', function () {
    Object.keys(state).forEach(function (id) { state[id].locked = false; });
    Object.keys(projectMeta).forEach(function (id) {
      var cb = document.querySelector('input[type=checkbox][data-id="' + id + '"]');
      if (cb) { cb.checked = false; cb.setAttribute('aria-checked', 'false'); }
      updateCard(id);
    });
    hideOutput();
  });

  document.getElementById('lock-all-btn').addEventListener('click', function () {
    Object.keys(state).forEach(function (id) { state[id].locked = true; });
    Object.keys(projectMeta).forEach(function (id) {
      var cb = document.querySelector('input[type=checkbox][data-id="' + id + '"]');
      if (cb) { cb.checked = true; cb.setAttribute('aria-checked', 'true'); }
      updateCard(id);
    });
    hideOutput();
  });

  // ── Generate config ────────────────────────────────────────────────────────
  document.getElementById('generate-btn').addEventListener('click', function () {
    var lines = Object.keys(projectMeta).map(function (id) {
      var s = state[id];
      var locked = s.locked ? 'true ' : 'false';
      return "    '" + id + "': { locked: " + locked + ", passwordHash: '" + s.passwordHash + "' }";
    });

    var code =
      "/**\n" +
      " * Controle de acesso por senha aos cases.\n" +
      " *\n" +
      " * Para proteger um projeto: locked: true + passwordHash.\n" +
      " * Para liberar: locked: false\n" +
      " *\n" +
      " * Para gerar um novo hash: npm run hash-password -- \"sua-senha\"\n" +
      " * Edite pelo painel: admin.html\n" +
      " */\n" +
      "window.PROJECT_ACCESS = {\n" +
      "  adminPasswordHash: '" + (config.adminPasswordHash || '') + "',\n" +
      "  projects: {\n" +
      lines.join(',\n') + ',\n' +
      "  },\n" +
      "  unlockTTLDays: " + (config.unlockTTLDays || 30) + ",\n" +
      "};\n";

    document.getElementById('output-code').textContent = code;
    document.getElementById('output-section').hidden = false;
    document.getElementById('output-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  function hideOutput() {
    document.getElementById('output-section').hidden = true;
  }

  // ── Copy ───────────────────────────────────────────────────────────────────
  document.getElementById('copy-btn').addEventListener('click', function () {
    var code = document.getElementById('output-code').textContent;
    var btn = this;

    navigator.clipboard.writeText(code).then(function () {
      btn.textContent = 'Copiado!';
      setTimeout(function () { btn.textContent = 'Copiar'; }, 2000);
    }).catch(function () {
      btn.textContent = 'Erro ao copiar';
      setTimeout(function () { btn.textContent = 'Copiar'; }, 2000);
    });
  });

  // ── Download ───────────────────────────────────────────────────────────────
  document.getElementById('download-btn').addEventListener('click', function () {
    var code = document.getElementById('output-code').textContent;
    var blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'project-access.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
