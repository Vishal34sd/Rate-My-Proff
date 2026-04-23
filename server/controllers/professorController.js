import Professor from "../models/Professor.js";

export const addProfessor = async (req, res) => {
  try {
    const { name, department, subjects, sections } = req.body;

    if (!name?.trim() || !department?.trim()) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const prof = await Professor.create({
      name: name.trim(),
      department: department.trim(),
      subjects,
      sections,
    });

    res.status(201).json(prof);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProfessors = async (req, res) => {
  try {
    const profs = await Professor.find();
    res.json(profs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProfessor = async (req, res) => {
  try {
    await Professor.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};