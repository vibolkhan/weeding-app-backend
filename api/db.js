import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4_general_ci'
    });
  }
  return pool;
}
