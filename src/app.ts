import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/index.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { userRoutes } from "./modules/user/user.route.js";
import { categoryRoutes } from "./modules/category/category.route.js";
import { gearRoutes, providerGearRoutes } from "./modules/gear/gear.route.js";
import { rentalRoutes, providerOrderRoutes } from "./modules/rental/rental.route.js";
import { paymentRoutes } from "./modules/payment/payment.route.js";
import { reviewRoutes } from "./modules/review/review.route.js";
import { adminRoutes } from "./modules/admin/admin.route.js";
import { notFound } from "./middlewares/notFound.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";

const app: Application = express();

// app.use(
//   cors({
//     origin: [
//       config.app_url,
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//       "http://localhost:5177",
//       "http://localhost:3000"
//     ],
//     credentials: true,
//   })
// );

// Capture raw body for Stripe signature validation before JSON parsing
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
// Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello, World!");
});

// Swagger API Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(swaggerSpec);
});

// Mounting Module Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/provider/gear", providerGearRoutes);
app.use("/api/provider/orders", providerOrderRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler for unmatched routes
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
