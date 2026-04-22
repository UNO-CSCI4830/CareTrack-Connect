import express from "express";
import { AlertController } from "../controllers/alertController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/provider/:providerId", asyncHandler(AlertController.getAlertsByProviderId));
router.get("/provider/:providerId/new", asyncHandler(AlertController.getNewAlertsByProviderId));
router.get("/patient/:patientId", asyncHandler(AlertController.getAlertsByPatientId));
router.get("/:id", asyncHandler(AlertController.getAlertById));
router.patch("/:id/status", asyncHandler(AlertController.updateAlertStatus));

export default router;
