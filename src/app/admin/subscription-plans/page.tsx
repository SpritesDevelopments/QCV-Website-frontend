'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi, ApiError, SubscriptionPlan } from '@/lib/api';
import { ToggleLeft, ToggleRight, Trash2, Plus, Pencil } from 'lucide-react';

export default function AdminSubscriptionPlansPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', billing_cycle: 'monthly',
    stripe_price_id: '', features: '', max_downloads: '50',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPlans = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminApi.subscriptionPlans(token);
      setPlans(data);
    } catch {
      setError('Failed to load plans.');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  if (!loading && (!user || !user.is_admin)) { router.push('/'); return null; }

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', billing_cycle: 'monthly', stripe_price_id: '', features: '', max_downloads: '50' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setForm({
      name: plan.name, description: plan.description || '',
      price: String(plan.price), billing_cycle: plan.billing_cycle || 'monthly',
      stripe_price_id: plan.stripe_price_id || '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
      max_downloads: String(plan.max_downloads_per_month || 50),
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      max_downloads: parseInt(form.max_downloads),
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await adminApi.updatePlan(token!, editingId, payload);
      } else {
        await adminApi.createPlan(token!, payload);
      }
      resetForm();
      fetchPlans();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await adminApi.togglePlan(token!, id);
      fetchPlans();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to toggle plan.');
    }
  };

  const deletePlan = async (id: number) => {
    if (!confirm('Delete this subscription plan?')) return;
    try {
      await adminApi.deletePlan(token!, id);
      fetchPlans();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete plan.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Subscription Plans</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Plan
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editingId ? 'Edit Plan' : 'Create Plan'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Stripe Price ID</label>
                <input className="input-field" value={form.stripe_price_id} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea className="input-field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label-field">Price (£)</label>
                <input type="number" step="0.01" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Billing Cycle</label>
                <select className="input-field" value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="label-field">Max Downloads/Month</label>
                <input type="number" className="input-field" value={form.max_downloads} onChange={(e) => setForm({ ...form, max_downloads: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label-field">Features (one per line)</label>
              <textarea className="input-field min-h-[80px]" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Cycle</th>
              <th className="p-4">Max DL</th>
              <th className="p-4">Active</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : plans.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No plans found.</td></tr>
            ) : plans.map((plan) => (
              <tr key={plan.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-white font-medium">{plan.name}</td>
                <td className="p-4 text-gray-300">£{plan.price}</td>
                <td className="p-4 text-gray-400">{plan.billing_cycle}</td>
                <td className="p-4 text-gray-400">{plan.max_downloads_per_month || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${plan.is_active ? 'bg-green-900/50 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(plan)} title="Edit"
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => toggleActive(plan.id)} title="Toggle active"
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors">
                      {plan.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => deletePlan(plan.id)} title="Delete"
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
