export interface SessionParams {
  dailyStudyMinutes: number;
  kcs: { id: string; pLearned: number }[];
}

export interface SessionPlan {
  totalQuestions: number;
  questionDistribution: {
    weak: number;
    learning: number;
    practiced: number;
  };
}

export function planSession(params: SessionParams): SessionPlan {
  const totalQuestions = Math.round(params.dailyStudyMinutes / 1.5);

  const w = Math.round(totalQuestions * 0.60);
  const l = Math.round(totalQuestions * 0.30);
  const p = totalQuestions - w - l;

  return {
    totalQuestions,
    questionDistribution: {
      weak: w,
      learning: l,
      practiced: p,
    },
  };
}
