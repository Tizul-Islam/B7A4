import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({ message: "Rental Order ID is required" }).uuid("Invalid rental order ID format"),
    method: z.enum(["STRIPE", "SSLCOMMERZ"], {
      message: "Payment method must be STRIPE or SSLCOMMERZ",
    }),
  }).strict(),
});

export const paymentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid payment ID format"),
  }),
});
