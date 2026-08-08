export class AppError extends Error {
  public statusCode: number;
  public errorSource?: { path: string; message: string }[];

  constructor(
    statusCode: number,
    message: string,
    errorSource?: { path: string; message: string }[],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    if (errorSource) {
      this.errorSource = errorSource;
    }
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
