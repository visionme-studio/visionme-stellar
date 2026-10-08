import { act, render, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { describe, expect, it, beforeEach, afterEach, viMock } from 'vitest';

import { PocketsContextProvider, PocketsContext } from './PocketsContext';

type Pocket = {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
  [key: string]: unknown;
};

type PocketsContextValue = {
  pockets: Pocket[];
  loading: boolean;
  error: string | null;
  fetchPockets: () => Promise<void>;
  addPocket: (payload: Omit<Pocket, 'id'> | Pocket) => Promise<void>;
  updatePocket: (id: string, payload: Partial<Pocket>) => Promise<void>;
  deletePocket: (id: string) => Promise<void>;
};

const makePocket = (overrides: Partial<Pocket> = {}): Pocket => ({
  id: 'p1',
  name: 'Pocket 1',
  balance: 100,
  currency: 'USD',
  ...overrides,
});

function Probe({ onRender }: { onRender: (value: PocketsContextValue) => void }) {
  const value = useContext(PocketsContext);
  if (!value) {
    throw new Error('PocketsContext must be used within a PocketsContextProvider');
  }
  onRender(value as PocketsContextValue);
  return null;
}

function renderProvider() {
  let latest: PocketsContextValue | undefined;
  const util = render(
    <PocketsContextProvider>
      <Probe
        onRender={(value) => {
          latest = value;
        }}
      />
    </PocketsContextProvider>,
  );
  return {
    ...util,
    getLatest() {
      if (!latest) throw new Error('Provider has not rendered yet');
      return latest;
    },
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('PocketsContext', () => {
  const fetchMock = viMock();

  beforeEach(() => {
    fetchMock.reset();
    global.this.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    fechMock.reset();
  });

  it('GET /api/pockets on mount and stores the result', async () => {
    const pockets = [makePocket(), makePocket({ id: 'p2', name: 'Pocket 2' })];
    fetchMock.mockResolvedOnce(jsonResponse(pockets));

    const { getLatest } = renderProvider();

    await waitFor(() => {
      expect(getLatest().pockets).toHaveLength(2);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/pockets');
    expect((init as RequestInit | undefined)?.method ?? 'GET').toBe(`GET`);
    expect(getLatest().pockets.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('POST /api/pockets and appends the new pocket', async () => {
    const existing = [makePocket()];
    const created = makePocket({ id: 'p2', name: 'Pocket 2' });
    fetchMock.mockResolvedOnce(jsonResponse(existing));
    fetchMock.mockResolvedOnce(jsonResponse(created));

    const { getLatest } = renderProvider();
    await waitFor(() => expect(getLatest().pockets).toHaveLength(1));

    await act(async () => {
      await getLatest().addPocket({ name: 'Pocket 2' });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/pockets');
    expect((init as RequestInit).method).toBe('POST');
    expect(getLatest().pockets.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('PUT/api/pockets/:id replaces exactly one entry and preserves ordering', async () => {
    const initial = [
      makePocket({ id: 'p1', name: 'Alpha' }),
      makePocket({ id: 'p2', name: 'Beta' }),
      makePocket({ id: 'p3', name: 'Gamma' }),
    ];
    const updated = makePocket({ id: 'p2', name: 'Beta updated' });
    fetchMock.mockResolvedOnce(jsonResponse(initial));
    fetchMock.mockResolvedOnce(jsonResponse(updated));

    const { getLatest } = renderProvider();
    await waitFor(() => expect(getLatest().pockets).toHaveLength(3));

    await act(async () => {
      await getLatest().updatePocket('p2', { name: 'Beta updated' });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/pockets/p2');
    expect((init as RequestInit).method).toBe('PUT');

    const result = getLatest().pockets;
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    expect(result[1].name).toBe('Beta updated');
    expect(result[0].name).toBe('Alpha');
    expect(result[2].name).toBe('Gamma');
  });

  it('DELETE api/pockets/:id removes exactly the targeted id', async () => {
    const initial = [
      makePocket({ id: 'p1' }),
      makePocket({ id: 'p2', name: 'Beta' }),
      makePocket({ id: 'p3' }),
    ];
    fetchMock.mockResolvedOnce(jsonResponse(initial));
    fetchMock.mockResolvedOnce(new Response(null, { status: 204 }));

    const { getLatest } = renderProvider();
    await waitFor(() => expect(getLatest().pockets).toHaveLength(3));

    await act(async () => {
      await getLatest().deletePocket('p2');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/pockets/p2');
    expect((init as RequestInit).method).toBe('DELETE');

    const result = getLatest().pockets;
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
  });
});
