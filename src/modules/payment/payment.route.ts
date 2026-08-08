import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { createPaymentSchema, paymentIdParamSchema } from "./payment.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/create", auth("CUSTOMER"), validateRequest(createPaymentSchema), paymentController.createPaymentIntent);
router.post("/confirm", paymentController.confirmPaymentWebhook); // Webhook endpoint is public, handles Stripe verification internally
router.get("/", auth(), paymentController.getPaymentHistory);
router.get("/:id", auth(), validateRequest(paymentIdParamSchema), paymentController.getPaymentDetails);

export const paymentRoutes = router;
