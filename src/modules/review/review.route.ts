import { Router } from "express";
import { createReview } from "./review.controller.js";
import { createReviewSchema } from "./review.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/", auth("CUSTOMER"), validateRequest(createReviewSchema), createReview);

export const reviewRoutes = router;
