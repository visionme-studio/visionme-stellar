"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Pocket {
  id: string;
  name: string;
  balance: number;
  target: number | null;
  created_at: string;
}

export interface PocketInput {
  name?: string;
  target?: number | null;
}

interface PocketsContextValue {
  pockets: Pocket[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createPocket: (input: PocketInput) => Promise<Pocket>;
  updatePocket: (id: string, input: PocketInput) => Promise<Pocket>;
  deletePocket: (id: string) => Promise<void>;
}

const PocketsContext = createContext<PocketsContextValue | undefined>(undefined);

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.error === "string") {
      return data.error;
    }
  } catch {
    // ignore json parsing errors
  }
  return `Failed to ${response.statusText || response.status}`;
}

export function PocketsProvider({ children }: { children: ReactNode }) {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pockets", { credentials: "include" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      const data = await response.json();
      setPockets(data.pockets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPocket = useCallback(async (input: PocketInput) => {
    const response = await fetch("/api/pockets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const data = await response.json();
    const pocket: Pocket = data.pocket;
    setPockets((prev) => [pocket, ...prev]);
    return pocket;
  }, []);

  const updatePocket = useCallback(async (id: string, input: PocketInput) => {
    const response = await fetch(`/api/pockets/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const data = await response.json();
    const pocket: Pocket = data.pocket;
    setPockets((prev) => prev.map((p) => (p.id === id ? pocket : p)));
    return pocket;
  }, []);

  const deletePocket = useCallback(async (id: string) => {
    const response = await fetch(`/api/pockets/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    setPockets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ pockets, loading, error, refresh, createPocket, updatePocket, deletePocket }),
    [pockets, loading, error, refresh, createPocket, updatePocket, deletePocket]
  );

  return <PocketsContext.Provider value={value}>{children}</PocketsContext.Provider>;
}

export function usePockets(): PocketsContextValue {
  const context = useContext(PocketsContext);
  if (!context) {
    throw new Error("usePockets must be used within a PocketsProvider");
  }
  return context;
}
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
