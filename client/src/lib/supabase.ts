import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to hard-coded values if not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jbcyhmhjlcfdavqdfosq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiY3lobWhqbGNmZGF2cWRmb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzU5ODYsImV4cCI6MjA2MjcxMTk4Nn0.LvMCWlq-QhPL_aCGLSJjvq4Dt0Du4w25jp_2fXwlTQk';

console.log('Initializing Supabase client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
