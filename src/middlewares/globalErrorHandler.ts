import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import config from "../config/index.js";

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("[Global Error Handler] Caught error:", err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let errorSource: { path: string; message: string }[] = err.errorSource || [];

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSource = err.issues.map((issue) => ({
      path: issue.path.map((p) => p.toString()).join("."),
      message: issue.message,
    }));
  }

  

  // Handle Prisma Database Errors (Prisma Client returns errors with code)
  if (err.code) {
    // Unique constraint violation (e.g., duplicate email)
    if (err.code === "P2002") {
      statusCode = 409;
      const targetFields = err.meta?.target ? (err.meta.target as string[]) : [];
      message = targetFields.length
        ? `${targetFields.join(", ")} already exists`
        : "Record already exists";
      errorSource = targetFields.map((field) => ({
        path: field,
        message: `${field} is already registered`,
      }));
    }
    // Foreign key constraint violation
    else if (err.code === "P2003") {
      statusCode = 400;
      message = "Invalid reference ID";
      const field = err.meta?.field_name ? String(err.meta.field_name) : "id";
      errorSource = [
        {
          path: field,
          message: "The referenced record does not exist",
        },
      ];
    }
    // Record not found
    else if (err.code === "P2025") {
      statusCode = 404;
      message = err.meta?.cause || err.message || "Record not found";
    }
  }

  // Final structured response
  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: {
      statusCode,
      ...(errorSource.length > 0 ? { errorSource } : {}),
      ...(config.node_env === "development" ? { stack: err.stack } : {}),
    },
  });
};
