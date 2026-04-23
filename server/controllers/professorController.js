import Professor from "../models/professorSchema.js";

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

export const addProfessor = async (req, res) => {
  try {
    const { name, department, subjects, sections } = req.body;

    if (!name?.trim() || !department?.trim()) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const prof = await Professor.create({
      name: name.trim(),
      department: department.trim(),
      subjects: normalizeStringArray(subjects),
      sections: normalizeStringArray(sections),
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

export const getProfessorById = async (req, res) => {
  try {
    const prof = await Professor.findById(req.params.id);
    if (!prof) return res.status(404).json({ message: 'Professor not found' });
    res.json(prof);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfessor = async (req, res) => {
  try {
    const { name, department, subjects, sections } = req.body;

    if (!name?.trim() || !department?.trim()) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const updated = await Professor.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        department: department.trim(),
        subjects: normalizeStringArray(subjects),
        sections: normalizeStringArray(sections),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Professor not found' });
    res.json(updated);
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