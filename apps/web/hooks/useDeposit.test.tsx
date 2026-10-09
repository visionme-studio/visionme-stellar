import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useDeposit } from './useDeposit';

const VISION_ME_JWT = 'vision-me-jtw-test-token';
const CROSSMINT_TOKEN = 'crossmint-test-token';

const depositParams = {
  visionMeJWT: VISION_ME_JWT,
  crossmintToken: CROSSMINT_TOKEN,
};

describe('useDeposit', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.unstubGlobal('fetch');
  });

  it('sends the Authorization and X-Crossmint-Token headers with their respective tokens', async () => {
    fetchMock.mockResolved({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useDeposit());

    await act(async () => {
      await result.current.deposit(depositParams);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mockCalls[0] as [string, RequestInit];
    expect(url).toBe('/api/deposits/deposit-with-swap');

    const headers = init.headers as Record<string, string>;
    expect(headers).toHaveProperty('Authorization');
    expect(headers).toHaveProperty('X-Crossmint-Token');
    expect(headers.Authorization).toBe(`Bearer ${VISION_ME_JWT}`);
    expect(headers['X-Crossmint-Token']).toBe(CROSSMINT_TOKEN);
  });

  it('throws the server error string from errorData.error on a non-ok response', async () => {
    fetchMock.mockResolved({
      ok: false,
      status: 400,
      json: async () => ({ error: 'invalid signature' }),
    });

    const { result } = renderHook(() => useDeposit());

    await expect(
      act(async () => {
        await result.current.deposit(depositParams);
      }),
    ).rejects.toThrow('invalid signature');
  });

  it('sets isLoading true during the request and false afterwards', async () => {
    let resolveFetch: () => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = () =>
            resolve({
              ok: true,
              json: async () => ({ success: true }),
            } as Response);
        }),
    );

    const { result } = renderHook(() => useDeposit());

    expect(result.current.isLoading).toBe(false);

    let depositPromise: Promise<unknown>;
    act(() => {
      depositPromise = result.current.deposit(depositParams);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveFetch();
      await depositPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });
});
