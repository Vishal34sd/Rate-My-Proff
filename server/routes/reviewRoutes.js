
import express from "express";
import {
  addReview,
  getMyReviews,
  getAllReviewsAdmin,
  toggleHelpful,
  voteReview,
  sendDailyReminders,
  getDailyAndWeeklyAnalytics,
} from "../controllers/reviewController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { requireEmailVerified } from "../middleware/verifiedMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, roleMiddleware("student"), getMyReviews);
router.get("/admin/all", authMiddleware, roleMiddleware("admin"), getAllReviewsAdmin);
router.get("/analytics/trends", authMiddleware, roleMiddleware("admin"), getDailyAndWeeklyAnalytics);
router.post("/send-reminders", authMiddleware, roleMiddleware("admin"), sendDailyReminders);
router.post("/:id/vote", authMiddleware, voteReview);
router.post("/:id/helpful", authMiddleware, toggleHelpful);
router.post("/", authMiddleware, roleMiddleware("student"), requireEmailVerified, addReview);

export default router;
