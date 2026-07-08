import bcrypt from "bcrypt";
import config from "../../config/index.js";
import { AppError } from "../../errors/appError.js";
import { prisma } from "../../lib/prisma.js";
import { jwtUtils } from "../../utils/jwt.js";
import { SignOptions } from "jsonwebtoken";

const registerUser = async (payload: any) => {
  const { name, email, password, role, phone, address } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, "Email is already registered", [
      { path: "email", message: "Email is already registered" },
    ]);
  }

  const saltRounds = parseInt(config.bcrypt_salt_rounds);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      activeStatus: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const loginUser = async (payload: any) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.activeStatus === "SUSPENDED") {
    throw new AppError(403, "Your account has been suspended. Please contact support.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expires_in } as SignOptions
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expires_in } as SignOptions
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verifiedToken.success) {
    throw new AppError(401, "Refresh token is invalid or has expired");
  }

  const { id } = verifiedToken.data as any;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.activeStatus === "SUSPENDED") {
    throw new AppError(403, "Your account has been suspended.");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expires_in } as SignOptions
  );

  return {
    accessToken,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};
