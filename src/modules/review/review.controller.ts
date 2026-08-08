import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { reviewService } from "./review.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

export const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customerId = req.user?.id as string;
  const result = await reviewService.createReview(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review submitted successfully",
    data: result,
  });
});

export const getGearReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const result = await reviewService.getGearReviews(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    data: result,
  });
});
