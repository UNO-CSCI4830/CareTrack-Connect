import { httpResponse } from "../utils/httpResponse.js";
import { CheckInService } from "../services/checkInService.js";

export class CheckInController {
  static async getAllCheckIns(req, res, next) {
    try {
      const checkIns = await CheckInService.getAllCheckIns();
      httpResponse.success(res, checkIns, 200, "Check-ins retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCheckInById(req, res, next) {
    try {
      const { id } = req.params;
      const checkIn = await CheckInService.getCheckInById(id);
      
      if (!checkIn) {
        return httpResponse.notFound(res, "Check-in not found");
      }

      httpResponse.success(res, checkIn, 200, "Check-in retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCheckInsByPatientId(req, res, next) {
    try {
      const { patientId } = req.params;
      const checkIns = await CheckInService.getCheckInsByPatientId(patientId);
      httpResponse.success(res, checkIns, 200, "Check-ins for patient retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCheckInsByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const checkIns = await CheckInService.getCheckInsByStatus(status);
      httpResponse.success(res, checkIns, 200, `Check-ins with status '${status}' retrieved successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async createCheckIn(req, res, next) {
    try {
      const checkInData = req.body;
      
      if (!checkInData.patient_id) {
        return httpResponse.badRequest(res, "patient_id is required");
      }

      const newCheckIn = await CheckInService.createCheckIn(checkInData);
      httpResponse.created(res, newCheckIn, "Check-in created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateCheckIn(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedCheckIn = await CheckInService.updateCheckIn(id, updateData);
      httpResponse.success(res, updatedCheckIn, 200, "Check-in updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteCheckIn(req, res, next) {
    try {
      const { id } = req.params;
      const deletedCheckIn = await CheckInService.deleteCheckIn(id);
      httpResponse.success(res, deletedCheckIn, 200, "Check-in deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCheckInsForProvider(req, res, next) {
    try {
      const { providerId } = req.params;
      const checkIns = await CheckInService.getCheckInsForProvider(providerId);
      httpResponse.success(res, checkIns, 200, "Provider check-ins retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCheckInsByPatientIdForProvider(req, res, next) {
    try {
      const { providerId, patientId } = req.params;
      const checkIns = await CheckInService.getCheckInsByPatientIdForProvider(providerId, patientId);

      if (checkIns === null) {
        return httpResponse.unauthorized(res, "This patient is not assigned to you");
      }

      httpResponse.success(res, checkIns, 200, "Patient check-ins retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
