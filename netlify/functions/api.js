// netlify/functions/api.js
import express from "express";
import serverless from "serverless-http";
import { Sequelize, DataTypes, Op } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

/* --------------------------- DB: Neon (Postgres) --------------------------- */
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
if (!url) console.warn("DATABASE_URL/NETLIFY_DATABASE_URL is not set");

const sequelize = new Sequelize(url, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true },
    // For local cert issues: ssl: { require: true, rejectUnauthorized: false }
  },
  pool: { max: 2, min: 0, idle: 10000, acquire: 20000 },
  logging: false,
});

// USERS TABLE (public.users)
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    username: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING }, // hashed
  },
  { tableName: "users", schema: "public", timestamps: false }
);

// GUESTS TABLE (public.guests)
// 👉 If your columns differ, edit below to match your Neon table.
const Guest = sequelize.define(
  "Guest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    note: { type: DataTypes.TEXT },
  },
  { tableName: "guests", schema: "public", timestamps: false }
);

// Authenticate DB once per cold start
let didAuth = false;
app.use(async (_req, _res, next) => {
  if (!didAuth) {
    try {
      await sequelize.authenticate();
      didAuth = true;
    } catch (err) {
      console.error("DB connection failed:", err);
      return next(err);
    }
  }
  next();
});

/* ------------------------------- Auth utils ------------------------------- */
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signToken(user) {
  return jwt.sign({ uid: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "12h",
  });
}

function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* --------------------------------- Sample --------------------------------- */
app.get("/api/hello", (_req, res) =>
  res.json({ message: "Hello from Express on Netlify!" })
);
app.get("/api/time", (_req, res) =>
  res.json({ now: new Date().toISOString() })
);
app.post("/api/echo", (req, res) => res.json({ youSent: req.body ?? null }));

/* --------------------------------- Login ---------------------------------- */
// POST /api/login  { username, password }
app.post("/api/login", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password)
      return res
        .status(400)
        .json({ error: "username and password are required" });

    const user = await User.findOne({ where: { username: String(username) } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    next(err);
  }
});

// GET /api/me  (authorization: Bearer <token>)
app.get("/api/me", authRequired, async (req, res) => {
  res.json({ user: req.user });
});

/* ------------------------------ Guests CRUD ------------------------------- */

// GET /api/guests?limit=&offset=&q=
app.get("/api/guests", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const offset = parseInt(req.query.offset || "0", 10);
    const q = String(req.query.q || "").trim();

    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { email: { [Op.iLike]: `%${q}%` } },
            { phone: { [Op.iLike]: `%${q}%` } },
          ],
        }
      : undefined;

    const { rows, count } = await Guest.findAndCountAll({
      where,
      order: [["id", "ASC"]],
      limit,
      offset,
    });

    res.json({ count, rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/guests/:id
app.get("/api/guests/:id", async (req, res, next) => {
  try {
    const guest = await Guest.findByPk(Number(req.params.id));
    if (!guest) return res.status(404).json({ error: "Not found" });
    res.json(guest);
  } catch (err) {
    next(err);
  }
});

// POST /api/guests  (auth required)
app.post("/api/guests", authRequired, async (req, res, next) => {
  try {
    // Whitelist allowed fields
    const { name, email = null, phone = null, note = null } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "name is required" });

    const created = await Guest.create({ name, email, phone, note });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/guests/:id  (auth required)
app.patch("/api/guests/:id", authRequired, async (req, res, next) => {
  try {
    const guest = await Guest.findByPk(Number(req.params.id));
    if (!guest) return res.status(404).json({ error: "Not found" });

    // Only update known fields
    const updates = {};
    for (const k of ["name", "email", "phone", "note"]) {
      if (k in req.body) updates[k] = req.body[k];
    }

    await guest.update(updates);
    res.json(guest);
  } catch (err) {
    next(err);
  }
});

// PUBLIC: get guest name by id
app.get("/api/guests/:id/name", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const guest = await Guest.findByPk(id, {
      attributes: ["id", "name"], // only return these columns
    });

    if (!guest) return res.status(404).json({ error: "Not found" });

    res.json(guest); // e.g., { "id": 12, "name": "Jane Doe" }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/guests/:id  (auth required)
app.delete("/api/guests/:id", authRequired, async (req, res, next) => {
  try {
    const guest = await Guest.findByPk(Number(req.params.id));
    if (!guest) return res.status(404).json({ error: "Not found" });
    await guest.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------ Health check ------------------------------ */
app.get("/api/health", async (_req, res, next) => {
  try {
    const [rows] = await sequelize.query("select now() as now");
    res.json({ ok: true, now: rows?.[0]?.now });
  } catch (err) {
    next(err);
  }
});

/* --------------------------------- Errors --------------------------------- */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err?.message || "Internal Error" });
});

export const handler = serverless(app);
