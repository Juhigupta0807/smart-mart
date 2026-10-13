import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";

export const adminRoutes = Router();
adminRoutes.use(requireAdmin);

adminRoutes.get("/ping", (req, res) => {
  res.json({ ok: true, adminId: req.auth!.adminId });
});

adminRoutes.get("/me", (req, res) => {
  res.json({
    ok: true,
    adminId: req.auth!.adminId,
    name: req.auth!.name,
    email: req.auth!.email,
  });
});
