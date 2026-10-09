import { jest } from '@jest/globals';

import { PocketService } from './pocketService';

describe('PocketService._waitForConfirmation', () => {
  const txHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

  let service: PocketService;
  let getTransaction: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    getTransaction = jest.fn();
    service = {
      sorobanRpc: { getTransaction },
    } as unknown as PocketService;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const wait = () =>
    (service as unknown as {
      _waitForConfirmation: (txHash: string) => Promise<unknown>;
    })._waitForConfirmation(txHash);

  const flushTimers = async (attempts: number) => {
    for (let i = 0; i < attempts; i++) {
      await jest.advanceTimersByTime(1000);
    }
  };

  it('resolves with the transaction response after the expected number of polls', async () => {
    const successResponse = { status: 'SUCCESS', txHash };
    getTransaction
      .mockResolvedOnce({ status: 'NOT_FOUND' })
      .mockResolvedOnce({ status: 'NOT_FOUND' })
      .mockResolvedOnce(successResponse);

    const promise = wait();
    await flushTimers(3);

    await expect(promise).resolves.toEqual(successResponse);
    expect(getTransaction).toHaveBeenCalledTimes(3);
    expect(getTransaction).toHaveBeenCalledWith(txHash);
  });

  it('throws when the transaction status is FAILED', async () => {
    getTransaction
      .mockResolvedOnce({ status: 'NOT_FOUND' })
      .mockResolvedOnce({ status: 'FAILED' });

    const promise = wait();
    const assertion = expect(promise).rejects.toThrow();
    await flushTimers(2);

    await assertion;
    expect(getTransaction).toHaveBeenCalledTimes(2);
  });

  it('times out after 60 attempts when the RC keeps throwing', async () => {
    getTransaction.mockRejected(new Error('RPC unavailable'));

    const promise = wait();
    const assertion = expect(promise).rejects.toThrow();
    await flushTimers(60);

    await assertion;
    expect(getTransaction).toHaveBeenCalledTimes(60);
  });
});
