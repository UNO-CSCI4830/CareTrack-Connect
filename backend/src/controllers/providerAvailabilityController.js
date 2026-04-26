import { httpResponse } from "../utils/httpResponse.js";
import { ProviderAvailabilityService } from "../services/providerAvailabilityService.js";

export class ProviderAvailabilityController {
  static async list(req, res, next) {
    try {
      const data = await ProviderAvailabilityService.listForProvider(req.params.providerId);
      httpResponse.success(res, data, 200, "Availability template retrieved");
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { provider_id, day_of_week, start_time, end_time } = req.body;
      if (provider_id === undefined || day_of_week === undefined || !start_time || !end_time) {
        return httpResponse.badRequest(res, "provider_id, day_of_week, start_time, end_time are required");
      }
      if (day_of_week < 0 || day_of_week > 6) {
        return httpResponse.badRequest(res, "day_of_week must be 0-6 (0=Sunday)");
      }
      if (start_time >= end_time) {
        return httpResponse.badRequest(res, "end_time must be after start_time");
      }
      const data = await ProviderAvailabilityService.create({ provider_id, day_of_week, start_time, end_time });
      httpResponse.created(res, data, "Availability block added");
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      const data = await ProviderAvailabilityService.delete(req.params.id);
      httpResponse.success(res, data, 200, "Availability block removed");
    } catch (err) { next(err); }
  }
}
