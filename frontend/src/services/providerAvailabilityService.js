const BASE_URL = "http://localhost:4000/api";

class ProviderAvailabilityService {
  static async listTemplate(providerId) {
    const res = await fetch(`${BASE_URL}/provider-availability/${providerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load template");
    return data;
  }

  static async addTemplateBlock({ provider_id, day_of_week, start_time, end_time }) {
    const res = await fetch(`${BASE_URL}/provider-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id, day_of_week, start_time, end_time }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add block");
    return data;
  }

  static async deleteTemplateBlock(id) {
    const res = await fetch(`${BASE_URL}/provider-availability/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to remove block");
    return data;
  }

  static async listExceptions(providerId) {
    const res = await fetch(`${BASE_URL}/provider-availability-exceptions/${providerId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load exceptions");
    return data;
  }

  static async addException({ provider_id, start_at, end_at, reason }) {
    const res = await fetch(`${BASE_URL}/provider-availability-exceptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id, start_at, end_at, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add time off");
    return data;
  }

  static async deleteException(id) {
    const res = await fetch(`${BASE_URL}/provider-availability-exceptions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to remove time off");
    return data;
  }
}

export default ProviderAvailabilityService;
