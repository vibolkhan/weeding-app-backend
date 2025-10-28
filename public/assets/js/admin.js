// Uses the global api() helper defined in admin.html

const tbody = document.getElementById('guestTbody');
const form = document.getElementById('guestForm');
const nameInput = document.getElementById('guestName');
const statusSelect = document.getElementById('guestStatus');

// Build base invite URL dynamically
function baseInviteUrl() {
  const { protocol, host, pathname } = window.location;
  // assume index.html is next to admin.html in the same folder
  const base = pathname.replace(/admin\.html$/, 'index.html');
  return `${protocol}//${host}${base}`;
}

function inviteLinkFor(code) {
  return `${baseInviteUrl()}?guest=${encodeURIComponent(code)}`;
}

function rowTpl(g) {
  const link = inviteLinkFor(g.invite_code);
  return `
    <tr data-id="${g.id}">
      <td>
        <input class="inline-input" type="text" value="${escapeHtml(g.name)}" />
      </td>
      <td>
        <select class="inline-select" data-status>
          ${['invited','confirmed','declined','unknown'].map(s => `
            <option value="${s}" ${g.status===s?'selected':''}>${capitalize(s)}</option>
          `).join('')}
        </select>
      </td>
      <td>
        <div class="link-wrap">
          <input class="link-input" type="text" value="${link}" readonly />
          <button class="btn tiny" data-copy>Copy</button>
        </div>
      </td>
      <td class="actions">
        <button class="btn outline tiny" data-save>Save</button>
        <button class="btn danger tiny" data-del>Delete</button>
      </td>
    </tr>
  `;
}

function capitalize(s){ return s[0].toUpperCase() + s.slice(1); }
function escapeHtml(str) {
  return (str ?? '').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}

async function loadGuests() {
  tbody.innerHTML = `
    <tr><td colspan="4" class="muted">Loading…</td></tr>
  `;
  try {
    const guests = await api('/guests', { method: 'GET' });
    if (!Array.isArray(guests) || guests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="muted">No guests yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = guests.map(rowTpl).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" class="err">${e.message}</td></tr>`;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const status = statusSelect.value;
  if (!name) return;
  try {
    await api('/guests', {
      method: 'POST',
      body: JSON.stringify({ name, status })
    });
    nameInput.value = '';
    statusSelect.value = 'invited';
    await loadGuests();
  } catch (e) {
    alert(e.message);
  }
});

tbody.addEventListener('click', async (e) => {
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  const id = tr.getAttribute('data-id');

  if (e.target.matches('[data-copy]')) {
    const inp = tr.querySelector('.link-input');
    const val = inp.value;
    try {
      // Clipboard API (HTTPS or localhost)
      if (navigator.clipboard && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        await navigator.clipboard.writeText(val);
      } else {
        // Fallback
        inp.select();
        document.execCommand('copy');
      }
      e.target.textContent = 'Copied!';
      setTimeout(() => (e.target.textContent = 'Copy'), 1200);
    } catch {
      alert('Unable to copy. Long-press the text field to copy manually.');
    }
  }

  if (e.target.matches('[data-save]')) {
    const name = tr.querySelector('.inline-input').value.trim();
    const status = tr.querySelector('select[data-status]').value;
    try {
      await api(`/guests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, status })
      });
      e.target.textContent = 'Saved';
      setTimeout(() => (e.target.textContent = 'Save'), 1000);
    } catch (err) {
      alert(err.message);
    }
  }

  if (e.target.matches('[data-del]')) {
    if (!confirm('Delete this guest?')) return;
    try {
      await api(`/guests/${id}`, { method: 'DELETE' });
      tr.remove();
      if (!tbody.children.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="muted">No guests yet.</td></tr>`;
      }
    } catch (err) {
      alert(err.message);
    }
  }
});

loadGuests();
