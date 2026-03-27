import express from "express";
import { PatientController } from "../controllers/patientController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Routes
router.get("/", asyncHandler(PatientController.getAllPatients));
router.get("/:id", asyncHandler(PatientController.getPatientById));
router.post("/", asyncHandler(PatientController.createPatient));
router.put("/:id", asyncHandler(PatientController.updatePatient));
router.delete("/:id", asyncHandler(PatientController.deletePatient));

export default router;
