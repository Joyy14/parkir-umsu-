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
  ChevronRight,
  Bell,
  Search,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'petugas', 'user'] },
  { path: '/kendaraan', label: 'Kendaraan', icon: Car, roles: ['admin', 'petugas', 'user'] },
  { path: '/transaksi', label: 'Parkir', icon: ClipboardList, roles: ['admin', 'petugas', 'user'] },
  { path: '/slot', label: 'Slot Parkir', icon: ParkingSquare, roles: ['admin', 'petugas', 'user'] },
  { path: '/booking', label: 'Booking', icon: CalendarCheck, roles: ['admin', 'petugas', 'user'] },
  { path: '/riwayat', label: 'Riwayat', icon: Clock, roles: ['admin', 'petugas', 'user'] },
  { path: '/laporan', label: 'Laporan', icon: FileText, roles: ['admin', 'petugas'] },
  { path: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['admin', 'petugas', 'user'] },
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

  const currentPage = filteredNav.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
            <ParkingSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 block leading-tight">Parkir UMSU</span>
            <span className="text-[10px] text-gray-400 font-medium">Smart Parking System</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={isActive ? 'nav-item-active' : 'nav-item-inactive'}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto text-primary-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {profile?.nama_lengkap?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile?.nama_lengkap || 'User'}
              </p>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium capitalize">
                {profile?.role || '-'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 -ml-2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <LayoutDashboard className="h-4 w-4" />
                <span className="font-medium text-gray-900">
                  {currentPage?.label || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/profile"
                className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm"
              >
                <span className="text-white text-xs font-bold">
                  {profile?.nama_lengkap?.charAt(0) || 'U'}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
