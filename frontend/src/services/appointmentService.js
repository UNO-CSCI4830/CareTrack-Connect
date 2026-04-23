const BASE_URL = "http://localhost:4000/api";

class AppointmentService {
  static async getAvailability(providerId, fromDate, toDate) {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${BASE_URL}/appointments/availability/${providerId}${qs}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch availability");
    return data;
  }

  static async listForPatient(patientId) {
    const res = await fetch(`${BASE_URL}/appointments?patient_id=${patientId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
    return data;
  }

  static async listForProvider(providerId) {
    const res = await fetch(`${BASE_URL}/appointments?provider_id=${providerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch appointments");
    return data;
  }

  static async book({ provider_id, patient_id, start_at, reason }) {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id, patient_id, start_at, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || "Failed to book appointment");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  static async reschedule(id, start_at) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_at }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || "Failed to reschedule");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  static async cancel(id, cancelledByProfileId) {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelled_by: cancelledByProfileId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to cancel");
    return data;
  }
}

export default AppointmentService;
