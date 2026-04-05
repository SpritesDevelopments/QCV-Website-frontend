'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { auth as authApi, type User, type AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const storeTokens = (data: AuthResponse) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem('access_token');
    if (!t) return;
    try {
      const u = await authApi.me(t);
      setUser(u);
    } catch {
      // token may be expired, try refresh
      const rt = localStorage.getItem('refresh_token');
      if (rt) {
        try {
          const { access_token } = await authApi.refresh(rt);
          localStorage.setItem('access_token', access_token);
          setToken(access_token);
          const u = await authApi.me(access_token);
          setUser(u);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    const t = localStorage.getItem('access_token');
    if (t) {
      setToken(t);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    storeTokens(data);
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    const data = await authApi.register({ username, email, password, confirm_password: confirmPassword });
    storeTokens(data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
