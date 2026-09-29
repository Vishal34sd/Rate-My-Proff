import express from "express";
import {
  addReview,
  getMyReviews,
  flagReview,
  getFlaggedReviews,
  resolveFlag,
} from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, roleMiddleware("student"), getMyReviews);
router.post("/", authMiddleware, roleMiddleware("student"), addReview);

// flagging / moderation
router.get("/flagged", authMiddleware, roleMiddleware("admin"), getFlaggedReviews);
router.post("/:id/flag", authMiddleware, flagReview);
router.patch("/:id/resolve", authMiddleware, roleMiddleware("admin"), resolveFlag);

export default router;