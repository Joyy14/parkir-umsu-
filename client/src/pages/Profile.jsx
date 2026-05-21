import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Save, Lock, AlertCircle, QrCode } from 'lucide-react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, fetchProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nama_lengkap: profile?.nama_lengkap || '',
    nip_npm: profile?.nip_npm || '',
    no_hp: profile?.no_hp || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.updateProfile(form);
      await fetchProfile();
      toast.success('Profile berhasil diupdate');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');

    if (passwordForm.newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Password tidak cocok');
      setPasswordLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({ password: passwordForm.newPassword });
      toast.success('Password berhasil diubah');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Kelola data diri dan password</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {profile?.nama_lengkap?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile?.nama_lengkap}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
              {profile?.role}
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-xl flex flex-col items-center">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <QrCode className="h-4 w-4 mr-1" /> QR Identitas
          </p>
          <QRCode
            value={JSON.stringify({ type: 'user', user_id: profile?.id, nama: profile?.nama_lengkap })}
            size={140}
            level="M"
          />
          <p className="text-xs text-gray-400 mt-2">Scan untuk check-in cepat</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP/NPM</label>
              <input
                type="text"
                value={form.nip_npm}
                onChange={(e) => setForm({ ...form, nip_npm: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input
                type="text"
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Profile'}</span>
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-gray-500" />
          Ubah Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field"
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Ulangi password"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={passwordLoading} className="btn-primary flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>{passwordLoading ? 'Menyimpan...' : 'Ubah Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
