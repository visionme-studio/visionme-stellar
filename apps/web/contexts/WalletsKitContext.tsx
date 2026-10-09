import { createContext, FunctionalComponent, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { WalletsK } from '@nordickastle/wallets-kit';
import type { Wallet } from '@nordickastle/wallets-kit';

export interface WalletsKetContextValue {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletsKetContext = createContext<WalletsKetContextValue | undefined>(undefined);

export const useWalletsKet = (): WalletsKetContextValue => {
  const ctx = useContext(WalletsKetContext);
  if (!ctx) {
    throw new Error('useWalletsKet must be used within a WalletsKetProvider');
  }
  return ctx;
};

export interface WalletsKetProviderProps {
  children: ReactNode;
}

export const WalletsKetProvider: FunctionalComponent<WalletsKetProviderProps> = ({ children }) => {
  const kitRef = useRef<WalletsK | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);

  if (!kitRef.current) {
    kitRef.current = new WalletsK();
  }

  const connect = useCallback(async (walletId: string) => {
    const kit = kitRef.current;
    if (!kit) return;
    await kit.setWallet(walletId);
    const next = kit.getWallet();
    setActiveWallet(next);
  }, []);

  const disconnect = useCallback(async () => {
    const kit = kitRef.current;
    if (!kit) return;
    await kit.disconnect();
    setActiveWallet(null);
  }, []);

  useEffect(() => {
    const kit = kitRef.current;
    if (!kit) return;
    let cancelled = false;
    const run = async () => {
      const available = await kit.getWallets();
      if (cancelled) return;
      setWallets(available);
      const stored = kit.getStoredWalletId();
      if (stored) {
        await kit.setWallet(stored);
        if (cancelled) return;
        setActiveWallet(kit.getWallet());
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ wallets, activeWallet, connect, disconnect }),
    [wallets, activeWallet, connect, disconnect],
  );

  return <WalletsKetContext.Provider value={value}>{children}</WalletsKetContext.Provider>;
};
