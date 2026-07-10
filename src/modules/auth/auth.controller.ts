import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { catchAsync } from "../../utils/catchAsync.js";
import config from "../../config/index.js";

const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await authService.registerUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);
  const isProduction = config.node_env === "production";

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token);
  const isProduction = config.node_env === "production";

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token retrieved successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const result = await authService.getMe(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});

export const authController = {
  register,
  login,
  refreshToken,
  getMe,
};
