import { useState, useEffect, useRef } from 'react';
import { parkirAPI, slotAPI, kendaraanAPI, bookingAPI } from '../services/api';
import { ClipboardList, Plus, LogOut, Search, Printer, X, QrCode, Camera } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import toast from 'react-hot-toast';

function Receipt({ transaksi, onClose }) {
  const receiptRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head><title>Struk Parkir UMSU</title>
      <style>
        body { font-family: monospace; font-size: 14px; padding: 20px; max-width: 300px; margin: 0 auto; }
        h2, h3 { text-align: center; margin: 5px 0; }
        hr { border-top: 1px dashed #000; }
        table { width: 100%; }
        td { padding: 3px 0; }
        .text-right { text-align: right; }
        .total { font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 15px; font-size: 12px; }
      </style>
      </head>
      <body>
        <h2>PARKIR UMSU</h2>
        <h3>Universitas Muhammadiyah Sumatera Utara</h3>
        <hr/>
        <p>No: ${transaksi.id.slice(0, 8).toUpperCase()}</p>
        <p>${new Date(transaksi.waktu_keluar || transaksi.waktu_masuk).toLocaleString('id-ID')}</p>
        <hr/>
        <table>
          <tr><td>Plat Nomor</td><td class="text-right">${transaksi.plat_nomor}</td></tr>
          <tr><td>Slot</td><td class="text-right">${transaksi.slot_parkir?.kode_slot || '-'}</td></tr>
          <tr><td>Masuk</td><td class="text-right">${new Date(transaksi.waktu_masuk).toLocaleString('id-ID')}</td></tr>
          <tr><td>Keluar</td><td class="text-right">${transaksi.waktu_keluar ? new Date(transaksi.waktu_keluar).toLocaleString('id-ID') : '-'}</td></tr>
        </table>
        <hr/>
        <table>
          <tr class="total"><td>TOTAL</td><td class="text-right">Rp ${Number(transaksi.biaya || 0).toLocaleString()}</td></tr>
        </table>
        <hr/>
        <p>Metode: ${transaksi.metode_pembayaran || 'Tunai'}</p>
        <div class="footer">
          <p>Terima Kasih</p>
          <p>Selamat Datang Kembali</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Struk Parkir</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div ref={receiptRef} className="bg-white border rounded-lg p-4 font-mono text-sm">
          <div className="text-center mb-3">
            <h4 className="font-bold text-lg">PARKIR UMSU</h4>
            <p className="text-xs text-gray-500">Universitas Muhammadiyah Sumatera Utara</p>
          </div>
          <hr className="border-dashed my-2" />
          <p className="text-xs text-gray-400">No: {transaksi.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-gray-400">{new Date(transaksi.waktu_keluar || transaksi.waktu_masuk).toLocaleString('id-ID')}</p>
          <hr className="border-dashed my-2" />
          <div className="space-y-1">
            <p>Plat: <span className="font-bold">{transaksi.plat_nomor}</span></p>
            <p>Slot: {transaksi.slot_parkir?.kode_slot || '-'}</p>
            <p>Masuk: {new Date(transaksi.waktu_masuk).toLocaleString('id-ID')}</p>
            <p>Keluar: {transaksi.waktu_keluar ? new Date(transaksi.waktu_keluar).toLocaleString('id-ID') : '-'}</p>
          </div>
          <hr className="border-dashed my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>Rp {Number(transaksi.biaya || 0).toLocaleString()}</span>
          </div>
          <hr className="border-dashed my-2" />
          <p className="text-xs">{transaksi.metode_pembayaran || 'Tunai'}</p>
          <div className="text-center mt-3 text-xs text-gray-500">
            <p>Terima Kasih</p>
            <p>Selamat Datang Kembali</p>
          </div>
        </div>
        <button onClick={handlePrint} className="btn-primary w-full mt-4 flex items-center justify-center space-x-2">
          <Printer className="h-4 w-4" />
          <span>Cetak Struk</span>
        </button>
      </div>
    </div>
  );
}

export default function TransaksiParkir() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [slots, setSlots] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [metodePembayaran, setMetodePembayaran] = useState('tunai');
  const [form, setForm] = useState({
    plat_nomor: '',
    slot_id: '',
    kendaraan_id: '',
  });
  const cariTimeout = useRef(null);

  useEffect(() => {
    fetchTransaksi();
    fetchSlots();
    return () => {
      if (cariTimeout.current) clearTimeout(cariTimeout.current);
    };
  }, []);

  const fetchTransaksi = async () => {
    try {
      const { data } = await parkirAPI.getAll({ status: 'aktif' });
      setTransaksi(data.data || []);
    } catch (error) {
      console.error('Failed to fetch transaksi:', error);
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

  const cariKendaraan = (plat) => {
    if (cariTimeout.current) clearTimeout(cariTimeout.current);
    if (!plat || plat.length < 2) return;
    cariTimeout.current = setTimeout(async () => {
      try {
        const { data } = await kendaraanAPI.getByPlat(plat);
        if (data) {
          setForm((prev) => ({ ...prev, kendaraan_id: data.id, plat_nomor: data.plat_nomor }));
        }
      } catch (error) {
      }
    }, 400);
  };

  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!form.plat_nomor || !form.slot_id) {
      toast.error('Plat nomor dan slot parkir harus diisi');
      return;
    }
    try {
      await parkirAPI.create(form);
      toast.success('Kendaraan masuk tercatat');
      setShowCheckin(false);
      setForm({ plat_nomor: '', slot_id: '', kendaraan_id: '' });
      fetchTransaksi();
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mencatat kendaraan masuk');
    }
  };

  const handleQRScan = async (decodedText) => {
    setShowScanner(false);
    try {
      const data = JSON.parse(decodedText);
      if (data.type === 'user' && data.user_id) {
        const res = await kendaraanAPI.getAll({ pemilik_id: data.user_id, limit: 1 });
        const vehicles = res.data?.data || [];
        if (vehicles.length > 0) {
          setForm((prev) => ({ ...prev, plat_nomor: vehicles[0].plat_nomor, kendaraan_id: vehicles[0].id }));
          toast.success(`Terisi: ${vehicles[0].plat_nomor}`);
        } else {
          toast('Kendaraan tidak ditemukan, isi manual');
        }
      } else if (data.type === 'booking' && data.booking_id) {
        await bookingAPI.use(data.booking_id);
        toast.success('Check-in dari booking berhasil');
        fetchTransaksi();
        fetchSlots();
        setMetodePembayaran('tunai');
      } else {
        toast.error('QR tidak dikenal');
      }
    } catch {
      toast.error('Gagal membaca QR');
    }
  };

  const [checkoutTarget, setCheckoutTarget] = useState(null);

  const handleCheckout = async (id) => {
    setCheckoutTarget(id);
  };

  const confirmCheckout = async () => {
    if (!checkoutTarget) return;
    try {
      const { data } = await parkirAPI.checkout(checkoutTarget, { metode_pembayaran: metodePembayaran });
      toast.success('Check-out berhasil');
      fetchTransaksi();
      fetchSlots();
      setShowReceipt(data.transaksi);
      setCheckoutTarget(null);
    } catch (error) {
      toast.error('Gagal check-out');
    }
  };

  const filteredTransaksi = transaksi.filter((t) =>
    t.plat_nomor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi Parkir</h1>
          <p className="text-gray-500 mt-1">Manajemen kendaraan masuk dan keluar</p>
        </div>
        <button onClick={() => setShowCheckin(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Parkir Masuk</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Waktu Masuk</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Tidak ada transaksi aktif
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.plat_nomor}</td>
                    <td className="px-4 py-3 text-gray-700">{item.slot_parkir?.kode_slot || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(item.waktu_masuk).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleCheckout(item.id)} className="btn-success flex items-center space-x-1 text-sm py-1.5 px-3">
                        <LogOut className="h-4 w-4" />
                        <span>Check-out</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Parkir Masuk</h3>
            <form onSubmit={handleCheckin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={form.plat_nomor}
                    onChange={(e) => { setForm({ ...form, plat_nomor: e.target.value }); cariKendaraan(e.target.value); }}
                    className="input-field flex-1"
                    placeholder="BK 1234 AB"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowScanner(true)} className="btn-secondary flex items-center space-x-1 px-3" title="Scan QR">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Slot</label>
                <select value={form.slot_id} onChange={(e) => setForm({ ...form, slot_id: e.target.value })} className="input-field">
                  <option value="">-- Pilih Slot --</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>{slot.kode_slot} - {slot.lokasi} ({slot.tipe})</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Simpan</button>
                <button type="button" onClick={() => setShowCheckin(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}

      {checkoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Check-out Kendaraan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                <select value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)} className="input-field">
                  <option value="tunai">Tunai</option>
                  <option value="qris">QRIS</option>
                  <option value="kartu">Kartu</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-2">
                <button onClick={confirmCheckout} className="btn-success flex-1">Konfirmasi Check-out</button>
                <button onClick={() => setCheckoutTarget(null)} className="btn-secondary flex-1">Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceipt && (
        <Receipt transaksi={showReceipt} onClose={() => setShowReceipt(null)} />
      )}
    </div>
  );
}
