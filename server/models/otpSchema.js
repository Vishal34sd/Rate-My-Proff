import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    consumed: {
      type: Boolean,
      default: false,
      index: true,
    },

    consumedAt: {
      type: Date,
    },

    ip: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// TTL index to automatically purge old OTP records 1 hour after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("Otp", otpSchema);
