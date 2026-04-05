'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { chat as chatApi, type ChatRoom } from '@/lib/api';
import { MessageCircle, Clock } from 'lucide-react';

export default function MyChatsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (token) {
      chatApi.rooms(token).then(setRooms).catch(() => {});
    }
  }, [user, token, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">My Chats</h1>
        <Link href="/start-chat" className="btn-primary text-sm">New Chat</Link>
      </div>

      {rooms.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>No active chats. Start a support or order chat!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <div className="glass-card p-4 hover:border-primary-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{room.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(room.created_at).toLocaleDateString()}
                      <span className="mx-1">·</span>
                      {room.message_count} messages
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    room.room_type === 'order' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'
                  }`}>
                    {room.room_type}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
