'use client';

import Calendar from 'lucide-react/dist/esm/icons/calendar';
import { Card } from '@/components/ui/Card';

interface ActivityHeatmapProps {
  history: Record<string, number>; // date (YYYY-MM-DD) -> XP or intensity level
}

export function ActivityHeatmap({ history }: ActivityHeatmapProps) {
  // Generate last 365 days
  const today = new Date();
  const days = [];
  
  // Find the closest Sunday to start the grid properly (GitHub style)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }

  const currentDate = new Date(startDate);
  
  while (currentDate <= today) {
    days.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColorClass = (value: number) => {
    if (value === 0) return 'bg-bg-tertiary/50 hover:bg-border-subtle';
    if (value < 20) return 'bg-primary-500/20 hover:bg-primary-500/30';
    if (value < 50) return 'bg-primary-500/50 hover:bg-primary-500/60';
    if (value < 100) return 'bg-primary-500/80 hover:bg-primary-500/90';
    return 'bg-primary-500 hover:bg-primary-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
  };

  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary-500" />
        <h2 className="font-bold text-lg">نشاط التعلم</h2>
      </div>

      <div className="overflow-x-auto pb-4" dir="ltr">
        <div className="min-w-[800px]">
          {/* Months header roughly aligned */}
          <div className="flex text-xs text-text-tertiary mb-2 pl-6">
            {months.map((m, i) => (
              <div key={i} className="flex-1 font-medium text-right">{m}</div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Days sidebar */}
            <div className="flex flex-col gap-1 text-[10px] text-text-tertiary pr-2 justify-between py-1 font-medium">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map(day => {
                    const d = day ?? '';
                    const val = d ? (history[d] || 0) : 0;
                    return (
                      <div
                        key={d || Math.random().toString()}
                        title={`${val} XP on ${d}`}
                        className={`w-3 h-3 sm:w-[14px] sm:h-[14px] rounded-[2px] transition-colors cursor-pointer ${getColorClass(val)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs text-text-tertiary mt-4 pr-1">
            <span>أقل</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-[2px] bg-bg-tertiary/50" />
              <div className="w-3 h-3 rounded-[2px] bg-primary-500/20" />
              <div className="w-3 h-3 rounded-[2px] bg-primary-500/50" />
              <div className="w-3 h-3 rounded-[2px] bg-primary-500/80" />
              <div className="w-3 h-3 rounded-[2px] bg-primary-500" />
            </div>
            <span>أكثر</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
