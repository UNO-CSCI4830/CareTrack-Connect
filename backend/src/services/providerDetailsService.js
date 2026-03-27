import { supabase } from "../supabaseClient.js";

export class ProviderDetailsService {
  static async getAllProviderDetails() {
    const { data, error } = await supabase
      .from("provider_details")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getProviderDetailsById(id) {
    const { data, error } = await supabase
      .from("provider_details")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getProviderDetailsByProfileId(profileId) {
    const { data, error } = await supabase
      .from("provider_details")
      .select("*")
      .eq("profile_id", profileId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createProviderDetails(detailsData) {
    const { data, error } = await supabase
      .from("provider_details")
      .insert([detailsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProviderDetails(id, detailsData) {
    const { data, error } = await supabase
      .from("provider_details")
      .update({ ...detailsData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProviderDetails(id) {
    const { data, error } = await supabase
      .from("provider_details")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAcceptingPatients() {
    const { data, error } = await supabase
      .from("provider_details")
      .select("*")
      .eq("accepting_patients", true);
    
    if (error) throw error;
    return data;
  }
}
