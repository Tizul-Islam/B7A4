import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { categoryService } from "./category.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";

const getCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await categoryService.getCategories();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await categoryService.createCategory(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const result = await categoryService.updateCategory(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const result = await categoryService.deleteCategory(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoryController = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
