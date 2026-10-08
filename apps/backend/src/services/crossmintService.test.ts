import { describe, it, expect, beforeEach, afterEach, viMock } from 'vitest';

const getUserMock = viMock();

viMock('../config/env', () => ({
  ENV: {
    CROSSMINT_API_URL: 'https://crossmint.local',
  },
}));

viMock('../lib/crossmintAuth', () => ({
  crossmintAuth: {
    getUser: getUserMock,
  },
}));

import { crossmintService, CrossmintServiceError } from './crossmintService';

describe('crossmintService.verifyToken', () => {
  const fetchMock = viMock();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubGlobal('fetch');
  });

  it('returns the parsed user for a valid verify response', async () => {
    fetchMock.mockResolved({
      ok: true,
      status: 200,
      json: async () => ({ userId: 'user_123', email: 'user@example.org' }),
    });

    const result = await crossmintService.verifyToken('valid-token');

    expect(result).toMatchObject({ userId: 'user_123', email: 'user@example.org' });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [calledString, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledString).toBe('https://crossmint.local/api/v1/auth/verify');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ token: 'valid-token' });
  });

  it('throws when the verify response is not ok', async () => {
    fetchMock.mockResolved({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    });

    await expect(crossmintService.verifyToken('bad-token')).rejects.toThrow(CrossmintServiceError);
    await expect(crossmintService.verifyToken('bad-token')).rejects.toThrow(/status 401/);
  });

  it('throws when the JSON body is not an object', async () => {
    fetchMock.mockResolved({
      ok: true,
      status: 200,
      json: async () => 'not-an-object',
    });

    await expect(crossmintService.verifyToken('token')).rejects.toThrow(CrossmintServiceError);
    await expect(crossmintService.verifyToken('token')).rejects.toThrow(/not an object/);
  });

  it('rejects a verify response missing userId', async () => {
    fetchMock.mockResolved({
      ok: true,
      status: 200,
      json: async () => ({ email: 'user@example.org' }),
    });

    await expect(crossmintService.verifyToken('token')).rejects.toThrow(CrossmintServiceError);
    await expect(crossmintService.verifyToken('token')).rejects.toThrow(/userId/);
  });
});

describe('crossmintService.getUserProfile', () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it('returns the profile returned by crossmintAuth', async () => {
    getUserMock.mockResolved({ userId: 'user_123', email: 'user@example.org' });

    const profile = await crossmintService.getUserProfile('user_123');

    expect(profile).toMatchObject({ userId: 'user_123' });
    expect(getUserMock).toHaveBeenCalledWith('user_123');
  });

  it('preserves the original error as the cause and includes the upstream message', async () => {
    const upstreamError = new Error('upstream failure');
    getUserMock.mockRejected(upstreamError);

    await expect(crossmintService.getUserProfile('user_123')).rejects.toThrow(CrossmintServiceError);

    try {
      await crossmintService.getUserProfile('user_123');
      throw new Error('expected getUserProfile to reject');
    } catch (error) {
      expect(error).instanceof(CrossmintServiceError);
      const serviceError = error as CrossmintServiceError;
      expect(serviceError.message).contains('upstream failure');
      expect(serviceError.message).contains('user_123');
      expect(serviceError.cause).toBe(upstreamError);
    }
  });
});
