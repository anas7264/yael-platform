import { create } from 'zustand';

export interface ExamQuestion {
  id: string;
  section: 'reading' | 'vocabulary' | 'writing' | 'spelling';
  text_hebrew: string;
  passage_text_hebrew?: string;
  option_a_hebrew: string;
  option_b_hebrew: string;
  option_c_hebrew: string;
  option_d_hebrew: string;
}

interface ExamState {
  questions: ExamQuestion[];
  answers: Record<string, string>; // questionId -> option
  flagged: Record<string, boolean>; // questionId -> boolean
  currentIndex: number;
  timeRemaining: number; // in seconds
  isSubmitted: boolean;

  initExam: (questions: ExamQuestion[], durationSeconds: number) => void;
  setAnswer: (questionId: string, option: string) => void;
  toggleFlag: (questionId: string) => void;
  setCurrentIndex: (index: number) => void;
  tickTimer: () => void;
  submitExam: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  questions: [],
  answers: {},
  flagged: {},
  currentIndex: 0,
  timeRemaining: 90 * 60, // 90 min default
  isSubmitted: false,

  initExam: (questions, durationSeconds) => set({
    questions,
    answers: {},
    flagged: {},
    currentIndex: 0,
    timeRemaining: durationSeconds,
    isSubmitted: false,
  }),

  setAnswer: (questionId, option) => set((state) => ({
    answers: { ...state.answers, [questionId]: option }
  })),

  toggleFlag: (questionId) => set((state) => ({
    flagged: { ...state.flagged, [questionId]: !state.flagged[questionId] }
  })),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  tickTimer: () => set((state) => ({
    timeRemaining: Math.max(0, state.timeRemaining - 1)
  })),

  submitExam: () => set({ isSubmitted: true }),

  reset: () => set({
    questions: [],
    answers: {},
    flagged: {},
    currentIndex: 0,
    timeRemaining: 90 * 60,
    isSubmitted: false,
  }),
}));
