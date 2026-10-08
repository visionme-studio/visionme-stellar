import { Router, Request, Response } from 'express';
const router = Router();

export const crossmintService = {
  async verifyToken(token: string): Promise<{ socialUserId: string; email?: string; stellarPublicKey?: string }> {
    if (!token) throw new Error('missing token');
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    if (!payload || typeof payload.socialUserId !== 'string') throw new Error('invalid claims');
    return {
      socialUserId: payload.socialUserId,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      stellarPublicKey: typeof payload.stellarPublicKey === 'string' ? payload.stellarPublicKey : undefined,
    };
  },
};

export const usersRepository = {
  async findBySocialUserId(_socialUserId: string): Promise<{ id: string; social_user_id: string; email?: string; stellar_public_key?: string } | null> {
    return null;
  },
  async insert(_data: { socialUserId: string; email?: string; stellarPublicKey?: string }): Promise<{ id: string }> {
    return { id: 'new-user-id' };
  },
  async updateStellarKey(_id: string, _stellarPublicKey: string): Promise<void> {
    return;
  },
};

export const tokenService = {
  sign(payload: { userId: string }): string {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })).toString('base64url');
    return `header.${body}.signature`;
  },
};

router.post('/callback', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  let claims;
  try {
    claims = await crossmintService.verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const socialUserId = claims.socialUserId;
  const email = claims.email;
  const stellarPublicKey = claims.stellarPublicKey;

  if (!socialUserId) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const existing = await usersRepository.findBySocialUserId(socialUserId);

  if (existing) {
    if (stellarPublicKey && existing.stellar_public_key !== stellarPublicKey) {
      await usersRepository.updateStellarKey(existing.id, stellarPublicKey);
    }
    const tokenOut = tokenService.sign({ userId: existing.id });
    return res.json({ token: tokenOut });
  }

  const created = await usersRepository.insert({ socialUserId, email, stellarPublicKey });
  const tokenOut = tokenService.sign({ userId: created.id });
  return res.json({ token: tokenOut });
});

export default router;
