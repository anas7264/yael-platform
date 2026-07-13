'use client';

import { useRouter } from 'next/navigation';
import type { Route } from 'next';

type Section = 'reading' | 'vocabulary' | 'writing' | 'spelling';

const SECTION_CONFIG: Record<Section, { icon: string; name: string }> = {
  reading: { icon: '📖', name: 'الاستيعاب' },
  vocabulary: { icon: '📚', name: 'المفردات' },
  writing: { icon: '✍️', name: 'الكتابة' },
  spelling: { icon: '🔤', name: 'الإملاء' },
};

function getMasteryLabel(pct: number): string {
  if (pct < 20) return 'مبتدئ';
  if (pct < 40) return 'متعلم';
  if (pct < 60) return 'متوسط';
  if (pct < 80) return 'متقدم';
  return 'خبير';
}

function getMasteryColor(pct: number): string {
  if (pct < 20) return '#f43f5e';
  if (pct < 40) return '#f59e0b';
  if (pct < 60) return '#eab308';
  if (pct < 80) return '#10b981';
  return '#6366f1';
}

interface SectionMasteryGridProps {
  reading: number;
  vocabulary: number;
  writing: number;
  spelling: number;
}

export function SectionMasteryGrid({ reading, vocabulary, writing, spelling }: SectionMasteryGridProps) {
  const router = useRouter();
  const sections: { key: Section; value: number }[] = [
    { key: 'reading', value: reading },
    { key: 'vocabulary', value: vocabulary },
    { key: 'writing', value: writing },
    { key: 'spelling', value: spelling },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">إتقان الأقسام</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sections.map(({ key, value }) => {
          const config = SECTION_CONFIG[key];
          const pct = Math.round(value || 0);
          const color = getMasteryColor(pct);
          const label = getMasteryLabel(pct);
          const size = 80;
          const stroke = 8;
          const r = (size - stroke) / 2;
          const circ = 2 * Math.PI * r;
          const dash = (pct / 100) * circ;

          return (
            <button
              key={key}
              onClick={() => router.push(`/practice/${key}` as Route)}
              className="group relative overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary p-4 flex flex-col items-center gap-3 transition-all hover:border-primary-500/50 hover:shadow-glow-primary hover:scale-105 text-center"
            >
              <div className="relative">
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
                  <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ}
                    strokeDashoffset={circ - dash}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">{config.icon}</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-text-primary">{config.name}</p>
                <p className="text-lg font-black" style={{ color }}>{pct}%</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
