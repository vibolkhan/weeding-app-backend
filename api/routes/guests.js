import { Router } from 'express';
import { getPool } from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();

// auth middleware for admin endpoints
function auth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// public (no token) – invite page uses this
router.get('/guests/public/by-code/:code', async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, status, code FROM guests WHERE code = ? LIMIT 1',
    [req.params.code]
  );
  if (!rows.length) return res.status(404).json({ error: 'Guest not found' });
  res.json(rows[0]);
});

// admin CRUD (token required)
router.get('/guests', auth, async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, name, status, code FROM guests ORDER BY id DESC');
  res.json(rows);
});

router.post('/guests', auth, async (req, res) => {
  const { name, status } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const code = Math.random().toString(36).slice(2, 12);
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO guests (name, status, code) VALUES (?, ?, ?)',
    [name, status || 'invited', code]
  );
  res.status(201).json({ id: result.insertId, name, status: status || 'invited', code });
});

router.put('/guests/:id', auth, async (req, res) => {
  const { name, status } = req.body || {};
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE guests SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?',
    [name ?? null, status ?? null, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/guests/:id', auth, async (req, res) => {
  const pool = getPool();
  const [result] = await pool.query('DELETE FROM guests WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
