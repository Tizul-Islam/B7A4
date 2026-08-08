import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { paymentService } from "./payment.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

const createPaymentIntent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customerId = req.user?.id as string;
  const result = await paymentService.createPaymentIntent(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment initialized successfully",
    data: result,
  });
});

const confirmPaymentWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers["stripe-signature"] as string;
  const result = await paymentService.confirmPaymentWebhook((req as any).rawBody, signature);

  // Send direct response since this is a public webhook called by Stripe
  res.status(200).json(result);
});

const getPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const result = await paymentService.getPaymentHistory(userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const result = await paymentService.getPaymentDetails(id, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

export const paymentController = {
  createPaymentIntent,
  confirmPaymentWebhook,
  getPaymentHistory,
  getPaymentDetails,
};
