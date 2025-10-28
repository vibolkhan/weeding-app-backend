(function () {
  const API_BASE = 'http://localhost:4000/api';
  const token = localStorage.getItem('jwt');
  const params = new URLSearchParams(window.location.search);
  const code = params.get('guest');
  if (!code) return;


  // Only add Authorization if we have a token.
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  fetch(`${API_BASE}/guests/by-code/` + encodeURIComponent(code), {
    method: 'GET',
    headers
  })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(g => {
      if (g && g.name) {
        const el = document.getElementById('guest-name');
        if (el) el.textContent = g.name;
      }
    })
    .catch(async (err) => {
      console.warn('Failed to fetch guest by code', err?.status || err);
    });
})();
