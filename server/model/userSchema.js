import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@kiet\.edu$/, "Invalid KIET email"],
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], required: true },
    department: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    collegeId: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);