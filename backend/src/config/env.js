import dotenv from 'dotenv';

dotenv.config();

const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

function normalizeSupabaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: normalizeSupabaseUrl(process.env.SUPABASE_URL),
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminOrigin: process.env.ADMIN_ORIGIN || 'http://localhost:5174',
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM_EMAIL || '',
    to: process.env.CONTACT_RECEIVER_EMAIL || '',
  },
};

export function missingEnv() {
  return REQUIRED.filter((key) => !process.env[key]);
}

const PRODUCTION_ORIGINS = [
  'https://portfolio-del10cbvw-karans-projects-43a893ed.vercel.app',
  'https://portfolio-admin-aa9i.onrender.com',
];

export function allowedOrigins() {
  return [env.corsOrigin, env.adminOrigin, ...PRODUCTION_ORIGINS]
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}
