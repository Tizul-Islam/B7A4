import { Router } from "express";
import { userController } from "./user.controller.js";
import { updateMeSchema } from "./user.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", auth(), userController.getProfile);
router.put("/me", auth(), validateRequest(updateMeSchema), userController.updateProfile);

export const userRoutes = router;
