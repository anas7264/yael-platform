'use client';

interface ExamNavigatorProps {
  total: number;
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  questions: { id: string }[];
  onNavigate: (index: number) => void;
}

export function ExamNavigator({ total, currentIndex, answers, flagged, questions, onNavigate }: ExamNavigatorProps) {
  return (
    <div className="w-full bg-bg-secondary p-4 rounded-xl border border-border-subtle shadow-sm mb-6">
      <h3 className="text-sm font-bold text-text-secondary mb-3">مستكشف الأسئلة</h3>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const qId = questions[i]?.id;
          if (!qId) return null;
          
          const isAnswered = !!answers[qId];
          const isFlagged = !!flagged[qId];
          const isCurrent = i === currentIndex;

          let baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ";
          
          if (isCurrent) {
            baseClasses += "ring-2 ring-primary-500 ring-offset-2 ring-offset-bg-secondary bg-primary-500 text-white";
          } else if (isFlagged) {
            baseClasses += "border-2 border-amber-500 text-amber-600 bg-amber-500/10";
          } else if (isAnswered) {
            baseClasses += "bg-emerald-500 text-white";
          } else {
            baseClasses += "bg-bg-tertiary text-text-secondary hover:bg-border-subtle";
          }

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={baseClasses}
              title={isFlagged ? "مؤشر للمراجعة" : isAnswered ? "مجاب" : "غير مجاب"}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle text-xs text-text-tertiary">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>مُجاب</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-500/10"></div>مؤشر للمراجعة</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-bg-tertiary"></div>غير مُجاب</div>
      </div>
    </div>
  );
}
