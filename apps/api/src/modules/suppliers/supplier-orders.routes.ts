import { Router } from "express";
import { db, supplierOrder, supplierOrderItem, supplier, product, inventory, admin, eq, asc, desc, and, sql } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/supplier-orders?status=
router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query as { status?: string };
    const rows = await db
      .select({
        supplierOrderId: supplierOrder.supplierOrderId,
        status: supplierOrder.status,
        orderDate: supplierOrder.orderDate,
        receivedDate: supplierOrder.receivedDate,
        totalCost: supplierOrder.totalCost,
        notes: supplierOrder.notes,
        supplierId: supplierOrder.supplierId,
        supplierName: supplier.supplierName,
        adminId: supplierOrder.adminId,
      })
      .from(supplierOrder)
      .leftJoin(supplier, eq(supplierOrder.supplierId, supplier.supplierId))
      .where(status ? eq(supplierOrder.status, status as any) : undefined)
      .orderBy(desc(supplierOrder.orderDate));
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/supplier-orders  — create a purchase order
router.post("/", async (req, res, next) => {
  try {
    const { supplierId, notes, items } = req.body as {
      supplierId?: number;
      notes?: string;
      items?: { productId: number; quantity: number; unitCost: number }[];
    };
    if (!supplierId) return next(badRequest("supplierId is required"));
    if (!items?.length) return next(badRequest("items array is required"));

    const result = await db.transaction(async (tx) => {
      const totalCost = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
      const [order] = await tx.insert(supplierOrder).values({
        supplierId: Number(supplierId),
        adminId: req.auth!.adminId!,
        totalCost: String(totalCost),
        notes: notes?.trim() || null,
      }).returning();

      await tx.insert(supplierOrderItem).values(
        items.map((it) => ({
          supplierOrderId: order.supplierOrderId,
          productId: it.productId,
          quantity: it.quantity,
          unitCost: String(it.unitCost),
        }))
      );
      return order;
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// GET /api/supplier-orders/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [order] = await db
      .select({
        supplierOrderId: supplierOrder.supplierOrderId,
        status: supplierOrder.status,
        orderDate: supplierOrder.orderDate,
        receivedDate: supplierOrder.receivedDate,
        totalCost: supplierOrder.totalCost,
        notes: supplierOrder.notes,
        supplierId: supplierOrder.supplierId,
        supplierName: supplier.supplierName,
      })
      .from(supplierOrder)
      .leftJoin(supplier, eq(supplierOrder.supplierId, supplier.supplierId))
      .where(eq(supplierOrder.supplierOrderId, id));
    if (!order) return next(notFound("Supplier order not found"));

    const items = await db
      .select({
        supplierOrderItemId: supplierOrderItem.supplierOrderItemId,
        productId: supplierOrderItem.productId,
        quantity: supplierOrderItem.quantity,
        unitCost: supplierOrderItem.unitCost,
        productName: product.productName,
      })
      .from(supplierOrderItem)
      .leftJoin(product, eq(supplierOrderItem.productId, product.productId))
      .where(eq(supplierOrderItem.supplierOrderId, id));

    res.json({ ...order, items });
  } catch (err) { next(err); }
});

// PATCH /api/supplier-orders/:id/receive — mark as received, bump inventory
router.patch("/:id/receive", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await db.transaction(async (tx) => {
      const [order] = await tx
        .update(supplierOrder)
        .set({ status: "Received", receivedDate: new Date() })
        .where(and(eq(supplierOrder.supplierOrderId, id), eq(supplierOrder.status, "Pending")))
        .returning();
      if (!order) throw notFound("Order not found or already processed");

      const items = await tx
        .select()
        .from(supplierOrderItem)
        .where(eq(supplierOrderItem.supplierOrderId, id));

      for (const item of items) {
        await tx
          .update(inventory)
          .set({ currentStock: sql`${inventory.currentStock} + ${item.quantity}`, lastUpdated: new Date() })
          .where(eq(inventory.productId, item.productId));
      }
    });
    res.json({ message: "Order marked as received and inventory updated" });
  } catch (err) { next(err); }
});

// PATCH /api/supplier-orders/:id/cancel
router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .update(supplierOrder)
      .set({ status: "Cancelled" })
      .where(and(eq(supplierOrder.supplierOrderId, id), eq(supplierOrder.status, "Pending")))
      .returning();
    if (!row) return next(notFound("Order not found or already processed"));
    res.json(row);
  } catch (err) { next(err); }
});

export default router;
