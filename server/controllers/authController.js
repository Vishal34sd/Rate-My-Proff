import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateString } from "../utils/validators.js";

export const register = async (req, res) => {
  try {
    let { name, email, password, role, department, section, collegeId } = req.body;

    if (!validateString(name) || !validateString(email) || !validateString(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    email = email.trim().toLowerCase();

    if (!email.endsWith("@kiet.edu")) {
      return res.status(400).json({ message: "Only KIET emails allowed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashed,
      role,
      department: department?.trim(),
      section: section?.trim(),
      collegeId: collegeId?.trim(),
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!validateString(email) || !validateString(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department, section: user.section },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};