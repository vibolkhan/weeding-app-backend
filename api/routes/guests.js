// routes/guests.js
import express from "express";
import { getPool } from "../db.js";
// import requireAuth from '../middleware/requireAuth.js'  // if you have one

const router = express.Router();

router.get("/guests/public/by-code/:code", async (req, res) => {
  const { code } = req.params;
  if (!code) return res.status(400).json({ error: "Missing code" });
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, status, code FROM guests WHERE code = ? LIMIT 1",
      [code]
    );
    const g = rows[0];
    if (!g) return res.status(404).json({ error: "Guest not found" });
    res.json({ id: g.id, name: g.name, status: g.status, code: g.code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// --- PROTECTED routes below ---
// router.use(requireAuth); // <— if you use a per-router guard, put it AFTER the public route

// e.g.
// router.get('/guests', requireAuth, ...);
// router.post('/guests', requireAuth, ...);
// router.put('/guests/:id', requireAuth, ...);
// router.delete('/guests/:id', requireAuth, ...);

export default router;
