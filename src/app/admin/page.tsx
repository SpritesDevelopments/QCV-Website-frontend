'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi } from '@/lib/api';
import { Users, Package, DollarSign, MessageCircle, Bell, CreditCard, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0, total_products: 0, total_purchases: 0,
    active_subscriptions: 0, active_chats: 0, total_revenue: 0,
  });

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) router.push('/');
    if (token) adminApi.dashboard(token).then(setStats).catch(() => {});
  }, [user, token, loading, router]);

  if (loading || !user?.is_admin) return null;

  const cards = [
    { label: 'Users', value: stats.total_users, icon: <Users className="w-6 h-6" />, color: 'text-blue-400', href: '/admin/users' },
    { label: 'Products', value: stats.total_products, icon: <Package className="w-6 h-6" />, color: 'text-green-400', href: '/admin/products' },
    { label: 'Purchases', value: stats.total_purchases, icon: <DollarSign className="w-6 h-6" />, color: 'text-yellow-400', href: '#' },
    { label: 'Subscriptions', value: stats.active_subscriptions, icon: <CreditCard className="w-6 h-6" />, color: 'text-purple-400', href: '/admin/subscription-plans' },
    { label: 'Active Chats', value: stats.active_chats, icon: <MessageCircle className="w-6 h-6" />, color: 'text-pink-400', href: '/admin/chats' },
    { label: 'Revenue', value: `£${stats.total_revenue.toFixed(2)}`, icon: <BarChart3 className="w-6 h-6" />, color: 'text-emerald-400', href: '#' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold gradient-text mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <div className="glass-card p-6 hover:border-primary-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className={c.color}>{c.icon}</span>
                <span className="text-2xl font-bold">{c.value}</span>
              </div>
              <p className="text-gray-400 text-sm">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/products', label: 'Manage Products', icon: <Package className="w-5 h-5" /> },
          { href: '/admin/users', label: 'Manage Users', icon: <Users className="w-5 h-5" /> },
          { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
          { href: '/admin/subscription-plans', label: 'Subscription Plans', icon: <CreditCard className="w-5 h-5" /> },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="btn-secondary flex items-center gap-2 justify-center">
            {link.icon} {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
