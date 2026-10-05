import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

export function mapDbError(error) {
  if (error?.code === '23505') return new ApiError(409, 'This value is already in use');
  if (error?.code === '23503') return new ApiError(400, 'Related record is missing');
  if (error?.code === 'PGRST116') return new ApiError(404, 'Record not found');
  const hint = env.nodeEnv === 'production'
    ? 'Database request failed'
    : 'Database request failed. Confirm the service role key and that supabase/schema.sql has been applied.';
  return new ApiError(500, hint);
}

export async function query(builder) {
  const { data, error } = await builder;
  if (error) {
    console.error(error);
    throw mapDbError(error);
  }
  return data;
}
