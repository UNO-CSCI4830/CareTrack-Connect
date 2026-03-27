import { supabase } from "../supabaseClient.js";

export class ProfileService {
  static async getAllProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*");
    
    if (error) throw error;
    return data;
  }

  static async getProfileById(id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getProfileByAuthUserId(authUserId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createProfile(profileData) {
    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProfile(id, profileData) {
    const { data, error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProfile(id) {
    const { data, error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getProfilesByRole(role) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", role);
    
    if (error) throw error;
    return data;
  }
}
