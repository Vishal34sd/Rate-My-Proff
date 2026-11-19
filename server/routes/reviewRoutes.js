
import express from "express";
import {
  addReview,
  getMyReviews,
  toggleHelpful
} from "../controllers/reviewController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, roleMiddleware("student"), getMyReviews);

router.post("/", authMiddleware, roleMiddleware("student"), addReview);

router.post(
"/:id/helpful",
authMiddleware,
roleMiddleware("student"),
toggleHelpful
);

export default router;
