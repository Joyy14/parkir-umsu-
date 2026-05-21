import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  ParkingSquare,
  CalendarCheck,
  FileText,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardList,
  Clock,
  User,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'petugas', 'user'] },
  { path: '/kendaraan', label: 'Kendaraan', icon: Car, roles: ['admin', 'petugas', 'user'] },
  { path: '/transaksi', label: 'Parkir', icon: ClipboardList, roles: ['admin', 'petugas', 'user'] },
  { path: '/slot', label: 'Slot Parkir', icon: ParkingSquare, roles: ['admin', 'petugas', 'user'] },
  { path: '/booking', label: 'Booking', icon: CalendarCheck, roles: ['admin', 'petugas', 'user'] },
  { path: '/riwayat', label: 'Riwayat Parkir', icon: Clock, roles: ['admin', 'petugas', 'user'] },
  { path: '/laporan', label: 'Laporan', icon: FileText, roles: ['admin', 'petugas'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['admin', 'petugas', 'user'] },
  { path: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
];

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <ParkingSquare className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Parkir UMSU</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {profile?.nama_lengkap?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 truncate max-w-[140px]">
                  {profile?.nama_lengkap || 'User'}
                </p>
                <p className="text-gray-500 capitalize">{profile?.role || '-'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <ParkingSquare className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold">Parkir UMSU</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
