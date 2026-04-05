'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi, ApiError, User } from '@/lib/api';
import { Shield, ShieldOff, Trash2, KeyRound } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminApi.users(token);
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (!loading && (!user || !user.is_admin)) { router.push('/'); return null; }

  const toggleAdmin = async (userId: number) => {
    try {
      await adminApi.toggleAdmin(userId, token!);
      fetchUsers();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to toggle admin.');
    }
  };

  const resetPassword = async (userId: number) => {
    if (!confirm('Reset this user\'s password?')) return;
    try {
      const res = await adminApi.resetUserPassword(userId, token!);
      alert(`New password: ${(res as { new_password: string }).new_password}`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to reset password.');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminApi.deleteUser(userId, token!);
      fetchUsers();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete user.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold gradient-text mb-8">Manage Users</h1>
      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">Admin</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-gray-400">{u.id}</td>
                <td className="p-4 text-white font-medium">{u.username}</td>
                <td className="p-4 text-gray-300">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${u.is_admin ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-700/50 text-gray-400'}`}>
                    {u.is_admin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '-'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => toggleAdmin(u.id)} title={u.is_admin ? 'Remove admin' : 'Make admin'}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors">
                      {u.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                    </button>
                    <button onClick={() => resetPassword(u.id)} title="Reset password"
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors">
                      <KeyRound size={16} />
                    </button>
                    <button onClick={() => deleteUser(u.id)} title="Delete user"
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
