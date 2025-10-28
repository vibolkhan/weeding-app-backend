(() => {
  const CFG = window.APP_CONFIG ?? {};
  window.APP_CONFIG = {
    API_BASE: location.hostname.endsWith("netlify.app")
      ? "/.netlify/functions/api"
      : "http://localhost:4000/api",
  };

  const KEYS = Object.assign(
    { TOKEN: "jwt", USER: "user" },
    CFG.STORAGE_KEYS || {}
  );

  const form = document.getElementById("loginForm") || document.body; // optional form wrapper
  const userEl = document.getElementById("email"); // your field id; used as username
  const passEl = document.getElementById("password");
  const btn = document.getElementById("loginBtn");
  const errEl = document.getElementById("error"); // optional small error container

  // --- Helpers ---
  const setBusy = (busy) => {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.dataset.originalText ??= btn.textContent || "Login";
    btn.textContent = busy ? "Signing in…" : btn.dataset.originalText;
  };

  const showError = (msg) => {
    if (window.toast) return toast(msg); // if you have a toast util
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = "block";
    } else {
      alert(msg);
    }
  };

  const saveSession = (token, user) => {
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem(KEYS.USER, JSON.stringify(user || {}));
  };

  const gotoAdmin = () => (window.location.href = "./admin.html");

  // If already logged in -> go straight to admin
  const existing = localStorage.getItem(KEYS.TOKEN);
  if (existing) gotoAdmin();

  // --- Submit handler ---
  async function doLogin(e) {
    e?.preventDefault?.();

    const username = (userEl?.value || "").trim();
    const password = passEl?.value || "";

    if (!username || !password) {
      showError("Please enter username and password.");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`${window.APP_CONFIG?.API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // BE expects username + password
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data?.error || "Login failed");
        return;
      }

      if (!data?.token) {
        showError("Missing token in response.");
        return;
      }

      saveSession(data.token, data.user);
      gotoAdmin();
    } catch (err) {
      showError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Click + Enter support
  btn?.addEventListener("click", doLogin);
  form?.addEventListener("submit", doLogin);
})();
