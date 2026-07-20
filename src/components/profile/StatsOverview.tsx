import Target from 'lucide-react/dist/esm/icons/target';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Flame from 'lucide-react/dist/esm/icons/flame';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';
import { Card } from '@/components/ui/Card';

interface StatsOverviewProps {
  stats: {
    totalQuestions: number;
    accuracy: number;
    studyHours: number;
    streakDays: number;
    predictedScore: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = [
    {
      label: 'الأسئلة المجابة',
      value: stats.totalQuestions.toLocaleString(),
      icon: Target,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'دقة الإجابات',
      value: `${stats.accuracy}%`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'ساعات الدراسة',
      value: stats.studyHours.toString(),
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'أيام متتالية',
      value: stats.streakDays.toString(),
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'الدرجة المتوقعة',
      value: stats.predictedScore.toString(),
      icon: BrainCircuit,
      color: 'text-primary-500',
      bg: 'bg-primary-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="p-5 flex flex-col items-center text-center space-y-3 hover:border-primary-500/30 transition-colors">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
            <card.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary" dir="ltr">{card.value}</p>
            <p className="text-xs font-medium text-text-secondary mt-1">{card.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
