import { Router } from 'express';
import {
  getDashboardStats,
  getLaporanBulanan,
  getRekapKendaraan,
} from '../controllers/laporanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/bulanan', authorize('admin', 'petugas'), getLaporanBulanan);
router.get('/rekap-kendaraan', authorize('admin', 'petugas'), getRekapKendaraan);

export default router;
