import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Check, Folder, Mail, Medal, Star, UserRound } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ErrorState, LoadingBlock } from '@/components/Modal.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { api } from '@/services/api.js';

const STATS = [
  { key: 'projects', label: 'Projects', to: '/projects', icon: Folder },
  { key: 'experiences', label: 'Experience', to: '/experience', icon: Award },
  { key: 'skills', label: 'Skills', to: '/skills', icon: Star },
  { key: 'achievements', label: 'Achievements', to: '/achievements', icon: Medal },
  { key: 'unreadMessages', label: 'Unread messages', to: '/messages', icon: Mail },
];

const cardClass = 'rounded-2xl border border-line bg-elevated shadow-[0_8px_24px_rgb(26_24_20/0.04)]';

function formatDay(value) {
  const key = String(value || '').slice(0, 10);
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return key;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function skillGroups(skills) {
  const groups = new Map();
  for (const skill of skills) {
    const category = skill.category || 'Other';
    groups.set(category, (groups.get(category) || 0) + 1);
  }
  return [...groups.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api('/dashboard'),
      api('/skills').catch(() => null),
    ])
      .then(([payload, skillList]) => {
        if (!active) return;
        setData(payload);
        setSkills(Array.isArray(skillList) ? skillList : null);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} />;

  const accent = theme === 'dark' ? '#d4a482' : '#8c4a32';
  const tick = { fontSize: 11, fill: theme === 'dark' ? '#8a847a' : '#8a8478' };
  const checks = [
    ['Name', data.status.hasName],
    ['Profile photo', data.status.hasPhoto],
    ['About summary', data.status.hasAbout],
    ['Resume', data.status.hasResume],
    ['Published content', data.status.hasProject],
    ['Social links', data.status.hasSocial],
  ];
  const series = (data.messageSeries || []).map((point) => ({
    ...point,
    label: formatDay(point.date),
  }));
  const groups = skills ? skillGroups(skills) : [];

  return (
    <div className="grid gap-4">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {STATS.map(({ key, label, to, icon: Icon }) => {
          const count = data.counts[key] ?? 0;
          return (
            <Link
              key={key}
              to={to}
              aria-label={`${label}, ${count}`}
              className={`${cardClass} flex items-center justify-between gap-3 px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            >
              <span>
                <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-faint">{label}</span>
                <span className="mt-2 block font-serif text-4xl leading-none text-ink">{count}</span>
              </span>
              <Icon size={22} strokeWidth={1.5} className="shrink-0 text-accent" aria-hidden />
            </Link>
          );
        })}
      </section>

      <div className="flex flex-wrap gap-2">
        <Link to="/projects/new" className="inline-flex items-center rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-ink transition hover:opacity-90">
          Add project
        </Link>
        <Link to="/experience" className="inline-flex items-center rounded-lg border border-line bg-elevated px-3.5 py-2 text-sm font-medium text-ink transition hover:border-ink/30">
          Add experience
        </Link>
        <Link to="/achievements" className="inline-flex items-center rounded-lg border border-line bg-elevated px-3.5 py-2 text-sm font-medium text-ink transition hover:border-ink/30">
          Add achievement
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.75fr)]">
        <section className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <h2 className="font-serif text-2xl text-ink">Messages, last 14 days</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="message-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.38} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={tick} interval={2} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} width={28} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [value, 'Messages']}
                  contentStyle={{
                    background: theme === 'dark' ? '#1c1b18' : '#fbf9f6',
                    border: theme === 'dark' ? '1px solid #302d29' : '1px solid #ddd6cc',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke={accent} fill="url(#message-fill)" strokeWidth={2} dot={{ r: 3, fill: accent, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`${cardClass} p-4 sm:p-5`}>
          <h2 className="font-serif text-2xl text-ink">Portfolio status</h2>
          <div className="mt-4 flex gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-surface text-muted" aria-hidden>
              <UserRound size={26} strokeWidth={1.5} />
            </span>
            <ul className="min-w-0 flex-1 text-sm">
              {checks.map(([label, done]) => (
                <li key={label} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
                  <span className="flex min-w-0 items-center gap-2 text-ink">
                    <Check size={14} className={done ? 'text-accent' : 'text-faint'} aria-hidden />
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="shrink-0 text-muted">{done ? 'Ready' : 'Missing'}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <section className={cardClass}>
          <h2 className="border-b border-line px-4 py-3 font-serif text-xl text-ink">Recent projects</h2>
          {data.recentProjects.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No projects yet.</p> : (
            <ul>
              {data.recentProjects.map((project) => (
                <li key={project.id} className="border-b border-line last:border-b-0">
                  <Link to={`/projects/${project.id}/edit`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-surface/70">
                    <span className="min-w-0 truncate text-ink">{project.name}</span>
                    <span className="shrink-0 text-faint">{project.isPublished ? 'Published' : 'Draft'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cardClass}>
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-serif text-xl text-ink">Skill Proficiency Growth</h2>
            <p className="mt-1 text-xs text-muted">Current skills by category.</p>
          </div>
          {skills === null ? <p className="px-4 py-6 text-sm text-muted">Skill details could not be loaded.</p> : null}
          {skills && groups.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No skills yet.</p> : null}
          {groups.length > 0 ? (
            <ul>
              {groups.map(([category, count]) => (
                <li key={category} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-sm last:border-b-0">
                  <span className="min-w-0 truncate text-ink">{category}</span>
                  <span className="shrink-0 text-faint">{count}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className={`${cardClass} lg:col-span-2 xl:col-span-1`}>
          <h2 className="border-b border-line px-4 py-3 font-serif text-xl text-ink">Recent messages</h2>
          {data.recentMessages.length === 0 ? <p className="px-4 py-6 text-sm text-muted">No messages yet.</p> : (
            <ul>
              {data.recentMessages.map((message) => (
                <li key={message.id} className="border-b border-line last:border-b-0">
                  <Link to="/messages" className="block px-4 py-3 text-sm transition hover:bg-surface/70">
                    <p className="text-ink">
                      {message.name}
                      <span className="text-faint"> · {message.isRead ? 'Read' : 'Unread'}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-muted">{message.message}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
