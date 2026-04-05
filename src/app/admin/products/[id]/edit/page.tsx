'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi, products as productsApi, ApiError, Product } from '@/lib/api';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, token, loading } = useAuth();
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'general', tags: '',
    is_instant_download: false, requires_subscription: false,
    subscription_tier: 'basic', is_premium: false, is_hidden: false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    productsApi.get(Number(id))
      .then((p: Product) => {
        setForm({
          name: p.name || '', description: p.description || '',
          price: String(p.price || 0), category: p.category || 'general',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          is_instant_download: !!p.is_instant_download,
          requires_subscription: !!p.requires_subscription,
          subscription_tier: p.subscription_tier || 'basic',
          is_premium: !!p.is_premium,
          is_hidden: !!p.is_hidden,
        });
        setLoaded(true);
      })
      .catch(() => setError('Product not found.'));
  }, [token, id]);

  if (!loading && (!user || !user.is_admin)) { router.push('/'); return null; }
  if (loading || !loaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { tags: tagsStr, price: priceStr, ...rest } = form;
      await adminApi.updateProduct(token!, Number(id), { ...rest, price: parseFloat(priceStr), tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) });
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold gradient-text mb-8">Edit Product</h1>
      <div className="glass-card p-8">
        {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea className="input-field min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Price (£)</label>
              <input type="number" step="0.01" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="label-field">Category</label>
              <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-field">Tags (comma-separated)</label>
            <input className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.is_instant_download} onChange={(e) => setForm({ ...form, is_instant_download: e.target.checked })} />
              Instant Download
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.requires_subscription} onChange={(e) => setForm({ ...form, requires_subscription: e.target.checked })} />
              Requires Subscription
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm({ ...form, is_premium: e.target.checked })} />
              Premium
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={form.is_hidden} onChange={(e) => setForm({ ...form, is_hidden: e.target.checked })} />
              Hidden
            </label>
          </div>
          {form.requires_subscription && (
            <div>
              <label className="label-field">Subscription Tier</label>
              <select className="input-field" value={form.subscription_tier} onChange={(e) => setForm({ ...form, subscription_tier: e.target.value })}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
