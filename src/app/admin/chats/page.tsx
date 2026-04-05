'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi, type ChatRoom } from '@/lib/api';
import { MessageSquare } from 'lucide-react';

export default function AdminChatsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminApi.chats(token);
      setChats(data);
    } catch { /* ignore */ }
    finally { setFetching(false); }
  }, [token]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  if (!loading && (!user || !user.is_admin)) { router.push('/'); return null; }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold gradient-text mb-8">All Chats</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">User</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : chats.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No chats found.</td></tr>
            ) : chats.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-gray-400">{c.id}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${c.room_type === 'order' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'}`}>
                    {c.room_type}
                  </span>
                </td>
                <td className="p-4 text-white">{c.user?.username || `User #${c.user?.id}`}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${!c.is_active ? 'bg-gray-700/50 text-gray-400' : 'bg-green-900/50 text-green-300'}`}>
                    {c.is_active ? 'Open' : 'Closed'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
                <td className="p-4">
                  <Link href={`/chat/${c.id}`} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors inline-flex">
                    <MessageSquare size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
