import express from "express";
import { CheckInController } from "../controllers/checkInController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(CheckInController.getAllCheckIns));
router.get("/provider/:providerId", asyncHandler(CheckInController.getCheckInsForProvider));
router.get("/provider/:providerId/patient/:patientId", asyncHandler(CheckInController.getCheckInsByPatientIdForProvider));
router.get("/patient/:patientId", asyncHandler(CheckInController.getCheckInsByPatientId));
router.get("/status/:status", asyncHandler(CheckInController.getCheckInsByStatus));
router.get("/:id", asyncHandler(CheckInController.getCheckInById));
router.post("/", asyncHandler(CheckInController.createCheckIn));
router.put("/:id", asyncHandler(CheckInController.updateCheckIn));
router.delete("/:id", asyncHandler(CheckInController.deleteCheckIn));

export default router;
