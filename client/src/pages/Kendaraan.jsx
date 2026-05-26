import { useState, useEffect } from 'react';
import { kendaraanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Car, Plus, Search, Edit2, Trash2, Bike } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Kendaraan() {
  const [kendaraan, setKendaraan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ plat_nomor: '', merek: '', model: '', warna: '', tipe: 'motor' });
  const { hasRole } = useAuth();

  useEffect(() => { fetchKendaraan(); }, []);

  const fetchKendaraan = async (query = '') => {
    try {
      const params = {};
      if (query) params.plat_nomor = query;
      const { data } = await kendaraanAPI.getAll(params);
      setKendaraan(data.data || []);
    } catch (error) { toast.error('Gagal memuat data kendaraan'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchKendaraan(search); };

  const openAdd = () => { setEditing(null); setForm({ plat_nomor: '', merek: '', model: '', warna: '', tipe: 'motor' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ plat_nomor: item.plat_nomor, merek: item.merek, model: item.model || '', warna: item.warna || '', tipe: item.tipe }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plat_nomor || !form.merek) { toast.error('Plat nomor dan merek harus diisi'); return; }
    try {
      if (editing) { await kendaraanAPI.update(editing.id, form); toast.success('Kendaraan berhasil diupdate'); }
      else { await kendaraanAPI.create(form); toast.success('Kendaraan berhasil ditambahkan'); }
      setShowModal(false); fetchKendaraan(search);
    } catch (error) { toast.error(error.response?.data?.message || 'Gagal menyimpan data'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;
    try { await kendaraanAPI.delete(id); toast.success('Kendaraan berhasil dihapus'); fetchKendaraan(search); }
    catch (error) { toast.error('Gagal menghapus kendaraan'); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Kendaraan</h1>
            <p className="page-subtitle">Manajemen data kendaraan terdaftar</p>
          </div>
          {hasRole('admin', 'petugas') && (
            <button onClick={openAdd} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Kendaraan
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari plat nomor..." className="input-field pl-11" />
          </div>
          <button type="submit" className="btn-primary btn-sm">Cari</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
        </div>
      ) : kendaraan.length === 0 ? (
        <div className="card text-center py-16">
          <Car className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Belum ada data kendaraan</p>
          {hasRole('admin', 'petugas') && (
            <button onClick={openAdd} className="btn-primary mt-4">
              <Plus className="h-4 w-4" /> Tambah Kendaraan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kendaraan.map((item) => (
            <div key={item.id} className="card card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.tipe === 'motor' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                    {item.tipe === 'motor' ? <Bike className={`h-5 w-5 text-blue-600`} /> : <Car className={`h-5 w-5 text-emerald-600`} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.plat_nomor}</p>
                    <p className="text-sm text-gray-500">{item.merek} {item.model ? `- ${item.model}` : ''}</p>
                  </div>
                </div>
                <span className={`badge ${item.tipe === 'motor' ? 'badge-blue' : 'badge-green'}`}>{item.tipe}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-sm text-gray-400">{item.warna || '-'}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {hasRole('admin') && (
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-6">{editing ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plat Nomor</label>
                <input type="text" value={form.plat_nomor} onChange={(e) => setForm({ ...form, plat_nomor: e.target.value })} className="input-field" placeholder="BK 1234 AB" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Merek</label>
                  <input type="text" value={form.merek} onChange={(e) => setForm({ ...form, merek: e.target.value })} className="input-field" placeholder="Honda" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
                  <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input-field" placeholder="Vario" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna</label>
                  <input type="text" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} className="input-field" placeholder="Hitam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                  <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} className="input-field">
                    <option value="motor">Motor</option>
                    <option value="mobil">Mobil</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
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
