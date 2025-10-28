window.APP_CONFIG = {
  API_BASE: location.hostname.endsWith("netlify.app")
    ? "/.netlify/functions/api"
    : "http://localhost:4000/api",
};

window.apiFetch = async function (path, options = {}) {
  const token = localStorage.getItem("jwt");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${window.APP_CONFIG?.API_BASE}${path}`, {
    ...options,
    headers,
  });
  // If unauthorized, bounce to login (admin pages)
  if (res.status === 401 && location.pathname.endsWith("admin.html")) {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    location.href = "./login.html";
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
};
