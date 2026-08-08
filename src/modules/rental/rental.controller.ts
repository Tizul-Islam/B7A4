import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { rentalService } from "./rental.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

const createRental = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customerId = req.user?.id as string;
  const result = await rentalService.createRental(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});

const getRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const result = await rentalService.getRentals(userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rentals retrieved successfully",
    data: result,
  });
});

const getRentalDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const result = await rentalService.getRentalDetails(id, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order details retrieved successfully",
    data: result,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const providerId = req.user?.id as string;
  const result = await rentalService.getProviderOrders(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Incoming provider orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const providerId = req.user?.id as string;
  const { status } = req.body;
  const result = await rentalService.updateOrderStatus(id, providerId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Order status updated to ${status} successfully`,
    data: result,
  });
});

const cancelRental = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id as string;
  const result = await rentalService.cancelRental(id, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order cancelled successfully",
    data: result,
  });
});

export const rentalController = {
  createRental,
  getRentals,
  getRentalDetails,
  getProviderOrders,
  updateOrderStatus,
  cancelRental,
};
