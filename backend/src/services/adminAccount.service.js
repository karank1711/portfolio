import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabase.js';
import { env } from '../config/env.js';

const adminEnvPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../admin/.env');

export function readAdminCredentials() {
  if (!fs.existsSync(adminEnvPath)) return null;
  const parsed = dotenv.parse(fs.readFileSync(adminEnvPath));
  const email = String(parsed.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(parsed.ADMIN_PASSWORD || '');
  if (!email || !password) return null;
  return { email, password };
}

export async function ensureAdminFromEnv() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) return null;
  const credentials = readAdminCredentials();
  if (!credentials) {
    console.warn('Admin sign-in is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in admin/.env.');
    return null;
  }

  const supabase = getSupabase();
  const passwordHash = await bcrypt.hash(credentials.password, 12);
  const { data: existing, error: lookupError } = await supabase
    .from('admin_users')
    .select('id, password_hash')
    .eq('email', credentials.email)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (!existing) {
    const { error } = await supabase.from('admin_users').insert({
      email: credentials.email,
      password_hash: passwordHash,
      name: 'Portfolio Admin',
    });
    if (error) throw error;
    console.log(`Admin account ready for ${credentials.email}`);
    return credentials.email;
  }

  const matches = await bcrypt.compare(credentials.password, existing.password_hash);
  if (!matches) {
    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('id', existing.id);
    if (error) throw error;
    console.log(`Admin password updated from admin/.env for ${credentials.email}`);
  }
  return credentials.email;
}
