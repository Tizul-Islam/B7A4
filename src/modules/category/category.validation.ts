import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ message: "Category name is required" }).min(1, "Name cannot be empty"),
    description: z.string().optional(),
  }).strict(),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().optional(),
  }).strict(),
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID format"),
  }),
});
