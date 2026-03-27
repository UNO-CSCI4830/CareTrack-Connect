import { httpResponse } from "../utils/httpResponse.js";
import { ProfileService } from "../services/profileService.js";

export class ProfileController {
  static async getAllProfiles(req, res, next) {
    try {
      const profiles = await ProfileService.getAllProfiles();
      httpResponse.success(res, profiles, 200, "Profiles retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProfileById(req, res, next) {
    try {
      const { id } = req.params;
      const profile = await ProfileService.getProfileById(id);
      
      if (!profile) {
        return httpResponse.notFound(res, "Profile not found");
      }

      httpResponse.success(res, profile, 200, "Profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProfileByAuthUserId(req, res, next) {
    try {
      const { authUserId } = req.params;
      const profile = await ProfileService.getProfileByAuthUserId(authUserId);
      
      if (!profile) {
        return httpResponse.notFound(res, "Profile not found");
      }

      httpResponse.success(res, profile, 200, "Profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProfilesByRole(req, res, next) {
    try {
      const { role } = req.params;
      const profiles = await ProfileService.getProfilesByRole(role);
      httpResponse.success(res, profiles, 200, `${role} profiles retrieved successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async createProfile(req, res, next) {
    try {
      const profileData = req.body;
      
      if (!profileData.auth_user_id || !profileData.role || !profileData.first_name || !profileData.last_name || !profileData.email) {
        return httpResponse.badRequest(res, "Missing required fields: auth_user_id, role, first_name, last_name, email");
      }

      const newProfile = await ProfileService.createProfile(profileData);
      httpResponse.created(res, newProfile, "Profile created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedProfile = await ProfileService.updateProfile(id, updateData);
      httpResponse.success(res, updatedProfile, 200, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const { id } = req.params;
      const deletedProfile = await ProfileService.deleteProfile(id);
      httpResponse.success(res, deletedProfile, 200, "Profile deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
