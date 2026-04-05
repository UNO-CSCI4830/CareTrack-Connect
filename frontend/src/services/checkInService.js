const BASE_URL = "http://localhost:4000/api";

class CheckInService {
  static async getActiveQuestions() {
    const response = await fetch(`${BASE_URL}/questions/active`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch questions");
    return data;
  }

  static async createCheckIn(patientId) {
    const response = await fetch(`${BASE_URL}/check-ins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: patientId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create check-in");
    return data;
  }

  static async submitResponses(checkInId, responses) {
    const response = await fetch(`${BASE_URL}/check-in-responses/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: responses.map(r => ({ ...r, check_in_id: checkInId })) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to submit responses");
    return data;
  }
}

export default CheckInService;
