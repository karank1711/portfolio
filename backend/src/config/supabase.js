import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

let client;

export function getSupabase() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new ApiError(503, 'Supabase is not configured. Add the keys in backend/.env.');
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
