import { httpResponse } from "../utils/httpResponse.js";
import { PatientDetailsService } from "../services/patientDetailsService.js";

export class PatientDetailsController {
  static async getAllPatientDetails(req, res, next) {
    try {
      const details = await PatientDetailsService.getAllPatientDetails();
      httpResponse.success(res, details, 200, "Patient details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getPatientDetailsById(req, res, next) {
    try {
      const { id } = req.params;
      const details = await PatientDetailsService.getPatientDetailsById(id);
      
      if (!details) {
        return httpResponse.notFound(res, "Patient details not found");
      }

      httpResponse.success(res, details, 200, "Patient details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getPatientDetailsByProfileId(req, res, next) {
    try {
      const { profileId } = req.params;
      const details = await PatientDetailsService.getPatientDetailsByProfileId(profileId);
      
      if (!details) {
        return httpResponse.notFound(res, "Patient details not found for this profile");
      }

      httpResponse.success(res, details, 200, "Patient details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createPatientDetails(req, res, next) {
    try {
      const detailsData = req.body;
      
      if (!detailsData.profile_id) {
        return httpResponse.badRequest(res, "profile_id is required");
      }

      const newDetails = await PatientDetailsService.createPatientDetails(detailsData);
      httpResponse.created(res, newDetails, "Patient details created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updatePatientDetails(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedDetails = await PatientDetailsService.updatePatientDetails(id, updateData);
      httpResponse.success(res, updatedDetails, 200, "Patient details updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deletePatientDetails(req, res, next) {
    try {
      const { id } = req.params;
      const deletedDetails = await PatientDetailsService.deletePatientDetails(id);
      httpResponse.success(res, deletedDetails, 200, "Patient details deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
