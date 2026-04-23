import Review from "../models/Review.js";
import Professor from "../models/Professor.js";

export const addReview = async (req, res) => {
  try {
    const { rating, comment, professorId, subject } = req.body;

    const professor = await Professor.findById(professorId);
    if (!professor) return res.status(404).json({ message: "Professor not found" });

    // check eligibility
    if (
      professor.department !== req.user.department ||
      !professor.sections.includes(req.user.section) ||
      !professor.subjects.includes(subject)
    ) {
      return res.status(403).json({ message: "Not allowed to review" });
    }

    const review = await Review.create({
      professorId,
      studentId: req.user.id,
      rating,
      comment: comment?.trim(),
    });

    res.status(201).json({
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }); // anonymous
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already reviewed" });
    }
    res.status(500).json({ message: error.message });
  }
};