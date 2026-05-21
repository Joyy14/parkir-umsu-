import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

export const registerValidation = [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama_lengkap').notEmpty().withMessage('Nama lengkap harus diisi'),
  validate,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password harus diisi'),
  validate,
];

export const createKendaraanValidation = [
  body('plat_nomor').notEmpty().withMessage('Plat nomor harus diisi'),
  body('merek').notEmpty().withMessage('Merek harus diisi'),
  body('tipe').isIn(['motor', 'mobil']).withMessage('Tipe harus motor atau mobil'),
  validate,
];

export const createTransaksiValidation = [
  body('plat_nomor').notEmpty().withMessage('Plat nomor harus diisi'),
  body('slot_id').notEmpty().withMessage('Slot parkir harus diisi'),
  validate,
];

export const createSlotValidation = [
  body('kode_slot').notEmpty().withMessage('Kode slot harus diisi'),
  body('lokasi').notEmpty().withMessage('Lokasi harus diisi'),
  body('tipe').isIn(['motor', 'mobil']).withMessage('Tipe harus motor atau mobil'),
  validate,
];

export const createBookingValidation = [
  body('slot_id').notEmpty().withMessage('Slot harus diisi'),
  body('plat_nomor').notEmpty().withMessage('Plat nomor harus diisi'),
  body('tanggal').notEmpty().withMessage('Tanggal harus diisi'),
  body('waktu_mulai').notEmpty().withMessage('Waktu mulai harus diisi'),
  body('waktu_selesai').notEmpty().withMessage('Waktu selesai harus diisi'),
  validate,
];
