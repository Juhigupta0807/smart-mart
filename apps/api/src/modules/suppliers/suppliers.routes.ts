import { Router } from "express";
import { db, supplier, eq, asc, ilike } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/suppliers?search=...
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query as { search?: string };
    const rows = search
      ? await db.select().from(supplier).where(ilike(supplier.supplierName, `%${search}%`)).orderBy(asc(supplier.supplierName))
      : await db.select().from(supplier).orderBy(asc(supplier.supplierName));
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/suppliers
router.post("/", async (req, res, next) => {
  try {
    const { supplierName, contactNumber, email, address } = req.body as Record<string, string>;
    if (!supplierName?.trim() || !contactNumber?.trim()) return next(badRequest("supplierName and contactNumber are required"));
    const [row] = await db.insert(supplier).values({ supplierName: supplierName.trim(), contactNumber: contactNumber.trim(), email: email?.trim() || null, address: address?.trim() || null }).returning();
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// GET /api/suppliers/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(supplier).where(eq(supplier.supplierId, id));
    if (!row) return next(notFound("Supplier not found"));
    res.json(row);
  } catch (err) { next(err); }
});

// PATCH /api/suppliers/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { supplierName, contactNumber, email, address } = req.body as Record<string, string>;
    const updates: Record<string, any> = {};
    if (supplierName?.trim()) updates.supplierName = supplierName.trim();
    if (contactNumber?.trim()) updates.contactNumber = contactNumber.trim();
    if (email !== undefined) updates.email = email?.trim() || null;
    if (address !== undefined) updates.address = address?.trim() || null;
    const [row] = await db.update(supplier).set(updates).where(eq(supplier.supplierId, id)).returning();
    if (!row) return next(notFound("Supplier not found"));
    res.json(row);
  } catch (err) { next(err); }
});

// DELETE /api/suppliers/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.delete(supplier).where(eq(supplier.supplierId, id)).returning();
    if (!row) return next(notFound("Supplier not found"));
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
