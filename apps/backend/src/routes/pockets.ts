import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/pockets
 * Lists pockets for the authenticated user.
 * Always scoped to the JWT subject. Optionally filtered by owner address.
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const owner = typeof req.query.owner === "string" ? req.query.owner : undefined;

  try {
    let query = supabase
      .from("pockets")
      .select("*")
      .eq("owner_id", userId);

    if (owner) {
      query = query.eq("owner_address", owner);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to list pockets:", error.message);
      res.status(500).json({ error: "Failed to list pockets" });
      return;
    }

    res.json({ data });
  } catch (err) {
    console.error("Unexpected error listing pockets:", err);
    res.status(500).json({ error: "Failed to list pockets" });
  }
});

export default router;
