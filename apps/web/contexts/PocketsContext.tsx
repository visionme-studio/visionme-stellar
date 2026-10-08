import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';

export interface Pocket {
  id: string;
  owner: string;
  asset: string;
  goalAmount: number;
  name: string;
  currency: string;
  emoji?: string;
}

export interface CreatePocketData {
  owner: string;
  asset: string;
  goalAmount: number;
  name: string;
  currency: string;
  emoji?: string;
}

export interface PocketsContextValue {
  pockets: Pocket[];
  loading: boolean;
  error: string | null;
  createPocket: (data: CreatePocketData) => Promise<Pocket>;
  refreshPockets: () => Promise<void>;
}

export const PocketsContext = createContext<PocketsContextValue | undefined>(
  undefined,
);

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.error === 'string' && body.error.length > 0) {
      return body.error;
    }
    if (body && typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // fall through to generic message
  }
  return `Failed to create pocket (${response.status})`;
}

export const PocketsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPockets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/pockets');
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      const data = await response.json();
      setPockets(Array.isArray(data) ? data : data.pockets ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPocket = useCallback(async (data: CreatePocketData): Promise<Pocket> => {
    setError(null);
    const response = await fetch('/api/pockets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const message = await parseError(response);
      setError(message);
      throw new Error(message);
    }
    const created = (await response.json()) as Pocket;
    setPockets((prev) => [...prev, created]);
    return created;
  }, []);

  return (
    <PocketsContext.Provider
      value={{ pockets, loading, error, createPocket, refreshPockets }}
    >
      {children}
    </PocketsContext.Provider>
  );
};

export function usePockets(): PocketsContextValue {
  const ctx = React.useContext(PocketsContext);
  if (!ctx) {
    throw new Error('usePockets must be used within a PocketsProvider');
  }
  return ctx;
}
