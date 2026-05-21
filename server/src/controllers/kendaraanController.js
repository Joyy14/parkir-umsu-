import { supabaseAdmin } from '../config/supabase.js';

export const getAllKendaraan = async (req, res) => {
  try {
    const { plat_nomor, pemilik_id, tipe, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('kendaraan')
      .select('*, profiles(nama_lengkap)', { count: 'exact' });

    if (plat_nomor) {
      query = query.ilike('plat_nomor', `%${plat_nomor}%`);
    }
    if (pemilik_id) {
      query = query.eq('pemilik_id', pemilik_id);
    }
    if (tipe) {
      query = query.eq('tipe', tipe);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: kendaraan, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      data: kendaraan,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all kendaraan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getKendaraanById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: kendaraan, error } = await supabaseAdmin
      .from('kendaraan')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    }

    res.json(kendaraan);
  } catch (error) {
    console.error('Get kendaraan by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getKendaraanByPlat = async (req, res) => {
  try {
    const { plat_nomor } = req.params;

    const { data: kendaraan, error } = await supabaseAdmin
      .from('kendaraan')
      .select('*')
      .ilike('plat_nomor', plat_nomor)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(kendaraan);
  } catch (error) {
    console.error('Get kendaraan by plat error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createKendaraan = async (req, res) => {
  try {
    const { plat_nomor, merek, model, warna, tipe, pemilik_id } = req.body;

    if (!plat_nomor || !merek || !tipe) {
      return res.status(400).json({ message: 'Plat nomor, merek, dan tipe harus diisi' });
    }

    const { data: existing } = await supabaseAdmin
      .from('kendaraan')
      .select('id')
      .eq('plat_nomor', plat_nomor.toUpperCase())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'Kendaraan dengan plat nomor ini sudah terdaftar' });
    }

    const { data, error } = await supabaseAdmin
      .from('kendaraan')
      .insert([{
        plat_nomor: plat_nomor.toUpperCase(),
        merek,
        model,
        warna,
        tipe,
        pemilik_id: pemilik_id || req.user.id,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ message: 'Kendaraan berhasil ditambahkan', kendaraan: data });
  } catch (error) {
    console.error('Create kendaraan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateKendaraan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plat_nomor, merek, model, warna, tipe, pemilik_id } = req.body;

    const updates = {};
    if (plat_nomor) updates.plat_nomor = plat_nomor.toUpperCase();
    if (merek) updates.merek = merek;
    if (model) updates.model = model;
    if (warna) updates.warna = warna;
    if (tipe) updates.tipe = tipe;
    if (pemilik_id) updates.pemilik_id = pemilik_id;
    updates.updated_at = new Date();

    const { data, error } = await supabaseAdmin
      .from('kendaraan')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Kendaraan berhasil diupdate', kendaraan: data });
  } catch (error) {
    console.error('Update kendaraan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteKendaraan = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('kendaraan')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Kendaraan berhasil dihapus' });
  } catch (error) {
    console.error('Delete kendaraan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
