import { supabase } from "../supabaseAdminClient.js";

export class AttachmentService {
  static async getAllAttachments() {
    const { data, error } = await supabase
      .from("attachments")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getAttachmentById(id) {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAttachmentsByPatientId(patientId) {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("patient_id", patientId);
    
    if (error) throw error;
    return data;
  }

  static async getAttachmentsByCheckInId(checkInId) {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("check_in_id", checkInId);
    
    if (error) throw error;
    return data;
  }

  static async getAttachmentsByType(fileType) {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("file_type", fileType);
    
    if (error) throw error;
    return data;
  }

  static async createAttachment(attachmentData) {
    const { data, error } = await supabase
      .from("attachments")
      .insert([attachmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAttachment(id, attachmentData) {
    const { data, error } = await supabase
      .from("attachments")
      .update(attachmentData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteAttachment(id) {
    const { data, error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteAttachmentsByCheckInId(checkInId) {
    const { data, error } = await supabase
      .from("attachments")
      .delete()
      .eq("check_in_id", checkInId);
    
    if (error) throw error;
    return data;
  }
}
