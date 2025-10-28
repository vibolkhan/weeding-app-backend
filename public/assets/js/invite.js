// assets/js/invite.js
(function () {
  const params = new URLSearchParams(location.search);
  const code = params.get('guest');
  if (!code) return;

  const nameEl = document.getElementById('guest-name');
  if (!nameEl) return;

  // This endpoint should NOT require JWT
  fetch(`${window.API_BASE}/guests/by-code/${encodeURIComponent(code)}`)
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(g => {
      if (g?.name) nameEl.textContent = g.name;
    })
    .catch(() => {
      // silently ignore
    });
})();
