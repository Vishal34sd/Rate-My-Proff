import express from "express";
import { addReview, getMyReviews } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, roleMiddleware("student"), getMyReviews);
router.post("/", authMiddleware, roleMiddleware("student"), addReview);

export default router;