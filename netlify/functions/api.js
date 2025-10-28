// netlify/functions/api.js
import express from "express";
import serverless from "serverless-http";
import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());

/* ---------------------- DB: Neon (Postgres) via Sequelize --------------------- */
const url =
  process.env.NETLIFY_DATABASE_URL || // Netlify Neon integration
  process.env.DATABASE_URL; // fallback (add ?sslmode=require)

if (!url) {
  console.warn("DATABASE_URL/NETLIFY_DATABASE_URL is not set.");
}

const sequelize = new Sequelize(url, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true }, // Neon requires TLS
    // For local cert issues, uncomment:
    // ssl: { require: true, rejectUnauthorized: false },
  },
  pool: { max: 2, min: 0, idle: 10000, acquire: 20000 },
  logging: false,
});

// Minimal model for public.users
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    username: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING }, // stored hashed; never return to clients
  },
  {
    tableName: "users",
    schema: "public",
    timestamps: false,
  }
);

// small helper: sanitize user output
const safeUser = (u) => (u ? { id: u.id, username: u.username } : null);

// middleware to ensure DB is reachable (runs once per cold start)
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

/* --------------------------------- Routes ---------------------------------- */

// Your sample routes
app.get("/api/hello", (_req, res) =>
  res.json({ message: "Hello from Express on Netlify!" })
);

app.get("/api/time", (_req, res) =>
  res.json({ now: new Date().toISOString() })
);

app.post("/api/echo", (req, res) => res.json({ youSent: req.body ?? null }));

// Users: list
app.get("/api/users", async (_req, res, next) => {
  try {
    const rows = await User.findAll({
      attributes: ["id", "username"],
      order: [["id", "ASC"]],
    });
    res.json(rows.map(safeUser));
  } catch (err) {
    next(err);
  }
});

// Users: get by id
app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(Number(req.params.id), {
      attributes: ["id", "username"],
    });
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(safeUser(user));
  } catch (err) {
    next(err);
  }
});

// Users: create (hash password)
app.post("/api/users", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password)
      return res
        .status(400)
        .json({ error: "username and password are required" });

    const hashed = await bcrypt.hash(String(password), 10);
    const created = await User.create({
      username: String(username),
      password: hashed,
    });
    res.status(201).json(safeUser(created));
  } catch (err) {
    next(err);
  }
});

// Users: update password (hash)
app.patch("/api/users/:id/password", async (req, res, next) => {
  try {
    const { password } = req.body ?? {};
    if (!password)
      return res.status(400).json({ error: "password is required" });

    const user = await User.findByPk(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "Not found" });

    user.password = await bcrypt.hash(String(password), 10);
    await user.save();

    res.json({ ok: true, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// Simple health check that also pings DB time
app.get("/api/health", async (_req, res, next) => {
  try {
    const [rows] = await sequelize.query("select now() as now");
    res.json({ ok: true, now: rows?.[0]?.now });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err?.message || "Internal Error" });
});

export const handler = serverless(app);
