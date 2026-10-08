import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import suppliersRoutes from "./modules/suppliers/suppliers.routes.js";
import supplierOrdersRoutes from "./modules/suppliers/supplier-orders.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./utils/httpError.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/supplier-orders", supplierOrdersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/reports", reportsRoutes);

app.use((req, res, next) => {
  next(notFound(`Route ${req.method} ${req.url} not found`));
});

app.use(errorHandler);

export { app };