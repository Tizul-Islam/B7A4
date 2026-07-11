import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/create", auth("CUSTOMER"), paymentController.createPayment);
router.post("/webhook", paymentController.stripeWebhook);
router.get("/", auth("CUSTOMER"), paymentController.getMyPayments);
router.get("/:id", auth("CUSTOMER", "ADMIN"), paymentController.getPaymentById);

export const paymentRoutes = router;
