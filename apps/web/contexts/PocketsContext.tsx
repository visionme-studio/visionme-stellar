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
