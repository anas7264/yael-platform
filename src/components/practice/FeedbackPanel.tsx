'use client';

import { Button } from '@/components/ui/Button';
import { AIResponse } from '@/components/shared/AIResponse';
import { CheckCircle2, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';

interface FeedbackPanelProps {
  isCorrect: boolean | null;
  xpEarned: number;
  explanation: string | null;
  onExplain: () => void;
  onNext: () => void;
  isLoadingExplain: boolean;
}

export function FeedbackPanel({
  isCorrect,
  xpEarned,
  explanation,
  onExplain,
  onNext,
  isLoadingExplain,
}: FeedbackPanelProps) {
  if (isCorrect === null) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-bg-primary border-t border-border-subtle shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 md:p-6 animate-slide-up z-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isCorrect ? (
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-rose-500" />
              </div>
            )}
            
            <div>
              <h3 className={`text-2xl font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isCorrect ? '!أحسنت' : '!حاول مرة أخرى'}
              </h3>
              {isCorrect && (
                <div className="text-emerald-500 font-bold animate-float-up inline-block mt-1">
                  +{xpEarned} XP
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isCorrect && !explanation && (
              <Button 
                variant="secondary" 
                onClick={onExplain} 
                disabled={isLoadingExplain}
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="flex-1 md:flex-none"
              >
                {isLoadingExplain ? 'جاري التحليل...' : 'اشرح لي'}
              </Button>
            )}
            <Button 
              size="lg" 
              onClick={onNext} 
              className="flex-1 md:flex-none"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              التالي
            </Button>
          </div>
        </div>

        {explanation && (
          <div className="mt-6 p-4 bg-bg-secondary rounded-xl border border-border-subtle max-h-64 overflow-y-auto">
            <h4 className="text-sm font-bold text-primary-500 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              تفسير الذكاء الاصطناعي
            </h4>
            <div className="text-sm leading-relaxed">
              <AIResponse text={explanation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
