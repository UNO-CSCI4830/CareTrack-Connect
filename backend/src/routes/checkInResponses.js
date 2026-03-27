import express from "express";
import { CheckInResponseController } from "../controllers/checkInResponseController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(CheckInResponseController.getAllCheckInResponses));
router.get("/:id", asyncHandler(CheckInResponseController.getCheckInResponseById));
router.get("/checkin/:checkInId", asyncHandler(CheckInResponseController.getResponsesByCheckInId));
router.get("/question/:questionId", asyncHandler(CheckInResponseController.getResponsesByQuestionId));
router.post("/", asyncHandler(CheckInResponseController.createCheckInResponse));
router.post("/batch", asyncHandler(CheckInResponseController.createMultipleResponses));
router.put("/:id", asyncHandler(CheckInResponseController.updateCheckInResponse));
router.delete("/:id", asyncHandler(CheckInResponseController.deleteCheckInResponse));

export default router;
