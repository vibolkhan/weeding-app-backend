import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import guestRoutes from './routes/guests.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', guestRoutes);

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`)
  );
}

export default app;
