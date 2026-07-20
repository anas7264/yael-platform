'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface DailyActivityChartProps {
  data: {
    date: string;
    questions: number;
    vocab: number;
    studyMinutes: number;
  }[];
}

export function DailyActivityChart({ data }: DailyActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle, #27272a)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--color-text-tertiary, #71717a)' }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: 'var(--color-text-tertiary, #71717a)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10, fill: 'var(--color-text-tertiary, #71717a)' }}
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
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : 0;
            if (name === 'questions') return [`${v}`, 'الأسئلة'];
            if (name === 'vocab') return [`${v}`, 'مراجعة المفردات'];
            return [`${v} د`, 'وقت الدراسة'];
          }}
        />
        <Legend
          formatter={(value) =>
            value === 'questions' ? 'الأسئلة'
            : value === 'vocab' ? 'مراجعة المفردات'
            : 'وقت الدراسة (د)'
          }
        />
        <Bar yAxisId="left" dataKey="questions" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
        <Bar yAxisId="left" dataKey="vocab" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="studyMinutes"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
