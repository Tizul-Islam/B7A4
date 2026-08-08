import { Router } from "express";
import { rentalController } from "./rental.controller.js";
import {
  createRentalSchema,
  updateOrderStatusSchema,
  rentalIdParamSchema,
} from "./rental.validation.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auth } from "../../middlewares/authMiddleware.js";

const rentalsRouter = Router();
rentalsRouter.post("/", auth("CUSTOMER"), validateRequest(createRentalSchema), rentalController.createRental);
rentalsRouter.get("/", auth(), rentalController.getRentals);
rentalsRouter.get("/:id", auth(), validateRequest(rentalIdParamSchema), rentalController.getRentalDetails);
rentalsRouter.patch("/:id/cancel", auth("CUSTOMER"), validateRequest(rentalIdParamSchema), rentalController.cancelRental);

const providerRouter = Router();
providerRouter.get("/", auth("PROVIDER"), rentalController.getProviderOrders);
providerRouter.patch("/:id", auth("PROVIDER"), validateRequest(updateOrderStatusSchema), rentalController.updateOrderStatus);

export const rentalRoutes = rentalsRouter;
export const providerOrderRoutes = providerRouter;
