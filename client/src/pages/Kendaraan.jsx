import { useState, useEffect } from 'react';
import { kendaraanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Car, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Kendaraan() {
  const [kendaraan, setKendaraan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    plat_nomor: '',
    merek: '',
    model: '',
    warna: '',
    tipe: 'motor',
  });
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchKendaraan();
  }, []);

  const fetchKendaraan = async (query = '') => {
    try {
      const params = {};
      if (query) params.plat_nomor = query;
      const { data } = await kendaraanAPI.getAll(params);
      setKendaraan(data.data || []);
    } catch (error) {
      toast.error('Gagal memuat data kendaraan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKendaraan(search);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ plat_nomor: '', merek: '', model: '', warna: '', tipe: 'motor' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      plat_nomor: item.plat_nomor,
      merek: item.merek,
      model: item.model || '',
      warna: item.warna || '',
      tipe: item.tipe,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.plat_nomor || !form.merek) {
      toast.error('Plat nomor dan merek harus diisi');
      return;
    }

    try {
      if (editing) {
        await kendaraanAPI.update(editing.id, form);
        toast.success('Kendaraan berhasil diupdate');
      } else {
        await kendaraanAPI.create(form);
        toast.success('Kendaraan berhasil ditambahkan');
      }
      setShowModal(false);
      fetchKendaraan(search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;

    try {
      await kendaraanAPI.delete(id);
      toast.success('Kendaraan berhasil dihapus');
      fetchKendaraan(search);
    } catch (error) {
      toast.error('Gagal menghapus kendaraan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kendaraan</h1>
          <p className="text-gray-500 mt-1">Manajemen data kendaraan</p>
        </div>
        {hasRole('admin', 'petugas') && (
          <button onClick={openAdd} className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari plat nomor..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">Cari</button>
      </form>

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
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Merek</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Model</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Warna</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Tipe</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kendaraan.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <Car className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Belum ada data kendaraan
                  </td>
                </tr>
              ) : (
                kendaraan.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.plat_nomor}</td>
                    <td className="px-4 py-3 text-gray-700">{item.merek}</td>
                    <td className="px-4 py-3 text-gray-700">{item.model || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.warna || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.tipe === 'motor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {hasRole('admin') && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                <input
                  type="text"
                  value={form.plat_nomor}
                  onChange={(e) => setForm({ ...form, plat_nomor: e.target.value })}
                  className="input-field"
                  placeholder="BK 1234 AB"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                  <input
                    type="text"
                    value={form.merek}
                    onChange={(e) => setForm({ ...form, merek: e.target.value })}
                    className="input-field"
                    placeholder="Honda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="input-field"
                    placeholder="Vario"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                  <input
                    type="text"
                    value={form.warna}
                    onChange={(e) => setForm({ ...form, warna: e.target.value })}
                    className="input-field"
                    placeholder="Hitam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select
                    value={form.tipe}
                    onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                    className="input-field"
                  >
                    <option value="motor">Motor</option>
                    <option value="mobil">Mobil</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
