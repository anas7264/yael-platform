'use client';

import { useEffect, useState, memo } from 'react';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Flame from 'lucide-react/dist/esm/icons/flame';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Target from 'lucide-react/dist/esm/icons/target';

interface StatsGridProps {
  level: number;
  xp: number;
  streakDays: number;
  longestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
}

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);
  return <>{val.toLocaleString('ar-EG')}</>;
}

export const StatsGrid = memo(function StatsGrid({ level, xp, streakDays, longestStreak, totalCorrect, totalAnswered }: StatsGridProps) {
  const xpForLevel = 1000;
  const levelProgress = (xp % xpForLevel) / xpForLevel * 100;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const cards = [
    {
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      bg: 'from-yellow-500/10 to-yellow-600/5',
      border: 'border-yellow-500/20',
      label: 'المستوى',
      value: <><AnimatedNumber target={level} /></>,
      sub: (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-tertiary">للمستوى التالي</span>
            <span className="text-yellow-400">{Math.round(levelProgress)}%</span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-1.5">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
      ),
    },
    {
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      bg: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/20',
      label: 'نقاط التجربة',
      value: <><AnimatedNumber target={xp} /> <span className="text-base font-normal text-text-tertiary">XP</span></>,
      sub: <p className="text-xs text-text-tertiary mt-2">المستوى التالي عند {(Math.floor(xp / xpForLevel) + 1) * xpForLevel} XP</p>,
    },
    {
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      bg: 'from-rose-500/10 to-rose-600/5',
      border: 'border-rose-500/20',
      label: 'الأيام المتتالية',
      value: <><AnimatedNumber target={streakDays} /> <span className="text-base font-normal text-text-tertiary">🔥</span></>,
      sub: <p className="text-xs text-text-tertiary mt-2">الأطول: {longestStreak} يوم</p>,
    },
    {
      icon: <Target className="w-5 h-5 text-emerald-400" />,
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      label: 'دقة الإجابات',
      value: <><AnimatedNumber target={accuracy} />%</>,
      sub: <p className="text-xs text-text-tertiary mt-2">{totalCorrect} من {totalAnswered} سؤال</p>,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl p-4 border bg-gradient-to-br ${card.bg} ${card.border} backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-bg-secondary/50">{card.icon}</div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{card.value}</p>
          <p className="text-sm text-text-secondary mt-0.5">{card.label}</p>
          {card.sub}
        </div>
      ))}
    </div>
  );
});
