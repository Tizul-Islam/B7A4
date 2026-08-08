import { z } from "zod";

export const createRentalSchema = z.object({
  body: z.object({
    startDate: z.string({ message: "Start date is required" }).datetime("Start date must be a valid ISO datetime"),
    endDate: z.string({ message: "End date is required" }).datetime("End date must be a valid ISO datetime"),
    items: z
      .array(
        z.object({
          gearItemId: z.string().uuid("Invalid gear item ID"),
          quantity: z.number().int().positive("Quantity must be a positive integer"),
        })
      )
      .min(1, "At least one item must be rented"),
  }).strict()
  .refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start < end;
  }, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine((data) => {
    const start = new Date(data.startDate);
    const now = new Date();
    // Allow small delay for timezone differences
    return start.getTime() >= now.getTime() - 5 * 60 * 1000;
  }, {
    message: "Start date cannot be in the past",
    path: ["startDate"],
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "PICKED_UP", "RETURNED"], {
      message: "Status must be CONFIRMED, PICKED_UP, or RETURNED",
    }),
  }).strict(),
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});

export const rentalIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});
