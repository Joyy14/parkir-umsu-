import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { ParkingSquare, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email harus diisi'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Link reset password dikirim ke email');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim email reset');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <ParkingSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-gray-500 mt-1">Sistem Parkir UMSU</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          {sent ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Link reset password telah dikirim ke <strong className="text-gray-700">{email}</strong>.
              </p>
              <Link to="/login" className="btn-primary">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan email Anda, kami akan mengirimkan link untuk mereset password.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-11" placeholder="Masukkan email" autoComplete="email" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <><Mail className="h-4 w-4" /><span>Kirim Link Reset</span></>}
                </button>
              </form>
              <p className="mt-6 text-center">
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5 font-medium">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
