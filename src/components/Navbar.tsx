'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notifications as notifApi } from '@/lib/api';
import { Menu, X, Bell, ShoppingBag, User, Shield, MessageCircle, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (token) {
      notifApi.unreadCount(token).then((r) => setUnread(r.count)).catch(() => {});
      const interval = setInterval(() => {
        notifApi.unreadCount(token).then((r) => setUnread(r.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold gradient-text">
            ⚡ Quantum Code Vault
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-gray-300 hover:text-white transition-colors">
              <ShoppingBag className="inline-block w-4 h-4 mr-1" />Shop
            </Link>
            <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/subscriptions" className="text-gray-300 hover:text-white transition-colors">
              Plans
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/notifications" className="relative text-gray-300 hover:text-white">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>

                <Link href="/my-chats" className="text-gray-300 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </Link>

                {/* Account dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 text-gray-300 hover:text-white">
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user.username}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 py-2 glass-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                      My Account
                    </Link>
                    <Link href="/change-password" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                      Change Password
                    </Link>
                    {user.is_admin && (
                      <>
                        <div className="border-t border-gray-800 my-1" />
                        <Link href="/admin" className="block px-4 py-2 text-sm text-purple-400 hover:bg-gray-800">
                          <Shield className="inline w-3 h-3 mr-1" />Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-800 my-1" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/shop" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/services" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link href="/subscriptions" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Plans</Link>
            <Link href="/about" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>About</Link>
            {user ? (
              <>
                <Link href="/account" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Account</Link>
                <Link href="/notifications" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>
                  Notifications {unread > 0 && `(${unread})`}
                </Link>
                <Link href="/my-chats" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Chats</Link>
                {user.is_admin && (
                  <Link href="/admin" className="block py-2 text-purple-400" onClick={() => setMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="block py-2 text-gray-300" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
