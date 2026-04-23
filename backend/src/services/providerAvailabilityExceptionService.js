import { supabase } from "../supabaseAdminClient.js";

export class ProviderAvailabilityExceptionService {
  static async listForProvider(providerId, { from, to } = {}) {
    let query = supabase
      .from("provider_availability_exceptions")
      .select("*")
      .eq("provider_id", providerId)
      .order("start_at");
    if (from) query = query.gte("end_at", from);
    if (to) query = query.lte("start_at", to);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async create({ provider_id, start_at, end_at, reason }) {
    const { data, error } = await supabase
      .from("provider_availability_exceptions")
      .insert([{ provider_id, start_at, end_at, reason: reason || null }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from("provider_availability_exceptions")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
