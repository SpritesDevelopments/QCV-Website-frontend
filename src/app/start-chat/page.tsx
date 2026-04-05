'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { chat as chatApi } from '@/lib/api';

function StartChatForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading } = useAuth();
  const productId = searchParams.get('product');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) { router.push('/login'); return null; }
  if (loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !message.trim()) return;
    setSubmitting(true);
    try {
      let room;
      if (productId) {
        room = await chatApi.startOrder(token, Number(productId), message.trim());
      } else {
        room = await chatApi.startSupport(token, message.trim());
      }
      router.push(`/chat/${room.id}`);
    } catch {
      alert('Failed to start chat.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 animate-fade-in-up">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">
          {productId ? 'Discuss Order' : 'Contact Support'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Your message</label>
            <textarea
              className="input-field min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={productId ? 'Tell us about your requirements...' : 'How can we help?'}
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Starting chat...' : 'Start Chat'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StartChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="text-gray-400">Loading...</div></div>}>
      <StartChatForm />
    </Suspense>
  );
}
