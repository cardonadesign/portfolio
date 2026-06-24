(function () {
  function ready() {
    document.documentElement.classList.add('case-gate-ready');
  }

  function init() {
    var config = window.PROJECT_ACCESS;
    if (!config || !config.projects) {
      ready();
      return;
    }

    var projectId = document.body && document.body.getAttribute('data-project-id');
    if (!projectId) {
      ready();
      return;
    }

    var project = config.projects[projectId];
    if (!project || !project.locked) {
      ready();
      return;
    }

    var STORAGE_KEY = 'unlock:' + projectId;
    var TTL_MS = (config.unlockTTLDays || 30) * 24 * 60 * 60 * 1000;

    function isUnlocked() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        var data = JSON.parse(raw);
        return data.ts && Date.now() - data.ts < TTL_MS;
      } catch (_) {
        return false;
      }
    }

    function saveUnlock() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
      } catch (_) {}
    }

    function sha256(text) {
      var encoder = new TextEncoder();
      return crypto.subtle.digest('SHA-256', encoder.encode(text)).then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
    }

    function getExpectedHash() {
      if (project.passwordHash) return Promise.resolve(project.passwordHash);
      if (project.password) return sha256(project.password);
      return Promise.resolve(null);
    }

    function reveal() {
      document.body.classList.remove('is-gated');
      var gate = document.getElementById('case-gate');
      if (gate) gate.remove();
    }

    function showGate() {
      document.body.classList.add('is-gated');

      var gate = document.createElement('div');
      gate.id = 'case-gate';
      gate.className = 'case-gate';
      gate.setAttribute('role', 'dialog');
      gate.setAttribute('aria-modal', 'true');
      gate.setAttribute('aria-labelledby', 'case-gate-title');

      gate.innerHTML =
        '<div class="case-gate-card">' +
          '<p class="case-gate-label">Password-protected</p>' +
          '<h2 id="case-gate-title" class="case-gate-title">Enter the password to access this case</h2>' +
          '<form class="case-gate-form" id="case-gate-form">' +
            '<label class="case-gate-field">' +
              '<span class="case-gate-field-label">Password</span>' +
              '<input type="password" class="case-gate-input" id="case-gate-password" placeholder="Enter your password" autocomplete="current-password" required>' +
            '</label>' +
            '<p class="case-gate-error" id="case-gate-error" aria-live="polite" hidden>Incorrect password. Please try again.</p>' +
            '<button type="submit" class="case-gate-submit">View Work</button>' +
            '<a href="projetos.html" class="case-gate-back">Back to featured works</a>' +
          '</form>' +
        '</div>';

      document.body.appendChild(gate);

      var form = document.getElementById('case-gate-form');
      var input = document.getElementById('case-gate-password');
      var error = document.getElementById('case-gate-error');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        error.hidden = true;
        var submitBtn = form.querySelector('button[type=submit]');
        submitBtn.disabled = true;

        getExpectedHash().then(function (expected) {
          if (!expected) {
            error.textContent = 'Projeto sem senha configurada.';
            error.hidden = false;
            submitBtn.disabled = false;
            return;
          }
          return sha256(input.value).then(function (hash) {
            if (hash === expected) {
              saveUnlock();
              reveal();
            } else {
              error.hidden = false;
              input.focus();
              input.select();
              submitBtn.disabled = false;
            }
          });
        }).catch(function () {
          error.textContent = 'Erro ao verificar senha. Tente novamente.';
          error.hidden = false;
          submitBtn.disabled = false;
        });
      });

      input.focus();
    }

    if (isUnlocked()) {
      ready();
      return;
    }

    showGate();
    ready();
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
