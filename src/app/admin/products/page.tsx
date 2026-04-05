'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { admin as adminApi, type Product } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) router.push('/');
    if (token) adminApi.products(token).then(setProducts).catch(() => {});
  }, [user, token, loading, router]);

  const toggleVisibility = async (id: number) => {
    if (!token) return;
    const { is_hidden } = await adminApi.toggleVisibility(token, id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_hidden } : p)));
  };

  const deleteProduct = async (id: number) => {
    if (!token || !confirm('Delete this product?')) return;
    await adminApi.deleteProduct(token, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading || !user?.is_admin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-center">Views</th>
                <th className="px-4 py-3 text-center">Visible</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">£{p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400">{p.category}</td>
                  <td className="px-4 py-3 text-center">{p.view_count}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleVisibility(p.id)} className="text-gray-400 hover:text-white">
                      {p.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary-400 hover:text-primary-300 inline-block">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
