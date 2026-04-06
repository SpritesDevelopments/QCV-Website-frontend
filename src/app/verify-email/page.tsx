'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailPromptPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up">
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 bg-primary-900/30 border-2 border-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold gradient-text mb-2">Check Your Email</h1>
        <p className="text-gray-400 mb-6">
          We&apos;ve sent a verification link to your email address. Click the link to verify your account.
        </p>

        {sent ? (
          <div className="bg-green-900/30 border border-green-800 text-green-300 rounded-lg p-4 mb-4">
            Verification email sent! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-4 text-left">
            <div>
              <label className="label-field">Didn&apos;t receive it? Enter your email:</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </form>
        )}

        <div className="mt-6 space-y-2 text-sm text-gray-400">
          <p>
            <Link href="/account" className="text-primary-400 hover:underline">
              Continue to Account
            </Link>
          </p>
          <p>
            <Link href="/login" className="text-primary-400 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
