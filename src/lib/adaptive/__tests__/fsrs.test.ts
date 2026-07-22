import { scheduleCard, FSRS_DEFAULT_WEIGHTS, computeRetrievability, FSRSCard } from '../fsrs';
import { describe, it, expect } from 'vitest';

describe('Free Spaced Repetition Scheduler (FSRS)', () => {
  const createNewCard = (): FSRSCard => ({
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 'New'
  });

  it('initial stability matches weight for each rating', () => {
    const card1 = scheduleCard(createNewCard(), 1, new Date());
    expect(card1.stability).toBe(FSRS_DEFAULT_WEIGHTS[0]); // 0.4072

    const card4 = scheduleCard(createNewCard(), 4, new Date());
    expect(card4.stability).toBe(FSRS_DEFAULT_WEIGHTS[3]); // 15.4722
  });

  it('retrievability = 1 at elapsed = 0', () => {
    const r = computeRetrievability(0, 1.0);
    expect(r).toBe(1.0);
  });

  it('retrievability decreases over time', () => {
    const r1 = computeRetrievability(1, 1.0);
    const r2 = computeRetrievability(2, 1.0);
    expect(r2).toBeLessThan(r1);
  });

  it('stability increases after successful recall', () => {
    const now = new Date();
    const card = scheduleCard(createNewCard(), 3, now); // State: Review
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextCard = scheduleCard(card, 3, nextDay);
    
    expect(nextCard.stability).toBeGreaterThan(card.stability);
  });

  it('state transitions: new->learning->review->relearning', () => {
    const now = new Date();
    // New -> Learning
    const card1 = scheduleCard(createNewCard(), 1, now);
    expect(card1.state).toBe('Learning');

    // New -> Review
    const card2 = scheduleCard(createNewCard(), 3, now);
    expect(card2.state).toBe('Review');

    // Review -> Relearning (when lapse)
    const card3 = scheduleCard(card2, 1, new Date(now.getTime() + 86400000));
    expect(card3.state).toBe('Relearning');
  });
});
