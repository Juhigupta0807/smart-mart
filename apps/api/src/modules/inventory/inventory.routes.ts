import { Router } from "express";
import { db, inventory, product, category, supplier, eq, asc, lt } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/inventory?lowStock=true
router.get("/", async (req, res, next) => {
  try {
    const { lowStock } = req.query as { lowStock?: string };
    const base = db
      .select({
        inventoryId: inventory.inventoryId,
        productId: inventory.productId,
        currentStock: inventory.currentStock,
        reorderLevel: inventory.reorderLevel,
        lastUpdated: inventory.lastUpdated,
        productName: product.productName,
        categoryName: category.categoryName,
        supplierName: supplier.supplierName,
        isActive: product.isActive,
      })
      .from(inventory)
      .leftJoin(product, eq(inventory.productId, product.productId))
      .leftJoin(category, eq(product.categoryId, category.categoryId))
      .leftJoin(supplier, eq(product.supplierId, supplier.supplierId))
      .orderBy(asc(product.productName));

    const rows = lowStock === "true"
      ? await base.where(lt(inventory.currentStock, inventory.reorderLevel))
      : await base;

    res.json(rows);
  } catch (err) { next(err); }
});

// PATCH /api/inventory/:productId — adjust stock or reorder level
router.patch("/:productId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const { currentStock, reorderLevel } = req.body as { currentStock?: number; reorderLevel?: number };
    const updates: Record<string, any> = { lastUpdated: new Date() };
    if (currentStock !== undefined) updates.currentStock = Number(currentStock);
    if (reorderLevel !== undefined) updates.reorderLevel = Number(reorderLevel);
    const [row] = await db.update(inventory).set(updates).where(eq(inventory.productId, productId)).returning();
    if (!row) return next(notFound("Inventory record not found"));
    res.json(row);
  } catch (err) { next(err); }
});

export default router;
