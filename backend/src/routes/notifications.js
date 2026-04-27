import express from "express";
import { NotificationController } from "../controllers/notificationController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/recipient/:recipientId", asyncHandler(NotificationController.getByRecipientId));
router.get("/recipient/:recipientId/unread", asyncHandler(NotificationController.getUnreadByRecipientId));
router.patch("/recipient/:recipientId/read-all", asyncHandler(NotificationController.markAllRead));
router.get("/:id", asyncHandler(NotificationController.getById));
router.patch("/:id/status", asyncHandler(NotificationController.updateStatus));

export default router;
