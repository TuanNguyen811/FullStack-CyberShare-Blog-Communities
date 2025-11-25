import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Users, Search, Shield, Ban, CheckCircle, 
  ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 20);
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);

      const response = await apiClient.get(`/api/admin/users?${params}`);
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await apiClient.put(`/api/admin/users/${userId}/status`, { status });
      fetchUsers();
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await apiClient.put(`/api/admin/users/${userId}/role`, { role });
      fetchUsers();
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and account status</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} 
                        alt={u.username}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.displayName || u.username}</div>
                        <div className="text-sm text-gray-500">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.email}
                    {u.emailVerified && <CheckCircle className="inline ml-1 h-4 w-4 text-green-500" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      u.status === 'BANNED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.authProvider || 'local'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {actionMenuOpen === u.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            {u.status === 'ACTIVE' ? (
                              <button
                                onClick={() => updateUserStatus(u.id, 'BANNED')}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserStatus(u.id, 'ACTIVE')}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate User
                              </button>
                            )}
                            {u.role === 'USER' ? (
                              <button
                                onClick={() => updateUserRole(u.id, 'ADMIN')}
                                className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-gray-100"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserRole(u.id, 'USER')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Remove Admin
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
