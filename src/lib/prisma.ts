import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/index.js";
import config from "../config/index.js";

const cleanConnectionString = config.databaseUrl?.split("?")[0];

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

// Pass the pg adapter to PrismaClient
export const prisma = new PrismaClient({ adapter } as any);
