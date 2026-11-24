import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function MessageChart({ series, accent, tick, theme }) {
  return (
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
  );
}
