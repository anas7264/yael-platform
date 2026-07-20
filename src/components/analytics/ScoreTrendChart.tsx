'use client';

import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Area, AreaChart, ResponsiveContainer, Legend,
} from 'recharts';

interface ScoreTrendChartProps {
  data: { date: string; score: number }[];
  targetScore: number;
}

export function ScoreTrendChart({ data, targetScore }: ScoreTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary-500, #6366f1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-primary-500, #6366f1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #27272a)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary, #71717a)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[50, 150]}
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary, #71717a)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-secondary, #18181b)',
            border: '1px solid var(--color-border-subtle, #27272a)',
            borderRadius: '12px',
            fontSize: '13px',
          }}
          labelFormatter={(label) => `التاريخ: ${label}`}
          formatter={(value) => [`${value ?? 0}`, 'الدرجة المتوقعة']}
        />
        <Legend formatter={() => 'الدرجة المتوقعة'} />
        <ReferenceLine
          y={targetScore}
          stroke="#f59e0b"
          strokeDasharray="6 4"
          label={{ value: 'الهدف', fill: '#f59e0b', fontSize: 12, position: 'right' }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#scoreGradient)"
          dot={false}
          activeDot={{ r: 5, fill: '#6366f1' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
