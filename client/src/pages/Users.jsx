import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Users as UsersIcon, Shield, UserCog, User } from 'lucide-react';
import toast from 'react-hot-toast';

const roleIcons = {
  admin: Shield,
  petugas: UserCog,
  user: User,
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  petugas: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await authAPI.getUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
        <p className="text-gray-500 mt-1">Manajemen pengguna sistem</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nama</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">NIP/NPM</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">No. HP</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  Belum ada pengguna
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const RoleIcon = roleIcons[user.role] || User;
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.nama_lengkap?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{user.nama_lengkap}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{user.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{user.nip_npm || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{user.no_hp || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        <RoleIcon className="h-3 w-3" />
                        <span className="capitalize">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
