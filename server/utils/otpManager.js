import crypto from "crypto";
import jwt from "jsonwebtoken";

const getOtpSecret = () => {
  return process.env.OTP_SECRET || process.env.JWT_SECRET || "kiet_rmp_secure_otp_secret_key_2026";
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 */
export const generateSixDigitOtp = () => {
  // Generates integer in range [100000, 999999]
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Computes HMAC-SHA256 hash of an OTP string.
 */
export const hashOtp = (otp) => {
  const secret = getOtpSecret();
  return crypto.createHmac("sha256", secret).update(String(otp).trim()).digest("hex");
};

/**
 * Securely compares candidate OTP against stored HMAC hash using timingSafeEqual.
 */
export const verifyOtpHash = (candidateOtp, storedHash) => {
  if (!candidateOtp || !storedHash) return false;
  try {
    const candidateHash = hashOtp(candidateOtp);
    const candidateBuf = Buffer.from(candidateHash, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");

    if (candidateBuf.length !== storedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuf, storedBuf);
  } catch (err) {
    return false;
  }
};

/**
 * Issues a short-lived signed JWT proof of email verification.
 * Used to securely bridge OTP verification to the registration endpoint.
 */
export const generateVerificationToken = (email) => {
  const secret = getOtpSecret();
  return jwt.sign(
    { email: email.trim().toLowerCase(), emailVerified: true },
    secret,
    { expiresIn: "15m" } // Valid for 15 minutes to complete registration
  );
};

/**
 * Verifies the verification proof token.
 */
export const verifyVerificationToken = (token) => {
  if (!token) return null;
  try {
    const secret = getOtpSecret();
    const decoded = jwt.verify(token, secret);
    if (decoded && decoded.emailVerified && decoded.email) {
      return decoded.email;
    }
    return null;
  } catch (err) {
    return null;
  }
};
