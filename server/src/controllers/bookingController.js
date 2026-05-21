import { supabaseAdmin } from '../config/supabase.js';

export const getAllBookings = async (req, res) => {
  try {
    const { status, tanggal, user_id, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('booking')
      .select('*, slot_parkir(kode_slot, lokasi)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (tanggal) {
      query = query.eq('tanggal', tanggal);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: bookings, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('booking')
      .select('*, slot_parkir(kode_slot, lokasi, tipe)', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: bookings, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { slot_id, plat_nomor, tanggal, waktu_mulai, waktu_selesai, catatan, kendaraan_id } = req.body;

    if (!slot_id || !plat_nomor || !tanggal || !waktu_mulai || !waktu_selesai) {
      return res.status(400).json({
        message: 'Slot, plat nomor, tanggal, waktu mulai, dan waktu selesai harus diisi',
      });
    }

    const { data: slot, error: slotError } = await supabaseAdmin
      .from('slot_parkir')
      .select('*')
      .eq('id', slot_id)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({ message: 'Slot parkir tidak ditemukan' });
    }

    if (slot.status === 'terisi') {
      return res.status(400).json({ message: 'Slot sedang terisi' });
    }

    const { data: existingBooking } = await supabaseAdmin
      .from('booking')
      .select('id')
      .eq('slot_id', slot_id)
      .eq('tanggal', tanggal)
      .in('status', ['dipesan', 'digunakan'])
      .maybeSingle();

    if (existingBooking) {
      return res.status(400).json({ message: 'Slot sudah dibooking untuk tanggal ini' });
    }

    const { data: booking, error } = await supabaseAdmin
      .from('booking')
      .insert([{
        user_id: req.user.id,
        slot_id,
        kendaraan_id,
        plat_nomor: plat_nomor.toUpperCase(),
        tanggal,
        waktu_mulai,
        waktu_selesai,
        status: 'dipesan',
        catatan,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await supabaseAdmin
      .from('slot_parkir')
      .update({ status: 'dipesan', updated_at: new Date() })
      .eq('id', slot_id);

    res.status(201).json({ message: 'Booking berhasil dibuat', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error: getError } = await supabaseAdmin
      .from('booking')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (booking.user_id !== req.user.id && req.userProfile?.role === 'user') {
      return res.status(403).json({ message: 'Anda tidak berhak membatalkan booking ini' });
    }

    if (booking.status === 'selesai' || booking.status === 'dibatalkan') {
      return res.status(400).json({ message: 'Booking sudah selesai atau dibatalkan' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('booking')
      .update({ status: 'dibatalkan', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await supabaseAdmin
      .from('slot_parkir')
      .update({ status: 'tersedia', updated_at: new Date() })
      .eq('id', booking.slot_id);

    res.json({ message: 'Booking berhasil dibatalkan', booking: updated });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('booking')
      .select('*, slot_parkir(kode_slot, lokasi, tipe)')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    res.json({ data: booking });
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const useBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error: getError } = await supabaseAdmin
      .from('booking')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'dipesan') {
      return res.status(400).json({ message: 'Booking tidak dalam status dipesan' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('booking')
      .update({ status: 'digunakan', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await supabaseAdmin
      .from('slot_parkir')
      .update({ status: 'terisi', updated_at: new Date() })
      .eq('id', booking.slot_id);

    await supabaseAdmin
      .from('transaksi_parkir')
      .insert([{
        plat_nomor: booking.plat_nomor,
        slot_id: booking.slot_id,
        kendaraan_id: booking.kendaraan_id,
        user_id: req.user.id,
        waktu_masuk: new Date(),
        status: 'aktif',
        catatan: `Booking: ${booking.id}`,
      }]);

    res.json({ message: 'Booking digunakan', booking: updated });
  } catch (error) {
    console.error('Use booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
