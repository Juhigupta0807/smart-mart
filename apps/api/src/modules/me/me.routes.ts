import { Router } from "express";
import { requireAuth, requireCustomer } from "../../middleware/auth.js";
import { db, user, customer, eq } from "@smartmart/db";

export const meRoutes = Router();

meRoutes.get("/", requireAuth, async (req, res) => {
  res.json({ ok: true, auth: req.auth });
});

meRoutes.patch("/", requireCustomer, async (req, res) => {
  const { name, phone, address } = req.body;
  
  await db.transaction(async (tx) => {
    if (name) {
      await tx.update(user).set({ name }).where(eq(user.id, req.auth!.userId));
    }
    if (phone || address) {
      await tx.update(customer).set({ phone, address }).where(eq(customer.customerId, req.auth!.customerId!));
    }
  });

  res.json({ ok: true });
});
