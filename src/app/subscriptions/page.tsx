'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  subscriptions as subApi,
  type SubscriptionPlan,
  type UserSubscription,
} from '@/lib/api';
import { Check, Crown, Zap } from 'lucide-react';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<UserSubscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    subApi.plans().then(setPlans).catch(() => {}).finally(() => setLoadingPlans(false));
    if (token) {
      subApi.mySubscription(token).then((r) => setCurrent(r.subscription)).catch(() => {});
    }
  }, [token]);

  const handleSubscribe = async (planId: number) => {
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const { checkout_url } = await subApi.subscribe(token, planId);
      window.location.href = checkout_url;
    } catch {
      alert('Failed to start checkout.');
    }
  };

  const handleCancel = async () => {
    if (!token) return;
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    await subApi.cancel(token);
    setCurrent(null);
  };

  const handleManage = async () => {
    if (!token) return;
    try {
      const { url } = await subApi.manage(token);
      window.location.href = url;
    } catch {
      alert('Could not open billing portal.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Subscription Plans</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Get unlimited access to our library of premium code, templates, and tools.
        </p>
      </div>

      {/* Current subscription */}
      {current && (
        <div className="glass-card p-6 mb-10 max-w-2xl mx-auto border-primary-700">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Current Plan: {current.plan.name}</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Status: <span className="text-green-400">{current.status}</span>
            {current.next_billing_date && ` · Next billing: ${new Date(current.next_billing_date).toLocaleDateString()}`}
          </p>
          <div className="flex gap-3">
            <button onClick={handleManage} className="btn-secondary text-sm">Manage Billing</button>
            <button onClick={handleCancel} className="text-sm text-red-400 hover:text-red-300">Cancel</button>
          </div>
        </div>
      )}

      {/* Plans grid */}
      {loadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card p-8 h-80 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isCurrentPlan = current?.plan.id === plan.id;
            const isPop = i === 1; // Middle plan highlighted
            return (
              <div
                key={plan.id}
                className={`glass-card p-8 flex flex-col ${
                  isPop ? 'border-primary-600 ring-2 ring-primary-600/30' : ''
                }`}
              >
                {isPop && (
                  <div className="text-center mb-2">
                    <span className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">£{plan.price.toFixed(2)}</span>
                  <span className="text-gray-400">/{plan.billing_cycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Zap className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                    {plan.max_downloads_per_month} downloads/month
                  </li>
                </ul>
                {isCurrentPlan ? (
                  <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <button onClick={() => handleSubscribe(plan.id)} className={`w-full ${isPop ? 'btn-primary' : 'btn-secondary'}`}>
                    Subscribe
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
