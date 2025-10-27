import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import guestsRoutes from './routes/guests.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
  credentials: false
}));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/guests', guestsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
