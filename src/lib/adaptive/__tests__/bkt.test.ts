import { updateBKT, BKT_DEFAULTS, applyDecay } from '../bkt';
import { describe, it, expect } from 'vitest';

describe('Bayesian Knowledge Tracing (BKT)', () => {
  it('correct answer increases P(L)', () => {
    const result = updateBKT(BKT_DEFAULTS, true);
    expect(result.pLearned_new).toBeGreaterThan(BKT_DEFAULTS.pLearned);
  });

  it('incorrect answer decreases P(L)', () => {
    const result = updateBKT(BKT_DEFAULTS, false);
    expect(result.pLearned_new).toBeLessThan(BKT_DEFAULTS.pLearned);
  });

  it('mastery at P(L) >= 0.95', () => {
    const result = updateBKT({ ...BKT_DEFAULTS, pLearned: 0.94 }, true);
    expect(result.mastered).toBe(true);
    expect(result.pLearned_new).toBeGreaterThanOrEqual(0.95);
  });

  it('decay reduces P(L) by 5% per day', () => {
    const pLearned = 0.8;
    const decayed1 = applyDecay(pLearned, 1);
    expect(decayed1).toBeCloseTo(pLearned * 0.95);

    const decayed3 = applyDecay(pLearned, 3);
    expect(decayed3).toBeCloseTo(pLearned * Math.pow(0.95, 3));
  });

  it('P(L) clamped to [0.0001, 0.9999]', () => {
    const resultHigh = updateBKT({ ...BKT_DEFAULTS, pLearned: 0.9999, pTransit: 1.0 }, true);
    expect(resultHigh.pLearned_new).toBeLessThanOrEqual(0.9999);

    const resultLow = updateBKT({ ...BKT_DEFAULTS, pLearned: 0.0001, pTransit: 0.0 }, false);
    expect(resultLow.pLearned_new).toBeGreaterThanOrEqual(0.0001);
  });
});
