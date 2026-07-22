import { predictYAELScore } from '../score-prediction';
import { describe, it, expect } from 'vitest';

describe('Score Prediction', () => {
  it('score clamped between 50 and 150', () => {
    // Should clamp to 150
    const high = predictYAELScore({
      studentTheta: 4, 
      mastery: { reading: 1, vocabulary: 1, writing: 1, spelling: 1 }
    });
    expect(high).toBe(150);

    // Should clamp to 50
    const low = predictYAELScore({
      studentTheta: -4, 
      mastery: { reading: 0, vocabulary: 0, writing: 0, spelling: 0 }
    });
    expect(low).toBe(50);
  });

  it('all mastery = 1.0 -> score near 150', () => {
    const score = predictYAELScore({
      studentTheta: 0,
      mastery: { reading: 1, vocabulary: 1, writing: 1, spelling: 1 }
    });
    expect(score).toBe(150); // Since theta=0 -> no bonus, bktScore=150
  });

  it('all mastery = 0.0 -> score near 50', () => {
    const score = predictYAELScore({
      studentTheta: 0,
      mastery: { reading: 0, vocabulary: 0, writing: 0, spelling: 0 }
    });
    expect(score).toBe(50);
  });
});
