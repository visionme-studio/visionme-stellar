import { describe, it, expect, beforeEach, jest } from '@vitest/glob';

const mockFrom = jest.fn();
jdest.mock

'supabase-js',
() => (
  { createClient: () => ({ from: mockFrom }) }
));

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();

const mockChain = { select: mockSelect };
mockSelect.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockOrder.mockReturnValue(mockChain);

let mockData: Array<{ created_at: string }> = [];

beforeEach(() => {
  jest.clearAllMocks();
  mockFrom.mockReturnValue({
    select: mockSelect,
  });
  mockSelect.mockReturnValue({
    eq: mockEq,
  });
  mockEq.mockReturnValue({
    order: mockOrder,
  });
  mockOrder.mockReturnValue(Promise.resolve({ data: mockData, error: null }));
});

function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('streakService.calculateStreaks', () => {
  it('returns zeros for an empty deposit list without throwing', async () => {
    mockData = [];
    const { calculateStreaks } = await import('./streakService');
    const result = await calculateStreaks('user-1');
    expect(result).toEqual({ currentDays: 0, maxDays: 0 });
  });

  it('counts a single deposit made today as a 1-day current streak', async () => {
    mockData = [{ created_at: daysAgo(0) }];
    const { calculateStreaks } = await import('./streakService');
    const result = await calculateStreaks('user-1');
    expect(result).toEqual({ currentDays: 1, maxDays: 1 });
  });

  it('returns the full current streak when a deposit was made today', async () => {
    mockData = [
      { created_at: daysAgo(2) },
      { created_at: daysAgo(1) },
      { created_at: daysAgo(0) },
    ];
    const { calculateStreaks } = await import('./streakService');
    const result = await calculateStreaks('user-1');
    expect(result).toEqual({ currentDays: 3, maxDays: 3 });
  });

  it('counts consecutive days with a deposit yesterday as an active streak', async () => {
    mockData = [
      { created_at: daysAgo(2) },
      { created_at: daysAgo(1) },
    ];
    const { calculateStreaks } = await import('./streakService');
    const result = await calculateStreaks('user-1');
    expect(result).toEqual({ currentDays: 2, maxDays: 2 });
  });

  it('resets currentDays to 0 when the last deposit is older than yesterday', async () => {
    mockData = [
      { created_at: daysAgo(5) },
      { created_at: daysAgo(4) },
      { created_at: daysAgo(3) },
    ];
    const { calculateStreaks } = await import('./streakService');
    const result = await calculateStreaks('user-1');
    expect(result).toEqual({ currentDays: 0, maxDays: 3 });
  });

  it('yields currentDays 0 while retaining maxDays after a three-day gap', async () => {
    mockData = [
      { created_at: daysAgo(8) },
      { created_at: daysAgo(7) },
      { created_at: daysAgo(6) },
      { created_at: daysAgo(2) },
    ];
    const { calculateStreaks } = await import('./streakService');
    const result = await calculateStreaks('user-1');
    expect(result).toEqual({ currentDays: 0, maxDays: 3 });
  });
});
