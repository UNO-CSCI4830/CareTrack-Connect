import { supabase, supabaseService } from "../supabaseClient.js";

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

  
  // static async createProfile({ first_name, last_name, email, password, role }) {
  //   // Use the service role Supabase client so our backend can bypass RLS for admin operations
    
  //   const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
  //     email,
  //     password,
  //     user_metadata: {
  //       first_name,
  //       last_name,
  //       role,
  //     },
  //     email_confirm: true,
  //   });

  //   if (authError) throw authError;

  //   const authUser = authData.user;
  //   if (!authUser) {
  //     throw new Error("User was not created successfully.");
  //   }

  //   // Insert profile as the backend service role, bypassing RLS restrictions
  //   const { data: profile, error: profileError } = await supabaseService
  //     .from("profiles")
  //     .insert([
  //       {
  //         auth_user_id: authUser.id,
  //         first_name,
  //         last_name,
  //         email,
  //         role,
  //       },
  //     ])
  //     .select()
  //     .single();

  //   if (profileError) throw profileError;

  //   return { user: authUser, profile };
  // }

  static async createProfile({ first_name, last_name, email, password, role }) {
  // 1. Create auth user in Supabase Auth
  const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name,
        last_name,
        role,
      },
      email_confirm: true,
    });

  if (authError) {
    throw authError;
  }

  const authUser = authData.user;

  if (!authUser) {
    throw new Error("User was not created successfully.");
  }

  // 2. Upsert profile in public.profiles
  const profilePayload = {
    auth_user_id: authUser.id,
    first_name,
    last_name,
    email,
    role,
  };

  const { data: profile, error: profileError } = await supabaseService
    .from("profiles")
    .upsert([profilePayload], {
      onConflict: "auth_user_id",
    })
    .select()
    .single();

  if (profileError) {
    throw profileError;
  }

  // 3. Return both auth user and profile
  return {
    user: authUser,
    profile,
  };
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
