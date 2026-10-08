import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.js";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error Details:", err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
  }

  if (err.code) {
    switch (err.code) {
      case "23505":
        return res.status(409).json({ error: "Record already exists." });
      case "23503":
        return res.status(409).json({ error: "Record is referenced by other records." });
      case "23514":
        return res.status(400).json({ error: "Check constraint failed." });
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    error: "Internal Server Error",
    stack: isProd ? undefined : err.stack,
  });
}