import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: TMeta;
  data?: T;
};

export const sendResponse = <T>(res: Response, response: TResponse<T>) => {
  const { success, statusCode, message, meta, data } = response;
  res.status(statusCode).json({
    success,
    statusCode,
    message,
    ...(meta && { meta }),
    data: data !== undefined ? data : {},
  });
};
