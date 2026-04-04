const BASE_URL = "http://localhost:4000/api";

class PatientDetailsService {
  static async getPatientDetailsByProfileId(profileId) {
    const response = await fetch(`${BASE_URL}/patient-details/profile/${profileId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Get patient details failed");
    }

    return data;
  }

  static async createPatientDetails(patientDetails) {
    const response = await fetch(`${BASE_URL}/patient-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientDetails),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Create patient details failed");
    }

    return data;
  }

  static async updatePatientDetails(id, update) {
    const response = await fetch(`${BASE_URL}/patient-details/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Update patient details failed");
    }

    return data;
  }

  static async deletePatientDetails(id) {
    const response = await fetch(`${BASE_URL}/patient-details/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Delete patient details failed");
    }

    return data;
  }
}

export default PatientDetailsService;
