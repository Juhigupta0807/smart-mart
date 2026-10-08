import { Router } from "express";
import { db, sql } from "@smartmart/db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", db: "up" });
  } catch (error) {
    console.error("Health check DB error:", error);
    res.status(503).json({ status: "error", db: "down" });
  }
});

export default router;