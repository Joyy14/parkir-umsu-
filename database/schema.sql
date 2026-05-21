-- ============================================
-- SISTEM PARKIR UMSU - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'petugas', 'user');
CREATE TYPE tipe_kendaraan AS ENUM ('motor', 'mobil');
CREATE TYPE status_slot AS ENUM ('tersedia', 'terisi', 'dipesan');
CREATE TYPE status_transaksi AS ENUM ('aktif', 'selesai');
CREATE TYPE status_booking AS ENUM ('dipesan', 'digunakan', 'selesai', 'dibatalkan');

-- ============================================
-- TABEL PROFILES (extends Supabase Auth)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nama_lengkap TEXT NOT NULL,
    nip_npm TEXT,
    role user_role NOT NULL DEFAULT 'user',
    no_hp TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nama_lengkap, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', 'User'),
        'user'
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TABEL KENDARAAN
-- ============================================
CREATE TABLE kendaraan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plat_nomor VARCHAR(20) NOT NULL UNIQUE,
    merek VARCHAR(50) NOT NULL,
    model VARCHAR(50),
    warna VARCHAR(30),
    tipe tipe_kendaraan NOT NULL DEFAULT 'motor',
    pemilik_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABEL SLOT PARKIR
-- ============================================
CREATE TABLE slot_parkir (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_slot VARCHAR(10) NOT NULL UNIQUE,
    lokasi VARCHAR(100) NOT NULL,
    tipe tipe_kendaraan NOT NULL DEFAULT 'motor',
    status status_slot NOT NULL DEFAULT 'tersedia',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABEL TRANSAKSI PARKIR
-- ============================================
CREATE TABLE transaksi_parkir (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kendaraan_id UUID REFERENCES kendaraan(id) ON DELETE SET NULL,
    slot_id UUID REFERENCES slot_parkir(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    plat_nomor VARCHAR(20) NOT NULL,
    waktu_masuk TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    waktu_keluar TIMESTAMPTZ,
    status status_transaksi NOT NULL DEFAULT 'aktif',
    biaya DECIMAL(10,2) DEFAULT 0,
    metode_pembayaran VARCHAR(20),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABEL BOOKING (Reservasi)
-- ============================================
CREATE TABLE booking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    slot_id UUID REFERENCES slot_parkir(id) ON DELETE CASCADE NOT NULL,
    kendaraan_id UUID REFERENCES kendaraan(id) ON DELETE SET NULL,
    plat_nomor VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    status status_booking NOT NULL DEFAULT 'dipesan',
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABEL LOG AKTIVITAS
-- ============================================
CREATE TABLE log_aktivitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    aksi VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_kendaraan_plat ON kendaraan(plat_nomor);
CREATE INDEX idx_kendaraan_pemilik ON kendaraan(pemilik_id);
CREATE INDEX idx_slot_status ON slot_parkir(status);
CREATE INDEX idx_transaksi_status ON transaksi_parkir(status);
CREATE INDEX idx_transaksi_masuk ON transaksi_parkir(waktu_masuk);
CREATE INDEX idx_booking_tanggal ON booking(tanggal);
CREATE INDEX idx_booking_user ON booking(user_id);
CREATE INDEX idx_booking_status ON booking(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendaraan ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_parkir ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_parkir ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read own profile, admin can read all
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- Kendaraan: all authenticated users can read
CREATE POLICY "Authenticated users can view kendaraan"
    ON kendaraan FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own kendaraan"
    ON kendaraan FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Transaksi: all authenticated can read
CREATE POLICY "Authenticated users can view transaksi"
    ON transaksi_parkir FOR SELECT
    USING (auth.role() = 'authenticated');

-- Booking: users can view own bookings
CREATE POLICY "Users can view own bookings"
    ON booking FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate parking fee
CREATE OR REPLACE FUNCTION hitung_biaya_parkir(
    p_waktu_masuk TIMESTAMPTZ,
    p_waktu_keluar TIMESTAMPTZ,
    p_tipe tipe_kendaraan
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    durasi_hours DECIMAL;
    tarif_per_jam DECIMAL;
    total_biaya DECIMAL(10,2);
BEGIN
    durasi_hours := EXTRACT(EPOCH FROM (p_waktu_keluar - p_waktu_masuk)) / 3600;

    IF durasi_hours < 1 THEN
        durasi_hours := 1;
    END IF;

    IF p_tipe = 'motor' THEN
        tarif_per_jam := 2000;
    ELSE
        tarif_per_jam := 5000;
    END IF;

    total_biaya := CEIL(durasi_hours) * tarif_per_jam;
    RETURN total_biaya;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update biaya when transaksi is completed
CREATE OR REPLACE FUNCTION auto_hitung_biaya()
RETURNS TRIGGER AS $$
DECLARE
    v_tipe tipe_kendaraan;
BEGIN
    IF NEW.status = 'selesai' AND OLD.status = 'aktif' THEN
        SELECT k.tipe INTO v_tipe
        FROM kendaraan k
        WHERE k.id = NEW.kendaraan_id;

        NEW.biaya := hitung_biaya_parkir(OLD.waktu_masuk, NEW.waktu_keluar, v_tipe);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_hitung_biaya ON transaksi_parkir;
CREATE TRIGGER trg_auto_hitung_biaya
    BEFORE UPDATE ON transaksi_parkir
    FOR EACH ROW
    WHEN (NEW.status = 'selesai' AND OLD.status = 'aktif')
    EXECUTE FUNCTION auto_hitung_biaya();
