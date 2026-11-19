
import Review from "../models/reviewSchema.js";
import Professor from "../models/professorSchema.js";
import { validateString } from "../utils/validators.js";

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { rating, comment, professorId, subject } = req.body;

    const ratingValue = Number(rating);

    if (
      !Number.isFinite(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!validateString(professorId) || !validateString(subject)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const professor = await Professor.findById(professorId);

    if (!professor) {
      return res.status(404).json({
        message: "Professor not found",
      });
    }

    // Check student eligibility
    if (
      professor.department !== req.user.department ||
      !(professor.sections || []).includes(req.user.section) ||
      !(professor.subjects || []).includes(subject.trim())
    ) {
      return res.status(403).json({
        message: "Not allowed to review",
      });
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
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Already reviewed",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get reviews of a professor
export const getReviewsByProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ professor: id })
      .sort({ createdAt: -1 })
      .select("rating comment subject createdAt helpfulCount +helpfulBy");

    const result = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      subject: review.subject,
      createdAt: review.createdAt,
      helpfulCount: review.helpfulCount,
      isHelpful: req.user
        ? review.helpfulBy.some(
            (userId) => userId.toString() === req.user.id.toString()
          )
        : false,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews written by logged-in student
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate("professor", "name department imageUrl")
      .select("rating comment subject createdAt professor");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark or remove a review as helpful
export const toggleHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const review = await Review.findById(id).select(
      "+helpfulBy +student"
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Students cannot vote on their own reviews
    if (review.student.toString() === studentId.toString()) {
      return res.status(403).json({
        message: "You cannot vote on your own review",
      });
    }

    const alreadyVoted = review.helpfulBy.some(
      (userId) => userId.toString() === studentId.toString()
    );

    if (alreadyVoted) {
      review.helpfulBy.pull(studentId);
    } else {
      review.helpfulBy.addToSet(studentId);
    }

    review.helpfulCount = review.helpfulBy.length;

    await review.save();

    res.json({
      message: alreadyVoted
        ? "Helpful vote removed"
        : "Review marked as helpful",
      helpfulCount: review.helpfulCount,
      isHelpful: !alreadyVoted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};