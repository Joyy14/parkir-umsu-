import { Router } from 'express';
import {
  getAllTransaksi,
  getTransaksiAktif,
  createTransaksi,
  checkOutTransaksi,
  getTransaksiById,
  getLaporanHarian,
} from '../controllers/parkirController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createTransaksiValidation } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllTransaksi);
router.get('/aktif', getTransaksiAktif);
router.get('/laporan/harian', authorize('admin', 'petugas'), getLaporanHarian);
router.get('/:id', getTransaksiById);
router.post('/', createTransaksiValidation, createTransaksi);
router.put('/:id/checkout', checkOutTransaksi);

export default router;
