// assets/js/admin.js
(function () {
  // Guard: require auth
  const token = localStorage.getItem("jwt");
  if (!token) {
    location.href = "./login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const form = document.getElementById("guestForm");
  const nameInput = document.getElementById("guestName");
  const statusSelect = document.getElementById("guestStatus");
  const tbody = document.getElementById("guestTbody");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    location.href = "./login.html";
  });

  function inviteLinkFor(code) {
    // point to your public invite page (index.html)
    const base = `${location.origin}${location.pathname.replace(
      /admin\.html$/,
      ""
    )}index.html`;
    return `${base}?guest=${encodeURIComponent(code)}`;
  }

  function rowTemplate(g) {
    const link = inviteLinkFor(g.code);
    return `
      <tr data-id="${g.id}">
        <td>
          <input class="cell-name" type="text" value="${g.name ?? ""}" />
        </td>
        <td>
          <select class="cell-status">
            ${["invited", "confirmed", "declined", "unknown"]
              .map(
                (s) =>
                  `<option value="${s}" ${
                    g.status === s ? "selected" : ""
                  }>${s}</option>`
              )
              .join("")}
          </select>
        </td>
        <td class="mono">
          <a href="${link}" target="_blank">${link}</a>
        </td>
        <td class="actions">
          <button class="btn xs copy">Copy</button>
          <button class="btn xs save">Save</button>
          <button class="btn xs danger del">Delete</button>
        </td>
      </tr>
    `;
  }

  async function loadGuests() {
    const list = await apiFetch("/guests");
    tbody.innerHTML = list.map(rowTemplate).join("");
  }

  // Create
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const status = statusSelect.value;
    if (!name) return;
    await apiFetch("/guests", {
      method: "POST",
      body: JSON.stringify({ name, status }),
    });
    nameInput.value = "";
    statusSelect.value = "invited";
    await loadGuests();
  });

  // ---- Add this helper somewhere top-level in admin.js ----
  async function copyText(text, btn) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older / blocked clipboard contexts
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy"); // legacy fallback
        document.body.removeChild(ta);
      }
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = original), 1200);
      }
    } catch (e) {
      alert("Copy failed. Please copy the link manually.");
    }
  }

  // Row actions (copy/save/delete)
  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const tr = btn.closest("tr");
    const id = tr?.dataset?.id;
    if (!id) return;

    if (btn.classList.contains("copy")) {
      // Prefer copying the existing link from the row
      const linkEl = tr.querySelector("td.mono a");
      let href = linkEl?.href || linkEl?.textContent || "";

      if (!href) {
        // Fallback: ask API for the guest code then build link
        try {
          const g = await apiFetch(`/guests/${id}`); // should return { id, name, status, code }
          href = inviteLinkFor(g.code);
        } catch (_) {
          // If BE didn’t return code, last-resort: tell the user
          alert("No invite link available for this guest yet.");
          return;
        }
      }

      await copyText(href, btn);
      return;
    }

    if (btn.classList.contains("save")) {
      const nameEl = tr.querySelector(".cell-name");
      const statusEl = tr.querySelector(".cell-status");
      await apiFetch(`/guests/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: nameEl.value.trim(),
          status: statusEl.value,
        }),
      });
      btn.textContent = "Saved";
      setTimeout(() => (btn.textContent = "Save"), 1200);
      return;
    }

    if (btn.classList.contains("del")) {
      if (!confirm("Delete this guest?")) return;
      await apiFetch(`/guests/${id}`, { method: "DELETE" });
      tr.remove();
      return;
    }
  });

  loadGuests().catch(console.error);
})();
