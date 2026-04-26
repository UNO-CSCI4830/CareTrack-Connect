import { httpResponse } from "../utils/httpResponse.js";
import { AppointmentService } from "../services/appointmentService.js";

function sendThrown(res, err) {
  const status = err.status || 500;
  if (status === 400) return httpResponse.badRequest(res, err.message);
  if (status === 403) return httpResponse.unauthorized(res, err.message);
  if (status === 404) return httpResponse.notFound(res, err.message);
  if (status === 409) return httpResponse.conflict(res, err.message);
  return httpResponse.error(res, err, 500, "Internal server error");
}

export class AppointmentController {
  static async getById(req, res, next) {
    try {
      const appt = await AppointmentService.getById(req.params.id);
      if (!appt) return httpResponse.notFound(res, "Appointment not found");
      httpResponse.success(res, appt, 200, "Appointment retrieved");
    } catch (err) { next(err); }
  }

  static async list(req, res, next) {
    try {
      const { patient_id, provider_id } = req.query;
      if (patient_id) {
        const data = await AppointmentService.listForPatient(patient_id);
        return httpResponse.success(res, data, 200, "Appointments retrieved");
      }
      if (provider_id) {
        const data = await AppointmentService.listForProvider(provider_id);
        return httpResponse.success(res, data, 200, "Appointments retrieved");
      }
      return httpResponse.badRequest(res, "patient_id or provider_id is required");
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { provider_id, patient_id, start_at, reason } = req.body;
      if (!provider_id || !patient_id || !start_at) {
        return httpResponse.badRequest(res, "provider_id, patient_id, and start_at are required");
      }
      const data = await AppointmentService.create({ provider_id, patient_id, start_at, reason });
      httpResponse.created(res, data, "Appointment booked");
    } catch (err) {
      if (err.status) return sendThrown(res, err);
      next(err);
    }
  }

  static async reschedule(req, res, next) {
    try {
      const { start_at } = req.body;
      if (!start_at) return httpResponse.badRequest(res, "start_at is required");
      const data = await AppointmentService.reschedule(req.params.id, { start_at });
      httpResponse.success(res, data, 200, "Appointment rescheduled");
    } catch (err) {
      if (err.status) return sendThrown(res, err);
      next(err);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { cancelled_by } = req.body || {};
      const data = await AppointmentService.cancel(req.params.id, cancelled_by);
      httpResponse.success(res, data, 200, "Appointment cancelled");
    } catch (err) { next(err); }
  }

  static async availability(req, res, next) {
    try {
      const { providerId } = req.params;
      const { from, to } = req.query;
      const slots = await AppointmentService.getAvailability(providerId, from, to);
      httpResponse.success(res, slots, 200, "Availability retrieved");
    } catch (err) { next(err); }
  }
}
