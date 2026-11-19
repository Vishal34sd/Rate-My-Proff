
import Review from "../models/reviewSchema.js";
import Professor from "../models/professorSchema.js";
import { validateString } from "../utils/validators.js";

// Add a new review
export const addReview = async (req, res) => {
  try {
    const {
      rating,
      comment,
      professorId,
      subject,
      teachingQuality,
      subjectKnowledge,
      doubtResolution,
      fairnessInGrading,
      classEngagement,
    } = req.body;
// Converts rating inputs into valid numbers and ignores invalid values.
    const parseParam = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const n = Number(val);
      if (Number.isFinite(n) && n >= 1 && n <= 5) return n;
      return null;
    };

    const tq = parseParam(teachingQuality);
    const sk = parseParam(subjectKnowledge);
    const dr = parseParam(doubtResolution);
    const fg = parseParam(fairnessInGrading);
    const ce = parseParam(classEngagement);
// Collects only valid ratings to calculate the overall average.
    const params = [tq, sk, dr, fg, ce].filter((x) => x !== null);
    let ratingValue = Number(rating);

    // If parameters are provided, calculate or fallback overall rating
    if (params.length > 0) {
      const avgParams = params.reduce((a, b) => a + b, 0) / params.length;
      if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        ratingValue = Number(avgParams.toFixed(1));
      }
    }

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
// Fetches professor details to verify the review request.
    const professor = await Professor.findById(professorId);

    if (!professor) {
      return res.status(404).json({
        message: "Professor not found",
      });
    }
// Verifies department, section and subject eligibility before accepting feedback.
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
// Saves the submitted feedback and all five evaluation parameters in MongoDB.
    const review = await Review.create({
      professor: professorId,
      student: req.user.id,
      rating: ratingValue,
      teachingQuality: tq,
      subjectKnowledge: sk,
      doubtResolution: dr,
      fairnessInGrading: fg,
      classEngagement: ce,
      comment: comment?.trim() || "",
      subject: subject.trim(),
    });

    res.status(201).json({
      rating: review.rating,
      teachingQuality: review.teachingQuality,
      subjectKnowledge: review.subjectKnowledge,
      doubtResolution: review.doubtResolution,
      fairnessInGrading: review.fairnessInGrading,
      classEngagement: review.classEngagement,
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
// Retrieves professor reviews with the newest submissions appearing first.
// Get reviews of a professor
export const getReviewsByProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ professor: id })
      .sort({ createdAt: -1 })
      .select(
        "rating teachingQuality subjectKnowledge doubtResolution fairnessInGrading classEngagement comment subject createdAt helpfulCount +helpfulBy"
      );

    const result = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      teachingQuality: review.teachingQuality,
      subjectKnowledge: review.subjectKnowledge,
      doubtResolution: review.doubtResolution,
      fairnessInGrading: review.fairnessInGrading,
      classEngagement: review.classEngagement,
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
      .select(
        "rating teachingQuality subjectKnowledge doubtResolution fairnessInGrading classEngagement comment subject createdAt professor"
      );

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for admin dashboard
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("professor", "name department imageUrl")
      .select(
        "rating teachingQuality subjectKnowledge doubtResolution fairnessInGrading classEngagement comment subject createdAt helpfulCount professor"
      );

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