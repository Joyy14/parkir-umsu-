-- ============================================
-- SISTEM PARKIR UMSU - Seed Data
-- ============================================

-- Seed slot parkir (Fakultas di UMSU)
INSERT INTO slot_parkir (kode_slot, lokasi, tipe, status) VALUES

-- FIKTI: 10 motor + 5 mobil
('FIKTI-M1', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M2', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M3', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M4', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M5', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M6', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M7', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M8', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M9', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-M10', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'motor', 'tersedia'),
('FIKTI-C1', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'mobil', 'tersedia'),
('FIKTI-C2', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'mobil', 'tersedia'),
('FIKTI-C3', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'mobil', 'tersedia'),
('FIKTI-C4', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'mobil', 'tersedia'),
('FIKTI-C5', 'Fakultas Ilmu Komputer dan Teknologi Informasi', 'mobil', 'tersedia'),

-- FKIP: 7 motor + 3 mobil
('FKIP-M1', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-M2', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-M3', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-M4', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-M5', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-M6', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-M7', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'motor', 'tersedia'),
('FKIP-C1', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'mobil', 'tersedia'),
('FKIP-C2', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'mobil', 'tersedia'),
('FKIP-C3', 'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'mobil', 'tersedia'),

-- FEB: 5 motor + 2 mobil
('FEB-M1', 'Fakultas Ekonomi dan Bisnis', 'motor', 'tersedia'),
('FEB-M2', 'Fakultas Ekonomi dan Bisnis', 'motor', 'tersedia'),
('FEB-M3', 'Fakultas Ekonomi dan Bisnis', 'motor', 'tersedia'),
('FEB-M4', 'Fakultas Ekonomi dan Bisnis', 'motor', 'tersedia'),
('FEB-M5', 'Fakultas Ekonomi dan Bisnis', 'motor', 'tersedia'),
('FEB-C1', 'Fakultas Ekonomi dan Bisnis', 'mobil', 'tersedia'),
('FEB-C2', 'Fakultas Ekonomi dan Bisnis', 'mobil', 'tersedia'),

-- FT: 3 motor + 2 mobil
('FT-M1', 'Fakultas Teknik', 'motor', 'tersedia'),
('FT-M2', 'Fakultas Teknik', 'motor', 'tersedia'),
('FT-M3', 'Fakultas Teknik', 'motor', 'tersedia'),
('FT-C1', 'Fakultas Teknik', 'mobil', 'tersedia'),
('FT-C2', 'Fakultas Teknik', 'mobil', 'tersedia'),

-- FH: 3 motor + 1 mobil
('FH-M1', 'Fakultas Hukum', 'motor', 'tersedia'),
('FH-M2', 'Fakultas Hukum', 'motor', 'tersedia'),
('FH-M3', 'Fakultas Hukum', 'motor', 'tersedia'),
('FH-C1', 'Fakultas Hukum', 'mobil', 'tersedia'),

-- FISIP: 2 motor + 1 mobil
('FISIP-M1', 'Fakultas Ilmu Sosial dan Ilmu Politik', 'motor', 'tersedia'),
('FISIP-M2', 'Fakultas Ilmu Sosial dan Ilmu Politik', 'motor', 'tersedia'),
('FISIP-C1', 'Fakultas Ilmu Sosial dan Ilmu Politik', 'mobil', 'tersedia'),

-- FAI: 2 motor + 1 mobil
('FAI-M1', 'Fakultas Agama Islam', 'motor', 'tersedia'),
('FAI-M2', 'Fakultas Agama Islam', 'motor', 'tersedia'),
('FAI-C1', 'Fakultas Agama Islam', 'mobil', 'tersedia'),

-- FAPERTA: 2 motor + 1 mobil
('FAPERTA-M1', 'Fakultas Pertanian', 'motor', 'tersedia'),
('FAPERTA-M2', 'Fakultas Pertanian', 'motor', 'tersedia'),
('FAPERTA-C1', 'Fakultas Pertanian', 'mobil', 'tersedia');
