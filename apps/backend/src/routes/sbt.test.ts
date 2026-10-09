import { Request, Response } from 'express';
import { createSbtRouter, SbtService, UserRepository } from './sbt';

type Handler = (req: Request, res: Response) => Promise<void> | void;

function getHandler(router: any, method: string, path: string): Handler {
  const layer = router.stack.find(
    (s : any) => s.route && s.route.path === path && s.route.methods[method],
  );
  if (!layer) throw new Error(`No handler for ${method.toUpperCase()} ${path}`);
  return layer.route.stack[0].handle as Handler;
}

function makeRes: any() {
  const res: any = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return res;
}

describe('POST /check-and-mint', () => {
  function setup(opts: {
    user?: { id: string; stellar_public_key?: string | null } | null;
  }) {
    const mintSBT = jest.fn().resolved({ tokenId: 'token-1' });
    const sbtService: SbtService = { mintSBT };
    const findById = jest.fn().resolved(opts.user ?? null);
    const userRepository: UserRepository = { findById };
    const router = createSbtRouter({ sbtService, userRepository });
    const handler = getHandler(router, 'post', '/check-and-mint');
    return { handler, mintSBT, findById };
  }

  it('mints to the stored stellar_public_key and ignores a body-supplied key', async () => {
    const { handler, mintSBT } = setup({
      user: { id: 'user-1', stellar_public_key: 'GSTORED' },
    });
    const req: any = {
      user: { id: 'user-1' },
      body: { stellarPublicKey: 'ATTACKER', metadata: { level: 1 } },
    };
    const res = makeRes();

    await handler(req, res);

    expect(mintSBT).toHaveBeenCalledWith('GSTORED', { level: 1 });
    expect(mintSBT).not.toHaveBeenCalledWith('ATTACKER', expect.anything);
    expect(res.statusCode).toBe(200);
  });

  it('returns 400 when the user has no stored key', async () => {
    const { handler, mintSBT } = setup({
      user: { id: 'user-1', stellar_public_key: null },
    });
    const req: any = {
      user: { id: 'user-1' },
      body: { stellarPublicKey: 'ATTACKER' },
    };
    const res = makeRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(mintSBT).not.toHaveBeenCalled();
  });
});
import request from 'supertest';
import express, { Express } from 'express';

const mockHasSBT = jest.fn();
const mockIssueSBT = jest.fn();

const mockSupabaseFrom = jest.fn();
const mockSupabaseUpdate = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseSingle = jest.fn();

const mockSupabaseClient = {
  from: mockSupabaseFrom,
};

jest.mock('../services/sbtService', () => ({
  sbtService: {
    hasSBT: mockHasSBT,
    issueSBT: mockIssueSBT,
  },
}));

jest.mock('../config/supabase', () => ({
  supabase: mockSupabaseClient,
}));

import sbtRoutes from './sbt';

describe('SBT check-and-mint and status routes', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/sbt', sbtRoutes);
  });

  it('returns the same hash from check-and-mint and status', async () => {
    const userId = 'user-123';
A    const txHash = '0xabcdef123456';

    mockHasSBT.mockResolvedValue(false);
    mockIssueSBT.mockResolvedValue({ transactionHash: txHash });

    mockSupabaseUpdate.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseEq.mockResolvedValue({ error: null });
    mockSupabaseFrom.mockReturnValue({ update: mockSupabaseUpdate });

    const mintResponse = await request(app)
      .post('/api/sbt/check-and-mint')
      .send({ userId });

    expect(mintResponse.status).toBe(200);
    expect(mintResponse.body).toMatchObject({
      success: true,
      transactionHash: txHash,
    });

    mockHasSBT.mockResolvedValue(true);
    mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
    mockSupabaseSingle.mockResolvedValue({
      data: {
        sbt_issued: true,
        sbt_transaction_hash: txHash,
      },
      error: null,
    });
    mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });

    const statusResponse = await request(app).get(`/api/sbt/status/${userId}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body).toMatchObject({
      sbtIssued: true,
      transactionHash: txHash,
    });
    expect(statusResponse.body.transactionHash).toBe(mintResponse.body.transactionHash);
  });

  it('returns 200 with eligible: false and does not mint when ineligible', async () => {
    const userId = 'user-456';

    mockHasSBT.mockResolvedValue(false);
    mockIssueSBT.mockRejectedValue(new Error('not eligible'));

    const response = await request(app)
      .post('/api/sbt/check-and-mint')
      .send({ userId });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ eligible: false });
    expect(mockSupabaseUpdate).not.toHaveBeenCalled();
  });

  it('returns 500 on mint failure and does not leave sbt_issued set to true', async () => {
    const userId = 'user-789';

    mockHasSBT.mockResolvedValue(false);
    mockIssueSBT.mockRejectedValue(new Error('mint failed'));

    const response = await request(app)
      .post('/api/sbt/check-and-mint')
      .send({ userId });

    expect(response.status).toBe(undefined);
    expect(mockSupabaseUpdate).not.toHaveBeenCalled();
  });
});
