import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Clock, Search, Car } from 'lucide-react';

export default function RiwayatParkir() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try { const { data } = await authAPI.getMyHistory(); setHistory(data.data || []); }
    catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const filtered = history.filter((t) => t.plat_nomor?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Riwayat Parkir</h1>
        <p className="page-subtitle">Riwayat parkir Anda</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari plat nomor..." className="input-field pl-11" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Belum ada riwayat parkir</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="card card-hover">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Car className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.plat_nomor}</p>
                    <p className="text-xs text-gray-400">{item.slot_parkir?.kode_slot || '-'}</p>
                  </div>
                </div>
                <span className={`badge ${item.status === 'aktif' ? 'badge-green' : 'badge-gray'}`}>
                  {item.status === 'aktif' ? 'Aktif' : 'Selesai'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Masuk</p>
                  <p className="font-medium text-gray-700">{new Date(item.waktu_masuk).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Keluar</p>
                  <p className="font-medium text-gray-700">{item.waktu_keluar ? new Date(item.waktu_keluar).toLocaleString('id-ID') : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-medium text-gray-700 capitalize">{item.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
