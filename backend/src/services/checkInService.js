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

  static async getCheckInsForProvider(providerId) {
    // Get active patient IDs for this provider
    const { data: assignments, error: assignError } = await supabase
      .from("provider_patients")
      .select("patient_id")
      .eq("provider_id", providerId)
      .eq("status", "active");

    if (assignError) throw assignError;

    const patientIds = assignments.map((a) => a.patient_id);
    if (patientIds.length === 0) return [];

    // Fetch check-ins for those patients with patient profile info and responses
    const { data, error } = await supabase
      .from("check_ins")
      .select(
        "*, patient:profiles!check_ins_patient_id_fkey(id, first_name, last_name), check_in_responses(numeric_value, text_value, question:questions(question_text, question_type))"
      )
      .in("patient_id", patientIds)
      .order("check_in_date", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async isProviderForPatient(providerId, patientId) {
    const { data, error } = await supabase
      .from("provider_patients")
      .select("id")
      .eq("provider_id", providerId)
      .eq("patient_id", patientId)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  static async getCheckInsByPatientIdForProvider(providerId, patientId) {
    const isProvider = await CheckInService.isProviderForPatient(
      providerId,
      patientId
    );
    if (!isProvider) return null; // signals unauthorized

    const { data, error } = await supabase
      .from("check_ins")
      .select(
        "*, check_in_responses(numeric_value, text_value, question:questions(question_text, question_type))"
      )
      .eq("patient_id", patientId)
      .order("check_in_date", { ascending: false });

    if (error) throw error;
    return data;
  }
}
