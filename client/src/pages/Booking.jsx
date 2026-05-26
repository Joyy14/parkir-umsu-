import { useState, useEffect } from 'react';
import { bookingAPI, slotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Plus, X, Check, Calendar, Clock, Car } from 'lucide-react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import toast from 'react-hot-toast';

const statusColors = {
  dipesan: 'badge-yellow', digunakan: 'badge-blue', selesai: 'badge-green', dibatalkan: 'badge-red',
};

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const { hasRole } = useAuth();
  const [form, setForm] = useState({
    slot_id: '', plat_nomor: '', tanggal: new Date().toISOString().split('T')[0],
    waktu_mulai: '08:00', waktu_selesai: '16:00', catatan: '',
  });

  useEffect(() => { fetchBookings(); fetchSlots(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = hasRole('admin', 'petugas') ? await bookingAPI.getAll() : await bookingAPI.getMy();
      setBookings(data.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchSlots = async () => {
    try { const { data } = await slotAPI.getAll({ status: 'tersedia' }); setSlots(data.data || []); }
    catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slot_id || !form.plat_nomor || !form.tanggal) { toast.error('Semua field harus diisi'); return; }
    try {
      await bookingAPI.create(form);
      toast.success('Booking berhasil dibuat!');
      setShowModal(false);
      setForm({ slot_id: '', plat_nomor: '', tanggal: new Date().toISOString().split('T')[0], waktu_mulai: '08:00', waktu_selesai: '16:00', catatan: '' });
      fetchBookings(); fetchSlots();
    } catch (error) { toast.error(error.response?.data?.message || 'Gagal membuat booking'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    try { await bookingAPI.cancel(id); toast.success('Booking dibatalkan'); fetchBookings(); fetchSlots(); }
    catch (error) { toast.error('Gagal membatalkan booking'); }
  };

  const handleUse = async (id) => {
    try { await bookingAPI.use(id); toast.success('Booking digunakan'); fetchBookings(); fetchSlots(); }
    catch (error) { toast.error('Gagal menggunakan booking'); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Booking</h1>
            <p className="page-subtitle">Reservasi slot parkir online</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Booking Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Belum ada booking</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4"><Plus className="h-4 w-4" /> Booking Baru</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card card-hover">
              <div className="flex items-start justify-between mb-3">
                <span className={statusColors[booking.status]}>{booking.status}</span>
                <div className="flex items-center gap-2">
                  {booking.status === 'dipesan' && (
                    <QRCode value={JSON.stringify({ type: 'booking', booking_id: booking.id })} size={40} level="M" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-400" />
                  <span className="font-bold text-lg text-gray-900">{booking.slot_parkir?.kode_slot}</span>
                  <span className="text-xs text-gray-400">{booking.slot_parkir?.tipe}</span>
                </div>
                <p className="text-sm text-gray-500">{booking.slot_parkir?.lokasi}</p>
                <p className="font-semibold text-gray-800">{booking.plat_nomor}</p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(booking.tanggal).toLocaleDateString('id-ID')}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{booking.waktu_mulai?.slice(0,5)} - {booking.waktu_selesai?.slice(0,5)}</span>
                </div>
              </div>
              {booking.status === 'dipesan' && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                  {hasRole('admin', 'petugas') && (
                    <button onClick={() => handleUse(booking.id)} className="btn-success btn-sm"><Check className="h-4 w-4" /> Gunakan</button>
                  )}
                  <button onClick={() => handleCancel(booking.id)} className="btn-danger btn-sm"><X className="h-4 w-4" /> Batal</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-6">Booking Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Slot</label>
                <select value={form.slot_id} onChange={(e) => setForm({ ...form, slot_id: e.target.value })} className="input-field">
                  <option value="">-- Pilih Slot --</option>
                  {slots.map((slot) => (<option key={slot.id} value={slot.id}>{slot.kode_slot} - {slot.lokasi}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plat Nomor</label>
                <input type="text" value={form.plat_nomor} onChange={(e) => setForm({ ...form, plat_nomor: e.target.value })} className="input-field" placeholder="BK 1234 AB" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Mulai</label>
                  <input type="time" value={form.waktu_mulai} onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Selesai</label>
                  <input type="time" value={form.waktu_selesai} onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
                <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className="input-field" rows={2} placeholder="Catatan tambahan..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Booking</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
