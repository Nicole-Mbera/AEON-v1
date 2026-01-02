
import { createClient } from '@supabase/supabase-js';

// Use standard Supabase env vars. 'STORAGE_' vars are likely S3 keys and not valid for supabase-js client (which expects a JWT).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_PUBLIC_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
