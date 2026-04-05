'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth as authApi, uploads, ApiError } from '@/lib/api';
import Link from 'next/link';
import { Camera, Save } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, token, loading, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setUsername(user.username);
      setEmail(user.email || '');
    }
  }, [user, loading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await authApi.updateProfile(token!, { username, email });
      await refreshUser();
      setMessage('Profile updated.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      await uploads.profilePicture(token, file);
      await refreshUser();
    } catch {
      setError('Failed to upload picture.');
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold gradient-text mb-8">My Account</h1>

      <div className="glass-card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-900/50 flex items-center justify-center text-3xl font-bold text-primary-400 overflow-hidden">
              {user.image_file && user.image_file !== 'default.jpg' ? (
                <img
                  src={uploads.imageUrl('profile_pics', user.image_file)}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-500">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePicture} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs">Joined {new Date(user.date_created).toLocaleDateString()}</p>
          </div>
        </div>

        {message && <div className="bg-green-900/30 border border-green-800 text-green-300 rounded-lg p-3 mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label-field">Username</label>
            <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap gap-3">
          <Link href="/change-password" className="btn-secondary text-sm">Change Password</Link>
          <Link href="/delete-account" className="text-sm text-red-400 hover:text-red-300 py-2 px-4">
            Delete Account
          </Link>
        </div>
      </div>
    </div>
  );
}
