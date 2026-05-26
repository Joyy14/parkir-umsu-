import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, kendaraanAPI } from '../services/api';
import { User, Save, Lock, AlertCircle, QrCode, Camera, Mail, Phone, CreditCard, Car, Bike, Plus, Trash2 } from 'lucide-react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nama_lengkap: profile?.nama_lengkap || '', nip_npm: profile?.nip_npm || '', no_hp: profile?.no_hp || '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [kendaraan, setKendaraan] = useState([]);
  const [kendaraanLoading, setKendaraanLoading] = useState(false);
  const [showAddKendaraan, setShowAddKendaraan] = useState(false);
  const [kendaraanForm, setKendaraanForm] = useState({ plat_nomor: '', merek: '', model: '', warna: '', tipe: 'motor' });

  useEffect(() => { if (profile?.id) fetchKendaraan(); }, [profile?.id]);

  const fetchKendaraan = async () => {
    setKendaraanLoading(true);
    try { const { data } = await kendaraanAPI.getAll({ pemilik_id: profile.id, limit: 50 }); setKendaraan(data?.data || []); }
    catch {} finally { setKendaraanLoading(false); }
  };

  const handleAddKendaraan = async (e) => {
    e.preventDefault();
    if (!kendaraanForm.plat_nomor || !kendaraanForm.merek) { toast.error('Plat nomor dan merek harus diisi'); return; }
    try {
      await kendaraanAPI.create({ ...kendaraanForm, plat_nomor: kendaraanForm.plat_nomor.toUpperCase(), pemilik_id: profile.id });
      toast.success('Kendaraan berhasil ditambahkan');
      setShowAddKendaraan(false);
      setKendaraanForm({ plat_nomor: '', merek: '', model: '', warna: '', tipe: 'motor' });
      fetchKendaraan();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menambahkan kendaraan'); }
  };

  const handleDeleteKendaraan = async (id) => {
    if (!confirm('Yakin ingin menghapus kendaraan ini?')) return;
    try { await kendaraanAPI.delete(id); toast.success('Kendaraan berhasil dihapus'); fetchKendaraan(); }
    catch { toast.error('Gagal menghapus kendaraan'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await authAPI.updateProfile(form); await fetchProfile(); toast.success('Profile berhasil diupdate'); }
    catch (err) { setError(err.response?.data?.message || 'Gagal update profile'); } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPasswordLoading(true); setError('');
    if (passwordForm.newPassword.length < 6) { setError('Password minimal 6 karakter'); setPasswordLoading(false); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setError('Password tidak cocok'); setPasswordLoading(false); return; }
    try { await authAPI.changePassword({ password: passwordForm.newPassword }); toast.success('Password berhasil diubah'); setPasswordForm({ newPassword: '', confirmPassword: '' }); }
    catch (err) { setError(err.response?.data?.message || 'Gagal mengubah password'); } finally { setPasswordLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Kelola data diri dan password</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-md shadow-primary-200">
            <span className="text-2xl text-white font-bold">{profile?.nama_lengkap?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile?.nama_lengkap}</h2>
            <p className="text-sm text-gray-400">{profile?.email}</p>
            <span className="inline-block mt-1.5 badge bg-primary-50 text-primary-700 border border-primary-200 capitalize">{profile?.role}</span>
          </div>
        </div>

        <div className="mb-6 p-5 bg-gray-50 rounded-2xl flex flex-col items-center">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-primary-600" /> QR Identitas
          </p>
          <QRCode value={JSON.stringify({ type: 'user', user_id: profile?.id, nama: profile?.nama_lengkap })} size={140} level="M" />
          <p className="text-xs text-gray-400 mt-2">Scan untuk check-in cepat</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className="input-field pl-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NIP/NPM</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={form.nip_npm} onChange={(e) => setForm({ ...form, nip_npm: e.target.value })} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No. HP</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="input-field pl-11" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="h-4 w-4" /> {loading ? 'Menyimpan...' : 'Simpan Profile'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Car className="h-5 w-5 text-primary-600" /> Kendaraan Saya
          </h3>
          <button onClick={() => setShowAddKendaraan(true)} className="btn-primary btn-sm">
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
        {kendaraanLoading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary-500 border-t-transparent"></div></div>
        ) : kendaraan.length === 0 ? (
          <div className="text-center py-6">
            <Car className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">Belum ada kendaraan terdaftar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {kendaraan.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${v.tipe === 'motor' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                    {v.tipe === 'motor' ? <Bike className="h-4 w-4 text-blue-600" /> : <Car className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{v.plat_nomor}</p>
                    <p className="text-xs text-gray-400">{v.merek}{v.model ? ` - ${v.model}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteKendaraan(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {showAddKendaraan && (
          <div className="modal-overlay" onClick={() => setShowAddKendaraan(false)}>
            <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Tambah Kendaraan</h3>
              <form onSubmit={handleAddKendaraan} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                  <input type="text" value={kendaraanForm.plat_nomor} onChange={(e) => setKendaraanForm({ ...kendaraanForm, plat_nomor: e.target.value })} className="input-field" placeholder="BK 1234 AB" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                    <input type="text" value={kendaraanForm.merek} onChange={(e) => setKendaraanForm({ ...kendaraanForm, merek: e.target.value })} className="input-field" placeholder="Honda" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input type="text" value={kendaraanForm.model} onChange={(e) => setKendaraanForm({ ...kendaraanForm, model: e.target.value })} className="input-field" placeholder="Vario" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                    <input type="text" value={kendaraanForm.warna} onChange={(e) => setKendaraanForm({ ...kendaraanForm, warna: e.target.value })} className="input-field" placeholder="Hitam" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select value={kendaraanForm.tipe} onChange={(e) => setKendaraanForm({ ...kendaraanForm, tipe: e.target.value })} className="input-field">
                      <option value="motor">Motor</option>
                      <option value="mobil">Mobil</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">Simpan</button>
                  <button type="button" onClick={() => setShowAddKendaraan(false)} className="btn-secondary flex-1">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-gray-400" /> Ubah Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input-field pl-11" placeholder="Minimal 6 karakter" autoComplete="new-password" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input-field pl-11" placeholder="Ulangi password" autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" disabled={passwordLoading} className="btn-primary">
            <Lock className="h-4 w-4" /> {passwordLoading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
