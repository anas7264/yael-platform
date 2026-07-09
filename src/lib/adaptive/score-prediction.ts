export interface ScoreParams {
  studentTheta: number;
  mastery: {
    reading: number;
    vocabulary: number;
    writing: number;
    spelling: number;
  };
}

export function predictYAELScore(params: ScoreParams): number {
  const weights = {
    reading: 0.30,
    vocabulary: 0.30,
    writing: 0.20,
    spelling: 0.20,
  };

  const bktScore = 
    params.mastery.reading * weights.reading * 150 +
    params.mastery.vocabulary * weights.vocabulary * 150 +
    params.mastery.writing * weights.writing * 150 +
    params.mastery.spelling * weights.spelling * 150;

  const irtBonus = (params.studentTheta / 3) * 15;
  
  let finalScore = bktScore + irtBonus;
  return Math.max(50, Math.min(150, Math.round(finalScore)));
}
