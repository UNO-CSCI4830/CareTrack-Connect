import { supabase } from "../supabaseClient.js";

export class PatientDetailsService {
  static async getAllPatientDetails() {
    const { data, error } = await supabase
      .from("patient_details")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getPatientDetailsById(id) {
    const { data, error } = await supabase
      .from("patient_details")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPatientDetailsByProfileId(profileId) {
    const { data, error } = await supabase
      .from("patient_details")
      .select("*")
      .eq("profile_id", profileId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createPatientDetails(detailsData) {
    const { data, error } = await supabase
      .from("patient_details")
      .insert([detailsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePatientDetails(id, detailsData) {
    const { data, error } = await supabase
      .from("patient_details")
      .update({ ...detailsData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePatientDetails(id) {
    const { data, error } = await supabase
      .from("patient_details")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
