'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth as authApi, ApiError } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!loading && !user) { router.push('/login'); return null; }
  if (loading) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDeleting(true);
    try {
      await authApi.deleteAccount(token!, password);
      logout();
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up">
      <div className="glass-card p-8 border-red-900/50">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl font-bold text-red-400">Delete Account</h1>
        </div>
        <p className="text-gray-400 mb-6">
          This action is <strong className="text-red-400">permanent</strong> and cannot be undone.
          All your data, purchases, and chats will be deleted.
        </p>
        {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="label-field">Confirm your password</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={deleting} className="btn-danger w-full">
            {deleting ? 'Deleting...' : 'Permanently Delete My Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
