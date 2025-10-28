import { Sequelize } from "sequelize";

const url =
  process.env.NETLIFY_DATABASE_URL   // ← Netlify/Neon var (pooled)
  || process.env.DATABASE_URL;       // ← optional fallback

const sequelize = new Sequelize(url, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true }           // Neon requires TLS
    // If you ever see certificate issues locally:
    // ssl: { require: true, rejectUnauthorized: false }
  },
  pool: { max: 2, min: 0, idle: 10000, acquire: 20000 },
  logging: false,
});

export async function handler() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query("select now() as now");
    return { statusCode: 200, body: JSON.stringify({ ok: true, now: rows?.[0]?.now }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
}
