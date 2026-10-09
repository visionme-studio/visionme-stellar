import { Router, Request, Response } from 'express';
const router = Router();

export interface SbtService {
  mintSBT(stellarPublicKey: string, metadata?: Record<string, unknown>): Promise<unknown>;
}

export interface UserRepository {
  findById(id: string): Promise<{ id: string; stellar_public_key?: string | null } | null>;
}

export interface SbtRouterDependencies {
  sbtService: SbtService;
  userRepository: UserRepository;
}

export function createSbtRouter(deps: SbtRouterDependencies): Router {
  const { sbtService, userRepository } = deps;

  router.post('/check-and-mint', async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const stellarPublicKey = user.stellar_public_key;
    if (!stellarPublicKey) {
      res.status(400).json({ error: 'No stellar_public_key on user' });
      return;
    }

    const metadata = req.body?.metadata;
    const result = await sbtService.mintSBT(stellarPublicKey, metadata);
    res.json({ success: true, result });
  });

  return router;
}

export default router;
