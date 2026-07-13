'use client';

import { HebrewIsland } from '@/components/ui/HebrewIsland';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Question {
  id: string;
  text_hebrew: string;
  passage_text_hebrew?: string;
  option_a_hebrew: string;
  option_b_hebrew: string;
  option_c_hebrew: string;
  option_d_hebrew: string;
}

interface QuestionCardProps {
  question: Question;
  currentNumber: number;
  totalNumber: number;
  selectedOption: string | null;
  onSelectOption: (opt: string) => void;
  isSubmitted: boolean;
  correctOption: string | null;
}

export function QuestionCard({
  question,
  currentNumber,
  totalNumber,
  selectedOption,
  onSelectOption,
  isSubmitted,
  correctOption,
}: QuestionCardProps) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, question?.id]);

  if (!question) return null;

  const progress = (currentNumber / totalNumber) * 100;
  const options = ['A', 'B', 'C', 'D'];
  const hebrewOptions: Record<string, string> = {
    A: String(question.option_a_hebrew || ''),
    B: String(question.option_b_hebrew || ''),
    C: String(question.option_c_hebrew || ''),
    D: String(question.option_d_hebrew || ''),
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 shadow-sm border border-border-subtle max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-text-tertiary">
          السؤال {currentNumber} من {totalNumber}
        </span>
        <span className="text-sm font-mono text-text-secondary">{formatTime(timer)}</span>
      </div>
      
      <ProgressBar value={progress} className="mb-8" />

      {question.passage_text_hebrew && (
        <div className="mb-8 p-4 bg-bg-tertiary rounded-xl max-h-48 overflow-y-auto">
          <HebrewIsland>{question.passage_text_hebrew}</HebrewIsland>
        </div>
      )}

      <div className="mb-8 text-xl">
        <HebrewIsland>{String(question.text_hebrew || '')}</HebrewIsland>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrect = correctOption === opt;
          
          let stateClasses = 'bg-bg-tertiary border-border-subtle hover:border-primary-300';
          let Icon = null;

          if (isSubmitted) {
            if (isCorrect) {
              stateClasses = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400';
              Icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            } else if (isSelected && !isCorrect) {
              stateClasses = 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 animate-shake';
              Icon = <XCircle className="w-5 h-5 text-rose-500" />;
            } else {
              stateClasses = 'bg-bg-tertiary border-border-subtle opacity-50';
            }
          } else if (isSelected) {
            stateClasses = 'bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-400';
          }

          return (
            <button
              key={opt}
              onClick={() => !isSubmitted && onSelectOption(opt)}
              disabled={isSubmitted}
              className={`w-full text-start p-4 rounded-xl border-2 transition-all flex items-center justify-between ${stateClasses}`}
              dir="ltr"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="font-bold font-mono opacity-50">{opt}</span>
                <span className="flex-1 text-right">
                  <HebrewIsland inline>{hebrewOptions[opt]}</HebrewIsland>
                </span>
              </div>
              {Icon && <div className="ml-4">{Icon}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
