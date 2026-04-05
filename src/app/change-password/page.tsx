'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth as authApi, ApiError } from '@/lib/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!loading && !user) { router.push('/login'); return null; }
  if (loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPw !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      await authApi.changePassword(token!, { current_password: current, new_password: newPw, confirm_password: confirm });
      router.push('/account');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">Change Password</h1>
        {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Current Password</label>
            <input type="password" className="input-field" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">New Password</label>
            <input type="password" className="input-field" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label className="label-field">Confirm New Password</label>
            <input type="password" className="input-field" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
