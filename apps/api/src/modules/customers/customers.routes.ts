import { Router } from "express";
import { db, customer, eq, asc, ilike, desc } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/customers?search=
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query as { search?: string };
    const rows = search
      ? await db
          .select({ customerId: customer.customerId, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, createdAt: customer.createdAt })
          .from(customer)
          .where(ilike(customer.name, `%${search}%`))
          .orderBy(asc(customer.name))
      : await db
          .select({ customerId: customer.customerId, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, createdAt: customer.createdAt })
          .from(customer)
          .orderBy(asc(customer.name));
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/customers/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .select({ customerId: customer.customerId, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, createdAt: customer.createdAt })
      .from(customer)
      .where(eq(customer.customerId, id));
    if (!row) return next(notFound("Customer not found"));
    res.json(row);
  } catch (err) { next(err); }
});

export default router;
