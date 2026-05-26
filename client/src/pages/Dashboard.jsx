import { useState, useEffect } from 'react';
import { laporanAPI, parkirAPI, slotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Car,
  ParkingSquare,
  CalendarCheck,
  Clock,
  TrendingUp,
  Layers,
  ArrowRight,
  MapPin,
  Bike,
  LogIn,
  LogOut,
  Calendar,
  Smartphone,
  QrCode,
  BellRing,
} from 'lucide-react';

const statusBg = {
  tersedia: 'bg-emerald-400',
  terisi: 'bg-red-400',
  dipesan: 'bg-yellow-400',
};

const statusColors = {
  tersedia: 'border-emerald-200 bg-emerald-50',
  terisi: 'border-red-200 bg-red-50',
  dipesan: 'border-yellow-200 bg-yellow-50',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [transaksiAktif, setTransaksiAktif] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile, hasRole, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, slotRes] = await Promise.all([
        laporanAPI.getDashboard(),
        slotAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setAllSlots(slotRes.data?.data || []);
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

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quickActions = [
    { label: 'Parkir Masuk', icon: LogIn, path: '/transaksi', color: 'bg-emerald-500', bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Parkir Keluar', icon: LogOut, path: '/transaksi', color: 'bg-orange-500', bg: 'bg-orange-50', textColor: 'text-orange-600' },
    { label: 'Booking', icon: Calendar, path: '/booking', color: 'bg-violet-500', bg: 'bg-violet-50', textColor: 'text-violet-600' },
    { label: 'Scan QR', icon: QrCode, path: '/profile', color: 'bg-blue-500', bg: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Laporan', icon: TrendingUp, path: '/laporan', color: 'bg-rose-500', bg: 'bg-rose-50', textColor: 'text-rose-600' },
    { label: 'Slot Parkir', icon: MapPin, path: '/slot', color: 'bg-cyan-500', bg: 'bg-cyan-50', textColor: 'text-cyan-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 lg:p-8">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-primary-100 text-sm font-medium">{today}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">
                Selamat datang, {profile?.nama_lengkap?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-primary-200 text-sm mt-1 max-w-xl">
                Sistem Parkir Pintar Universitas Muhammadiyah Sumatera Utara
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <ParkingSquare className="h-5 w-5 text-primary-200" />
              <span className="text-white text-sm font-medium">Smart Parking System</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white/60 text-xs">Status Parkir</p>
              <p className="text-white font-bold text-lg">{stats?.parkirAktif || 0} Aktif</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white/60 text-xs">Slot Tersedia</p>
              <p className="text-white font-bold text-lg">{stats?.slotTersedia || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-white/60 text-xs">Booking</p>
              <p className="text-white font-bold text-lg">{stats?.bookingHariIni || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot Occupancy Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title mb-0">Peta Slot Parkir</h2>
                <p className="text-sm text-gray-400">Status real-time slot parkir</p>
              </div>
              <Link to="/slot" className="btn-ghost btn-sm text-primary-600 hover:text-primary-700">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Tersedia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400"></span> Terisi
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Dipesan
              </span>
            </div>

            {/* Slot Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
              {allSlots.slice(0, 40).map((slot) => (
                <div
                  key={slot.id}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-default ${
                    statusColors[slot.status] || 'border-gray-200 bg-gray-50'
                  } ${slot.status === 'tersedia' ? 'hover:border-emerald-400' : ''}`}
                  title={`${slot.kode_slot} - ${slot.status}`}
                >
                  <span className="truncate px-0.5">{slot.kode_slot}</span>
                </div>
              ))}
            </div>

            {/* Usage bar */}
            <div className="mt-5 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">
                  Penggunaan Parkir
                </span>
                <span className="text-sm font-bold text-gray-900">{usagePercent}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>{stats?.slotTersedia || 0} tersedia</span>
                <span>{slotTerisi} terisi dari {stats?.totalSlots || 0}</span>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Kendaraan', value: stats?.totalKendaraan || 0, icon: Car, color: 'bg-blue-500' },
              { label: 'Total Slot', value: stats?.totalSlots || 0, icon: Layers, color: 'bg-gray-600' },
              { label: 'Parkir Aktif', value: stats?.parkirAktif || 0, icon: Clock, color: 'bg-orange-500' },
              { label: 'Booking Hari Ini', value: stats?.bookingHariIni || 0, icon: CalendarCheck, color: 'bg-violet-500' },
            ].map((card) => (
              <div key={card.label} className="stat-card">
                <div className="stat-card-icon shadow-lg shadow-black/5" style={{ background: card.color }}>
                  <card.icon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Activity & Revenue */}
        <div className="space-y-6">
          {/* Active Transactions */}
          {hasRole('admin', 'petugas') && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Parkir Aktif</h3>
                <span className="badge bg-orange-50 text-orange-700 border border-orange-200">
                  {transaksiAktif.length} kendaraan
                </span>
              </div>
              <div className="space-y-3">
                {transaksiAktif.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <ParkingSquare className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                    Tidak ada parkir aktif
                  </div>
                ) : (
                  transaksiAktif.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.plat_nomor}</p>
                          <p className="text-xs text-gray-400">
                            {t.slot_parkir?.kode_slot || '-'} &middot; {new Date(t.waktu_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="badge-green btn-xs">Aktif</span>
                    </div>
                  ))
                )}
                {transaksiAktif.length > 0 && (
                  <Link to="/transaksi" className="flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium pt-1">
                    Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Ringkasan</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Bike className="h-4 w-4 text-gray-400" /> Motor
                </span>
                <span className="font-bold text-gray-900">{stats?.totalKendaraan || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-400" /> Mobil
                </span>
                <span className="font-bold text-gray-900">{stats?.totalKendaraan || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-gray-400" /> Booking
                </span>
                <span className="font-bold text-gray-900">{stats?.bookingHariIni || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="section-title">Akses Cepat</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xs font-semibold ${action.textColor} text-center`}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
