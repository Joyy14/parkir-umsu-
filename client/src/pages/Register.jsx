import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ParkingSquare, UserPlus, AlertCircle, Mail, Lock, User, Phone, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    nama_lengkap: '', nip_npm: '', no_hp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.nama_lengkap) {
      setError('Email, password, dan nama lengkap harus diisi'); return;
    }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok'); return; }

    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, nama_lengkap: form.nama_lengkap, nip_npm: form.nip_npm, no_hp: form.no_hp });
      toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registrasi gagal';
      setError(message); toast.error(message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <ParkingSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Parkir UMSU</h1>
          <p className="text-gray-500 mt-1">Universitas Muhammadiyah Sumatera Utara</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary-600" />
            Daftar Akun
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} className="input-field pl-11" placeholder="Masukkan nama lengkap" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field pl-11" placeholder="Masukkan email" autoComplete="email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">NIP/NPM</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" name="nip_npm" value={form.nip_npm} onChange={handleChange} className="input-field pl-11" placeholder="NIP/NPM" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">No. HP</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} className="input-field pl-11" placeholder="No. HP" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field pl-11" placeholder="Minimal 6 karakter" autoComplete="new-password" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field pl-11" placeholder="Ulangi password" autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <><UserPlus className="h-4 w-4" /><span>Daftar</span></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
