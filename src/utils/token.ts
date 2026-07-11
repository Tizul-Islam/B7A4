import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const generateAccessToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as jwt.SignOptions["expiresIn"],
  });
};
