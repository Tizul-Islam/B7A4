import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    activeStatus: z.enum(["ACTIVE", "SUSPENDED"], {
      message: "activeStatus is required and must be ACTIVE or SUSPENDED",
    }),
  }).strict(),
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});

export const adminIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid ID format"),
  }),
});
