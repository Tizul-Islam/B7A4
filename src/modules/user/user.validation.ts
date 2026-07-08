import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{4,14}$/, "Phone number must be in a valid format")
      .optional(),
    address: z.string().optional(),
  }).strict(),
});
