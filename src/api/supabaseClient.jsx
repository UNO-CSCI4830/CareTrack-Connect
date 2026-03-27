//esablishes the supabase client
//update supbaseURL and supabaseAnonKey in the .env file
import  { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_DB_URL;
const supabaseAnonKey = import.meta.env.VITE_DB_ANON_KEY;
export const supabase = createClient(supabaseURL, supabaseAnonKey);