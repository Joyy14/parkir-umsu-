import { useState, useEffect } from 'react';
import { laporanAPI, parkirAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  ParkingSquare,
  CalendarCheck,
  DollarSign,
  Clock,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [transaksiAktif, setTransaksiAktif] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile, hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await laporanAPI.getDashboard();
      setStats(data);
      if (hasRole('admin', 'petugas')) {
        const res = await parkirAPI.getAktif();
        setTransaksiAktif(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const slotTerisi = (stats?.totalSlots || 0) - (stats?.slotTersedia || 0);
  const usagePercent = stats?.totalSlots > 0 ? Math.round((slotTerisi / stats.totalSlots) * 100) : 0;

  const publicCards = [
    { label: 'Total Kendaraan', value: stats?.totalKendaraan || 0, icon: Car, color: 'bg-blue-500' },
    { label: 'Total Slot', value: stats?.totalSlots || 0, icon: Layers, color: 'bg-gray-600' },
    { label: 'Slot Tersedia', value: stats?.slotTersedia || 0, icon: ParkingSquare, color: 'bg-green-500' },
    { label: 'Parkir Aktif', value: stats?.parkirAktif || 0, icon: Clock, color: 'bg-orange-500' },
    { label: 'Booking Hari Ini', value: stats?.bookingHariIni || 0, icon: CalendarCheck, color: 'bg-purple-500' },
  ];

  const adminCards = [
    { label: 'Pendapatan Hari Ini', value: `Rp ${(stats?.pendapatanHariIni || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Pendapatan Bulan Ini', value: `Rp ${(stats?.pendapatanBulanIni || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-indigo-500' },
  ];

  const cards = hasRole('admin', 'petugas') ? [...publicCards, ...adminCards] : publicCards;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang, {profile?.nama_lengkap || 'User'}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="card card-hover">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Penggunaan Slot Parkir
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              {stats?.slotTersedia || 0} tersedia dari {stats?.totalSlots || 0} total
            </span>
            <span className="text-sm font-semibold text-gray-700">{usagePercent}% terpakai</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Tersedia: {stats?.slotTersedia || 0}</span>
            <span>Terisi: {slotTerisi}</span>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ringkasan Parkir Aktif
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Kendaraan Terdaftar</span>
              <span className="font-bold text-lg">{stats?.totalKendaraan || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sedang Parkir</span>
              <span className="font-bold text-lg text-orange-600">{stats?.parkirAktif || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Booking Hari Ini</span>
              <span className="font-bold text-lg text-purple-600">{stats?.bookingHariIni || 0}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-600">Pendapatan Hari Ini</span>
              <span className="font-bold text-lg text-emerald-600">
                Rp {(stats?.pendapatanHariIni || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasRole('admin', 'petugas') && transaksiAktif.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaksi Aktif</h2>
            <a href="/transaksi" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Plat</th>
                  <th className="pb-2 font-medium">Slot</th>
                  <th className="pb-2 font-medium">Masuk</th>
                </tr>
              </thead>
              <tbody>
                {transaksiAktif.slice(0, 5).map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 font-medium text-gray-900">{t.plat_nomor}</td>
                    <td className="py-2 text-gray-600">{t.slot_parkir?.kode_slot || '-'}</td>
                    <td className="py-2 text-gray-600">
                      {new Date(t.waktu_masuk).toLocaleTimeString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasRole('admin', 'petugas') && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/transaksi"
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <p className="text-blue-700 font-medium">Parkir Masuk</p>
              <p className="text-sm text-blue-500">Catat kendaraan masuk</p>
            </a>
            <a
              href="/transaksi"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <p className="text-green-700 font-medium">Parkir Keluar</p>
              <p className="text-sm text-green-500">Check-out kendaraan</p>
            </a>
            <a
              href="/booking"
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <p className="text-purple-700 font-medium">Booking</p>
              <p className="text-sm text-purple-500">Kelola reservasi</p>
            </a>
            <a
              href="/laporan"
              className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
            >
              <p className="text-orange-700 font-medium">Laporan</p>
              <p className="text-sm text-orange-500">Lihat rekap data</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
