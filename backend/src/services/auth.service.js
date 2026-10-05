import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../utils/db.js';

const dummyHashPromise = bcrypt.hash('not-a-real-password', 12);

function publicAdmin(row) {
  return { id: row.id, email: row.email, name: row.name };
}

function signToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, name: admin.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export async function login(email, password) {
  const row = await query(
    getSupabase().from('admin_users').select('id, email, name, password_hash').eq('email', email.toLowerCase()).maybeSingle(),
  );
  const hash = row?.password_hash || await dummyHashPromise;
  const matches = await bcrypt.compare(password, hash);
  if (!row || !matches) throw new ApiError(401, 'Invalid email or password');
  const admin = publicAdmin(row);
  return { token: signToken(admin), admin };
}

export async function me(user) {
  const row = await query(
    getSupabase().from('admin_users').select('id, email, name').eq('id', user.sub).maybeSingle(),
  );
  if (!row) throw new ApiError(401, 'Invalid or expired session');
  return row;
}

export async function updateName(user, name) {
  const row = await query(
    getSupabase().from('admin_users').update({ name }).eq('id', user.sub).select('id, email, name').single(),
  );
  return row;
}

export async function changePassword(user, currentPassword, newPassword) {
  const row = await query(
    getSupabase().from('admin_users').select('id, password_hash').eq('id', user.sub).maybeSingle(),
  );
  if (!row) throw new ApiError(401, 'Invalid or expired session');
  const matches = await bcrypt.compare(currentPassword, row.password_hash);
  if (!matches) throw new ApiError(400, 'Current password is incorrect');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await query(getSupabase().from('admin_users').update({ password_hash: passwordHash }).eq('id', row.id));
}
