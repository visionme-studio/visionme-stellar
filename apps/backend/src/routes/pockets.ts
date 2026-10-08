import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";

const router = Router.async();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { data, error } = await supabase
    .from("pockets")
    .select("*")
    .eq("owner_id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ pockets: data });
});

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  const { data, error } = await supabase
    .from("pockets")
    .select("*")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (error) {
    if (error.code === "PGREML116") {
      return res.status(404).json({ error: "Pocket not found" });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.json({ pocket: data });
});

export default router;
