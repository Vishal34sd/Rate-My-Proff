
import mongoose from "mongoose";
import Review from "../models/reviewSchema.js";
import Professor from "../models/professorSchema.js";
import User from "../models/userSchema.js";
import { validateString } from "../utils/validators.js";
import { sendDailyReviewReminder } from "../utils/emailService.js";

// Normalize department names and aliases for flexible institutional matching
const normalizeDept = (dept) => {
  if (!dept || typeof dept !== "string") return "";
  const d = dept.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (["it", "informationtechnology"].includes(d)) return "it";
  if (
    [
      "cse",
      "cs",
      "computerscience",
      "computerscienceandengineering",
      "computerscienceengineering",
    ].includes(d)
  )
    return "cse";
  if (["csit", "computerscienceandinformationtechnology"].includes(d))
    return "csit";
  if (
    [
      "ece",
      "electronicsandcommunication",
      "electronicsandcommunicationengineering",
      "electronicscommunication",
    ].includes(d)
  )
    return "ece";
  if (
    [
      "ee",
      "eee",
      "electricalengineering",
      "electricalandelectronics",
      "electricalandelectronicsengineering",
    ].includes(d)
  )
    return "ee";
  if (["me", "mechanical", "mechanicalengineering"].includes(d)) return "me";
  if (["ce", "civil", "civilengineering"].includes(d)) return "ce";
  if (["mca", "masterofcomputerapplications"].includes(d)) return "mca";
  if (["mba", "masterofbusinessadministration"].includes(d)) return "mba";
  if (
    [
      "aids",
      "aiml",
      "artificialintelligence",
      "artificialintelligenceanddatascience",
      "artificialintelligenceandmachinelearning",
    ].includes(d)
  )
    return "aids";

  return d;
};

const isDepartmentMatch = (profDept, studentDept) => {
  if (!profDept || !studentDept) return true;
  const pNorm = normalizeDept(profDept);
  const sNorm = normalizeDept(studentDept);
  return pNorm === sNorm || pNorm.includes(sNorm) || sNorm.includes(pNorm);
};

const isSectionMatch = (profSections, studentSection) => {
  if (!profSections || !Array.isArray(profSections) || profSections.length === 0) {
    return true; // Professor teaches all sections or sections are open
  }
  if (!studentSection) return true;
  const cleanStudentSec = String(studentSection).trim().toUpperCase();
  return profSections.some((s) => {
    const cleanProfSec = String(s).trim().toUpperCase();
    if (cleanProfSec === cleanStudentSec) return true;
    if (
      cleanProfSec.endsWith(`-${cleanStudentSec}`) ||
      cleanProfSec.endsWith(` ${cleanStudentSec}`)
    ) {
      return true;
    }
    return false;
  });
};

