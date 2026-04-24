import mongoose from "mongoose";

const professorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true, default: '' },
    subjects: { type: [String], default: [] },
    sections: { type: [String], default: [] },

    qualification: { type: String, trim: true, default: '' },
    post: { type: String, trim: true, default: '' },
    experienceYears: { type: Number, min: 0, default: null },
    officialEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      match: [/^$|^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
      match: [/^$|^[0-9+()\-\s]{7,20}$/, 'Invalid contact number'],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Professor", professorSchema);