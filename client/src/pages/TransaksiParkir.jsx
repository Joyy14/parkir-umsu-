import { useState, useEffect, useRef, useMemo } from 'react';
import { parkirAPI, slotAPI, kendaraanAPI, bookingAPI } from '../services/api';
import { ClipboardList, Plus, LogOut, Search, Printer, X, Camera, Car, QrCode } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import toast from 'react-hot-toast';

const daftarFakultas = [
  'Fakultas Ilmu Komputer dan Teknologi Informasi', 'Fakultas Pertanian', 'Fakultas Hukum',
  'Fakultas Ilmu Sosial dan Ilmu Politik', 'Fakultas Agama Islam', 'Fakultas Ekonomi dan Bisnis',
  'Fakultas Ilmu Keguruan dan Ilmu Pendidikan', 'Fakultas Teknik',
];

function Receipt({ transaksi, onClose }) {
  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Struk Parkir UMSU</title>
      <style>body{font-family:monospace;font-size:14px;padding:20px;max-width:300px;margin:0 auto}
      h2,h3{text-align:center;margin:5px 0}hr{border-top:1px dashed #000}
      table{width:100%}td{padding:3px 0}.text-right{text-align:right}
      .total{font-size:18px;font-weight:bold}.footer{text-align:center;margin-top:15px;font-size:12px}</style>
      </head><body>
      <h2>PARKIR UMSU</h2>
      <h3>Universitas Muhammadiyah Sumatera Utara</h3>
      <hr/><p>No: ${transaksi.id.slice(0,8).toUpperCase()}</p>
      <p>${new Date(transaksi.waktu_keluar || transaksi.waktu_masuk).toLocaleString('id-ID')}</p><hr/>
      <table><tr><td>Plat Nomor</td><td class="text-right">${transaksi.plat_nomor}</td></tr>
      <tr><td>Slot</td><td class="text-right">${transaksi.slot_parkir?.kode_slot || '-'}</td></tr>
      <tr><td>Masuk</td><td class="text-right">${new Date(transaksi.waktu_masuk).toLocaleString('id-ID')}</td></tr>
      <tr><td>Keluar</td><td class="text-right">${transaksi.waktu_keluar ? new Date(transaksi.waktu_keluar).toLocaleString('id-ID') : '-'}</td></tr></table><hr/>
      <div class="footer"><p>Terima Kasih</p><p>Selamat Datang Kembali</p></div>
      </body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Struk Parkir</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X className="h-5 w-5" /></button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 font-mono text-sm">
          <div className="text-center mb-3">
            <h4 className="font-bold text-lg">PARKIR UMSU</h4>
            <p className="text-xs text-gray-400">Universitas Muhammadiyah Sumatera Utara</p>
          </div>
          <hr className="border-dashed my-2" />
          <p className="text-xs text-gray-400">No: {transaksi.id.slice(0,8).toUpperCase()}</p>
          <p className="text-xs text-gray-400">{new Date(transaksi.waktu_keluar || transaksi.waktu_masuk).toLocaleString('id-ID')}</p>
          <hr className="border-dashed my-2" />
          <div className="space-y-1">
            <p>Plat: <span className="font-bold">{transaksi.plat_nomor}</span></p>
            <p>Slot: {transaksi.slot_parkir?.kode_slot || '-'}</p>
            <p>Masuk: {new Date(transaksi.waktu_masuk).toLocaleString('id-ID')}</p>
            <p>Keluar: {transaksi.waktu_keluar ? new Date(transaksi.waktu_keluar).toLocaleString('id-ID') : '-'}</p>
          </div>
          <hr className="border-dashed my-2" />
          <div className="text-center mt-3 text-xs text-gray-400">
            <p>Terima Kasih</p>
            <p>Selamat Datang Kembali</p>
          </div>
        </div>
        <button onClick={handlePrint} className="btn-primary w-full mt-4"><Printer className="h-4 w-4" /> Cetak Struk</button>
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
  const [form, setForm] = useState({ plat_nomor: '', slot_id: '', kendaraan_id: '' });
  const [pendingQrUser, setPendingQrUser] = useState(null);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [platInput, setPlatInput] = useState('');
  const [checkoutQrMode, setCheckoutQrMode] = useState(false);
  const [filterLokasi, setFilterLokasi] = useState('');
  const [pendingSlotId, setPendingSlotId] = useState('');
  const [hideVehicleList, setHideVehicleList] = useState(false);
  const [showNewVehicle, setShowNewVehicle] = useState(false);
  const [newVehicleMerek, setNewVehicleMerek] = useState('');
  const [newVehicleTipe, setNewVehicleTipe] = useState('motor');
  const cariTimeout = useRef(null);

  const filteredSlotsByLokasi = useMemo(() => {
    if (!filterLokasi) return slots;
    return slots.filter((s) => s.lokasi === filterLokasi);
  }, [slots, filterLokasi]);

  const groupedSlots = useMemo(() => {
    const groups = {};
    const list = filterLokasi ? filteredSlotsByLokasi : slots;
    for (const s of list) {
      if (!groups[s.lokasi]) groups[s.lokasi] = [];
      groups[s.lokasi].push(s);
    }
    return groups;
  }, [slots, filterLokasi, filteredSlotsByLokasi]);

  useEffect(() => { fetchTransaksi(); fetchSlots(); return () => { if (cariTimeout.current) clearTimeout(cariTimeout.current); }; }, []);

  const fetchTransaksi = async () => {
    try { const { data } = await parkirAPI.getAll({ status: 'aktif' }); setTransaksi(data.data || []); }
    catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchSlots = async () => {
    try { const { data } = await slotAPI.getAll({ status: 'tersedia' }); setSlots(data.data || []); }
    catch (error) { console.error(error); }
  };

  const cariKendaraan = (plat) => {
    if (cariTimeout.current) clearTimeout(cariTimeout.current);
    if (!plat || plat.length < 2) return;
    cariTimeout.current = setTimeout(async () => {
      try { const { data } = await kendaraanAPI.getByPlat(plat); if (data) setForm((prev) => ({ ...prev, kendaraan_id: data.id, plat_nomor: data.plat_nomor })); }
      catch (error) {}
    }, 400);
  };

  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!form.plat_nomor || !form.slot_id) { toast.error('Plat nomor dan slot parkir harus diisi'); return; }
    try { await parkirAPI.create(form); toast.success('Kendaraan masuk tercatat'); setShowCheckin(false); setForm({ plat_nomor: '', slot_id: '', kendaraan_id: '' }); fetchTransaksi(); fetchSlots(); }
    catch (error) { toast.error(error.response?.data?.message || 'Gagal mencatat kendaraan masuk'); }
  };

  const handleQRScan = async (decodedText) => {
    setShowScanner(false);
    try {
      const data = JSON.parse(decodedText);

      // Checkout QR mode
      if (checkoutQrMode) {
        setCheckoutQrMode(false);
        if (data.type === 'user' && data.user_id) {
          const match = transaksi.find(t => {
            try { const c = JSON.parse(t.catatan || '{}'); return c.qr === data.user_id; }
            catch { return false; }
          });
          if (match) {
            await parkirAPI.checkout(match.id);
            toast.success(`Check-out: ${match.plat_nomor}`);
            fetchTransaksi(); fetchSlots();
            setShowReceipt(null);
          } else {
            toast.error('Tidak ditemukan transaksi aktif untuk user ini');
          }
        } else toast.error('QR tidak dikenal');
        return;
      }

      // Check-in QR mode
      if (data.type === 'user' && data.user_id) {
        const res = await kendaraanAPI.getAll({ pemilik_id: data.user_id, limit: 50 });
        const vehicles = res.data?.data || [];
        setPendingVehicles(vehicles);
        setPendingQrUser(data);
        setPlatInput('');
        setPendingSlotId('');
        setFilterLokasi('');
        setHideVehicleList(false);
      } else if (data.type === 'booking' && data.booking_id) {
        await bookingAPI.use(data.booking_id);
        toast.success('Check-in dari booking berhasil');
        setShowCheckin(false);
        fetchTransaksi(); fetchSlots();
      } else toast.error('QR tidak dikenal');
    } catch { toast.error('Gagal membaca QR'); }
  };

  const handlePendingCheckin = async () => {
    if (!platInput || !platInput.trim()) { toast.error('Plat nomor harus diisi'); return; }
    if (!pendingSlotId) { toast.error('Slot parkir harus dipilih'); return; }
    const selectedSlot = slots.find(s => s.id === pendingSlotId);
    let kendaraanId = null;
    try {
      const { data } = await kendaraanAPI.getByPlat(platInput.trim().toUpperCase());
      if (data?.id) {
        kendaraanId = data.id;
      } else if (showNewVehicle && newVehicleMerek) {
        const { data: created } = await kendaraanAPI.create({
          plat_nomor: platInput.trim().toUpperCase(), merek: newVehicleMerek, tipe: newVehicleTipe, pemilik_id: pendingQrUser.user_id
        });
        kendaraanId = created?.id;
      }
    } catch {}
    try {
      await parkirAPI.create({ plat_nomor: platInput.trim().toUpperCase(), slot_id: pendingSlotId, kendaraan_id: kendaraanId, catatan: JSON.stringify({ qr: pendingQrUser.user_id }) });
      setPendingQrUser(null);
      setPendingVehicles([]);
      setPlatInput('');
      setPendingSlotId('');
      setFilterLokasi('');
      setShowNewVehicle(false);
      setNewVehicleMerek('');
      setNewVehicleTipe('motor');
      setHideVehicleList(false);
      setForm({ plat_nomor: '', slot_id: '', kendaraan_id: '' });
      toast.success(`Check-in: ${platInput.trim().toUpperCase()} - ${selectedSlot?.kode_slot || ''}`);
      fetchTransaksi(); fetchSlots();
    } catch (err) { toast.error('Gagal check-in'); }
  };

  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const handleCheckout = (id) => setCheckoutTarget(id);

  const confirmCheckout = async () => {
    if (!checkoutTarget) return;
    try { const { data } = await parkirAPI.checkout(checkoutTarget); toast.success('Check-out berhasil'); fetchTransaksi(); fetchSlots(); setShowReceipt(data.transaksi); setCheckoutTarget(null); }
    catch (error) { toast.error('Gagal check-out'); }
  };

  const filteredTransaksi = transaksi.filter((t) => t.plat_nomor?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Transaksi Parkir</h1>
            <p className="page-subtitle">Manajemen kendaraan masuk dan keluar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setCheckoutQrMode(true); setShowScanner(true); }} className="btn-secondary">
              <QrCode className="h-4 w-4" /> Scan Keluar
            </button>
            <button onClick={() => setShowScanner(true)} className="btn-secondary">
              <Camera className="h-4 w-4" /> Scan Masuk
            </button>
            <button onClick={() => setShowCheckin(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Parkir Masuk
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari plat nomor..." className="input-field pl-11" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
        </div>
      ) : filteredTransaksi.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Tidak ada transaksi aktif</p>
          <button onClick={() => setShowCheckin(true)} className="btn-primary mt-4"><Plus className="h-4 w-4" /> Parkir Masuk</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransaksi.map((item) => (
            <div key={item.id} className="card card-hover flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{item.plat_nomor}</p>
                  <p className="text-sm text-gray-400">
                    {item.slot_parkir?.kode_slot || '-'} &middot; {new Date(item.waktu_masuk).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge-green">Aktif</span>
                <button onClick={() => handleCheckout(item.id)} className="btn-success btn-sm">
                  <LogOut className="h-4 w-4" /> Check-out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCheckin && (
        <div className="modal-overlay" onClick={() => { setShowCheckin(false); setFilterLokasi(''); }}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-6">Parkir Masuk</h3>
            <form onSubmit={handleCheckin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plat Nomor</label>
                <div className="flex gap-2">
                  <input type="text" value={form.plat_nomor} onChange={(e) => { setForm({ ...form, plat_nomor: e.target.value }); cariKendaraan(e.target.value); }} className="input-field flex-1" placeholder="BK 1234 AB" autoFocus />
                  <button type="button" onClick={() => setShowScanner(true)} className="btn-secondary" title="Scan QR"><Camera className="h-4 w-4" /></button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fakultas</label>
                <select value={filterLokasi} onChange={(e) => setFilterLokasi(e.target.value)} className="input-field">
                  <option value="">Semua Fakultas</option>
                  {daftarFakultas.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Slot</label>
                <select value={form.slot_id} onChange={(e) => setForm({ ...form, slot_id: e.target.value })} className="input-field">
                  <option value="">-- Pilih Slot --</option>
                  {Object.entries(groupedSlots).map(([lokasi, slotList]) => (
                    <optgroup key={lokasi} label={lokasi}>
                      {slotList.map((slot) => (<option key={slot.id} value={slot.id}>{slot.kode_slot} ({slot.tipe})</option>))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Simpan</button>
                <button type="button" onClick={() => setShowCheckin(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => { setShowScanner(false); setCheckoutQrMode(false); }} />}

      {pendingQrUser && (
        <div className="modal-overlay" onClick={() => { setPendingQrUser(null); setPendingVehicles([]); setFilterLokasi(''); setShowNewVehicle(false); setNewVehicleMerek(''); setHideVehicleList(false); }}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Check-in</h3>
              <button onClick={() => { setPendingQrUser(null); setPendingVehicles([]); setFilterLokasi(''); setShowNewVehicle(false); setNewVehicleMerek(''); setHideVehicleList(false); }} className="btn-ghost p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <p><span className="font-medium">User:</span> {pendingQrUser.nama || '-'}</p>
            </div>
            <div className="space-y-3">
              {pendingVehicles.length > 0 && !hideVehicleList && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan Terdaftar</label>
                  <select onChange={(e) => {
                    const v = pendingVehicles.find(v => v.id === e.target.value);
                    if (v) { setPlatInput(v.plat_nomor); setShowNewVehicle(false); setHideVehicleList(false); }
                  }} className="input-field" defaultValue="">
                    <option value="">-- Pilih Kendaraan --</option>
                    {pendingVehicles.map((v) => (<option key={v.id} value={v.id}>{v.plat_nomor} - {v.merek} {v.model || ''}</option>))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                <input type="text" value={platInput} onChange={(e) => { setPlatInput(e.target.value); setShowNewVehicle(false); setHideVehicleList(true); }} className="input-field" placeholder="BK 1234 AB" autoFocus />
              </div>
              {!showNewVehicle ? (
                <button onClick={() => setShowNewVehicle(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  + Daftarkan kendaraan baru
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                    <input type="text" value={newVehicleMerek} onChange={(e) => setNewVehicleMerek(e.target.value)} className="input-field" placeholder="Honda" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select value={newVehicleTipe} onChange={(e) => setNewVehicleTipe(e.target.value)} className="input-field">
                      <option value="motor">Motor</option>
                      <option value="mobil">Mobil</option>
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                <select value={filterLokasi} onChange={(e) => setFilterLokasi(e.target.value)} className="input-field">
                  <option value="">Semua Fakultas</option>
                  {daftarFakultas.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Slot</label>
                <select value={pendingSlotId} onChange={(e) => setPendingSlotId(e.target.value)} className="input-field">
                  <option value="">-- Pilih Slot --</option>
                  {Object.entries(groupedSlots).map(([lokasi, slotList]) => (
                    <optgroup key={lokasi} label={lokasi}>
                      {slotList.map((slot) => (<option key={slot.id} value={slot.id}>{slot.kode_slot} ({slot.tipe})</option>))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setPendingQrUser(null); setPendingVehicles([]); setFilterLokasi(''); setShowNewVehicle(false); setNewVehicleMerek(''); setHideVehicleList(false); }} className="btn-secondary flex-1">Batal</button>
                <button onClick={handlePendingCheckin} className="btn-primary flex-1">Check-in</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {checkoutTarget && (
        <div className="modal-overlay" onClick={() => setCheckoutTarget(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Check-out Kendaraan</h3>
            <p className="text-sm text-gray-500 mb-6">Konfirmasi kendaraan keluar?</p>
            <div className="flex gap-3">
              <button onClick={confirmCheckout} className="btn-success flex-1">Check-out</button>
              <button onClick={() => setCheckoutTarget(null)} className="btn-secondary flex-1">Batal</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && <Receipt transaksi={showReceipt} onClose={() => setShowReceipt(null)} />}
    </div>
  );
}