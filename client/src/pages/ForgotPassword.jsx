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

    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Link reset password dikirim ke email');
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal mengirim email reset';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <ParkingSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-gray-500 mt-1">Sistem Parkir UMSU</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-gray-500 mb-6">
                Link reset password telah dikirim ke <strong>{email}</strong>. Silakan cek email Anda.
              </p>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan email Anda, kami akan mengirimkan link untuk mereset password.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Masukkan email"
                    autoComplete="email"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Kirim Link Reset</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1">
                  <ArrowLeft className="h-3 w-3" />
                  <span>Kembali ke Login</span>
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
