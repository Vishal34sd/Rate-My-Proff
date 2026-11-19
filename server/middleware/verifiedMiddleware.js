import User from "../models/userSchema.js";

/**
 * Middleware that ensures the authenticated user has a verified KIET email.
 * Admins bypass this check by default.
 */
export const requireEmailVerified = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admins are pre-verified
    if (req.user.role === "admin") {
      return next();
    }

    // Check token claims first for efficiency
    if (req.user.emailVerified === true) {
      return next();
    }

    // Check database to ensure verification status is accurate
    const user = await User.findById(req.user.id).select("emailVerified role");
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your KIET institutional email address to perform this action.",
        emailVerified: false,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
