import express from "express";
import {
  addProfessor,
  getAllProfessors,
  deleteProfessor,
} from "../controllers/professorController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllProfessors);
router.post("/", authMiddleware, roleMiddleware("admin"), addProfessor);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProfessor);

export default router;