import { supabase } from "../supabaseAdminClient.js";

export class ProviderAvailabilityService {
  static async listForProvider(providerId) {
    const { data, error } = await supabase
      .from("provider_availability")
      .select("*")
      .eq("provider_id", providerId)
      .order("day_of_week")
      .order("start_time");
    if (error) throw error;
    return data;
  }

  static async create({ provider_id, day_of_week, start_time, end_time }) {
    const { data, error } = await supabase
      .from("provider_availability")
      .insert([{ provider_id, day_of_week, start_time, end_time }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from("provider_availability")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
