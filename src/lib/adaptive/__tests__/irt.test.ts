import { irt3PL, fisherInformation, estimateAbilityEAP } from '../irt';
import { describe, it, expect } from 'vitest';

describe('Item Response Theory (IRT)', () => {
  it('irt3PL(0, 1, 0, 0) ≈ 0.5', () => {
    const prob = irt3PL(0, 1, 0, 0);
    expect(prob).toBeCloseTo(0.5);
  });

  it('irt3PL(0, 1, 0, 0.2) ≈ 0.6', () => {
    const prob = irt3PL(0, 1, 0, 0.2);
    expect(prob).toBeCloseTo(0.6); // 0.2 + 0.8 * 0.5 = 0.6
  });

  it('higher ability -> higher probability', () => {
    const prob1 = irt3PL(0, 1, 1, 0.2); // theta=0
    const prob2 = irt3PL(1, 1, 1, 0.2); // theta=1
    expect(prob2).toBeGreaterThan(prob1);
  });

  it('Fisher Information peaks near difficulty', () => {
    const infoAtDiff = fisherInformation(1, 1, 1, 0);
    const infoAway = fisherInformation(0, 1, 1, 0);
    expect(infoAtDiff).toBeGreaterThan(infoAway);
  });

  it('EAP with empty responses returns prior', () => {
    const est = estimateAbilityEAP([]);
    expect(est.theta).toBe(0);
    expect(est.se).toBe(1);
  });
});
