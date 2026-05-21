import { useState, useEffect } from 'react';
import { bookingAPI, slotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Plus, X, Check, Calendar, Clock } from 'lucide-react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import toast from 'react-hot-toast';

const statusColors = {
  dipesan: 'bg-yellow-100 text-yellow-700',
  digunakan: 'bg-blue-100 text-blue-700',
  selesai: 'bg-green-100 text-green-700',
  dibatalkan: 'bg-red-100 text-red-700',
};

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const { hasRole, profile } = useAuth();
  const [form, setForm] = useState({
    slot_id: '',
    plat_nomor: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu_mulai: '08:00',
    waktu_selesai: '16:00',
    catatan: '',
  });

  useEffect(() => {
    fetchBookings();
    fetchSlots();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = hasRole('admin', 'petugas')
        ? await bookingAPI.getAll()
        : await bookingAPI.getMy();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const { data } = await slotAPI.getAll({ status: 'tersedia' });
      setSlots(data.data || []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slot_id || !form.plat_nomor || !form.tanggal) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      await bookingAPI.create(form);
      toast.success('Booking berhasil dibuat!');
      setShowModal(false);
      setForm({
        slot_id: '',
        plat_nomor: '',
        tanggal: new Date().toISOString().split('T')[0],
        waktu_mulai: '08:00',
        waktu_selesai: '16:00',
        catatan: '',
      });
      fetchBookings();
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat booking');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking dibatalkan');
      fetchBookings();
      fetchSlots();
    } catch (error) {
      toast.error('Gagal membatalkan booking');
    }
  };

  const handleUse = async (id) => {
    try {
      await bookingAPI.use(id);
      toast.success('Booking digunakan');
      fetchBookings();
      fetchSlots();
    } catch (error) {
      toast.error('Gagal menggunakan booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking</h1>
          <p className="text-gray-500 mt-1">Reservasi slot parkir online</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Booking Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              Belum ada booking
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    {booking.status === 'dipesan' && (
                      <QRCode
                        value={JSON.stringify({ type: 'booking', booking_id: booking.id })}
                        size={48}
                        level="M"
                      />
                    )}
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-gray-900">
                      {booking.slot_parkir?.kode_slot}
                    </span>
                    <span className="text-sm text-gray-500">
                      {booking.slot_parkir?.tipe}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{booking.slot_parkir?.lokasi}</p>
                  <p className="font-medium text-gray-800">{booking.plat_nomor}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(booking.tanggal).toLocaleDateString('id-ID')}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{booking.waktu_mulai?.slice(0, 5)} - {booking.waktu_selesai?.slice(0, 5)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
                  {booking.status === 'dipesan' && (
                    <>
                      {hasRole('admin', 'petugas') && (
                        <button
                          onClick={() => handleUse(booking.id)}
                          className="btn-success text-sm py-1.5 px-3 flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Gunakan</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="btn-danger text-sm py-1.5 px-3 flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Batal</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Booking Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Slot</label>
                <select
                  value={form.slot_id}
                  onChange={(e) => setForm({ ...form, slot_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Pilih Slot --</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.kode_slot} - {slot.lokasi}
                    </option>
                  ))}
                </select>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                  <input
                    type="time"
                    value={form.waktu_mulai}
                    onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                  <input
                    type="time"
                    value={form.waktu_selesai}
                    onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Catatan tambahan..."
                />
              </div>
              <div className="flex space-x-3 pt-2">
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
