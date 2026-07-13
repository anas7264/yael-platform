import { create } from 'zustand';

interface PracticeState {
  sessionId: string | null;
  sessionPlan: Record<string, unknown> | null;
  currentQuestion: Record<string, unknown> | null;
  questionsAnswered: number;
  isCorrect: boolean | null;
  correctOption: string | null;
  xpEarned: number;
  masteryUpdate: Record<string, unknown> | null;
  isSessionComplete: boolean;
  sessionSummary: Record<string, unknown> | null;
  hintsUsed: number;
  explanation: string | null;

  setSession: (sessionId: string, sessionPlan: Record<string, unknown>, firstQuestion: Record<string, unknown>) => void;
  submitAnswer: (isCorrect: boolean, correctOption: string, xpEarned: number, masteryUpdate: Record<string, unknown>) => void;
  nextQuestion: (question: Record<string, unknown> | null) => void;
  setSessionSummary: (summary: Record<string, unknown>) => void;
  addHint: () => void;
  setExplanation: (explanation: string) => void;
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  sessionId: null,
  sessionPlan: null,
  currentQuestion: null,
  questionsAnswered: 0,
  isCorrect: null,
  correctOption: null,
  xpEarned: 0,
  masteryUpdate: null,
  isSessionComplete: false,
  sessionSummary: null,
  hintsUsed: 0,
  explanation: null,

  setSession: (sessionId, sessionPlan, firstQuestion) => set({
    sessionId,
    sessionPlan,
    currentQuestion: firstQuestion,
    questionsAnswered: 0,
    isCorrect: null,
    correctOption: null,
    xpEarned: 0,
    masteryUpdate: null,
    isSessionComplete: false,
    sessionSummary: null,
    hintsUsed: 0,
    explanation: null,
  }),

  submitAnswer: (isCorrect, correctOption, xpEarned, masteryUpdate) => set((state) => ({
    isCorrect,
    correctOption,
    xpEarned: state.xpEarned + xpEarned,
    masteryUpdate,
    questionsAnswered: state.questionsAnswered + 1,
  })),

  nextQuestion: (question) => set({
    currentQuestion: question,
    isCorrect: null,
    correctOption: null,
    hintsUsed: 0,
    explanation: null,
    masteryUpdate: null,
    isSessionComplete: !question,
  }),

  setSessionSummary: (summary) => set({
    sessionSummary: summary,
    isSessionComplete: true,
  }),

  addHint: () => set((state) => ({ hintsUsed: state.hintsUsed + 1 })),
  setExplanation: (explanation) => set({ explanation }),

  reset: () => set({
    sessionId: null,
    sessionPlan: null,
    currentQuestion: null,
    questionsAnswered: 0,
    isCorrect: null,
    correctOption: null,
    xpEarned: 0,
    masteryUpdate: null,
    isSessionComplete: false,
    sessionSummary: null,
    hintsUsed: 0,
    explanation: null,
  }),
}));
