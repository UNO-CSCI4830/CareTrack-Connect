import express from "express";
import { PatientDetailsController } from "../controllers/patientDetailsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(PatientDetailsController.getAllPatientDetails));
router.get("/:id", asyncHandler(PatientDetailsController.getPatientDetailsById));
router.get("/profile/:profileId", asyncHandler(PatientDetailsController.getPatientDetailsByProfileId));
router.post("/", asyncHandler(PatientDetailsController.createPatientDetails));
router.put("/:id", asyncHandler(PatientDetailsController.updatePatientDetails));
router.delete("/:id", asyncHandler(PatientDetailsController.deletePatientDetails));

export default router;
