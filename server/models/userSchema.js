// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@kiet\.edu$/, "Invalid KIET email"],
    },

    password: { 
      type: String, 
      required: true 
    },

    role: { 
      type: String, 
      enum: ["student", "admin"], 
      required: true 
    },

    department: { 
      type: String, 
      required: true, 
      trim: true 
    },

    section: { 
      type: String, 
      trim: true 
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
    },

    
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // allows multiple nulls (important for admins)
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);