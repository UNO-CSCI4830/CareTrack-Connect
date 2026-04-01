import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Service role (strong key) for admin operations and bypassing RLS from backend
export const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});
