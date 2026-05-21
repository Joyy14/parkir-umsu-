import { useState, useEffect } from 'react';
import { slotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ParkingSquare, Plus, Edit2, Trash2, Map, Grid3X3 } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  tersedia: 'bg-green-100 text-green-700 border-green-200',
  terisi: 'bg-red-100 text-red-700 border-red-200',
  dipesan: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const statusLabels = {
  tersedia: 'Tersedia',
  terisi: 'Terisi',
  dipesan: 'Dipesan',
};

const statusBgMap = {
  tersedia: 'bg-green-500',
  terisi: 'bg-red-500',
  dipesan: 'bg-yellow-500',
};

const daftarFakultas = [
  'Fakultas Ilmu Komputer dan Teknologi Informasi',
  'Fakultas Pertanian',
  'Fakultas Hukum',
  'Fakultas Ilmu Sosial dan Ilmu Politik',
  'Fakultas Agama Islam',
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Ilmu Keguruan dan Ilmu Pendidikan',
  'Fakultas Teknik',
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

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const { data } = await slotAPI.getAll();
      setSlots(data.data || []);
      setStats({
        total: data.total || 0,
        tersedia: data.tersedia || 0,
        terisi: data.terisi || 0,
        dipesan: data.dipesan || 0,
      });
    } catch (error) {
      toast.error('Gagal memuat data slot');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ kode_slot: '', lokasi: '', tipe: 'motor' });
    setShowModal(true);
  };

  const openEdit = (slot) => {
    setEditing(slot);
    setForm({ kode_slot: slot.kode_slot, lokasi: slot.lokasi, tipe: slot.tipe });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kode_slot || !form.lokasi) {
      toast.error('Kode slot dan lokasi harus diisi');
      return;
    }
    try {
      if (editing) {
        await slotAPI.update(editing.id, form);
      } else {
        await slotAPI.create(form);
      }
      setShowModal(false);
      await fetchSlots();
      toast.success(editing ? 'Slot berhasil diupdate' : 'Slot berhasil ditambahkan');
    } catch (error) {
      console.error('Save slot error:', error);
      const msg = error.response?.data?.message || error.message || 'Gagal menyimpan';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus slot ini?')) return;
    try {
      await slotAPI.delete(id);
      toast.success('Slot berhasil dihapus');
      fetchSlots();
    } catch (error) {
      toast.error('Gagal menghapus slot');
    }
  };

  const filteredSlots = slots.filter((s) => {
    if (filterTipe !== 'all' && s.tipe !== filterTipe) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const lokasiGroups = [...new Set(filteredSlots.map((s) => s.lokasi))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slot Parkir</h1>
          <p className="text-gray-500 mt-1">Manajemen slot parkir kampus</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="btn-secondary flex items-center space-x-1"
          >
            {viewMode === 'list' ? <Map className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            <span>{viewMode === 'list' ? 'Tampilan Map' : 'Tampilan Daftar'}</span>
          </button>
          {hasRole('admin') && (
            <button onClick={openAdd} className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Slot</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-500' },
          { label: 'Tersedia', value: stats.tersedia, color: 'bg-green-500' },
          { label: 'Terisi', value: stats.terisi, color: 'bg-red-500' },
          { label: 'Dipesan', value: stats.dipesan, color: 'bg-yellow-500' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
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
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-6">
          {lokasiGroups.map((lokasi) => {
            const groupSlots = filteredSlots.filter((s) => s.lokasi === lokasi);
            return (
              <div key={lokasi} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{lokasi}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
                  {groupSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        slot.status === 'tersedia' ? 'border-green-300 bg-green-50' :
                        slot.status === 'terisi' ? 'border-red-300 bg-red-50' :
                        'border-yellow-300 bg-yellow-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${statusBgMap[slot.status]}`} />
                        <p className="font-bold text-sm text-gray-900">{slot.kode_slot}</p>
                        <p className="text-xs text-gray-500">{slot.tipe}</p>
                      </div>
                      {hasRole('admin') && (
                        <div className="absolute top-1 right-1 flex space-x-0.5">
                          <button onClick={() => openEdit(slot)} className="p-0.5 text-blue-600 hover:bg-blue-100 rounded text-xs">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDelete(slot.id)} className="p-0.5 text-red-600 hover:bg-red-100 rounded text-xs">
                            <Trash2 className="h-3 w-3" />
                          </button>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredSlots.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <ParkingSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              Tidak ada slot
            </div>
          ) : (
            filteredSlots.map((slot) => (
              <div key={slot.id} className={`card p-4 border-l-4 ${
                slot.status === 'tersedia' ? 'border-l-green-500' :
                slot.status === 'terisi' ? 'border-l-red-500' : 'border-l-yellow-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-900">{slot.kode_slot}</span>
                  <ParkingSquare className={`h-5 w-5 ${slot.tipe === 'motor' ? 'text-blue-500' : 'text-green-500'}`} />
                </div>
                <p className="text-sm text-gray-600 mb-1 truncate">{slot.lokasi}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[slot.status]}`}>
                    {statusLabels[slot.status]}
                  </span>
                  <span className="text-xs text-gray-400">{slot.tipe}</span>
                </div>
                {hasRole('admin') && (
                  <div className="flex space-x-1 mt-2 pt-2 border-t border-gray-100">
                    <button onClick={() => openEdit(slot)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(slot.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Slot' : 'Tambah Slot'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Slot</label>
                <input type="text" value={form.kode_slot} onChange={(e) => setForm({ ...form, kode_slot: e.target.value })} className="input-field" placeholder="A-M1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi (Fakultas)</label>
                <select value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="input-field">
                  <option value="">-- Pilih Fakultas --</option>
                  {daftarFakultas.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} className="input-field">
                  <option value="motor">Motor</option>
                  <option value="mobil">Mobil</option>
                </select>
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
