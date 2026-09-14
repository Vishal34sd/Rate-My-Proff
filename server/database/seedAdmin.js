import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/userSchema.js";

export const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@kiet.edu").trim().toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists: ${adminEmail}`);
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: process.env.ADMIN_NAME || "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      department: process.env.ADMIN_DEPARTMENT || "Administration",
    });

    console.log(`[Seed] Admin user created successfully: ${admin.email}`);
  } catch (error) {
    console.error("[Seed] Failed to seed admin user:", error.message);
  }
};

// Allow standalone execution via CLI (e.g. `npm run seed:admin`)
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  dotenv.config();
  if (!process.env.MONGO_URI) {
    console.error("[Seed] MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("Connected to MongoDB for admin seeding...");
      await seedAdmin();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed] Standalone seed error:", err.message);
      process.exit(1);
    });
}

export default seedAdmin;
