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
