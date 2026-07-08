import { Router } from "express";
import { adminController } from "./admin.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "../category/category.validation.js";
import { updateUserStatusSchema } from "./admin.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

// Apply admin guard to all routes in this router
router.use(auth("ADMIN"));

// User Management
router.get("/users", adminController.getUsers);
router.patch("/users/:id", validateRequest(updateUserStatusSchema), adminController.updateUserStatus);

// Inventory & Rentals
router.get("/gear", adminController.getGearListings);
router.get("/rentals", adminController.getRentals);

// Category Management (delegates to categoryController directly since they share the category controllers)
import { categoryController } from "../category/category.controller.js";
router.post("/categories", validateRequest(createCategorySchema), categoryController.createCategory);
router.patch("/categories/:id", validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete("/categories/:id", validateRequest(deleteCategorySchema), categoryController.deleteCategory);

// Stats
router.get("/stats", adminController.getStats);

export const adminRoutes = router;
