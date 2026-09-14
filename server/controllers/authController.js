import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateString } from "../utils/validators.js";

export const register = async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role,
      department,
      section,
      semester,
      registrationNumber,
    } = req.body;

    if (role && role === "admin") {
      return res.status(403).json({
        message: "Admin registration is not allowed. Admin is pre-configured during system setup.",
      });
    }

    if (!validateString(name) || !validateString(email) || !validateString(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!validateString(department)) {
      return res.status(400).json({ message: "Department is required" });
    }

    if (!validateString(section)) {
      return res.status(400).json({ message: "Section is required" });
    }

    const sem = Number(semester);
    if (!Number.isFinite(sem) || sem < 1 || sem > 8) {
      return res.status(400).json({ message: "Semester must be between 1 and 8" });
    }

    if (!validateString(registrationNumber)) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    email = email.trim().toLowerCase();

    if (!email.endsWith("@kiet.edu")) {
      return res.status(400).json({ message: "Only KIET emails allowed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email,
      password: hashed,
      role: "student",
      department: department.trim(),
      section: section.trim(),
      semester: sem,
      registrationNumber: registrationNumber.trim(),
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

export const me = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "No token" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};