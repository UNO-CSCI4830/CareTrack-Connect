const BASE_URL = "http://localhost:4000/api";

class ProfileService {
  static async createProfile(profile) {
    const response = await fetch(`${BASE_URL}/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Create profile failed");
    }

    return data;
  }

  static async getProfiles() {
    const response = await fetch(`${BASE_URL}/profiles`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Get profiles failed");
    }

    return data;
  }

  static async getProfile(id) {
    const response = await fetch(`${BASE_URL}/profiles/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Get profile failed");
    }

    return data;
  }
  
  static async getProfileByAuthUserId(authUserId) {
    const response = await fetch(`${BASE_URL}/profiles/auth/${authUserId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Get profile by auth user ID failed");
    }

    return data;
  }

  static async updateProfile(id, update) {
    const response = await fetch(`${BASE_URL}/profiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Update profile failed");
    }

    return data;
  }

  static async deleteProfile(id) {
    const response = await fetch(`${BASE_URL}/profiles/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Delete profile failed");
    }

    return data;
  }
}

export default ProfileService;
