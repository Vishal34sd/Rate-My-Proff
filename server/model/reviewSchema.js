// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professor",
  },
  rating: Number,
  comment: String,

  
  studentHidden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    select: false,
  },

  subject: String,
  department: String,
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);