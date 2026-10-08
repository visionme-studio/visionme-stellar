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
