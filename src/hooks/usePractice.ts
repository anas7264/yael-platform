'use client';
import { useState, useCallback } from 'react';
import type { YAELSection } from '@/types';

interface PracticeSession {
  sessionId: string;
  section: YAELSection;
  questionIds: string[];
}

interface SubmitResult {
  correct: boolean;
  explanation: string;
  xpEarned: number;
}

interface UsePracticeReturn {
  session: PracticeSession | null;
  isStarting: boolean;
  isSubmitting: boolean;
  error: string | null;
  startSession: (section: YAELSection) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<SubmitResult | null>;
  completeSession: () => Promise<void>;
}

/**
 * Orchestrates practice session lifecycle:
 * create session → submit answers → complete session.
 */
export function usePractice(): UsePracticeReturn {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async (section: YAELSection) => {
    setIsStarting(true);
    setError(null);
    try {
      const res = await fetch('/api/practice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
      if (!res.ok) throw new Error(`فشل بدء الجلسة: ${res.status}`);
      const data = await res.json();
      setSession(data as PracticeSession);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsStarting(false);
    }
  }, []);

  const submitAnswer = useCallback(async (questionId: string, answer: string): Promise<SubmitResult | null> => {
    if (!session) return null;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, questionId, answer }),
      });
      if (!res.ok) throw new Error(`فشل إرسال الإجابة: ${res.status}`);
      return (await res.json()) as SubmitResult;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [session]);

  const completeSession = useCallback(async () => {
    if (!session) return;
    try {
      await fetch('/api/practice/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
      setSession(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    }
  }, [session]);

  return { session, isStarting, isSubmitting, error, startSession, submitAnswer, completeSession };
}
