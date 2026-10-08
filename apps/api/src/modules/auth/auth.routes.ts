import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@smartmart/db";
import { admin } from "@smartmart/db";
import { eq } from "@smartmart/db";
import { env } from "../../config/env.js";
import { badRequest, unauthorized } from "../../utils/httpError.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

// POST /api/auth/admin/login
router.post("/admin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return next(badRequest("email and password are required"));

    const [found] = await db.select().from(admin).where(eq(admin.email, email.toLowerCase())).limit(1);
    if (!found) return next(unauthorized("Invalid credentials"));

    const valid = await bcrypt.compare(password, found.password);
    if (!valid) return next(unauthorized("Invalid credentials"));

    const token = jwt.sign(
      { adminId: found.adminId, email: found.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      admin: { adminId: found.adminId, name: found.name, email: found.email },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/admin/logout
router.post("/admin/logout", requireAdmin, (_req, res) => {
  res.clearCookie("admin_token");
  res.json({ message: "Logged out" });
});

// GET /api/auth/admin/me
router.get("/admin/me", requireAdmin, async (req, res, next) => {
  try {
    const [found] = await db
      .select({ adminId: admin.adminId, name: admin.name, email: admin.email, createdAt: admin.createdAt })
      .from(admin)
      .where(eq(admin.adminId, req.admin!.adminId))
      .limit(1);
    if (!found) return next(unauthorized());
    res.json(found);
  } catch (err) {
    next(err);
  }
});

export default router;
