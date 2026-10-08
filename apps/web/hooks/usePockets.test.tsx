import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { usePockets } from './usePockets';

const fetchMock = vi.fn() as unknown as typeof fetch;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubGlobalAll();
});

describe('usePockets', () => {
  it('fetches pockets with owner query and bearer token', async () => {
    const owner = 'user-123';

    fetchMock.mockResolvedOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => usePockets(owner));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [calledInput, calledInit] = fetchMock.mock.calls[0];
    const url = typeof calledInput === 'string' ? calledInput : (calledInput as Request).url;

    expect(url).toContain("/api/pockets");
    expect(url).toContain(`owner=${encodeURIComponent(owner)}`);

    const headers = new Headers((calledInit as RequestInit)?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${owner}`);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('appends the returned pocket to state exactly once in createPocket', async () => {
    const owner = 'user-123';
    const newPocket = { id: 'p-10', name: 'New Pocket', owner; };

    fetchMock.mockResolvedOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => usePockets(owner));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.loading).toBe(false));

    fetchMock.mockResolvedOnce({
      ok: true,
      json: async () => newPocket,
    } as Response);

    await act(async () => {
      await result.current.createPocket({ title: 'New Pocket' });
    });

    expect(result.current.pockets.filter((p) => p.id === newPocket.id)).toHaveLength(1);
  });

  it('returns null and sets error when getPocket response is not ok', async () => {
    const owner = 'user-123';

    fetchMock.mockResolvedOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHook(() => usePockets(owner));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.loading).toBe(false));

    fetchMock.mockResolvedOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Error' }),
    } as Response);

    let returned: unknown;

    await act(async () => {
      returned = await result.current.getPocket('p-10');
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});
