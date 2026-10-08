import { Router } from "express";
import { db, category, eq, asc } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/categories
router.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(category).orderBy(asc(category.categoryName));
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/categories
router.post("/", async (req, res, next) => {
  try {
    const { categoryName } = req.body as { categoryName?: string };
    if (!categoryName?.trim()) return next(badRequest("categoryName is required"));
    const [row] = await db.insert(category).values({ categoryName: categoryName.trim() }).returning();
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// GET /api/categories/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(category).where(eq(category.categoryId, id));
    if (!row) return next(notFound("Category not found"));
    res.json(row);
  } catch (err) { next(err); }
});

// PATCH /api/categories/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { categoryName } = req.body as { categoryName?: string };
    if (!categoryName?.trim()) return next(badRequest("categoryName is required"));
    const [row] = await db.update(category).set({ categoryName: categoryName.trim() }).where(eq(category.categoryId, id)).returning();
    if (!row) return next(notFound("Category not found"));
    res.json(row);
  } catch (err) { next(err); }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.delete(category).where(eq(category.categoryId, id)).returning();
    if (!row) return next(notFound("Category not found"));
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
