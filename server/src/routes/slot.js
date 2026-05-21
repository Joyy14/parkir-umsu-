import { Router } from 'express';
import {
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
  getSlotsByLokasi,
} from '../controllers/slotController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllSlots);
router.get('/:id', getSlotById);
router.get('/lokasi/:lokasi', getSlotsByLokasi);
router.post('/', authorize('admin'), createSlot);
router.put('/:id', authorize('admin'), updateSlot);
router.delete('/:id', authorize('admin'), deleteSlot);

export default router;
