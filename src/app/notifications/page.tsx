'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notifications as notifApi, type Notification } from '@/lib/api';
import { Bell, Check, CheckCheck } from 'lucide-react';

const typeColors: Record<string, string> = {
  info: 'border-blue-700 bg-blue-900/20',
  warning: 'border-yellow-700 bg-yellow-900/20',
  success: 'border-green-700 bg-green-900/20',
  danger: 'border-red-700 bg-red-900/20',
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (token) {
      notifApi.list(token).then(setItems).catch(() => {}).finally(() => setFetching(false));
    }
  }, [user, token, loading, router]);

  const markRead = async (id: number) => {
    if (!token) return;
    await notifApi.markRead(token, id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!token) return;
    await notifApi.markAllRead(token);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {fetching ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card p-4 h-20 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`glass-card p-4 border-l-4 ${typeColors[n.notification_type] || typeColors.info} ${
                !n.is_read ? 'ring-1 ring-primary-800/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="text-primary-400 hover:text-primary-300 shrink-0">
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
