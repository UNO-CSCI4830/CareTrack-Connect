import { httpResponse } from "../utils/httpResponse.js";
import { ProviderAvailabilityExceptionService } from "../services/providerAvailabilityExceptionService.js";

export class ProviderAvailabilityExceptionController {
  static async list(req, res, next) {
    try {
      const { from, to } = req.query;
      const data = await ProviderAvailabilityExceptionService.listForProvider(req.params.providerId, { from, to });
      httpResponse.success(res, data, 200, "Exceptions retrieved");
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { provider_id, start_at, end_at, reason } = req.body;
      if (!provider_id || !start_at || !end_at) {
        return httpResponse.badRequest(res, "provider_id, start_at, end_at are required");
      }
      if (end_at <= start_at) {
        return httpResponse.badRequest(res, "end_at must be after start_at");
      }
      const data = await ProviderAvailabilityExceptionService.create({ provider_id, start_at, end_at, reason });
      httpResponse.created(res, data, "Exception added");
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      const data = await ProviderAvailabilityExceptionService.delete(req.params.id);
      httpResponse.success(res, data, 200, "Exception removed");
    } catch (err) { next(err); }
  }
}
