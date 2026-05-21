import { Router } from 'express';
import {
  getAllBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  useBooking,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createBookingValidation } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'petugas'), getAllBookings);
router.get('/saya', getMyBookings);
router.get('/:id', getBookingById);
router.post('/', createBookingValidation, createBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/use', authorize('admin', 'petugas'), useBooking);

export default router;
