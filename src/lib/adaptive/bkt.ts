export interface BKTParams {
  pLearned: number; // pL: probability the skill is already learned
  pTransit: number; // pT: probability of transitioning to learned state after practice
  pSlip: number;    // pS: probability of making a mistake despite knowing the skill
  pGuess: number;   // pG: probability of guessing correctly despite not knowing
}

export interface BKTResult {
  pLearned_new: number;
  pCorrect_next: number;
  mastered: boolean;
}

export const BKT_DEFAULTS: BKTParams = {
  pLearned: 0.3,
  pTransit: 0.09,
  pSlip: 0.1,
  pGuess: 0.25,
};

export type MasteryLevel = 'novice' | 'learning' | 'practiced' | 'mastered';

/**
 * Updates the BKT model parameters based on a learner's response using Bayesian inference.
 */
export function updateBKT(params: BKTParams, isCorrect: boolean): BKTResult {
  const pL = params.pLearned;
  const pT = params.pTransit;
  const pS = params.pSlip;
  const pG = params.pGuess;

  let pLearned_posterior: number;

  if (isCorrect) {
    pLearned_posterior = (pL * (1 - pS)) / (pL * (1 - pS) + (1 - pL) * pG);
  } else {
    pLearned_posterior = (pL * pS) / (pL * pS + (1 - pL) * (1 - pG));
  }

  if (isNaN(pLearned_posterior)) {
    pLearned_posterior = pL;
  }

  // Learning transition calculation
  let pLearned_new = pLearned_posterior + (1 - pLearned_posterior) * pT;

  // Clamp pLearned to [0.0001, 0.9999] to prevent certainty trap
  pLearned_new = Math.max(0.0001, Math.min(0.9999, pLearned_new));

  // Predict the probability of getting the NEXT question correct
  const pCorrect_next = pLearned_new * (1 - pS) + (1 - pLearned_new) * pG;

  const mastered = pLearned_new >= 0.95;

  return {
    pLearned_new,
    pCorrect_next,
    mastered,
  };
}

/**
 * Returns a discrete mastery string level based on continuous pLearned
 */
export function getMasteryLevel(pLearned: number): MasteryLevel {
  if (pLearned < 0.40) return 'novice';
  if (pLearned < 0.70) return 'learning';
  if (pLearned < 0.95) return 'practiced';
  return 'mastered';
}

/**
 * Applies knowledge memory decay based on inactive days (5% decay per day)
 */
export function applyDecay(pLearned: number, daysInactive: number): number {
  if (daysInactive <= 0) return pLearned;
  const decayed = pLearned * Math.pow(0.95, daysInactive);
  return Math.max(0.1, decayed);
}
