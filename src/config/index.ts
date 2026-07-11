import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || "3000",
  databaseUrl: process.env.DATABASE_URL,
  app_url: process.env.APP_URL || "http://localhost:5173",
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || "12",
  jwt_access_secret:
    process.env.JWT_ACCESS_SECRET || "your_super_secret_jwt_access_key",
  jwt_refresh_secret:
    process.env.JWT_REFRESH_SECRET || "your_super_secret_jwt_refresh_key",
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripe_success_url:
    process.env.STRIPE_SUCCESS_URL ||
    `${process.env.APP_URL || "http://localhost:5173"}/success`,
  stripe_cancel_url:
    process.env.STRIPE_CANCEL_URL ||
    `${process.env.APP_URL || "http://localhost:5173"}/cancel`, 
  admin_email: process.env.ADMIN_EMAIL || "admin@gearup.com",
  admin_password: process.env.ADMIN_PASSWORD || "Admin@12345",
  node_env: process.env.NODE_ENV || "development",

  stripe_product_price_id: process.env.STRIPE_PRODUCT_PRICE_ID,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,   
};
