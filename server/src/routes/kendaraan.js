import { Router } from 'express';
import {
  getAllKendaraan,
  getKendaraanById,
  getKendaraanByPlat,
  createKendaraan,
  updateKendaraan,
  deleteKendaraan,
} from '../controllers/kendaraanController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createKendaraanValidation } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllKendaraan);
router.get('/:id', getKendaraanById);
router.get('/plat/:plat_nomor', getKendaraanByPlat);
router.post('/', createKendaraanValidation, createKendaraan);
router.put('/:id', authorize('admin', 'petugas'), updateKendaraan);
router.delete('/:id', authorize('admin'), deleteKendaraan);

export default router;
