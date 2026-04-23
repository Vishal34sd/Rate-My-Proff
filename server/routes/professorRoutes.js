import express from "express";
import {
  addProfessor,
  getAllProfessors,
  getProfessorById,
  updateProfessor,
  deleteProfessor,
} from "../controllers/professorController.js";

import { getReviewsByProfessor } from "../controllers/reviewController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllProfessors);
router.get("/:id", getProfessorById);
router.get("/:id/reviews", getReviewsByProfessor);
router.post("/", authMiddleware, roleMiddleware("admin"), addProfessor);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateProfessor);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProfessor);

export default router;