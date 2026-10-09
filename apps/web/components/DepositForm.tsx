'use client';

import { useState, FormEvent } from 'react';
import { useDeposit } from '../hooks/useDeposit';
import { useAuth } from '../contexts/AuthContext';
import { useCrossmint } from '@crossmint/sdk-react';

export const DepositForm = () => {
  const { depositWithSwap } = useDeposit();
  const { visionMeJWT } = useAuth();
  const { crossmintToken } = useCrossmint();

  const [amount, setAmount] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!visionMeJWT) {
      setError('Missing VisionMe auth token. Please sign in again.');
      return;
    }

    if (!crossmintToken) {
      setError('Missing Crossmint token. Please reconnect your wallet.');
      return;
    }

    if (!publicKey) {
      setError('Missing public key.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await depositWithSwap(
        { amount, publicKey },
        visionMeJWT,
        crossmintToken,
      );
      setStatus(`Deposit submitted: ${result.txHash ?? 'unknown'}`);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Amount
        <input
          type="text"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <label>
        Public key
        <input
          type="text"
          value={publicKey}
          onChange={(event) => setPublicKey(event.target.value)}
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Deposit'}
      </button>
      {error ? <p data-testid="deposit-error">{error}</p> : null}
      {status ? <p data-testid="deposit-status">{status}</p> : null}
    </form>
  );
};
