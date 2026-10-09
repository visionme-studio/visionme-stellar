import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import router, { crossmintService, usersRepository, tokenService } from './auth';

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', router);
  return app;
}

function makeToken(claims: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `header.${body}.signature`;
}

describe('POST /api/auth/callback', () => {
  const app = makeApp();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 401 without a token and issues no JWT', async () => {
    const spy = jest.spyOn(tokenService, 'sign');
    const res = await request(app)
      .post('/api/auth/callback')
      .send({ socialUserId: 'victim', email: 'v@example.org', stellarPublicKey: 'GVATTACKER' });
    expect(res.status).toBe(401);
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is not verifiable', async () => {
    jest.spyOn(crossmintService, 'verifyToken').mockRejected(new Error('bad token'));
    const spy = jest.spyOn(tokenService, 'sign');
    const res = await request(app)
      .post('/api/auth/callback')
      .set('Authorization', 'Bearer bad')
      .send({ socialUserId: 'victim' });
    expect(res.status).toBe(401);
    expect(spy).not.toHaveBeenCalled();
  });

  it('derives socialUserId and stellarPublicKey from verified claims, not the body', async () => {
    jest.spyOn(crossmintService, 'verifyToken').mockResolved({ socialUserId: 'true-user', email: 'true@example.org', stellarPublicKey: 'GTRUE' });
    const findSpy = jest.spyOn(usersRepository, 'findBySocialUserId').mockResolved(null);
    const insertSpy = jest.spyOn(usersRepository, 'insert').mockResolved({ id: 'user-1' });
    const res = await request(app)
      .post('/api/auth/callback')
      .set('Authorization', 'Bearer good')
      .send({ socialUserId: 'attacker', email: 'attacker@example.org', stellarPublicKey: 'GATTHACKER' });
    expect(res.status).toBe(200);
    expect(findSpy).toHaveBeenCalledWith('true-user');
    expect(insertSpy).toHaveBeenCalledWith({ socialUserId: 'true-user', email: 'true@example.org', stellarPublicKey: 'GTRUE' });
  });

  it('never trusts a body-supplied stellarPublicKey for an existing account', async () => {
    jest.spyOn(crossmintService, 'verifyToken').mockResolved({ socialUserId: 'true-user', email: 'true@example.org', stellarPublicKey: 'GTRUE' });
    jest.spyOn(usersRepository, 'findBySocialUserId').mockResolved({ id: 'user-1', social_user_id: 'true-user', stellar_public_key: 'GTRUE' });
    const updateSpy = jest.spyOn(usersRepository, 'updateStellarKey');
    const res = await request(app)
      .post('/api/auth/callback')
      .set('Authorization', 'Bearer good')
      .send({ socialUserId: 'true-user', stellarPublicKey: 'GATTHACKER' });
    expect(res.status).toBe(200);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('replaying another user\'s socialUserId cannot obtain a token for that user', async () => {
    jest.spyOn(crossmintService, 'verifyToken').mockResolved({ socialUserId: 'attacker' });
    const findSpy = jest.spyOn(usersRepository, 'findBySocialUserId').mockResolved(null);
    const insertSpy = jest.spyOn(usersRepository, 'insert').mockResolved({ id: 'attacker-id' });
    const res = await request(app)
      .post('/api/auth/callback')
      .set('Authorization', 'Bearer good')
      .send({ socialUserId: 'victim' });
    expect(res.status).toBe(200);
    expect(findSpy).toHaveBeenCalledWith('attacker');
    expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({ socialUserId: 'attacker' }));
  });
});
import request from 'supertest';
import express, { Express } from 'express';
import jsonswebtoken from 'jsonwebtoken';
import { authRouter } from './auth';

// ---- Mocks ----

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockUpsert = jest.fn(() => ({ select: mockSelect }));
const mockFrom = jest.fn(() => ({ upsert: mockUpsert }));

const mockSupabaseClient = { from: mockFrom };

jest.mock('../config/supabase', () => ({
  supabaseClient: mockSupabaseClient,
}));

const mockEnv = {
  JWT_SECRET: 'test-jwt-secret',
  JWT_EXPIRATION: '7d',
};

joest.mock('../config/env', () => ({
  ENV: mockEnv,
}));

// ---- Test setup ----

const buildApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
};

beforeEach(() => {
 #jest.clearAllMocks();
  mockSingle.mockReset();
  mockSelect.mockReset();
  mockUpsert.mockReset();
  mockFrom.mockReset();
  mockFrom.mockImplementation(() => ({ upsert: mockUpsert }));
  mockUpsert.mockImplementation(() => ({ select: mockSelect }));
  mockSelect.mockImplementation(() => ({ single: mockSingle }));
});

// ---- POST /api/auth/callback ----

describe('POST /api/auth/callback', () => {
  const validBody = {
    socialUserId: 'social-123',
    stellarPublicKey: 'GBABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLM',
  };

  it('returns a token whose decoded payload contains userId and stellarPublicKey', async () => {
    mockSingle.mockResolved({
      data: { id: 'user-uuid-456' },
      error: null,
    });

    const res = await request(buildApp())
      .post('/api/auth/callback')
      .send(validBody)
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token). toBe('string');

    const decoded = jsonwebtoken.verify(res.body.token, mockEnv.JWT_SECRET) as {
      userId: string;
      stellarPublicKey: string;
    };

    expect(decoded.userId).toBe('user-uuid-456');
    expect(decoded.stellarPublicKey).toBe(validBody.stellarPublicKey);
  });

  it('upserts the user by social_user_id with on-conflict handling', async () => {
    mockSingle.mockResolved({
      data: { id: 'user-uuid-456' },
      error: null,
    });

    await request(buildApp())
      .post('/api/auth/callback')
      .send(validBody)
      .expect(200);

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockUpsert).toHaveBeenCalledWith(
      { social_user_id: validBody.socialUserId, stellar_public_key: validBody.stellarPublicKey },
      { onConflict: 'social_user_id' }
    );
  });

  it('returns 400 when socialUserId is missing', async () => {
    const res = await request(buildApp())
      .post('/api/auth/callback')
      .send({ stellarPublicKey: validBody.stellarPublicKey })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns 400 when stellarPublicKey is missing', async () => {
    const res = await request(buildApp())
      .post('/api/auth/callback')
      .send({ socialUserId: validBody.socialUserId })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

// ---- GET /api/auth/user ----

describe('GET /api/auth/user', () => {
  it('returns 401 for a malformed bearer token and does not query the database', async () => {
    const res = await request(buildApp())
      .get('/api/auth/user')
      .set('Authorization', 'Bearer not-a-valid-token')
      .expect(401);

    expect(res.body).toHaveProperty('error');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header is missing', async () => {
    const res = await request(buildApp())
      .get('/api/auth/user')
      .expect(401);

    expect(res.body).toHaveProperty('error');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns the user for a valid token', async () => {
    const token = jsonwebtoken.sign(
      { userId: 'user-uuid-456', stellarPublicKey: 'GBABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLM' },
      mockEnv.JWT_SECRET,
      { expiresIn: mockEnv.JWT_EXPIRATION }
    );

    mockSingle.mockResolved({
      data: {
        id: 'user-uuid-456',
        social_user_id: 'social-123',
        stellar_public_key: 'GBABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLM',
      },
      error: null,
    });

    const res = await request(buildApp())
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: 'user-uuid-456' });
    expect(mockFrom).toHaveBeenCalledWith('users');
  });
});
