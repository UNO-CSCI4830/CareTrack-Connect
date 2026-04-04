import { supabase } from "../supabaseAdminClient.js";

export class CheckInService {
  static async getAllCheckIns() {
    const { data, error } = await supabase
      .from("check_ins")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getCheckInById(id) {
    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getCheckInsByPatientId(patientId) {
    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("patient_id", patientId)
      .order("check_in_date", { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getCheckInsByPatientAndDate(patientId, checkInDate) {
    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("patient_id", patientId)
      .eq("check_in_date", checkInDate)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createCheckIn(checkInData) {
    const { data, error } = await supabase
      .from("check_ins")
      .insert([checkInData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCheckIn(id, checkInData) {
    const { data, error } = await supabase
      .from("check_ins")
      .update(checkInData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCheckIn(id) {
    const { data, error } = await supabase
      .from("check_ins")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getCheckInsByStatus(status) {
    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("status", status);
    
    if (error) throw error;
    return data;
  }
}
