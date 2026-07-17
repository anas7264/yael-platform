import { create } from 'zustand';

interface VocabCard {
  id: string;
  hebrew_word: string;
  arabic_meaning: string;
  nikud?: string;
  part_of_speech?: string;
  transliteration?: string;
  root?: string;
  example_hebrew?: string;
  example_arabic?: string;
  difficulty_level?: number;
  fsrs_state?: number;
}

interface VocabState {
  dueCards: VocabCard[];
  currentIndex: number;
  isFlipped: boolean;
  cardsRemaining: number;
  sessionCorrect: number;
  sessionTotal: number;

  setDueCards: (cards: VocabCard[]) => void;
  flipCard: () => void;
  nextCard: (rating: number) => void;
  resetSession: () => void;
}

export const useVocabStore = create<VocabState>((set) => ({
  dueCards: [],
  currentIndex: 0,
  isFlipped: false,
  cardsRemaining: 0,
  sessionCorrect: 0,
  sessionTotal: 0,

  setDueCards: (cards) => set({
    dueCards: cards,
    currentIndex: 0,
    isFlipped: false,
    cardsRemaining: cards.length,
    sessionCorrect: 0,
    sessionTotal: 0,
  }),

  flipCard: () => set({ isFlipped: true }),

  nextCard: (rating) => set((state) => {
    const isGood = rating > 1; // 2=Hard, 3=Good, 4=Easy
    const newCardsRemaining = Math.max(0, state.cardsRemaining - 1);
    const newIndex = state.currentIndex + 1;
    
    return {
      isFlipped: false,
      currentIndex: newIndex,
      cardsRemaining: newCardsRemaining,
      sessionCorrect: state.sessionCorrect + (isGood ? 1 : 0),
      sessionTotal: state.sessionTotal + 1,
    };
  }),

  resetSession: () => set({
    dueCards: [],
    currentIndex: 0,
    isFlipped: false,
    cardsRemaining: 0,
    sessionCorrect: 0,
    sessionTotal: 0,
  })
}));
