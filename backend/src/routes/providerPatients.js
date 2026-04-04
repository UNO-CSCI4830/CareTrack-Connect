import express from "express";
import { ProviderPatientsController } from "../controllers/providerPatientsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(ProviderPatientsController.getAllProviderPatients));
router.get("/:id", asyncHandler(ProviderPatientsController.getProviderPatientById));
router.get("/provider/:providerId", asyncHandler(ProviderPatientsController.getPatientsByProviderId));
router.get("/provider/:providerId/active", asyncHandler(ProviderPatientsController.getActivePatientsByProviderId));
router.get("/patient/:patientId", asyncHandler(ProviderPatientsController.getProvidersByPatientId));
router.post("/", asyncHandler(ProviderPatientsController.assignPatientToProvider));
router.put("/:id", asyncHandler(ProviderPatientsController.updateProviderPatient));
router.delete("/:id", asyncHandler(ProviderPatientsController.removePatientFromProvider));

export default router;
