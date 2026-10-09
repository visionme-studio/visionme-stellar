import { useCallback, useState } from 'react';

export interface CrossmintUser {
  id: string;
  email?: string;
  walletAddress?: string;
}

export interface UseCrossmintAuthResult {
  user: CrossmintUser | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useCrossmintAuth(): UseCrossmintAuthResult {
  const [user, setUser] = useState<CrossmintUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/crossmint/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error(`Crossmint sign-in failed with status ${response.status}`);
      }
      const data = (await response.json()) as CrossmintUser;
      setUser(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Crossmint sign-in failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/crossmint/signout', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Crossmint sign-out failed with status ${response.status}`);
      }
      setUser(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Crossmint sign-out failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading, error, signIn, signOut };
}
