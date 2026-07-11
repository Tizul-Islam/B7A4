import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding started...");

  // Seed Admin Credentials
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gearup.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"); 

  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: "Platform Administrator",
      role: "ADMIN",
      activeStatus: "ACTIVE",
    },
    create: {
      email: adminEmail,
      name: "Platform Administrator",
      password: hashedPassword,
      role: "ADMIN",
      activeStatus: "ACTIVE",
    },
  });

  console.log(`Admin user seeded: ${adminUser.email}`);

  // Seed Categories
  const categories = [
    { name: "Hiking", description: "Hiking gear, backpacks, poles, and trail accessories" },
    { name: "Camping", description: "Tents, sleeping bags, stoves, and general camping equipment" },
    { name: "Climbing", description: "Harnesses, ropes, helmets, and carabiners" },
    { name: "Water Sports", description: "Kayaks, paddleboards, life vests, and snorkels" },
    { name: "Cycling", description: "Mountain bikes, road bikes, helmets, and repair kits" },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    });
    console.log(`Category seeded: ${category.name}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // End the pool connection
    await pool.end();
  });
