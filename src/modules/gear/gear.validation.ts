import { z } from "zod";

export const createGearSchema = z.object({
  body: z.object({
    name: z.string({ message: "Name is required" }).min(1, "Name cannot be empty"),
    description: z.string({ message: "Description is required" }).min(1, "Description cannot be empty"),
    brand: z.string({ message: "Brand is required" }).min(1, "Brand cannot be empty"),
    categoryId: z.string({ message: "Category ID is required" }).uuid("Invalid Category ID format"),
    images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
    pricePerDay: z.coerce.number({ message: "Price per day is required" }).positive("Price must be a positive number"),
    stockQuantity: z.coerce.number({ message: "Stock quantity is required" }).int().nonnegative("Stock quantity must be non-negative"),
    condition: z.enum(["NEW", "GOOD", "FAIR"], {
      message: "Condition must be NEW, GOOD, or FAIR",
    }),
    isAvailable: z.boolean().optional(),
  }).strict(),
});

export const updateGearSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    brand: z.string().min(1, "Brand cannot be empty").optional(),
    categoryId: z.string().uuid("Invalid Category ID format").optional(),
    images: z.array(z.string().url("Invalid image URL")).min(1).optional(),
    pricePerDay: z.coerce.number().positive("Price must be a positive number").optional(),
    stockQuantity: z.coerce.number().int().nonnegative("Stock quantity must be non-negative").optional(),
    condition: z.enum(["NEW", "GOOD", "FAIR"]).optional(),
    isAvailable: z.boolean().optional(),
  }).strict(),
  params: z.object({
    id: z.string().uuid("Invalid gear ID format"),
  }),
});

export const getGearQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(), // category ID or category name
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    brand: z.string().optional(),
    isAvailable: z.string().optional(), // we'll parse this manually in controller
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100, "Limit cannot exceed 100 items per page").default(10),
    sortBy: z.string().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const getGearByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid gear ID format"),
  }),
});