const isSubjectMatch = (profSubjects, selectedSubject) => {
  if (!profSubjects || !Array.isArray(profSubjects) || profSubjects.length === 0) {
    return true;
  }
  if (!selectedSubject) return false;
  const cleanSub = String(selectedSubject).trim().toLowerCase();
  return profSubjects.some(
    (s) => String(s).trim().toLowerCase() === cleanSub
  );
};

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

    const professor = await Professor.findById(professorId);

    if (!professor) {
      return res.status(404).json({
        message: "Professor not found",
      });
    }

    // Retrieve student department & section (fallback to DB if token didn't contain them)
    let userDept = req.user?.department;
    let userSec = req.user?.section;
    if (!userDept || !userSec) {
      const dbUser = await User.findById(req.user?.id).select("department section");
      if (dbUser) {
        userDept = userDept || dbUser.department;
        userSec = userSec || dbUser.section;
      }
    }

    // Check student eligibility (department, section, and subject)
    const isDeptEligible = isDepartmentMatch(professor.department, userDept);
    const isSectionEligible = isSectionMatch(professor.sections, userSec);
    const isSubjectEligible = isSubjectMatch(professor.subjects, subject);

    if (!isDeptEligible || !isSectionEligible || !isSubjectEligible) {
      let detail = "You can only review professors who teach your department, section, or subject.";
      if (!isDeptEligible) {
        detail = `Professor belongs to ${professor.department}, while your registered department is ${userDept || "unspecified"}.`;
      } else if (!isSectionEligible) {
        detail = `Professor teaches sections (${(professor.sections || []).join(", ")}), while your section is ${userSec || "unspecified"}.`;
      } else if (!isSubjectEligible) {
        detail = `Subject "${subject}" is not taught by this professor.`;
      }
      return res.status(403).json({
        message: detail,
      });
    }

    // Daily Lecture Review Date (YYYY-MM-DD)
    const todayDate = (req.body.reviewDate || new Date().toISOString().slice(0, 10)).trim();

    // Check if student already submitted a review for this professor today
    const existingToday = await Review.findOne({
      professor: professorId,
      student: req.user.id,
      reviewDate: todayDate,
    });

    if (existingToday) {
      return res.status(400).json({
        message: "You have already submitted today's lecture review for this professor. Daily reviews reset every day!",
      });
    }

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
      reviewDate: todayDate,
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
      reviewDate: review.reviewDate,
      createdAt: review.createdAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted today's lecture review for this professor. Daily reviews reset every day!",
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
      .select(
        "rating teachingQuality subjectKnowledge doubtResolution fairnessInGrading classEngagement comment subject reviewDate createdAt helpfulCount +helpfulBy"
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
      reviewDate: review.reviewDate || review.createdAt?.toISOString().slice(0, 10),
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
        "rating teachingQuality subjectKnowledge doubtResolution fairnessInGrading classEngagement comment subject reviewDate createdAt professor"
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
        "rating teachingQuality subjectKnowledge doubtResolution fairnessInGrading classEngagement comment subject reviewDate createdAt helpfulCount professor"
      );

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send daily review reminders to all verified students
export const sendDailyReminders = async (req, res) => {
  try {
    const students = await User.find({ role: "student", emailVerified: true }).select("name email");
    let sentCount = 0;
    const errors = [];

    for (const student of students) {
      try {
        await sendDailyReviewReminder(student.email, student.name);
        sentCount++;
      } catch (err) {
        errors.push({ email: student.email, error: err.message });
      }
    }

    res.json({
      success: true,
      totalEligible: students.length,
      sentCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Daily review reminders successfully dispatched to ${sentCount} student(s).`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get day-and-date-wise and weekly analytics for admin dashboard graphs
export const getDailyAndWeeklyAnalytics = async (req, res) => {
  try {
    const { professorId, subject } = req.query;
    const matchFilter = {};
    if (professorId && professorId !== "all") {
      matchFilter.professor = new mongoose.Types.ObjectId(professorId);
    }
    if (subject && subject !== "all") {
      matchFilter.subject = new RegExp(`^${subject.trim()}$`, "i");
    }

    // Aggregation by reviewDate (Day and Date Wise)
    const dailyStats = await Review.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $ifNull: ["$reviewDate", { $substr: ["$createdAt", 0, 10] }] },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          avgTeaching: { $avg: "$teachingQuality" },
          avgKnowledge: { $avg: "$subjectKnowledge" },
          avgDoubt: { $avg: "$doubtResolution" },
          avgFairness: { $avg: "$fairnessInGrading" },
          avgEngagement: { $avg: "$classEngagement" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      dailyStats: dailyStats.map((d) => ({
        date: d._id,
        count: d.count,
        avgRating: Number(d.avgRating?.toFixed(1) || 0),
        avgTeaching: Number(d.avgTeaching?.toFixed(1) || 0),
        avgKnowledge: Number(d.avgKnowledge?.toFixed(1) || 0),
        avgDoubt: Number(d.avgDoubt?.toFixed(1) || 0),
        avgFairness: Number(d.avgFairness?.toFixed(1) || 0),
        avgEngagement: Number(d.avgEngagement?.toFixed(1) || 0),
      })),
    });
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