import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { adminService } from "./admin.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

const getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All users retrieved successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const { activeStatus } = req.body;
  const result = await adminService.updateUserStatus(id, activeStatus);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User account status updated to ${activeStatus} successfully`,
    data: result,
  });
});

const getGearListings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getGearListings();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All gear listings retrieved successfully",
    data: result,
  });
});

const getRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getRentals();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All rental orders retrieved successfully",
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await adminService.getStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Platform statistics retrieved successfully",
    data: result,
  });
});

export const adminController = {
  getUsers,
  updateUserStatus,
  getGearListings,
  getRentals,
  getStats,
};
