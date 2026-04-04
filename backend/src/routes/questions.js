import express from "express";
import { QuestionController } from "../controllers/questionController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(QuestionController.getAllQuestions));
router.get("/active", asyncHandler(QuestionController.getActiveQuestions));
router.get("/:id", asyncHandler(QuestionController.getQuestionById));
router.get("/type/:questionType", asyncHandler(QuestionController.getQuestionsByType));
router.post("/", asyncHandler(QuestionController.createQuestion));
router.put("/:id", asyncHandler(QuestionController.updateQuestion));
router.delete("/:id", asyncHandler(QuestionController.deleteQuestion));
router.patch("/:id/deactivate", asyncHandler(QuestionController.deactivateQuestion));

export default router;
