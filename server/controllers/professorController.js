import Professor from "../models/professorSchema.js";

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeOptionalString = (value) => {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeOptionalNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
};

export const addProfessor = async (req, res) => {
  try {
    const {
      name,
      department,
      imageUrl,
      subjects,
      sections,
      qualification,
      post,
      experienceYears,
      officialEmail,
      contactNumber,
      // Optional: accept newer client keys but store as department/sections
      dept,
      section,
    } = req.body;

    const resolvedDepartment = (department ?? dept ?? '').toString().trim();
    const resolvedName = (name ?? '').toString().trim();
    const resolvedSections = normalizeStringArray(sections ?? section);

    if (!resolvedName || !resolvedDepartment) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const uploadedImageUrl = req.file ? `/uploads/professors/${req.file.filename}` : '';

    const prof = await Professor.create({
      name: resolvedName,
      department: resolvedDepartment,
      imageUrl: uploadedImageUrl || normalizeOptionalString(imageUrl),
      subjects: normalizeStringArray(subjects),
      sections: resolvedSections,
      qualification: normalizeOptionalString(qualification),
      post: normalizeOptionalString(post),
      experienceYears: normalizeOptionalNumber(experienceYears),
      officialEmail: normalizeOptionalString(officialEmail),
      contactNumber: normalizeOptionalString(contactNumber),
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
    const {
      name,
      department,
      imageUrl,
      subjects,
      sections,
      qualification,
      post,
      experienceYears,
      officialEmail,
      contactNumber,
      // Optional: accept newer client keys but store as department/sections
      dept,
      section,
    } = req.body;

    const resolvedDepartment = (department ?? dept ?? '').toString().trim();
    const resolvedName = (name ?? '').toString().trim();
    const resolvedSections = normalizeStringArray(sections ?? section);

    if (!resolvedName || !resolvedDepartment) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const updateDoc = {
      name: resolvedName,
      department: resolvedDepartment,
      subjects: normalizeStringArray(subjects),
      sections: resolvedSections,
      qualification: normalizeOptionalString(qualification),
      post: normalizeOptionalString(post),
      experienceYears: normalizeOptionalNumber(experienceYears),
      officialEmail: normalizeOptionalString(officialEmail),
      contactNumber: normalizeOptionalString(contactNumber),
    };

    if (req.file) {
      updateDoc.imageUrl = `/uploads/professors/${req.file.filename}`;
    } else if (typeof imageUrl === 'string') {
      // Only update via body if explicitly provided.
      updateDoc.imageUrl = imageUrl.trim();
    }

    const updated = await Professor.findByIdAndUpdate(req.params.id, updateDoc, {
      new: true,
      runValidators: true,
    });

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