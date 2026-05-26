import { useState, useEffect } from 'react';
import { slotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ParkingSquare, Plus, Edit2, Trash2, Map, Grid3X3, Bike, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = { tersedia: 'badge-green', terisi: 'badge-red', dipesan: 'badge-yellow' };
const statusLabels = { tersedia: 'Tersedia', terisi: 'Terisi', dipesan: 'Dipesan' };
const statusBg = { tersedia: 'bg-emerald-400', terisi: 'bg-red-400', dipesan: 'bg-yellow-400' };
const statusCard = { tersedia: 'border-l-emerald-400', terisi: 'border-l-red-400', dipesan: 'border-l-yellow-400' };

const daftarFakultas = [
  'Fakultas Ilmu Komputer dan Teknologi Informasi', 'Fakultas Pertanian', 'Fakultas Hukum',
  'Fakultas Ilmu Sosial dan Ilmu Politik', 'Fakultas Agama Islam', 'Fakultas Ekonomi dan Bisnis',
  'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'Fakultas Teknik',
];

export default function SlotParkir() {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ total: 0, tersedia: 0, terisi: 0, dipesan: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [filterTipe, setFilterTipe] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ kode_slot: '', lokasi: '', tipe: 'motor' });
  const { hasRole } = useAuth();

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    try {
      const { data } = await slotAPI.getAll();
      setSlots(data.data || []);
      setStats({ total: data.total || 0, tersedia: data.tersedia || 0, terisi: data.terisi || 0, dipesan: data.dipesan || 0 });
    } catch (error) { toast.error('Gagal memuat data slot'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ kode_slot: '', lokasi: '', tipe: 'motor' }); setShowModal(true); };
  const openEdit = (slot) => { setEditing(slot); setForm({ kode_slot: slot.kode_slot, lokasi: slot.lokasi, tipe: slot.tipe }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kode_slot || !form.lokasi) { toast.error('Kode slot dan lokasi harus diisi'); return; }
    try {
      if (editing) await slotAPI.update(editing.id, form);
      else await slotAPI.create(form);
      setShowModal(false); await fetchSlots();
      toast.success(editing ? 'Slot berhasil diupdate' : 'Slot berhasil ditambahkan');
    } catch (error) { toast.error(error.response?.data?.message || 'Gagal menyimpan'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus slot ini?')) return;
    try { await slotAPI.delete(id); toast.success('Slot berhasil dihapus'); fetchSlots(); }
    catch (error) { toast.error('Gagal menghapus slot'); }
  };

  const filteredSlots = slots.filter((s) => {
    if (filterTipe !== 'all' && s.tipe !== filterTipe) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const lokasiGroups = [...new Set(filteredSlots.map((s) => s.lokasi))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Slot Parkir</h1>
            <p className="page-subtitle">Manajemen slot parkir kampus UMSU</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="btn-secondary btn-sm">
              {viewMode === 'list' ? <Map className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              {viewMode === 'list' ? 'Tampilan Map' : 'Tampilan Daftar'}
            </button>
            {hasRole('admin') && (
              <button onClick={openAdd} className="btn-primary">
                <Plus className="h-4 w-4" /> Tambah Slot
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Slot', value: stats.total, color: 'bg-gray-500', icon: ParkingSquare },
          { label: 'Tersedia', value: stats.tersedia, color: 'bg-emerald-500', icon: ParkingSquare },
          { label: 'Terisi', value: stats.terisi, color: 'bg-red-500', icon: ParkingSquare },
          { label: 'Dipesan', value: stats.dipesan, color: 'bg-yellow-500', icon: ParkingSquare },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)} className="input-field w-40">
          <option value="all">Semua Tipe</option>
          <option value="motor">Motor</option>
          <option value="mobil">Mobil</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
          <option value="all">Semua Status</option>
          <option value="tersedia">Tersedia</option>
          <option value="terisi">Terisi</option>
          <option value="dipesan">Dipesan</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-6">
          {lokasiGroups.map((lokasi) => {
            const groupSlots = filteredSlots.filter((s) => s.lokasi === lokasi);
            return (
              <div key={lokasi} className="card">
                <h3 className="font-semibold text-gray-900 mb-4">{lokasi}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {groupSlots.map((slot) => (
                    <div key={slot.id} className={`relative p-2.5 rounded-xl border-2 transition-all hover:scale-105 cursor-default ${
                      slot.status === 'tersedia' ? 'border-emerald-200 bg-emerald-50' :
                      slot.status === 'terisi' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1.5 ${statusBg[slot.status]}`} />
                        <p className="font-bold text-xs text-gray-900">{slot.kode_slot}</p>
                        {slot.tipe === 'motor' ? <Bike className="h-3 w-3 mx-auto mt-0.5 text-gray-400" /> : <Car className="h-3 w-3 mx-auto mt-0.5 text-gray-400" />}
                      </div>
                      {hasRole('admin') && (
                        <div className="absolute top-1 right-1 flex">
                          <button onClick={() => openEdit(slot)} className="p-0.5 text-blue-600 hover:bg-blue-100 rounded"><Edit2 className="h-3 w-3" /></button>
                          <button onClick={() => handleDelete(slot.id)} className="p-0.5 text-red-600 hover:bg-red-100 rounded"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSlots.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <ParkingSquare className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              Tidak ada slot
            </div>
          ) : (
            filteredSlots.map((slot) => (
              <div key={slot.id} className={`card border-l-4 ${statusCard[slot.status]}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-900">{slot.kode_slot}</span>
                  {slot.tipe === 'motor' ? <Bike className="h-4 w-4 text-blue-500" /> : <Car className="h-4 w-4 text-emerald-500" />}
                </div>
                <p className="text-sm text-gray-500 mb-2 truncate">{slot.lokasi}</p>
                <div className="flex items-center justify-between">
                  <span className={statusColors[slot.status]}>{statusLabels[slot.status]}</span>
                  <span className="text-xs text-gray-400">{slot.tipe}</span>
                </div>
                {hasRole('admin') && (
                  <div className="flex gap-1 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => openEdit(slot)} className="btn-ghost btn-xs text-blue-600"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                    <button onClick={() => handleDelete(slot.id)} className="btn-ghost btn-xs text-red-600"><Trash2 className="h-3.5 w-3.5" /> Hapus</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-6">{editing ? 'Edit Slot' : 'Tambah Slot'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Slot</label>
                <input type="text" value={form.kode_slot} onChange={(e) => setForm({ ...form, kode_slot: e.target.value })} className="input-field" placeholder="FIKTI-M1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi (Fakultas)</label>
                <select value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="input-field">
                  <option value="">-- Pilih Fakultas --</option>
                  {daftarFakultas.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} className="input-field">
                  <option value="motor">Motor</option>
                  <option value="mobil">Mobil</option>
                </select>
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
