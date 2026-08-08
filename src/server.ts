import app from "./app.js";
import config from "./config/index.js";
import { prisma } from "./lib/prisma.js";
import bcrypt from "bcrypt";

const PORT = config.port || 3000;

async function checkAndSeedAdmin() {
  try {
    const adminEmail = config.admin_email;
    const adminPassword = config.admin_password;
    const saltRounds = parseInt(config.bcrypt_salt_rounds);

    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    await prisma.user.upsert({
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
    console.log(`[Startup] Seed check: Admin account '${adminEmail}' is ready.`);
  } catch (err: any) {
    if (err.code === "P2021") {
      console.warn(
        "\n⚠️  [Startup Warning] Database tables do not exist yet. Please run 'npx prisma db push' to create tables, then restart the server to seed the admin user.\n"
      );
    } else {
      console.error("[Startup] Failed to check and seed admin user on boot:", err);
    }
  }
}

async function startServer() {
  try {
    // 1. Connect to database
    console.log("Connecting to the database...");
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    // 2. Ensure Admin user exists on boot
    await checkAndSeedAdmin();

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    // Disconnect Prisma on startup failure
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();