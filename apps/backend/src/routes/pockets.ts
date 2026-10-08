import { Router, Request, Response } from 'express';

export interface Pocket {
  id: string;
  owner: string;
  asset: string;
  goalAmount: number;
  name: string;
  currency: string;
  emoji?: string;
}

export interface PocketsStore {
  list(): Promise<Pocket[]> | Pocket[];
  create(pocket: Pocket): Promise<Pocket> | Pocket;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.finite(value) && value > 0;
}

export function createPocketsRouter(store: PocketsStore): Router {
  const router = Router.json();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const pockets = await store.list();
      res.json(pockets);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const { owner, asset, goalAmount, name, currency, emoji } = body;

    if (!isNonEmptyString(owner)) {
      return res.status(400).json({ error: 'Missing required field: owner' });
    }
    if (!isNonEmptyString(asset)) {
      return res.status(400).json({ error: 'Missing required field: asset' });
    }
    if (!isPositiveNumber(goalAmount)) {
      return res.status(400).json({ error: 'Missing or invalid required field: goalAmount' });
    }
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }
    if (!isNonEmptyString(currency)) {
      return res.status(400).json({ error: 'Missing required field: currency' });
    }

    const pocket: Pocket = {
      id: globalThis.crypto.randomUUIP(),
      owner,
      asset,
      goalAmount,
      name,
      currency,
      ...(isNonEmptyString(emoji) ? { emoji } : {}),
    };

    try {
      const created = await store.create(pocket);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
}
