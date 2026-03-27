import { httpResponse } from "../utils/httpResponse.js";
import { ProviderDetailsService } from "../services/providerDetailsService.js";

export class ProviderDetailsController {
  static async getAllProviderDetails(req, res, next) {
    try {
      const details = await ProviderDetailsService.getAllProviderDetails();
      httpResponse.success(res, details, 200, "Provider details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProviderDetailsById(req, res, next) {
    try {
      const { id } = req.params;
      const details = await ProviderDetailsService.getProviderDetailsById(id);
      
      if (!details) {
        return httpResponse.notFound(res, "Provider details not found");
      }

      httpResponse.success(res, details, 200, "Provider details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProviderDetailsByProfileId(req, res, next) {
    try {
      const { profileId } = req.params;
      const details = await ProviderDetailsService.getProviderDetailsByProfileId(profileId);
      
      if (!details) {
        return httpResponse.notFound(res, "Provider details not found for this profile");
      }

      httpResponse.success(res, details, 200, "Provider details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAcceptingPatients(req, res, next) {
    try {
      const providers = await ProviderDetailsService.getAcceptingPatients();
      httpResponse.success(res, providers, 200, "Providers accepting patients retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createProviderDetails(req, res, next) {
    try {
      const detailsData = req.body;
      
      if (!detailsData.profile_id) {
        return httpResponse.badRequest(res, "profile_id is required");
      }

      const newDetails = await ProviderDetailsService.createProviderDetails(detailsData);
      httpResponse.created(res, newDetails, "Provider details created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateProviderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedDetails = await ProviderDetailsService.updateProviderDetails(id, updateData);
      httpResponse.success(res, updatedDetails, 200, "Provider details updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteProviderDetails(req, res, next) {
    try {
      const { id } = req.params;
      const deletedDetails = await ProviderDetailsService.deleteProviderDetails(id);
      httpResponse.success(res, deletedDetails, 200, "Provider details deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
