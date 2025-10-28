import { Router } from "express";
import crypto from "crypto";
import { getPool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function genCode() {
  return crypto.randomBytes(8).toString("base64url").slice(0, 10);
}

// Admin list
router.get("/guests", requireAuth, async (req, res) => {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, name, status, code, created_at FROM guests ORDER BY created_at DESC"
  );
  res.json(rows);
});

// Admin create
router.post("/guests", requireAuth, async (req, res) => {
  const { name, status = "invited" } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const code = genCode();
  const pool = getPool();
  const [result] = await pool.query(
    "INSERT INTO guests (name, status, code) VALUES (?, ?, ?)",
    [name, status, code]
  );
  res.json({ id: result.insertId, name, status, code });
});

// Admin update
router.put("/guests/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body || {};
  if (!name && !status)
    return res.status(400).json({ error: "Nothing to update" });
  const pool = getPool();
  const [rows] = await pool.query("SELECT id FROM guests WHERE id = ?", [id]);
  if (!rows.length) return res.status(404).json({ error: "Guest not found" });

  const fields = [];
  const values = [];
  if (name) {
    fields.push("name = ?");
    values.push(name);
  }
  if (status) {
    fields.push("status = ?");
    values.push(status);
  }
  values.push(id);

  const sql = "UPDATE guests SET " + fields.join(", ") + " WHERE id = ?";
  await pool.query(sql, values);
  res.json({ ok: true });
});

// Admin delete
router.delete("/guests/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  const [result] = await pool.query("DELETE FROM guests WHERE id = ?", [id]);
  res.json({ ok: true, affected: result.affectedRows });
});

export default router;
