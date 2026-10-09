import { useCallback } from 'react';

export interface DepositRequest {
  amount: string;
  publicKey: string;
}

export interface DepositResponse {
  txHash?: string;
  swapTxHash?: string;
}

export const useDeposit = () => {
  const depositWithSwap = useCallback(
    async (
      request: DepositRequest,
      visionMeJWT: string,
      crossmintToken: string,
    ): Promise<DepositResponse> => {
      if (!visionMeJWT) {
        throw new Error('Missing VisionMe auth token');
      }
      if (!crossmintToken) {
        throw new Error('Missing Crossmint token');
      }

      const response = await fetch('/api/deposit-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${visionMeJWT}`,
          'X-Crossmint-Token': crossmintToken,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Deposit swap failed');
      }

      return (response.json() as Promise<DepositResponse>);
    },
    [],
  );

  return { depositWithSwap };
};
