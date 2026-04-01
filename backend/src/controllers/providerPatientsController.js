import { httpResponse } from "../utils/httpResponse.js";
import { ProviderPatientsService } from "../services/providerPatientsService.js";

export class ProviderPatientsController {
  static async getAllProviderPatients(req, res, next) {
    try {
      const assignments = await ProviderPatientsService.getAllProviderPatients();
      httpResponse.success(res, assignments, 200, "Provider-patient assignments retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProviderPatientById(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await ProviderPatientsService.getProviderPatientById(id);
      
      if (!assignment) {
        return httpResponse.notFound(res, "Provider-patient assignment not found");
      }

      httpResponse.success(res, assignment, 200, "Assignment retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getPatientsByProviderId(req, res, next) {
    try {
      const { providerId } = req.params;
      const assignments = await ProviderPatientsService.getPatientsByProviderId(providerId);
      httpResponse.success(res, assignments, 200, "Patients for provider retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getActivePatientsByProviderId(req, res, next) {
    try {
      const { providerId } = req.params;
      const assignments = await ProviderPatientsService.getActivePatientsByProviderId(providerId);
      httpResponse.success(res, assignments, 200, "Active patients for provider retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProvidersByPatientId(req, res, next) {
    try {
      const { patientId } = req.params;
      const assignments = await ProviderPatientsService.getProvidersByPatientId(patientId);
      httpResponse.success(res, assignments, 200, "Providers for patient retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async assignPatientToProvider(req, res, next) {
    try {
      const assignmentData = req.body;
      
      if (!assignmentData.provider_id || !assignmentData.patient_id) {
        return httpResponse.badRequest(res, "provider_id and patient_id are required");
      }

      const newAssignment = await ProviderPatientsService.assignPatientToProvider(assignmentData);
      httpResponse.created(res, newAssignment, "Patient assigned to provider successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateProviderPatient(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedAssignment = await ProviderPatientsService.updateProviderPatient(id, updateData);
      httpResponse.success(res, updatedAssignment, 200, "Assignment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async removePatientFromProvider(req, res, next) {
    try {
      const { id } = req.params;
      const deletedAssignment = await ProviderPatientsService.removePatientFromProvider(id);
      httpResponse.success(res, deletedAssignment, 200, "Patient removed from provider successfully");
    } catch (error) {
      next(error);
    }
  }
}
