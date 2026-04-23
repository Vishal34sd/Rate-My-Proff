import mongoose from "mongoose";

const professorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    subjects: { type: [String], default: [] },
    sections: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Professor", professorSchema);