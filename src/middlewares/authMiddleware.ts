import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import { AppError } from "../errors/appError.js";
import { prisma } from "../lib/prisma.js";
import { jwtUtils } from "../utils/jwt.js";
import { catchAsync } from "../utils/catchAsync.js";

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Read token from cookie first, fallback to header
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    // Debug info to help identify auth failures (remove for production)
    console.log("[AuthDebug] authorization header:", req.headers.authorization);
    console.log("[AuthDebug] cookies:", req.cookies);

    if (!token) {
      console.log("[AuthDebug] No token extracted from request.");
      throw new AppError(
        401,
        "You are not authorized! Access token is missing.",
      );
    }

    console.log("[AuthDebug] Extracted token:", token);

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      console.log(
        "[AuthDebug] Token verification failed:",
        verifiedToken.error,
      );
      throw new AppError(
        401,
        "You are not authorized! Access token is invalid or has expired.",
      );
    }

    const { id, email, role } = verifiedToken.data as JwtPayload;

    // Check database user status
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, "Authenticated user not found.");
    }

    if (user.activeStatus === "SUSPENDED") {
      throw new AppError(
        403,
        "Your account has been suspended. Please contact support.",
      );
    }

    // Role authorization check
    console.log("[AuthDebug] requiredRoles:", requiredRoles);
    console.log("[AuthDebug] user role in DB:", user.role);
    console.log("[AuthDebug] user.role !== 'ADMIN':", user.role !== "ADMIN");
    console.log(
      "[AuthDebug] !requiredRoles.includes(user.role):",
      !requiredRoles.includes(user.role as Role),
    );

    if (
      requiredRoles.length > 0 &&
      user.role !== "ADMIN" &&
      !requiredRoles.includes(user.role as Role)
    ) {
      console.log("[AuthDebug] Throwing 403 Forbidden!");
      throw new AppError(
        403,
        "You do not have permission to access this resource.",
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };

    next();
  });
};
