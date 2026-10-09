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
'use client';

import { CrossmintAuthProvider, CrossmintProvider } from '@crossmint/client-sdk-react-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? ''}>
      <CrossmintAuthProvider
        loginMethods={['email', 'google', 'apple', 'facebook', 'twitter']}
      >
        {children}
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
