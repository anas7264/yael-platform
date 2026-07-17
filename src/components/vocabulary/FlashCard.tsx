'use client';

import { HebrewIsland } from '@/components/ui/HebrewIsland';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashCardProps {
  card: {
    hebrew_word: string;
    arabic_meaning: string;
    nikud?: string;
    part_of_speech?: string;
    transliteration?: string;
    root?: string;
    example_hebrew?: string;
    example_arabic?: string;
  };
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  if (!card) return null;

  return (
    <div 
      className="relative w-full max-w-lg mx-auto aspect-[4/3] min-h-[300px] cursor-pointer"
      onClick={() => !isFlipped && onFlip()}
      style={{ perspective: '1000px' }}
    >
      <AnimatePresence initial={false} mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-bg-secondary rounded-2xl shadow-lg border border-border-subtle p-8 flex flex-col items-center justify-center text-center backface-hidden"
          >
            {card.part_of_speech && (
              <span className="absolute top-4 right-4 bg-primary-500/10 text-primary-600 px-3 py-1 rounded-full text-xs font-bold">
                {card.part_of_speech}
              </span>
            )}
            
            <div className="mb-4">
              <HebrewIsland className="text-4xl md:text-5xl font-black mb-2 inline-block">
                {card.hebrew_word}
              </HebrewIsland>
              {card.nikud && (
                <p className="text-lg text-text-secondary mt-2 font-hebrew">
                  {card.nikud}
                </p>
              )}
            </div>
            
            <p className="absolute bottom-6 text-sm text-text-tertiary animate-pulse">
              انقر لقلب البطاقة
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-bg-secondary rounded-2xl shadow-lg border border-border-subtle p-8 flex flex-col items-center justify-center text-center backface-hidden"
          >
            {card.root && (
              <span className="absolute top-4 right-4 bg-border-subtle text-text-secondary px-3 py-1 rounded-full text-xs font-bold" dir="ltr">
                {card.root}
              </span>
            )}

            <h2 className="text-3xl font-bold text-primary-500 mb-2">{card.arabic_meaning}</h2>
            
            {card.transliteration && (
              <p className="text-sm text-text-tertiary mb-6" dir="ltr">
                /{card.transliteration}/
              </p>
            )}

            {card.example_hebrew && card.example_arabic && (
              <div className="mt-4 w-full bg-bg-tertiary p-4 rounded-xl text-start">
                <HebrewIsland className="text-base font-bold block mb-2">
                  {card.example_hebrew}
                </HebrewIsland>
                <p className="text-sm text-text-secondary">{card.example_arabic}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
