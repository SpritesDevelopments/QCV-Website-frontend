'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { products as productsApi, type Product } from '@/lib/api';
import { Search, Tag } from 'lucide-react';

export default function ShopPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ search, category, page, per_page: 12 })
      .then((data) => {
        setItems(data.products);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-4xl font-bold gradient-text mb-8">Shop</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field md:w-48"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <p className="text-gray-400 text-sm mb-6">{total} product{total !== 1 ? 's' : ''} found</p>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-40 bg-gray-800 rounded-lg mb-4" />
              <div className="h-4 bg-gray-800 rounded mb-2 w-3/4" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="glass-card overflow-hidden hover:border-primary-700 transition-all group cursor-pointer">
                <div className="h-40 bg-gradient-to-br from-primary-900/40 to-gray-900 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-primary-500/50 group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 truncate">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-400">£{product.price.toFixed(2)}</span>
                    {product.requires_subscription && (
                      <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded">
                        {product.subscription_tier}
                      </span>
                    )}
                  </div>
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
