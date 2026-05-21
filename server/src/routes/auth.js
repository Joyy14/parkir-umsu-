import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  changePassword,
  getMyHistory,
  getUsers,
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', authenticate, changePassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/history', authenticate, getMyHistory);
router.get('/users', authenticate, authorize('admin'), getUsers);

export default router;
