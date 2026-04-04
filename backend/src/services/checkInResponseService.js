import { supabase } from "../supabaseAdminClient.js";

export class CheckInResponseService {
  static async getAllCheckInResponses() {
    const { data, error } = await supabase
      .from("check_in_responses")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getCheckInResponseById(id) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getResponsesByCheckInId(checkInId) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .select("*")
      .eq("check_in_id", checkInId);
    
    if (error) throw error;
    return data;
  }

  static async getResponsesByQuestionId(questionId) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .select("*")
      .eq("question_id", questionId);
    
    if (error) throw error;
    return data;
  }

  static async createCheckInResponse(responseData) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .insert([responseData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createMultipleResponses(responsesData) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .insert(responsesData)
      .select();
    
    if (error) throw error;
    return data;
  }

  static async updateCheckInResponse(id, responseData) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .update(responseData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCheckInResponse(id) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteResponsesByCheckInId(checkInId) {
    const { data, error } = await supabase
      .from("check_in_responses")
      .delete()
      .eq("check_in_id", checkInId);
    
    if (error) throw error;
    return data;
  }
}
