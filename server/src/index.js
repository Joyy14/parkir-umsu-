import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import kendaraanRoutes from './routes/kendaraan.js';
import parkirRoutes from './routes/parkir.js';
import slotRoutes from './routes/slot.js';
import bookingRoutes from './routes/booking.js';
import laporanRoutes from './routes/laporan.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/parkir', parkirRoutes);
app.use('/api/slot', slotRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/laporan', laporanRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Parkir UMSU API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Terjadi kesalahan internal server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Parkir UMSU berjalan di port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
