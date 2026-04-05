'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { chat as chatApi, type ChatRoom, type ChatMessage } from '@/lib/api';
import { Send, XCircle, Download } from 'lucide-react';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMsgId = useRef(0);

  const roomId = Number(params.id);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    chatApi.room(token, roomId).then((data) => {
      setRoom(data.room);
      setMessages(data.messages);
      if (data.messages.length > 0) {
        lastMsgId.current = data.messages[data.messages.length - 1].id;
      }
    }).catch(() => router.push('/my-chats'));
  }, [token, roomId, router]);

  // Polling for new messages
  useEffect(() => {
    if (!token || !room?.is_active) return;
    const interval = setInterval(async () => {
      try {
        const newMsgs = await chatApi.messages(token, roomId, lastMsgId.current);
        if (newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs]);
          lastMsgId.current = newMsgs[newMsgs.length - 1].id;
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [token, roomId, room?.is_active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    setSending(true);
    try {
      const msg = await chatApi.send(token, roomId, input.trim());
      setMessages((prev) => [...prev, msg]);
      lastMsgId.current = msg.id;
      setInput('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleClose = async () => {
    if (!token) return;
    await chatApi.close(token, roomId);
    router.push('/my-chats');
  };

  if (loading || !user || !room) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="glass-card p-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{room.name}</h1>
          <span className="text-xs text-gray-400">{room.room_type} chat</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${roomId}/transcript`}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Transcript
          </a>
          {room.is_active && (
            <button onClick={handleClose} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs">
              <XCircle className="w-4 h-4" /> Close
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="glass-card p-4 h-[500px] overflow-y-auto space-y-3 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
              msg.is_admin
                ? 'bg-gray-800 text-gray-200'
                : 'bg-primary-700 text-white'
            }`}>
              <p className="text-xs font-medium mb-0.5 opacity-70">{msg.user?.username || 'Unknown'}</p>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {room.is_active ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-4">
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-500 py-4">This chat has been closed.</div>
      )}
    </div>
  );
}
