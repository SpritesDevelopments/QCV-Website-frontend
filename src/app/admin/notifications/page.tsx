'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi, ApiError, Notification } from '@/lib/api';
import { ToggleLeft, ToggleRight, Trash2, Plus } from 'lucide-react';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', message: '', type: 'info', priority: 'normal',
    is_global: true, expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminApi.notifications(token);
      setNotifications(data);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  if (!loading && (!user || !user.is_admin)) { router.push('/'); return null; }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.createNotification(token!, form as never);
      setShowForm(false);
      setForm({ title: '', message: '', type: 'info', priority: 'normal', is_global: true, expires_at: '' });
      fetchNotifications();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create notification.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await adminApi.toggleNotification(id, token!);
      fetchNotifications();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to toggle notification.');
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await adminApi.deleteNotification(id, token!);
      fetchNotifications();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete notification.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Notification</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label-field">Title</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label-field">Message</label>
              <textarea className="input-field min-h-[80px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-field">Type</label>
                <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="label-field">Priority</label>
                <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="label-field">Expires At</label>
                <input type="datetime-local" className="input-field" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.is_global} onChange={(e) => setForm({ ...form, is_global: e.target.checked })} />
              Global notification (visible to all users)
            </label>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Global</th>
              <th className="p-4">Active</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No notifications.</td></tr>
            ) : notifications.map((n) => (
              <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-white font-medium">{n.title}</td>
                <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-blue-900/50 text-blue-300">{(n as Record<string, unknown>).type as string || 'info'}</span></td>
                <td className="p-4 text-gray-300">{(n as Record<string, unknown>).priority as string || 'normal'}</td>
                <td className="p-4 text-gray-400">{(n as Record<string, unknown>).is_global ? 'Yes' : 'No'}</td>
                <td className="p-4 text-gray-400">{(n as Record<string, unknown>).is_active ? 'Yes' : 'No'}</td>
                <td className="p-4 text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleDateString() : '-'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(n.id)} title="Toggle active"
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors">
                      {(n as Record<string, unknown>).is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => deleteNotification(n.id)} title="Delete"
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
