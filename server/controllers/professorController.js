import Professor from "../models/professorSchema.js";
import Review from "../models/reviewSchema.js";

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

// Normalize section formats to uppercase A, B, C etc. to match student registered sections
const normalizeSections = (value) => {
  const rawList = normalizeStringArray(value);
  return rawList
    .map((sec) => {
      const clean = sec.trim().toUpperCase();
      // If entered as "CSE-A", "IT-B", "Section A", or "A", extract the trailing section identifier
      const match = clean.match(/([A-Z0-9]+)$/);
      return match ? match[1] : clean;
    })
    .filter(Boolean);
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
    const resolvedSections = normalizeSections(sections ?? section);

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
    const profs = await Professor.find().lean();

    // Aggregate review stats per professor
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$professor",
          totalReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const statsMap = {};
    reviewStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        totalReviews: stat.totalReviews,
        overallRating: Number(stat.avgRating.toFixed(1)),
      };
    });

    const enrichedProfs = profs.map((prof) => {
      const stats = statsMap[prof._id.toString()];
      return {
        ...prof,
        totalReviews: stats?.totalReviews || 0,
        overallRating: stats?.overallRating || 0,
      };
    });

    res.json(enrichedProfs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfessorById = async (req, res) => {
  try {
    const prof = await Professor.findById(req.params.id).lean();
    if (!prof) return res.status(404).json({ message: 'Professor not found' });

    const reviewStats = await Review.aggregate([
      { $match: { professor: prof._id } },
      {
        $group: {
          _id: "$professor",
          totalReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const stat = reviewStats[0];
    const enriched = {
      ...prof,
      totalReviews: stat?.totalReviews || 0,
      overallRating: stat ? Number(stat.avgRating.toFixed(1)) : 0,
    };

    res.json(enriched);
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
    const resolvedSections = normalizeSections(sections ?? section);

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