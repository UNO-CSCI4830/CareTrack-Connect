import express from "express";
import { AttachmentController } from "../controllers/attachmentController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(AttachmentController.getAllAttachments));
router.get("/:id", asyncHandler(AttachmentController.getAttachmentById));
router.get("/patient/:patientId", asyncHandler(AttachmentController.getAttachmentsByPatientId));
router.get("/checkin/:checkInId", asyncHandler(AttachmentController.getAttachmentsByCheckInId));
router.get("/type/:fileType", asyncHandler(AttachmentController.getAttachmentsByType));
router.post("/", asyncHandler(AttachmentController.createAttachment));
router.put("/:id", asyncHandler(AttachmentController.updateAttachment));
router.delete("/:id", asyncHandler(AttachmentController.deleteAttachment));

export default router;
