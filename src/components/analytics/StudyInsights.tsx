'use client';

import { TrendingUp, Clock, Zap } from 'lucide-react';

interface StudyInsightsProps {
  weakestKC: string;
  bestStudyTime: string;
  xpPerDay: number;
  xpTrend: 'up' | 'down' | 'stable';
}

export function StudyInsights({ weakestKC, bestStudyTime, xpPerDay, xpTrend }: StudyInsightsProps) {
  const trendColor =
    xpTrend === 'up' ? 'text-emerald-500' :
    xpTrend === 'down' ? 'text-rose-500' :
    'text-amber-500';

  const trendLabel =
    xpTrend === 'up' ? 'في تحسن مستمر' :
    xpTrend === 'down' ? 'يحتاج انتباهاً' :
    'مستقر';

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Weakest KC */}
      <div className="bg-bg-secondary border border-rose-500/20 rounded-2xl p-5 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            أكثر مهارة تحتاج تمرين
          </p>
          <p className="font-bold text-base leading-tight">{weakestKC}</p>
          <p className="text-xs text-rose-500 mt-1">ركز على هذا القسم أولاً</p>
        </div>
      </div>

      {/* Best Study Time */}
      <div className="bg-bg-secondary border border-amber-500/20 rounded-2xl p-5 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            أفضل وقت للدراسة
          </p>
          <p className="font-bold text-base leading-tight">{bestStudyTime}</p>
          <p className="text-xs text-amber-500 mt-1">أعلى معدل نشاط لديك</p>
        </div>
      </div>

      {/* XP per day */}
      <div className="bg-bg-secondary border border-emerald-500/20 rounded-2xl p-5 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            معدل التقدم اليومي
          </p>
          <p className="font-bold text-2xl leading-tight">
            {xpPerDay} <span className="text-sm font-normal text-text-secondary">نقطة / يوم</span>
          </p>
          <p className={`text-xs mt-1 font-bold ${trendColor}`}>{trendLabel}</p>
        </div>
      </div>
    </div>
  );
}
