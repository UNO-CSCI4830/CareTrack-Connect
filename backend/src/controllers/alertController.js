import { httpResponse } from "../utils/httpResponse.js";
import { AlertService } from "../services/alertService.js";

export class AlertController {
  static async getAlertsByProviderId(req, res, next) {
    try {
      const { providerId } = req.params;
      const alerts = await AlertService.getAlertsByProviderId(providerId);
      httpResponse.success(res, alerts, 200, "Alerts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getNewAlertsByProviderId(req, res, next) {
    try {
      const { providerId } = req.params;
      const alerts = await AlertService.getNewAlertsByProviderId(providerId);
      httpResponse.success(res, alerts, 200, "New alerts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAlertsByPatientId(req, res, next) {
    try {
      const { patientId } = req.params;
      const alerts = await AlertService.getAlertsByPatientId(patientId);
      httpResponse.success(res, alerts, 200, "Alerts for patient retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAlertById(req, res, next) {
    try {
      const { id } = req.params;
      const alert = await AlertService.getAlertById(id);

      if (!alert) {
        return httpResponse.notFound(res, "Alert not found");
      }

      httpResponse.success(res, alert, 200, "Alert retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateAlertStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["new", "reviewed", "dismissed"].includes(status)) {
        return httpResponse.badRequest(res, "Valid status is required (new, reviewed, dismissed)");
      }

      const updatedAlert = await AlertService.updateAlertStatus(id, status);
      httpResponse.success(res, updatedAlert, 200, "Alert status updated successfully");
    } catch (error) {
      next(error);
    }
  }
}
