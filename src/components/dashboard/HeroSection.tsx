'use client';

import { useEffect, useState } from 'react';

const MOTIVATIONAL = [
  'كل يوم تتعلم فيه هو خطوة نحو هدفك!',
  'الثبات هو مفتاح النجاح في امتحان ياعيل.',
  'أنت أقرب من أمس إلى درجتك المستهدفة.',
  'الممارسة اليومية تصنع الفارق الحقيقي.',
  'الجهد المتواصل يفتح أبواب النجاح.',
];

interface HeroSectionProps {
  name: string;
  predictedScore: number;
  targetScore: number;
}

function getScoreColor(score: number): string {
  if (score < 80) return '#f43f5e';
  if (score < 100) return '#f59e0b';
  if (score < 120) return '#6366f1';
  return '#10b981';
}

export function HeroSection({ name, predictedScore, targetScore }: HeroSectionProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * predictedScore));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [predictedScore]);

  const motivation = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min((predictedScore - 50) / 100, 1);
  const dash = pct * circumference;
  const color = getScoreColor(predictedScore);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-800 p-6 md:p-10 text-white shadow-glow-primary">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            مرحباً، <span className="text-yellow-300">{name}</span>! 👋
          </h1>
          <p className="text-white/80 text-lg max-w-md">{motivation}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <span>الهدف المستهدف:</span>
            <span className="text-yellow-300 font-bold">{targetScore}</span>
          </div>
        </div>

        {/* Predicted Score Ring */}
        <div className="flex flex-col items-center gap-2">
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke}
            />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={color} strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center" style={{ marginTop: -size / 2 - 16 }}>
            <span className="text-4xl font-black text-white" style={{ lineHeight: 1 }}>{displayScore}</span>
            <span className="text-xs text-white/60 mt-1">الدرجة المتوقعة</span>
          </div>
          <p className="text-xs text-white/50 mt-2">من أصل 150</p>
        </div>
      </div>
    </div>
  );
}
