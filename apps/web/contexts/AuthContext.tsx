import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

export interface User {
  id: string;
  email?: string;
  walletAddress?: string;
  username?: string;
  avatar?: string;
  crossmintUserId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  loginWithCrossmint: (crossmintToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const TOKEN_STORAGE_KEY = 'visionme.auth.token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function parseJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const persistToken = useCallback((value: string | null) => {
    setToken(value);
    if (typeof window !== 'undefined') {
      if (value) window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
      else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken =
      token ??
      (typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null);
    if (!activeToken) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/user', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (!response.ok) {
        throw new Error((await parseJson(response))?.error ?? 'Failed to load user');
      }
      const data = await parseJson(response);
      setUser((data?.user ?? data ?? null) as User | null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loginWithCrossmint = useCallback(async (crossmintToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: crossmintToken }),
      });
      const data = await parseJson(response);
      if (!response.ok) {
        throw new Error(data?.error ?? 'Crossmint login failed');
      }
      const nextToken = data?.token ?? data?.jwt;
      if (!nextToken) throw new Error('Auth callback did not return a token');
      persistToken(nextToken);
      setUser((data?.user ?? null) as User | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      persistToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistToken]);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
    setError(null);
  }, [persistToken]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void refreshUser();
    }
  }, [token, refreshUser]);

  const value = useMemo(
    () => ({ user, token, loading, error, loginWithCrossmint, logout, refreshUser }),
    [user, token, loading, error, loginWithCrossmint, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
