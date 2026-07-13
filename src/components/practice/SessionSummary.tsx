'use client';

import { Button } from '@/components/ui/Button';
import { Trophy, Target, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

interface SessionSummaryProps {
  summary: {
    accuracy: number;
    isPerfect: boolean;
    bonusXp: number;
    totalXp: number;
    durationSeconds: number;
  };
  section: string;
}

export function SessionSummary({ summary, section }: SessionSummaryProps) {
  const router = useRouter();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-gold shadow-glow-gold mb-6 animate-bounce">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">اكتمل التمرين!</h1>
        <p className="text-xl text-text-secondary">
          {summary.isPerfect ? 'أداء مثالي! لقد حصلت على الجائزة الكاملة.' : 'عمل رائع! استمر في التدريب لتحسين مستواك.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle text-center">
          <Target className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-text-secondary mb-1">دقة الإجابات</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(summary.accuracy)}%</p>
        </div>
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-sm text-text-secondary mb-1">النقاط المكتسبة</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">+{summary.totalXp}</p>
        </div>
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle text-center">
          <Clock className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-text-secondary mb-1">وقت التمرين</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatTime(summary.durationSeconds)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          size="lg" 
          variant="secondary" 
          onClick={() => router.push('/dashboard' as Route)}
          leftIcon={<ArrowRight className="w-5 h-5 rtl-flip" />}
          className="w-full sm:w-auto"
        >
          العودة للوحة التحكم
        </Button>
        <Button 
          size="lg" 
          onClick={() => router.push(`/practice/${section}` as Route)}
          rightIcon={<RotateCcw className="w-5 h-5" />}
          className="w-full sm:w-auto shadow-glow-primary"
        >
          تمرين آخر
        </Button>
      </div>
    </div>
  );
}
