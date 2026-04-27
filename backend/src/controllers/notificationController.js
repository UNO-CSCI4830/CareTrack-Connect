import { httpResponse } from "../utils/httpResponse.js";
import { NotificationService } from "../services/notificationService.js";

export class NotificationController {
  static async getByRecipientId(req, res, next) {
    try {
      const { recipientId } = req.params;
      const notifications = await NotificationService.getByRecipientId(recipientId);
      httpResponse.success(res, notifications, 200, "Notifications retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadByRecipientId(req, res, next) {
    try {
      const { recipientId } = req.params;
      const notifications = await NotificationService.getUnreadByRecipientId(recipientId);
      httpResponse.success(res, notifications, 200, "Unread notifications retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.getById(id);

      if (!notification) {
        return httpResponse.notFound(res, "Notification not found");
      }

      httpResponse.success(res, notification, 200, "Notification retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["unread", "read", "dismissed"].includes(status)) {
        return httpResponse.badRequest(res, "Valid status is required (unread, read, dismissed)");
      }

      const updated = await NotificationService.updateStatus(id, status);
      httpResponse.success(res, updated, 200, "Notification status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req, res, next) {
    try {
      const { recipientId } = req.params;
      const updated = await NotificationService.markAllRead(recipientId);
      httpResponse.success(res, updated, 200, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}
