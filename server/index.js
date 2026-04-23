import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/db.js";

import authRoutes from "./routes/authRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/professors", professorRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);