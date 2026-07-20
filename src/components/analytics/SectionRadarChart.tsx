'use client';

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';

interface SectionRadarChartProps {
  data: {
    subject: string;
    mastery: number;
    target: number;
  }[];
}

export function SectionRadarChart({ data }: SectionRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="var(--color-border-subtle, #27272a)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: 'var(--color-text-secondary, #a1a1aa)' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: 'var(--color-text-tertiary, #71717a)' }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-secondary, #18181b)',
            border: '1px solid var(--color-border-subtle, #27272a)',
            borderRadius: '12px',
            fontSize: '13px',
          }}
          formatter={(value, name) => [
            `${value ?? 0}%`,
            name === 'mastery' ? 'المستوى الحالي' : 'الهدف',
          ]}
        />
        <Legend
          formatter={(value) => value === 'mastery' ? 'المستوى الحالي' : 'الهدف'}
        />
        <Radar
          name="target"
          dataKey="target"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.1}
          strokeDasharray="5 3"
        />
        <Radar
          name="mastery"
          dataKey="mastery"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
