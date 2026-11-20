import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

// Automated daily reminder scheduler: triggers daily review reminders every evening
let lastReminderDate = null;
const runDailyReminderCheck = async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    // Trigger between 17:00 and 22:00 once per calendar day
    if (now.getHours() >= 17 && lastReminderDate !== todayStr) {
      lastReminderDate = todayStr;
      console.log(`[DAILY SCHEDULER] Triggering automated daily review reminders for ${todayStr}...`);
      const { sendDailyReviewReminder } = await import("./utils/emailService.js");
      const User = (await import("./models/userSchema.js")).default;
      const students = await User.find({ role: "student", emailVerified: true }).select("name email");
      let count = 0;
      for (const student of students) {
        try {
          await sendDailyReviewReminder(student.email, student.name);
          count++;
        } catch (e) {
          console.warn(`[DAILY SCHEDULER] Failed to send reminder to ${student.email}:`, e.message);
        }
      }
      console.log(`[DAILY SCHEDULER] Daily review reminders sent to ${count} students for ${todayStr}.`);
    }
  } catch (err) {
    console.error("[DAILY SCHEDULER ERROR]", err.message);
  }
};

// Check on startup after 10 seconds, then every 30 minutes
setTimeout(runDailyReminderCheck, 10 * 1000);
setInterval(runDailyReminderCheck, 30 * 60 * 1000);

app.listen(process.env.PORT || 8080, () =>
  console.log(`Server running on port ${process.env.PORT || 8080}`)
);
