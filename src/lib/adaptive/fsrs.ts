export type FSRSState = 'New' | 'Learning' | 'Review' | 'Relearning';
export type FSRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface FSRSCard {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: FSRSState;
  last_review?: Date;
}

export const FSRS_DEFAULT_WEIGHTS = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589, 1.5330, 0.1544,
  1.0100, 1.9279, 0.1443, 0.0325, 2.1214, 0.2927, 2.9898, 0.5960, 0.4477
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeRetrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

export function initDifficulty(rating: FSRSRating, w: number[]): number {
  return clamp(w[4]! - Math.exp(w[5]! * (rating - 1)) + 1, 1, 10);
}

export function initStability(rating: FSRSRating, w: number[]): number {
  return Math.max(0.1, w[rating - 1]!);
}

export function updateDifficulty(d: number, rating: FSRSRating, w: number[]): number {
  const initDiff3 = initDifficulty(3, w);
  return clamp(w[6]! * initDiff3 + (1 - w[6]!) * (d - w[7]! * (rating - 3)), 1, 10);
}

export function stabilityAfterRecall(d: number, s: number, r: number, rating: FSRSRating, w: number[]): number {
  const hardPenalty = rating === 2 ? w[15]! : 1;
  const easyBonus = rating === 4 ? w[16]! : 1;
  
  const sPrime = s * (1 + Math.exp(w[8]!) * (11 - d) * Math.pow(s, -w[9]!) * (Math.exp(w[10]! * (1 - r)) - 1) * hardPenalty * easyBonus);
  return sPrime;
}

export function stabilityAfterForget(d: number, s: number, r: number, w: number[]): number {
  return w[11]! * Math.pow(d, -w[12]!) * (Math.pow(s + 1, w[13]!) - 1) * Math.exp(w[14]! * (1 - r));
}

export function computeInterval(stability: number, requestRetention: number = 0.9): number {
  return Math.round(9 * stability * (1 / requestRetention - 1));
}

export function scheduleCard(
  card: FSRSCard,
  rating: FSRSRating,
  now: Date,
  weights: number[] = FSRS_DEFAULT_WEIGHTS,
  requestRetention: number = 0.9,
  maxInterval: number = 36500
): FSRSCard {
  const elapsedDays = card.last_review
    ? Math.max(0, (now.getTime() - card.last_review.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  let newStability = card.stability;
  let newDifficulty = card.difficulty;
  let nextState = card.state;
  let lapses = card.lapses;

  if (card.state === 'New') {
    newDifficulty = initDifficulty(rating, weights);
    newStability = initStability(rating, weights);
    nextState = rating === 1 ? 'Learning' : 'Review';
  } else {
    const r = computeRetrievability(elapsedDays, card.stability);
    newDifficulty = updateDifficulty(card.difficulty, rating, weights);
    
    if (rating === 1) {
      newStability = stabilityAfterForget(newDifficulty, card.stability, r, weights);
      nextState = 'Relearning';
      lapses++;
    } else {
      newStability = stabilityAfterRecall(newDifficulty, card.stability, r, rating, weights);
      nextState = 'Review';
    }
  }

  let scheduledDays = computeInterval(newStability, requestRetention);
  
  if (rating === 1) {
    scheduledDays = 0; // Immediate review on lapse
  }
  
  scheduledDays = Math.min(scheduledDays, maxInterval);

  const due = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

  return {
    ...card,
    due,
    stability: newStability,
    difficulty: newDifficulty,
    elapsed_days: elapsedDays,
    scheduled_days: scheduledDays,
    reps: card.reps + 1,
    lapses,
    state: nextState,
    last_review: now,
  };
}
