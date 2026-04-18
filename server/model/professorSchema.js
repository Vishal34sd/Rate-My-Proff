// models/Professor.js
import mongoose from "mongoose";

const professorSchema = new mongoose.Schema({
  name: String,
  department: String,
  subjects: [String], 
}, { timestamps: true });

export default mongoose.model("Professor", professorSchema);