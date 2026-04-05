'use client';

import { useState } from 'react';
import { auth } from '@/lib/api';
import Link from 'next/link';

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await auth.requestReset(email).catch(() => {});
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">Reset Password</h1>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-900/30 border border-green-800 text-green-300 rounded-lg p-4">
              If that email is registered, a reset link has been sent. Check your inbox.
            </div>
            <Link href="/login" className="text-primary-400 hover:underline text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Email Address</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-400">
              <Link href="/login" className="text-primary-400 hover:underline">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
