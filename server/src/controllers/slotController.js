import { supabase, supabaseAdmin } from '../config/supabase.js';

export const getAllSlots = async (req, res) => {
  try {
    const { lokasi, tipe, status } = req.query;

    let query = supabaseAdmin.from('slot_parkir').select('*', { count: 'exact' });

    if (lokasi) {
      query = query.ilike('lokasi', `%${lokasi}%`);
    }
    if (tipe) {
      query = query.eq('tipe', tipe);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: slots, error, count } = await query
      .order('kode_slot', { ascending: true });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      data: slots,
      total: count,
      tersedia: slots.filter(s => s.status === 'tersedia').length,
      terisi: slots.filter(s => s.status === 'terisi').length,
      dipesan: slots.filter(s => s.status === 'dipesan').length,
    });
  } catch (error) {
    console.error('Get all slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: slot, error } = await supabaseAdmin
      .from('slot_parkir')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Slot tidak ditemukan' });
    }

    res.json(slot);
  } catch (error) {
    console.error('Get slot by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSlot = async (req, res) => {
  try {
    const { kode_slot, lokasi, tipe } = req.body;

    if (!kode_slot || !lokasi || !tipe) {
      return res.status(400).json({ message: 'Kode slot, lokasi, dan tipe harus diisi' });
    }

    const { data: existing } = await supabaseAdmin
      .from('slot_parkir')
      .select('id')
      .eq('kode_slot', kode_slot.toUpperCase())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'Kode slot sudah ada' });
    }

    const { data, error } = await supabaseAdmin
      .from('slot_parkir')
      .insert([{
        kode_slot: kode_slot.toUpperCase(),
        lokasi,
        tipe,
        status: 'tersedia',
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ message: 'Slot parkir berhasil ditambahkan', slot: data });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_slot, lokasi, tipe, status } = req.body;

    const updates = {};
    if (kode_slot) updates.kode_slot = kode_slot.toUpperCase();
    if (lokasi) updates.lokasi = lokasi;
    if (tipe) updates.tipe = tipe;
    if (status) updates.status = status;
    updates.updated_at = new Date();

    const { data, error } = await supabaseAdmin
      .from('slot_parkir')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Slot parkir berhasil diupdate', slot: data });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('slot_parkir')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Slot parkir berhasil dihapus' });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSlotsByLokasi = async (req, res) => {
  try {
    const { lokasi } = req.params;

    const { data: slots, error } = await supabaseAdmin
      .from('slot_parkir')
      .select('*')
      .ilike('lokasi', `%${lokasi}%`)
      .order('kode_slot', { ascending: true });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(slots);
  } catch (error) {
    console.error('Get slots by lokasi error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
