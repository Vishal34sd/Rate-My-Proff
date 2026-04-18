// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  department: String,   
  subjects: [String],   
}, { timestamps: true });

export default mongoose.model("User", userSchema);