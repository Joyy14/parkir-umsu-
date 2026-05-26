import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Users as UsersIcon, Shield, UserCog, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const roleIcons = { admin: Shield, petugas: UserCog, user: User };
const roleColors = { admin: 'badge bg-purple-50 text-purple-700 border border-purple-200', petugas: 'badge bg-blue-50 text-blue-700 border border-blue-200', user: 'badge bg-gray-100 text-gray-600 border border-gray-200' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const { data } = await authAPI.getUsers(); setUsers(data || []); }
    catch (error) { toast.error('Gagal memuat data pengguna'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Pengguna</h1>
        <p className="page-subtitle">Manajemen pengguna sistem parkir UMSU</p>
      </div>

      {users.length === 0 ? (
        <div className="card text-center py-16">
          <UsersIcon className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Belum ada pengguna</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role] || User;
            return (
              <div key={user.id} className="card card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">{user.nama_lengkap?.charAt(0) || '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{user.nama_lengkap}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email || '-'}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">NIP/NPM</span>
                    <span className="font-medium text-gray-700">{user.nip_npm || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">No. HP</span>
                    <span className="font-medium text-gray-700">{user.no_hp || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Bergabung</span>
                    <span className="font-medium text-gray-700">{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <span className={`inline-flex items-center gap-1.5 ${roleColors[user.role]}`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
