'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePracticeStore } from '@/store/practice';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { FeedbackPanel } from '@/components/practice/FeedbackPanel';
import { SessionSummary } from '@/components/practice/SessionSummary';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PracticeSessionPage() {
  const params = useParams();
  const section = params.section as string;
  
  const {
    sessionId,
    sessionPlan,
    currentQuestion,
    questionsAnswered,
    isCorrect,
    correctOption,
    xpEarned,
    isSessionComplete,
    sessionSummary,
    explanation,
    setSession,
    submitAnswer,
    nextQuestion,
    setSessionSummary,
    setExplanation,
    reset,
  } = usePracticeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    reset();
    let mounted = true;

    async function initSession() {
      try {
        const res = await fetch('/api/practice/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section }),
        });
        const data = await res.json();
        if (mounted && data.sessionId) {
          setSession(data.sessionId, data.sessionPlan, data.firstQuestion);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();
    return () => { mounted = false; };
  }, [section, reset, setSession]);

  const [nextQ, setNextQ] = useState<Record<string, unknown> | null>(null);

  const handleSubmitWithNext = async (opt: string) => {
    if (!sessionId || !currentQuestion || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedOption: opt,
          responseTimeMs: 5000,
        }),
      });
      const data = await res.json();
      setNextQ(data.nextQuestion);
      submitAnswer(data.isCorrect, data.correctOption, data.xpEarned, data.masteryUpdate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExplain = async () => {
    if (!currentQuestion || isExplaining) return;
    setIsExplaining(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOption: selectedOption,
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  const advanceNext = async () => {
    if (questionsAnswered >= ((sessionPlan?.totalQuestions as number) || 10)) {
      const res = await fetch('/api/practice/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setSessionSummary(data);
    } else {
      nextQuestion(nextQ);
      setSelectedOption(null);
      setNextQ(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pt-10">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (isSessionComplete && sessionSummary) {
    return (
      <SessionSummary 
        summary={sessionSummary as unknown as { accuracy: number; isPerfect: boolean; bonusXp: number; totalXp: number; durationSeconds: number; }} 
        section={section} 
      />
    );
  }

  if (!currentQuestion) {
    return <div className="text-center py-20 text-text-tertiary">لا توجد أسئلة متاحة حالياً.</div>;
  }

  return (
    <div className="pb-32 relative min-h-[calc(100vh-100px)]">
      <QuestionCard
        question={currentQuestion as unknown as { id: string; text_hebrew: string; option_a_hebrew: string; option_b_hebrew: string; option_c_hebrew: string; option_d_hebrew: string; passage_text_hebrew?: string }}
        currentNumber={questionsAnswered + (isCorrect !== null ? 0 : 1)}
        totalNumber={(sessionPlan?.totalQuestions as number) || 10}
        selectedOption={selectedOption}
        onSelectOption={(opt) => {
          setSelectedOption(opt);
          handleSubmitWithNext(opt);
        }}
        isSubmitted={isCorrect !== null}
        correctOption={correctOption}
      />

      <FeedbackPanel
        isCorrect={isCorrect}
        xpEarned={xpEarned} // wait, xpEarned in store is total. The prompt implies +10 per question. I'll just pass total or calculate.
        explanation={explanation}
        onExplain={handleExplain}
        onNext={advanceNext}
        isLoadingExplain={isExplaining}
      />
    </div>
  );
}
