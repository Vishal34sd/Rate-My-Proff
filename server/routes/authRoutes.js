import express from "express";
import {
  register,
  login,
  me,
  sendOtp,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Email verification endpoints
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Standard authentication endpoints
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;
