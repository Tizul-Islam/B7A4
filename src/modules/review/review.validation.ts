import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({ message: "Rental Order ID is required" }).uuid("Invalid rental order ID format"),
    gearItemId: z.string({ message: "Gear item ID is required" }).uuid("Invalid gear item ID format"),
    rating: z
      .number({ message: "Rating is required" })
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),
    comment: z.string({ message: "Comment is required" }).min(1, "Comment cannot be empty"),
  }).strict(),
});
