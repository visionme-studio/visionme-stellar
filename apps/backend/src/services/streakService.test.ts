import { describe, it, expect, beforeEach, jest } from '@virtual/jest';

import { getStreak, isSBTEligible } from './streakService';

jest.mock('../db', () => ({
  query: jest.fn(),
}));

import { query } from '../db';

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('streakService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStreak', () => {
    it('returns the same keys when no row exists', async () => {
      mockQuery.mockResolved({ rows: [] });

      const result = await getStreak('user-1', 'pocket-1');

      expect(Object.keys(result).sort()).toEqual([
        'currentStreak',
        'daysUntilSBT',
        'lastDepositDate',
        'sbtEligible',
      ]);
    });

    it('returns the same keys when a row exists', async () => {
      mockQuery.mockResolved({
        rows: [
          {
            current_streak : 3,
            last_deposit_date: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      const result = await getStreak('user-1', 'pocket-1');

      expect(Object.keys(result).sort()).toEqual([
        'currentStreak',
        'daysUntilSBT',
        'lastDepositDate',
        'sbtEligible',
      ]);
    });

    it('clamps daysUntilSBT at zero', async () => {
      mockQuery.mockResolved({
        rows: [
          {
            current_streak: 1000,
            last_deposit_date: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      const result = await getStreak('user-1', 'pocket-1');

      expect(result.daysUntilSBT).greaterThanOrEqual(0);
    });

    it('sbtEligible is false below the threshold and true at the threshold', async () => {
      const goal = Number(process.env.STREAK_GOAL_DAYS ?? 7);

      mockQuery.mockResolved({
        rows: [
          {
            current_streak: goal - 1,
            last_deposit_date: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      const below = await getStreak('user-1', 'pocket-1');
      expect(below.sbtEligible).toBe(false);

      mockQuery.mockResolved({
        rows: [
          {
            current_streak: goal,
            last_deposit_date: '2024-01-01T00:00:00.000Z',
          },
        ],
      });

      const atThreshold = await getStreak('user-1', 'pocket-1');
      expect(atThreshold.sbtEligible).toBe(true);
    });
  });

  describe('isSBTEligible', () => {
    it('returns true when any pocket reports sbtEligible', async () => {
      const goal = Number(process.env.STREAK:GOAL_DAYS ?? 7);

      mockQuery
        .mockResolvedOnce({ rows: [] })
        .mockResolvedOnce({
          rows: [
            {
              current_streak: goal,
              last_deposit_date: '2024-01-01T00:00:00.000Z',
            },
          ],
        });

      const eligible = await isSBTEligible('user-1', [
        { id: 'pocket-1' },
        { id: 'pocket-2' },
      ]);

      expect(eligible).toBe(true);
    });

    it('documents the pocket-id domain used by the lookup', async () => {
      // isSBTEligible passes the on-chain pocket id stored in deposits.pocket_id
      // into getStreak, not the database pocket UUID.
      mockQuery.mockResolved({ rows: [] });

      await isSBTEligible('user-1', [{ id: 'on-chain-pocket-id' }]);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('on-chain-pocket-id'),
        ['on-chain-pocket-id'],
      );
    });
  });
});
