import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Kendaraan from './pages/Kendaraan';
import TransaksiParkir from './pages/TransaksiParkir';
import SlotParkir from './pages/SlotParkir';
import Booking from './pages/Booking';
import RiwayatParkir from './pages/RiwayatParkir';
import Profile from './pages/Profile';
import Laporan from './pages/Laporan';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kendaraan"
          element={
            <ProtectedRoute>
              <Layout><Kendaraan /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaksi"
          element={
            <ProtectedRoute>
              <Layout><TransaksiParkir /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/slot"
          element={
            <ProtectedRoute>
              <Layout><SlotParkir /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Layout><Booking /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <ProtectedRoute>
              <Layout><RiwayatParkir /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute roles={['admin', 'petugas']}>
              <Layout><Laporan /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <Layout><Users /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
