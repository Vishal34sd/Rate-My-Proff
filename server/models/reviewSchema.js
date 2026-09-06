// models/Review.js
import mongoose from "mongoose";

const flagSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "offensive", "irrelevant", "fake", "other"],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false, // keeps review anonymous
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      default: "",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["visible", "under_review", "removed"],
      default: "visible",
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    flagCount: {
      type: Number,
      default: 0,
    },

    flags: {
      type: [flagSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// 🔥 prevent duplicate review per student per professor
reviewSchema.index({ professor: 1, student: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);