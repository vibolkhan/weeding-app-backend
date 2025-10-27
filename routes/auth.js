import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// (One-time) Create first admin user (remove/disable in production)
router.post('/create-user', async (req, res) => {
  const { email, password, role = 'admin' } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?,?,?)',
      [email, hash, role]
    );
    res.json({ id: r.insertId, email, role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
