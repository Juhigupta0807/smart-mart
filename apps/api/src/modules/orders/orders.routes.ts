import { Router } from "express";
import { db, orders, orderDetails, product, customer, payment, eq, asc, desc, and, ilike } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/orders?status=&customerId=
router.get("/", async (req, res, next) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const conditions: any[] = [];
    if (status) conditions.push(eq(orders.orderStatus, status as any));
    if (customerId) conditions.push(eq(orders.customerId, Number(customerId)));

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderDate: orders.orderDate,
        orderStatus: orders.orderStatus,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        customerId: orders.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
      })
      .from(orders)
      .leftJoin(customer, eq(orders.customerId, customer.customerId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.orderDate));
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/orders/:id  — includes order items
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [order] = await db
      .select({
        orderId: orders.orderId,
        orderDate: orders.orderDate,
        orderStatus: orders.orderStatus,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        customerId: orders.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
      })
      .from(orders)
      .leftJoin(customer, eq(orders.customerId, customer.customerId))
      .where(eq(orders.orderId, id));
    if (!order) return next(notFound("Order not found"));

    const items = await db
      .select({
        orderDetailId: orderDetails.orderDetailId,
        productId: orderDetails.productId,
        quantity: orderDetails.quantity,
        unitPrice: orderDetails.unitPrice,
        productName: product.productName,
      })
      .from(orderDetails)
      .leftJoin(product, eq(orderDetails.productId, product.productId))
      .where(eq(orderDetails.orderId, id));

    const [pay] = await db.select().from(payment).where(eq(payment.orderId, id));

    res.json({ ...order, items, payment: pay ?? null });
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { orderStatus } = req.body as { orderStatus?: string };
    if (!orderStatus) return next(badRequest("orderStatus is required"));
    const [row] = await db.update(orders).set({ orderStatus: orderStatus as any }).where(eq(orders.orderId, id)).returning();
    if (!row) return next(notFound("Order not found"));
    res.json(row);
  } catch (err) { next(err); }
});

export default router;
