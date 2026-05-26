DROP TRIGGER IF EXISTS trg_auto_hitung_biaya ON transaksi_parkir;
DROP FUNCTION IF EXISTS auto_hitung_biaya();
DROP FUNCTION IF EXISTS hitung_biaya_parkir(timestamptz, timestamptz, tipe_kendaraan);
ALTER TABLE transaksi_parkir DROP COLUMN IF EXISTS biaya;
ALTER TABLE transaksi_parkir DROP COLUMN IF EXISTS metode_pembayaran;
