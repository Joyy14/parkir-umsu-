import { supabaseAdmin } from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00Z`;
    const endOfDay = `${today}T23:59:59Z`;

    const { count: totalKendaraan } = await supabaseAdmin
      .from('kendaraan')
      .select('*', { count: 'exact', head: true });

    const { count: totalSlots } = await supabaseAdmin
      .from('slot_parkir')
      .select('*', { count: 'exact', head: true });

    const { count: slotTersedia } = await supabaseAdmin
      .from('slot_parkir')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'tersedia');

    const { count: parkirAktif } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif');

    const { data: todayTransaksi } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('biaya')
      .gte('waktu_masuk', startOfDay)
      .lte('waktu_masuk', endOfDay)
      .eq('status', 'selesai');

    const pendapatanHariIni = todayTransaksi
      ? todayTransaksi.reduce((sum, t) => sum + Number(t.biaya), 0)
      : 0;

    const { count: bookingHariIni } = await supabaseAdmin
      .from('booking')
      .select('*', { count: 'exact', head: true })
      .eq('tanggal', today)
      .neq('status', 'dibatalkan');

    const { data: transaksiBulanIni } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('biaya, waktu_masuk')
      .gte('waktu_masuk', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lte('waktu_masuk', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString())
      .eq('status', 'selesai');

    const pendapatanBulanIni = transaksiBulanIni
      ? transaksiBulanIni.reduce((sum, t) => sum + Number(t.biaya), 0)
      : 0;

    res.json({
      totalKendaraan,
      totalSlots,
      slotTersedia,
      parkirAktif,
      pendapatanHariIni,
      bookingHariIni,
      pendapatanBulanIni,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLaporanBulanan = async (req, res) => {
  try {
    const { tahun, bulan } = req.query;
    const thn = tahun || new Date().getFullYear();
    const bln = bulan || new Date().getMonth() + 1;

    const startDate = `${thn}-${String(bln).padStart(2, '0')}-01T00:00:00Z`;
    const endDate = new Date(thn, bln, 0).toISOString().split('T')[0] + 'T23:59:59Z';

    const { data: transaksi, error } = await supabaseAdmin
      .from('transaksi_parkir')
      .select('*, kendaraan(tipe)')
      .gte('waktu_masuk', startDate)
      .lte('waktu_masuk', endDate)
      .order('waktu_masuk', { ascending: true });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const totalTransaksi = transaksi.length;
    const totalPendapatan = transaksi.reduce((sum, t) => sum + Number(t.biaya), 0);
    const selesai = transaksi.filter(t => t.status === 'selesai').length;
    const motor = transaksi.filter(t => {
      return t.kendaraan?.tipe === 'motor' || (!t.kendaraan && t.biaya > 0 && Number(t.biaya) % 5000 !== 0);
    }).length;
    const mobil = transaksi.filter(t => {
      return t.kendaraan?.tipe === 'mobil' || (!t.kendaraan && t.biaya > 0 && Number(t.biaya) % 5000 === 0);
    }).length;

    const harian = {};
    transaksi.forEach(t => {
      const day = new Date(t.waktu_masuk).toISOString().split('T')[0];
      if (!harian[day]) {
        harian[day] = { tanggal: day, total: 0, pendapatan: 0 };
      }
      harian[day].total++;
      harian[day].pendapatan += Number(t.biaya);
    });

    res.json({
      periode: `${bln}/${thn}`,
      totalTransaksi,
      totalPendapatan,
      selesai,
      motor,
      mobil,
      detailHarian: Object.values(harian),
    });
  } catch (error) {
    console.error('Get laporan bulanan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRekapKendaraan = async (req, res) => {
  try {
    const { count: motor } = await supabaseAdmin
      .from('kendaraan')
      .select('*', { count: 'exact', head: true })
      .eq('tipe', 'motor');

    const { count: mobil } = await supabaseAdmin
      .from('kendaraan')
      .select('*', { count: 'exact', head: true })
      .eq('tipe', 'mobil');

    const { data: semua } = await supabaseAdmin
      .from('kendaraan')
      .select('merek');

    const merekCount = {};
    (semua || []).forEach(k => {
      if (k.merek) {
        merekCount[k.merek] = (merekCount[k.merek] || 0) + 1;
      }
    });

    const byMerek = Object.entries(merekCount)
      .map(([merek, count]) => ({ merek, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalMotor: motor,
      totalMobil: mobil,
      byMerek,
    });
  } catch (error) {
    console.error('Get rekap kendaraan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
