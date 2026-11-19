import express from "express";
import { addReview, getMyReviews } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { requireEmailVerified } from "../middleware/verifiedMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, roleMiddleware("student"), getMyReviews);
router.post("/", authMiddleware, roleMiddleware("student"), requireEmailVerified, addReview);

export default router;
