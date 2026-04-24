import Review from "../models/reviewSchema.js";
import Professor from "../models/professorSchema.js";
import { validateString } from "../utils/validators.js";

export const addReview = async (req, res) => {
  try {
    const { rating, comment, professorId, subject } = req.body;

    const ratingValue = Number(rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!validateString(professorId) || !validateString(subject)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const professor = await Professor.findById(professorId);
    if (!professor) return res.status(404).json({ message: "Professor not found" });

    // check eligibility
    if (
      professor.department !== req.user.department ||
      !(professor.sections || []).includes(req.user.section) ||
      !(professor.subjects || []).includes(subject.trim())
    ) {
      return res.status(403).json({ message: "Not allowed to review" });
    }

    const review = await Review.create({
      professor: professorId,
      student: req.user.id,
      rating: ratingValue,
      comment: comment?.trim() || "",
      subject: subject.trim(),
    });

    res.status(201).json({
      rating: review.rating,
      comment: review.comment,
      subject: review.subject,
      createdAt: review.createdAt,
    }); // anonymous
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already reviewed" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsByProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ professor: id })
      .sort({ createdAt: -1 })
      .select('rating comment subject createdAt');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate('professor', 'name department imageUrl')
      .select('rating comment subject createdAt professor');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};