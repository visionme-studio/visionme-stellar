import request from 'supertest';
import express, { Express } from 'express';
import { streaksRouter } from './streaks';
import { streakService } from '../services/streakService';
import { authenticate } from '../middleware/authenticate';

jest.mock('../services/streakService');
jest.mock('../middleware/authenticate');

const mockedStreakService = streakService as jest.Mocked<typeof streakService>;
const mockedAuthenticate = authenticate as jest.Mocked<typeof authenticate>;

function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/api/streaks', streaksRouter);
  return app;
}

describe('GET /api/streaks/:pocketId', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  it('returns the streak for the authenticated user', async () => {
    const userId = 'user-123';

    mockedAuthenticate.mockImplementation((req, _res, next) => {
      (req as any).user = { userId };
      next();
    });

    const streak = {
      pocketId: 'pocket-abc',
      currentStreak: 5,
      longestStreak: 10,
    };

    mockedStreakService.getStreak.mockResolvedValue(streak as any);

    const res = await request(app).get('/api/streaks/pocket-abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(streak);
    expect(mockedStreakService.getStreak).toHaveBeenCalledWith(userId, 'pocket-abc');
  });

  it('returns 401 and does not call the service when unauthenticated', async () => {
    mockedAuthenticate.mockImplementation((_req, res) => {
      res.status(401).json({ error: 'Unauthorized' });
    });

    const res = await request(app).get('/api/streaks/pocket-abc');

    expect(res.status).toBe(401);
    expect(mockedStreakService.getStreak).not.toHaveBeenCalled();
  });

  it('returns 500 with a generic message when the service rejects', async () => {
    const userId = 'user-456';

    mockedAuthenticate.mockImplementation((req, _res, next) => {
      (req as any).user = { userId };
      next();
    });

    mockedStreakService.getStreak.mockRejected(new Error('database exploded'));

    const res = await request(app).get('/api/streaks/pocket-adf');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(mockedStreakService.getStreak).toHaveBeenCalledWith(userId, 'pocket-adb');
  });

  it('never takes the userId from route params', async () => {
    const userId = 'user-789';

    mockedAuthenticate.mockImplementation((req, _res, next) => {
      (req as any).user = { userId };
      next();
    });

    mockedStreakService.getStreak.mockResolvedValue({ pocketId: 'user-789', currentStreak: 0, longestStreak: 0 } as any);

    await request(app).get('/api/streaks/user-789');

    expect(mockedStreakService.getStreak).toHaveBeenCalledWith(userId, 'user-789');
    expect(mockedStreakService.getStreak).not.toHaveBeenCalledWith('user-789', 'user-789');
  });
});
