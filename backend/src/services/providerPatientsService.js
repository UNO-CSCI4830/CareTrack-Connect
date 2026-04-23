import { supabase } from "../supabaseAdminClient.js";

export class ProviderPatientsService {
  static async getAllProviderPatients() {
    const { data, error } = await supabase
      .from("provider_patients")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getProviderPatientById(id) {
    const { data, error } = await supabase
      .from("provider_patients")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPatientsByProviderId(providerId) {
    const { data, error } = await supabase
      .from("provider_patients")
      .select("*")
      .eq("provider_id", providerId);
    
    if (error) throw error;
    return data;
  }

  static async getProvidersByPatientId(patientId) {
    const { data, error } = await supabase
      .from("provider_patients")
      .select("*, provider:profiles!provider_patients_provider_id_fkey(id, first_name, last_name, email)")
      .eq("patient_id", patientId);

    if (error) throw error;
    return data;
  }

  static async assignPatientToProvider(assignmentData) {
    const { data, error } = await supabase
      .from("provider_patients")
      .insert([assignmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProviderPatient(id, assignmentData) {
    const { data, error } = await supabase
      .from("provider_patients")
      .update(assignmentData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async removePatientFromProvider(id) {
    const { data, error } = await supabase
      .from("provider_patients")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getActivePatientsByProviderId(providerId) {
    const { data, error } = await supabase
      .from("provider_patients")
      .select("*")
      .eq("provider_id", providerId)
      .eq("status", "active");
    
    if (error) throw error;
    return data;
  }
}
