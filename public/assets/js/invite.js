(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("guest");
  if (!code) return; // no code in link, nothing to show

  window.APP_CONFIG = {
    API_BASE: location.hostname.endsWith("netlify.app")
      ? "/.netlify/functions/api"
      : "http://localhost:4000/api",
  };

  fetch(
    `${window.APP_CONFIG?.API_BASE}/guests/public/by-code/${encodeURIComponent(
      code
    )}`
  )
    .then((r) => (r.ok ? r.json() : Promise.reject(r)))
    .then((g) => {
      if (g?.name) {
        const el = document.getElementById("guest-name"); // <div id="guest-name"></div>
        if (el) el.textContent = g.name;
      }
    })
    .catch(() => {
      // optional: keep silent or show a fallback
      const el = document.getElementById("guest-name");
      if (el) el.textContent = "";
    });
})();
