import { supabaseAdmin } from '../config/supabase.js';

export const getAllTransaksi = async (req, res) => {
  try {
    const {
      status,
      plat_nomor,
      tanggal_mulai,
      tanggal_selesai,
      page = 1,
      limit = 20,
    } = req.query;

    let query = supabaseAdmin
      .from('transaksi_parkir')
      .select('*, kendaraan(merek, tipe), slot_parkir(kode_slot, lokasi)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (plat_nomor) {
      query = query.ilike('plat_nomor', `%${plat_nomor}%`);
    }
    if (tanggal_mulai) {
      query = query.gte('waktu_masuk', tanggal_mulai);
    }
    if (tanggal_selesai) {
      query = query.lte('waktu_masuk', tanggal_selesai);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: transaksi, error, count } = await query
      .order('waktu_masuk', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      data: transaksi,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all transaksi error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransaksiAktif = async (req, res) => {
  try {
    const { data: transaksi, error } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('*, kendaraan(merek, tipe), slot_parkir(kode_slot, lokasi)')
      .eq('status', 'aktif')
      .order('waktu_masuk', { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(transaksi);
  } catch (error) {
    console.error('Get transaksi aktif error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTransaksi = async (req, res) => {
  try {
    const { plat_nomor, slot_id, kendaraan_id, catatan } = req.body;

    if (!plat_nomor || !slot_id) {
      return res.status(400).json({ message: 'Plat nomor dan slot parkir harus diisi' });
    }

    const { data: slot, error: slotError } = await supabaseAdmin
      .from('slot_parkir')
      .select('*')
      .eq('id', slot_id)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({ message: 'Slot parkir tidak ditemukan' });
    }

    if (slot.status !== 'tersedia') {
      return res.status(400).json({ message: 'Slot parkir tidak tersedia' });
    }

    const { data: transaksi, error } = await supabaseAdmin
      .from('transaksi_parkir')
      .insert([{
        plat_nomor: plat_nomor.toUpperCase(),
        slot_id,
        kendaraan_id: kendaraan_id || null,
        user_id: req.user.id,
        waktu_masuk: new Date(),
        status: 'aktif',
        catatan,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await supabaseAdmin
      .from('slot_parkir')
      .update({ status: 'terisi', updated_at: new Date() })
      .eq('id', slot_id);

    res.status(201).json({ message: 'Kendaraan masuk tercatat', transaksi });
  } catch (error) {
    console.error('Create transaksi error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkOutTransaksi = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: transaksi, error: getError } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    if (transaksi.status === 'selesai') {
      return res.status(400).json({ message: 'Transaksi ini sudah selesai' });
    }

    const waktu_keluar = new Date();

    const { data: updated, error } = await supabaseAdmin
      .from('transaksi_parkir')
      .update({
        waktu_keluar,
        status: 'selesai',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await supabaseAdmin
      .from('slot_parkir')
      .update({ status: 'tersedia', updated_at: new Date() })
      .eq('id', transaksi.slot_id);

    res.json({
      message: 'Check-out berhasil',
      transaksi: updated,
    });
  } catch (error) {
    console.error('Checkout transaksi error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: transaksi, error } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json(transaksi);
  } catch (error) {
    console.error('Get transaksi by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLaporanHarian = async (req, res) => {
  try {
    const { tanggal } = req.query;
    const tgl = tanggal || new Date().toISOString().split('T')[0];

    const startOfDay = `${tgl}T00:00:00Z`;
    const endOfDay = `${tgl}T23:59:59Z`;

    const { data: transaksi, error } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('*, kendaraan(tipe)')
      .gte('waktu_masuk', startOfDay)
      .lte('waktu_masuk', endOfDay)
      .order('waktu_masuk', { ascending: true });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const totalKendaraan = transaksi.length;
    const totalMotor = transaksi.filter(t => t.kendaraan?.tipe === 'motor').length;
    const totalMobil = transaksi.filter(t => t.kendaraan?.tipe === 'mobil').length;
    const aktif = transaksi.filter(t => t.status === 'aktif').length;

    res.json({
      tanggal: tgl,
      totalKendaraan,
      totalMotor,
      totalMobil,
      aktif,
      transaksi,
    });
  } catch (error) {
    console.error('Get laporan harian error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
