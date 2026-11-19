
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Reference to the professor whose feedback is being submitted.
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
    },
// Stores the student reference privately and excludes it from queries by default.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false,
    },
// Stores individual ratings for evaluating different aspects of teaching.
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 5 Faculty Rating Parameters (1-5 stars: 1 = Poor, 5 = Excellent)
    teachingQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    subjectKnowledge: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    doubtResolution: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    fairnessInGrading: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    classEngagement: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
// Optional written feedback provided by the student.
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

// Maintains a list of students who found this review helpful.
    helpfulBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      select: false,
    },
// Keeps track of the total helpful votes received by a review.
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);
// Ensures that a student can submit only one review for a professor.
reviewSchema.index({ professor: 1, student: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
