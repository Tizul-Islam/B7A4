import cookieParser from "cookie-parser";
import express, { Application, Request, Response, NextFunction } from "express";
import config from "./config";
import cors from "cors";







const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// app.get("/premium", (req: Request, res: Response) => {
//   res.send("<h1>Subscription Successful!</h1><p>Thank you for subscribing. You can now access premium content.</p>");
// });

// app.get("/payment", (req: Request, res: Response) => {
//   res.send("<h1>Subscription Cancelled/Failed</h1><p>The checkout process was cancelled or failed. Please try again.</p>");
// });

// // Routes
// app.use("/api/users", userRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/posts", postRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/subscription", subscriptionRouter);
// app.use("/api/premium",premiumRoutes);
// // Not Found Handler
// app.use(notFound);

// // Global Error Handler
// app.use(globalErrorHandler);

export default app;
