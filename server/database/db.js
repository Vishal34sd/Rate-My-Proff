import mongoose from "mongoose";
import dns from "dns";
import seedAdmin from "./seedAdmin.js";

// Ensure Node.js resolves MongoDB SRV records via reliable public DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("Warning: Could not set custom DNS servers:", err.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected Successfully`);
    await seedAdmin();
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;