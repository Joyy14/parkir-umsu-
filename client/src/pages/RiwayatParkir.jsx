import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Clock, Search } from 'lucide-react';

export default function RiwayatParkir() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await authAPI.getMyHistory();
      setHistory(data.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter((t) =>
    t.plat_nomor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Parkir</h1>
        <p className="text-gray-500 mt-1">Riwayat parkir Anda</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari plat nomor..."
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Plat Nomor</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Slot</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Masuk</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Keluar</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Biaya</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Belum ada riwayat parkir
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.plat_nomor}</td>
                    <td className="px-4 py-3 text-gray-700">{item.slot_parkir?.kode_slot || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(item.waktu_masuk).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.waktu_keluar ? new Date(item.waktu_keluar).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.biaya > 0 ? `Rp ${Number(item.biaya).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'aktif' ? 'Aktif' : 'Selesai'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
