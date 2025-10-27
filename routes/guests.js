import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
const router = Router();

// All routes here require auth
router.use(requireAuth);

// List guests
router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT id, name, status, invite_code, created_at FROM guests ORDER BY id DESC');
  res.json(rows);
});

// Create guest
router.post('/', async (req, res) => {
  const { name, status = 'invited' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Name required' });

  const invite_code = nanoid();
  const [r] = await pool.query(
    'INSERT INTO guests (name, status, invite_code) VALUES (?,?,?)',
    [name, status, invite_code]
  );
  res.json({ id: r.insertId, name, status, invite_code });
});

// Update guest
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body || {};
  const [r] = await pool.query(
    'UPDATE guests SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?',
    [name ?? null, status ?? null, id]
  );
  res.json({ updated: r.affectedRows });
});

// Delete guest
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const [r] = await pool.query('DELETE FROM guests WHERE id = ?', [id]);
  res.json({ deleted: r.affectedRows });
});

// Get guest by invite_code (for dynamic name display on index.html if you add ?guest=CODE)
router.get('/by-code/:code', async (req, res) => {
  const { code } = req.params;
  const [rows] = await pool.query('SELECT id, name, status, invite_code FROM guests WHERE invite_code = ?', [code]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

export default router;
