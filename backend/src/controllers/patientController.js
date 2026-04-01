import { httpResponse } from "../utils/httpResponse.js";
import { PatientService } from "../services/patientService.js";

export class PatientController {
  static async getAllPatients(req, res, next) {
    try {
      const patients = await PatientService.getAllPatients();
      httpResponse.success(res, patients, 200, "Patients retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getPatientById(req, res, next) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getPatientById(id);
      
      if (!patient) {
        return httpResponse.notFound(res, "Patient not found");
      }

      httpResponse.success(res, patient, 200, "Patient retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createPatient(req, res, next) {
    try {
      const patientData = req.body;
      
      // Validate required fields (adjust based on your schema)
      if (!patientData.name) {
        return httpResponse.badRequest(res, "Name is required");
      }

      const newPatient = await PatientService.createPatient(patientData);
      httpResponse.created(res, newPatient, "Patient created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedPatient = await PatientService.updatePatient(id, updateData);
      httpResponse.success(res, updatedPatient, 200, "Patient updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deletePatient(req, res, next) {
    try {
      const { id } = req.params;
      const deletedPatient = await PatientService.deletePatient(id);
      httpResponse.success(res, deletedPatient, 200, "Patient deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
