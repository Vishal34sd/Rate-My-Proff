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
import { professorImageUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllProfessors);
router.get("/:id", getProfessorById);
router.get("/:id/reviews", getReviewsByProfessor);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  professorImageUpload.single("image"),
  addProfessor
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  professorImageUpload.single("image"),
  updateProfessor
);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProfessor);

export default router;