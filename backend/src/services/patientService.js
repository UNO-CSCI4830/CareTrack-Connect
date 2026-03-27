import { supabase } from "../supabaseClient.js";

export class PatientService {
  static async getAllPatients() {
    const { data, error } = await supabase
      .from("patients")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getPatientById(id) {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createPatient(patientData) {
    const { data, error } = await supabase
      .from("patients")
      .insert([patientData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePatient(id, patientData) {
    const { data, error } = await supabase
      .from("patients")
      .update(patientData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePatient(id) {
    const { data, error } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
