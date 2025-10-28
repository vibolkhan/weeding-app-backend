// LocalStorage-backed guest store
(function (global) {
  const STORAGE_KEY = "wedding.guests.v1";

  const DEFAULTS = [
    // Example seeds (optional) – delete if you don’t want samples
    { id: crypto.randomUUID(), name: "លោក សេន", status: "Invited", slug: "lok-sen" },
    { id: crypto.randomUUID(), name: "អ្នកនាង សុភា", status: "Invited", slug: "neak-neang-sophea" }
  ];

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        _save(DEFAULTS);
        return DEFAULTS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function _save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function list() {
    return _load().sort((a, b) => a.name.localeCompare(b.name, "km"));
  }

  function slugify(name) {
    const ascii = name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    return ascii || "guest";
  }

  function ensureUniqueSlug(base, exceptId = null) {
    const all = _load();
    let candidate = base;
    let i = 1;
    while (all.some(g => g.slug === candidate && g.id !== exceptId)) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  function upsert(guest) {
    const all = _load();
    const isEdit = Boolean(guest.id);
    const id = guest.id || crypto.randomUUID();
    const baseSlug = slugify(guest.name);
    const slug = ensureUniqueSlug(baseSlug, isEdit ? id : null);

    const finalGuest = {
      id,
      name: guest.name.trim(),
      status: guest.status || "Invited",
      slug
    };

    const idx = all.findIndex(g => g.id === id);
    if (idx >= 0) all[idx] = finalGuest;
    else all.push(finalGuest);

    _save(all);
    return finalGuest;
  }

  function remove(id) {
    const all = _load().filter(g => g.id !== id);
    _save(all);
  }

  function findBySlug(slug) {
    return _load().find(g => g.slug === slug) || null;
  }

  function getLinkFor(guest, filename = "index.html") {
    // Build an absolute URL based on the current page location,
    // but pointing to `filename`, and attach ?guest=...
    const url = new URL(filename, window.location.href);
    url.searchParams.set("guest", guest.slug);
    return url.href; // absolute, includes protocol/host/path
  }

  global.GuestStore = { list, upsert, remove, findBySlug, getLinkFor };
})(window);

