import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env so environment variables are reliably populated
// regardless of whether the server is started from root or server directory
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config(); // fallback for current working directory

import express from "express";
import cors from "cors";
import connectDB from "./database/db.js";

import authRoutes from "./routes/authRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Static uploads (e.g., professor images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/professors", professorRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
