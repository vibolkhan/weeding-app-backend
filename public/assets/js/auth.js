const API_BASE = 'https://weeding-app-api.netlify.app/api';

const emailEl = document.getElementById('email');
const passEl  = document.getElementById('password');
const btn     = document.getElementById('loginBtn');
const errEl   = document.getElementById('error');

function saveToken(token, user) {
  localStorage.setItem('jwt', token);
  localStorage.setItem('user', JSON.stringify(user));
}

btn?.addEventListener('click', async () => {
  errEl.textContent = '';
  const username = (emailEl?.value || '').trim();
  const password = passEl?.value || '';

  if (!username || !password) {
    errEl.textContent = 'Please enter username and password.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Login failed');

    saveToken(data.token, data.user);
    window.location.href = './admin.html';
  } catch (e) {
    errEl.textContent = e.message;
  }
});

// If logged in, go straight to admin
if (localStorage.getItem('jwt')) {
  window.location.href = './admin.html';
}
