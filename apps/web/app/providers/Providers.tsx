"use client";

import type { ReactNode } from "react";
import { CrossmintProvider } from "@crossmint/sdk/client";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";
import { SorobanProvider } from "@/contexts/SorobanProvider";
import { WalletsKitProvider } from "@/contexts/WalletsKitProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { PocketsProvider } from "@/contexts/PocketsProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CrossmintProvider>
      <SupabaseProvider>
        <SorobanProvider>
          <WalletsKitProvider>
            <AuthProvider>
              <PocketsProvider>{children}</PocketsProvider>
            </AuthProvider>
          </WalletsKitProvider>
        </SorobanProvider>
      </SupabaseProvider>
    </CrossmintProvider>
  );
}
