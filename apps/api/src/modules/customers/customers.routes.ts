import { Router } from "express";
import { db, customer, user, eq, asc, ilike } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { notFound } from "../../utils/httpError.js";

const router = Router();
router.use(requireAdmin);

// GET /api/customers?search=
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query as { search?: string };
    const query = db
      .select({ 
        customerId: customer.customerId, 
        name: user.name, 
        email: user.email, 
        phone: customer.phone, 
        address: customer.address, 
        createdAt: customer.createdAt 
      })
      .from(customer)
      .innerJoin(user, eq(customer.userId, user.id));

    const rows = search
      ? await query.where(ilike(user.name, `%${search}%`)).orderBy(asc(user.name))
      : await query.orderBy(asc(user.name));
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/customers/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .select({ 
        customerId: customer.customerId, 
        name: user.name, 
        email: user.email, 
        phone: customer.phone, 
        address: customer.address, 
        createdAt: customer.createdAt 
      })
      .from(customer)
      .innerJoin(user, eq(customer.userId, user.id))
      .where(eq(customer.customerId, id));
    if (!row) return next(notFound("Customer not found"));
    res.json(row);
  } catch (err) { next(err); }
});

export default router;
