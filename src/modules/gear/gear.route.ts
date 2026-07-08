import { Router } from "express";
import { gearController } from "./gear.controller.js";
import { getGearReviews } from "../review/review.controller.js";
import {
  createGearSchema,
  updateGearSchema,
  getGearQuerySchema,
  getGearByIdSchema,
} from "./gear.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const publicRouter = Router();
publicRouter.get("/", validateRequest(getGearQuerySchema), gearController.getGearList);
publicRouter.get("/:id", validateRequest(getGearByIdSchema), gearController.getGearDetails);
publicRouter.get("/:id/reviews", validateRequest(getGearByIdSchema), getGearReviews);

const providerRouter = Router();
providerRouter.post("/", auth("PROVIDER"), validateRequest(createGearSchema), gearController.createGear);
providerRouter.put("/:id", auth("PROVIDER"), validateRequest(updateGearSchema), gearController.updateGear);
providerRouter.delete("/:id", auth("PROVIDER"), validateRequest(getGearByIdSchema), gearController.deleteGear);

export const gearRoutes = publicRouter;
export const providerGearRoutes = providerRouter;
