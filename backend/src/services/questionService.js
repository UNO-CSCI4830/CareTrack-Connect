import { supabase } from "../supabaseAdminClient.js";

export class QuestionService {
  static async getAllQuestions() {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getQuestionById(id) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getActiveQuestions() {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async getQuestionsByType(questionType) {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("question_type", questionType)
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async createQuestion(questionData) {
    const { data, error } = await supabase
      .from("questions")
      .insert([questionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateQuestion(id, questionData) {
    const { data, error } = await supabase
      .from("questions")
      .update(questionData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteQuestion(id) {
    const { data, error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deactivateQuestion(id) {
    const { data, error } = await supabase
      .from("questions")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
