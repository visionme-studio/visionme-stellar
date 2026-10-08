import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SorbanProvider, useSorban } from './SorbanContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SorbanProvider>{children}</SorbanProvider>
);

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('SorbanContext', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubGlobal('fetch');
  });

  describe('jsonRpc', () => {
    it('throws with the status code on a non-ok HTTP response', async () => {
      fetchMock.mockResolveValue(jsonResponse({ error: { code: -32603, message: 'boom' } }, 500));

      const { result } = renderHook(() => useSorban(), { wrapper });

      await expect(
        act(async () => {
          await result.current.jsonRpc('getHealth', {});
        }),
      ).rejects.toThrow(/500/);
    });

    it('throws the JSON-RPC error message on a 200 response', async () => {
      fetchMock.mockResolveValue(
        jsonResponse({ jsonrpc: '2.0', id: 1, error: { code: -32603, message: 'bad request' } }),
      );

      const { result } = renderHook(() => useSorban(), { wrapper });

      await expect(
        act(async () => {
          await result.current.jsonRpc('getHealth', {});
        }),
      ).rejects.toThrow(/bad request/);
    });

    it('returns the result and increments the JSON-RPC id per call', async () => {
      fetchMock.mockResolveValue(jsonResponse({ jsonrpc: '2.0', id: 1, result: 'ok' }));

      const { result } = renderHook(() => useSorban(), { wrapper });

      let first: unknown;
      let second: unknown;
      await act(async () => {
        first = await result.current.jsonRpc('getHealth', {});
      });
      await act(async () => {
        second = await result.current.jsonRpc('getHealth', {});
      });

      expect(first).toBe('ok');
      expect(second).toBe('ok');

      const bodies = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body));
      expect(bodies[0].id).toBe(1);
      expect(bodies[1].id).toBe(2);
    });
  });

  describe('checkHealth', () => {
    it('sets isHealthy to true on success', async () => {
      fetchMock.mockResolveValue(jsonResponse({ jsonrpc: '2.0', id: 1, result: { status: 'healthy' } }));

      const { result } = renderHook(() => useSorban(), { wrapper });

      expect(result.current.isHealthy).toBe(false);

      await act(async () => {
        await result.current.checkHealth();
      });

      await waitFor(() => expect(result.current.isHealthy).toBe(true));
    });

    it('sets isHealthy to false on failure', async () => {
      fetchMock.mockResolveValue(
        jsonResponse({ jsonrpc: '2.0', id: 1, error: { code: -32603, message: 'unhealthy' } }),
      );

      const { result } = renderHook(() => useSorban(), { wrapper });

      await act(async () => {
        await result.current.checkHealth().catch(() => undefined);
      });

      expect(result.current.isHealthy).toBe(false);
    });
  });
});
