import { Router } from "express";
import { authController } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", auth(), authController.getMe);

export const authRoutes = router;
