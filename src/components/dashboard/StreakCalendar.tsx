'use client';

type DayActivity = {
  activity_date: string;
  xp_earned: number;
};

interface StreakCalendarProps {
  activity: DayActivity[];
}

function getDayColor(xp: number): string {
  if (xp === 0) return 'bg-bg-tertiary';
  if (xp < 20) return 'bg-emerald-900/60';
  if (xp < 50) return 'bg-emerald-700/70';
  if (xp < 100) return 'bg-emerald-500/80';
  return 'bg-emerald-400';
}

export function StreakCalendar({ activity }: StreakCalendarProps) {
  // Build a map of date → xp
  const activityMap = new Map<string, number>();
  for (const day of activity) {
    activityMap.set(day.activity_date, day.xp_earned);
  }

  // Last 30 days
  const days: { date: string; xp: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0] as string;
    days.push({ date: key, xp: activityMap.get(key) || 0 });
  }

  const activeDays = days.filter((d) => d.xp > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">سلسلة الأيام</h2>
        <span className="text-sm text-text-tertiary">{activeDays} / 30 يوم نشط</span>
      </div>
      <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
        <div className="grid grid-cols-10 gap-1.5">
          {days.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.xp} XP`}
              className={`h-6 w-full rounded-sm ${getDayColor(day.xp)} transition-colors`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-text-tertiary">
          <span>30 يوم مضى</span>
          <span>اليوم</span>
        </div>
      </div>
    </div>
  );
}
