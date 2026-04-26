import express from "express";
import { AppointmentController } from "../controllers/appointmentController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/availability/:providerId", asyncHandler(AppointmentController.availability));
router.get("/", asyncHandler(AppointmentController.list));
router.get("/:id", asyncHandler(AppointmentController.getById));
router.post("/", asyncHandler(AppointmentController.create));
router.patch("/:id", asyncHandler(AppointmentController.reschedule));
router.delete("/:id", asyncHandler(AppointmentController.cancel));

export default router;
