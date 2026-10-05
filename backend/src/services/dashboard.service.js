import { getSupabase } from '../config/supabase.js';
import { mapDbError } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { getAbout } from './about.service.js';
import { getProfile } from './profile.service.js';
import { getResume } from './resume.service.js';

async function countOf(table, apply) {
  let builder = getSupabase().from(table).select('*', { count: 'exact', head: true });
  if (apply) builder = apply(builder);
  const { count, error } = await builder;
  if (error) {
    console.error(error);
    throw mapDbError(error);
  }
  return count || 0;
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboard() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);

  const [
    projects,
    skills,
    experiences,
    education,
    achievements,
    messages,
    unreadMessages,
    socialLinks,
    profile,
    about,
    resume,
    recentProjects,
    recentMessages,
    recentMessageDates,
  ] = await Promise.all([
    countOf('projects'),
    countOf('skills'),
    countOf('experiences'),
    countOf('education'),
    countOf('achievements'),
    countOf('contact_messages'),
    countOf('contact_messages', (builder) => builder.eq('is_read', false)),
    countOf('social_links'),
    getProfile(),
    getAbout(),
    getResume(),
    getSupabase().from('projects').select('id, name, category, status, is_featured, is_published, updated_at').order('updated_at', { ascending: false }).limit(5),
    getSupabase().from('contact_messages').select('id, name, email, message, is_read, created_at').order('created_at', { ascending: false }).limit(5),
    getSupabase().from('contact_messages').select('created_at').gte('created_at', since.toISOString()),
  ]);

  if (recentProjects.error) throw mapDbError(recentProjects.error);
  if (recentMessages.error) throw mapDbError(recentMessages.error);
  if (recentMessageDates.error) throw mapDbError(recentMessageDates.error);

  const countsByDay = new Map();
  for (const row of recentMessageDates.data || []) {
    const key = String(row.created_at).slice(0, 10);
    countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
  }
  const messageSeries = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = dayKey(date);
    return { date: key, count: countsByDay.get(key) || 0 };
  });

  return {
    counts: {
      projects,
      skills,
      experiences,
      education,
      achievements,
      messages,
      unreadMessages,
    },
    recentProjects: (recentProjects.data || []).map((row) => toCamel(row)),
    recentMessages: (recentMessages.data || []).map((row) => toCamel(row)),
    messageSeries,
    status: {
      hasName: Boolean(profile?.fullName),
      hasPhoto: Boolean(profile?.profileImageUrl),
      hasAbout: Boolean(about?.summary),
      hasResume: Boolean(resume?.fileUrl),
      hasProject: projects > 0,
      hasSocial: socialLinks > 0,
    },
  };
}
