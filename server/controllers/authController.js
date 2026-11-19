import User from "../models/userSchema.js";
import Otp from "../models/otpSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  validateString,
  validateKietEmail,
  normalizeEmail,
  validateOtpFormat,
} from "../utils/validators.js";
import {
  generateSixDigitOtp,
  hashOtp,
  verifyOtpHash,
  generateVerificationToken,
  verifyVerificationToken,
} from "../utils/otpManager.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { checkIpRateLimit } from "../utils/rateLimiter.js";

const KIET_ERROR_MSG =
  "Please use your KIET institutional email address ending with @kiet.edu.";

/**
 * Send a 6-digit OTP to a valid KIET email address.
 * POST /api/auth/send-otp
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate IP Rate Limit
    const ipCheck = checkIpRateLimit(req.ip, 15, 10 * 60 * 1000);
    if (!ipCheck.allowed) {
      return res.status(429).json({ message: ipCheck.message });
    }

    // 2. Validate KIET Email Domain Strictly
    if (!validateKietEmail(email)) {
      return res.status(400).json({ message: KIET_ERROR_MSG });
    }

    const cleanEmail = normalizeEmail(email);

    // 3. Enforce 60-Second Cooldown between OTP sends
    const latestOtp = await Otp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    if (latestOtp) {
      const elapsedMs = Date.now() - new Date(latestOtp.createdAt).getTime();
      if (elapsedMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
          retryAfterSeconds: remainingSeconds,
        });
      }
    }

    // 4. Enforce Hourly Limit: Maximum 5 OTPs per email per rolling hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyCount = await Otp.countDocuments({
      email: cleanEmail,
      createdAt: { $gte: oneHourAgo },
    });

    if (hourlyCount >= 5) {
      return res.status(429).json({
        message:
          "Maximum verification attempts reached for this email in this hour (limit: 5). Please try again later.",
      });
    }

    // 5. Invalidate previous active unconsumed OTPs for this email
    await Otp.updateMany(
      { email: cleanEmail, consumed: false },
      { consumed: true, consumedAt: new Date() }
    );

    // 6. Generate cryptographically secure 6-digit OTP
    const rawOtp = generateSixDigitOtp();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // 7. Store OTP hash in database (never store plain OTP)
    await Otp.create({
      email: cleanEmail,
      otpHash,
      expiresAt,
      ip: req.ip,
      attempts: 0,
      consumed: false,
    });

    // 8. Send OTP via Nodemailer
    await sendVerificationEmail(cleanEmail, rawOtp);

    // 9. Respond to client (NEVER expose the raw OTP in response)
    return res.status(200).json({
      success: true,
      message: "Verification code sent to your KIET email address.",
      email: cleanEmail,
      expiresInSeconds: 300,
      cooldownSeconds: 60,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to send verification code." });
  }
};

/**
 * Resend OTP (aliases sendOtp with strict cooldown enforcement)
 * POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res) => {
  return sendOtp(req, res);
};

/**
 * Verify a 6-digit OTP.
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Validate Email & OTP format
    if (!validateKietEmail(email)) {
      return res.status(400).json({ message: KIET_ERROR_MSG });
    }

    if (!validateOtpFormat(otp)) {
      return res.status(400).json({ message: "Invalid code format. Please enter a 6-digit number." });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp).trim();

    // 2. Locate active, non-expired, unconsumed OTP
    const now = new Date();
    const activeOtp = await Otp.findOne({
      email: cleanEmail,
      consumed: false,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    if (!activeOtp) {
      return res.status(400).json({
        message: "Invalid or expired verification code. Please request a new one.",
      });
    }

    // 3. Brute-force protection: Max 5 incorrect attempts
    if (activeOtp.attempts >= 5) {
      activeOtp.consumed = true;
      activeOtp.consumedAt = now;
      await activeOtp.save();
      return res.status(400).json({
        message: "Too many incorrect attempts. This code has been invalidated. Please request a new one.",
      });
    }

    // 4. Secure timing-safe hash comparison
    const isMatch = verifyOtpHash(cleanOtp, activeOtp.otpHash);

    if (!isMatch) {
      activeOtp.attempts += 1;
      if (activeOtp.attempts >= 5) {
        activeOtp.consumed = true;
        activeOtp.consumedAt = now;
      }
      await activeOtp.save();

      const remaining = Math.max(0, 5 - activeOtp.attempts);
      return res.status(400).json({
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
        remainingAttempts: remaining,
      });
    }

    // 5. Mark OTP as consumed immediately to prevent reuse
    activeOtp.consumed = true;
    activeOtp.consumedAt = now;
    await activeOtp.save();

    // 6. Update user's email verification status if account exists
    const existingUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      { emailVerified: true },
      { new: true }
    );

    // 7. Generate a secure, tamper-proof verification proof token for registration flow
    const verificationToken = generateVerificationToken(cleanEmail);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      email: cleanEmail,
      emailVerified: true,
      verificationToken,
      hasAccount: Boolean(existingUser),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to verify code." });
  }
};

/**
 * Student Registration
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role,
      department,
      section,
      semester,
      registrationNumber,
      verificationToken,
    } = req.body;

    if (role && role === "admin") {
      return res.status(403).json({
        message: "Admin registration is not allowed. Admin is pre-configured during system setup.",
      });
    }

    if (!validateString(name) || !validateString(email) || !validateString(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!validateString(department)) {
      return res.status(400).json({ message: "Department is required" });
    }

    if (!validateString(section)) {
      return res.status(400).json({ message: "Section is required" });
    }

    const sem = Number(semester);
    if (!Number.isFinite(sem) || sem < 1 || sem > 8) {
      return res.status(400).json({ message: "Semester must be between 1 and 8" });
    }

    if (!validateString(registrationNumber)) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    // Strict KIET domain validation
    if (!validateKietEmail(email)) {
      return res.status(400).json({ message: KIET_ERROR_MSG });
    }

    email = normalizeEmail(email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: "An account with this KIET email is already registered." });
    }

    // Verify that the email was verified via OTP
    let isEmailVerified = false;

    // Check 1: Cryptographic verification token
    if (verificationToken) {
      const verifiedEmail = verifyVerificationToken(verificationToken);
      if (verifiedEmail && verifiedEmail === email) {
        isEmailVerified = true;
      }
    }

    // Check 2: Recent consumed OTP record in DB (within 15 minutes)
    if (!isEmailVerified) {
      const recentOtp = await Otp.findOne({
        email,
        consumed: true,
        consumedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
      });
      if (recentOtp) {
        isEmailVerified = true;
      }
    }

    if (!isEmailVerified) {
      return res.status(403).json({
        message: "Email verification is required before creating an account. Please verify your OTP.",
        requireOtp: true,
        email,
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    // If an unverified user record previously existed, update it; otherwise create new
    if (existingUser) {
      existingUser.name = name.trim();
      existingUser.password = hashed;
      existingUser.department = department.trim();
      existingUser.section = section.trim();
      existingUser.semester = sem;
      existingUser.registrationNumber = registrationNumber.trim();
      existingUser.emailVerified = true;
      await existingUser.save();
    } else {
      await User.create({
        name: name.trim(),
        email,
        password: hashed,
        role: "student",
        department: department.trim(),
        section: section.trim(),
        semester: sem,
        registrationNumber: registrationNumber.trim(),
        emailVerified: true,
      });
    }

    res.status(201).json({
      success: true,
      message: "Account registered and email verified successfully. You can now log in.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "An account with this registration number or email already exists.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!validateString(email) || !validateString(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    email = normalizeEmail(email);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    // Enforce email verification for students
    if (user.role === "student" && !user.emailVerified) {
      return res.status(403).json({
        message: "Your KIET email address has not been verified yet. Please verify your email.",
        emailVerified: false,
        email: user.email,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        department: user.department,
        section: user.section,
        emailVerified: user.emailVerified || user.role === "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified || user.role === "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Current User Profile
 * GET /api/auth/me
 */
export const me = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "No token" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
