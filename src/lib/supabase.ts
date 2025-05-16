import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Default fallback values for local development
// These will be replaced with actual environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;