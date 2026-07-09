import { fisherInformation } from './irt';

export interface KC {
  id: string;
  pLearned: number;
}

export interface QuestionCandidate {
  id: string;
  kcId: string;
  a: number;
  b: number;
  c: number;
}

export interface SelectorParams {
  studentTheta: number;
  answeredQuestionIds: Set<string>;
  kcs: KC[];
  questions: QuestionCandidate[];
}

export function selectNextQuestion(params: SelectorParams): QuestionCandidate | null {
  const unanswered = params.questions.filter(q => !params.answeredQuestionIds.has(q.id));
  if (unanswered.length === 0) return null;

  const weakKCs = params.kcs
    .filter(kc => kc.pLearned < 0.95)
    .sort((a, b) => a.pLearned - b.pLearned)
    .slice(0, 3)
    .map(kc => kc.id);
  
  const weakKcSet = new Set(weakKCs);

  let candidates = unanswered.filter(q => weakKcSet.has(q.kcId));
  if (candidates.length === 0) {
    candidates = unanswered;
  }

  const scored = candidates.map(q => ({
    question: q,
    info: fisherInformation(params.studentTheta, q.a, q.b, q.c)
  }));

  scored.sort((a, b) => b.info - a.info);
  const top5 = scored.slice(0, 5);
  
  if (top5.length === 0) return null;

  const totalInfo = top5.reduce((sum, item) => sum + item.info, 0);
  
  if (totalInfo <= 0) {
    return top5[Math.floor(Math.random() * top5.length)]!.question;
  }

  let random = Math.random() * totalInfo;
  for (const item of top5) {
    random -= item.info;
    if (random <= 0) return item.question;
  }

  return top5[top5.length - 1]!.question;
}
