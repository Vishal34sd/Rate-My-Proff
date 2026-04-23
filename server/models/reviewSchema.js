// models/Review.js
import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

// 🔥 prevent duplicate review per student per professor
reviewSchema.index({ professor: 1, student: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);