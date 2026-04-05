'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { products as productsApi, type Product } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Download, Lock, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const productId = Number(params.id);

  useEffect(() => {
    productsApi
      .get(productId, token || undefined)
      .then(setProduct)
      .catch(() => router.push('/shop'))
      .finally(() => setLoading(false));
  }, [productId, token, router]);

  const handleBuy = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    setPurchasing(true);
    try {
      const { checkout_url } = await productsApi.checkout(token, productId);
      window.location.href = checkout_url;
    } catch {
      alert('Failed to start checkout.');
      setPurchasing(false);
    }
  };

  const handleDownload = () => {
    if (!token) return;
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/download`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass-card p-8 animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-48 bg-gray-800 rounded mb-4" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="h-48 bg-gradient-to-br from-primary-900/50 to-accent-900/30 flex items-center justify-center">
          <span className="text-6xl">📦</span>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {product.category && (
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{product.category}</span>
            )}
            {product.requires_subscription && (
              <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded">
                Requires {product.subscription_tier} plan
              </span>
            )}
            {product.is_premium && (
              <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">Premium</span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-400 text-sm mb-6 flex items-center gap-3">
            By {product.owner} &middot; {new Date(product.date_posted).toLocaleDateString()}
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {product.view_count}</span>
          </p>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-gray-300 whitespace-pre-line">{product.description}</p>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag) => (
                <span key={tag} className="text-sm bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">{tag.trim()}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-800">
            <span className="text-3xl font-bold text-primary-400">£{product.price.toFixed(2)}</span>

            {product.user_has_purchased || product.user_can_access ? (
              product.download_file ? (
                <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </button>
              ) : (
                <span className="text-green-400 text-sm">✓ Access granted</span>
              )
            ) : product.requires_subscription && !product.user_can_access ? (
              <Link href="/subscriptions" className="btn-primary flex items-center gap-2">
                <Lock className="w-4 h-4" /> Subscribe to Access
              </Link>
            ) : (
              <button onClick={handleBuy} disabled={purchasing} className="btn-primary flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                {purchasing ? 'Redirecting...' : 'Buy Now'}
              </button>
            )}

            {user && (
              <Link href={`/start-chat?product=${product.id}`} className="btn-secondary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Discuss Order
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
