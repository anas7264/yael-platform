'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVocabStore } from '@/store/vocab';
import { FlashCard } from '@/components/vocabulary/FlashCard';
import { RatingButtons } from '@/components/vocabulary/RatingButtons';
import { VocabProgress } from '@/components/vocabulary/VocabProgress';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PartyPopper, ArrowRight } from 'lucide-react';
import type { Route } from 'next';

export default function VocabularyReviewPage() {
  const router = useRouter();
  const {
    dueCards,
    currentIndex,
    isFlipped,
    cardsRemaining,
    sessionCorrect,
    sessionTotal,
    setDueCards,
    flipCard,
    nextCard,
    resetSession,
  } = useVocabStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock stats for demo purposes
  const mockStats = {
    new: dueCards.filter(c => c.fsrs_state === 0).length,
    learning: dueCards.filter(c => c.fsrs_state === 1).length,
    review: dueCards.filter(c => c.fsrs_state === 2).length,
    relearning: dueCards.filter(c => c.fsrs_state === 3).length,
  };

  useEffect(() => {
    let mounted = true;
    async function fetchDueCards() {
      try {
        const res = await fetch('/api/vocab/review'); // GET due cards
        if (res.ok) {
          const data = await res.json();
          if (mounted) setDueCards(data.cards || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    resetSession();
    fetchDueCards();
    return () => { mounted = false; };
  }, [setDueCards, resetSession]);

  const handleRate = async (rating: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const currentCard = dueCards[currentIndex];
    if (!currentCard) return;

    try {
      // POST rating to backend FSRS logic
      await fetch('/api/vocab/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentCard.id,
          rating,
          reviewTimeMs: 3000,
        }),
      });
      // Move to next
      nextCard(rating);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pt-10 space-y-8">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (dueCards.length === 0 || currentIndex >= dueCards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">اكتملت المراجعة!</h1>
        <p className="text-text-secondary mb-8 max-w-md">
          لقد راجعت جميع الكلمات المستحقة لهذا اليوم. عد غداً لمواصلة تعزيز ذاكرتك.
        </p>
        <Button size="lg" onClick={() => router.push('/vocabulary' as Route)} leftIcon={<ArrowRight className="w-5 h-5 rtl-flip" />}>
          العودة للقاموس
        </Button>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  if (!currentCard) return null;

  return (
    <div className="pb-32">
      <VocabProgress 
        cardsRemaining={cardsRemaining}
        sessionCorrect={sessionCorrect}
        sessionTotal={sessionTotal}
        stats={mockStats}
      />

      <FlashCard 
        card={{
          hebrew_word: currentCard.hebrew_word,
          arabic_meaning: currentCard.arabic_meaning,
          nikud: currentCard.nikud,
          part_of_speech: currentCard.part_of_speech,
          transliteration: currentCard.transliteration,
          root: currentCard.root,
          example_hebrew: currentCard.example_hebrew,
          example_arabic: currentCard.example_arabic,
        }}
        isFlipped={isFlipped}
        onFlip={flipCard}
      />

      {isFlipped && (
        <RatingButtons onRate={handleRate} disabled={isSubmitting} />
      )}
    </div>
  );
}
