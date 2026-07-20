'use client';
import { useState, useCallback } from 'react';
import type { FSRSRating } from '@/types';

interface VocabCard {
  id: string;
  word_hebrew: string;
  word_arabic: string;
  definition_arabic: string;
  example_sentence: string | null;
  due_date: string;
  fsrs_state: string;
}

interface VocabReviewSession {
  cards: VocabCard[];
  currentIndex: number;
  isFlipped: boolean;
  completed: boolean;
  totalReviewed: number;
}

interface UseVocabReviewReturn {
  session: VocabReviewSession | null;
  currentCard: VocabCard | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  startReview: () => Promise<void>;
  flipCard: () => void;
  rateCard: (rating: FSRSRating) => Promise<void>;
}

/**
 * Orchestrates the FSRS vocabulary review flow:
 * load due cards → flip → rate → advance.
 */
export function useVocabReview(): UseVocabReviewReturn {
  const [session, setSession] = useState<VocabReviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startReview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vocab/review', { method: 'GET' });
      if (!res.ok) throw new Error(`فشل تحميل البطاقات: ${res.status}`);
      const data = await res.json();
      const cards = (data.cards ?? []) as VocabCard[];
      setSession({
        cards,
        currentIndex: 0,
        isFlipped: false,
        completed: cards.length === 0,
        totalReviewed: 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const flipCard = useCallback(() => {
    setSession(prev => prev ? { ...prev, isFlipped: !prev.isFlipped } : prev);
  }, []);

  const rateCard = useCallback(async (rating: FSRSRating) => {
    if (!session) return;
    const card = session.cards[session.currentIndex];
    if (!card) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/vocab/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, rating }),
      });
      if (!res.ok) throw new Error(`فشل حفظ التقييم: ${res.status}`);

      const nextIndex = session.currentIndex + 1;
      const completed = nextIndex >= session.cards.length;

      setSession(prev => prev ? {
        ...prev,
        currentIndex: nextIndex,
        isFlipped: false,
        completed,
        totalReviewed: prev.totalReviewed + 1,
      } : prev);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  }, [session]);

  const currentCard = session?.cards[session.currentIndex] ?? null;

  return { session, currentCard, isLoading, isSubmitting, error, startReview, flipCard, rateCard };
}
