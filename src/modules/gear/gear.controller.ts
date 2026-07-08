import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { gearService } from "./gear.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

const getGearList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await gearService.getGearList(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getGearDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const result = await gearService.getGearDetails(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear details retrieved successfully",
    data: result,
  });
});

const createGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const providerId = req.user?.id as string;
  const result = await gearService.createGear(providerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item added to inventory successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const providerId = req.user?.id as string;
  const result = await gearService.updateGear(id, providerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const providerId = req.user?.id as string;
  const result = await gearService.deleteGear(id, providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item deleted successfully",
    data: result,
  });
});

export const gearController = {
  getGearList,
  getGearDetails,
  createGear,
  updateGear,
  deleteGear,
};
