export interface IRTResponse {
  isCorrect: boolean;
  a: number; // Discrimination
  b: number; // Difficulty
  c: number; // Guessing
}

export interface IRTAbilityEstimate {
  theta: number; // Estimated ability (θ)
  se: number;    // Standard Error of Measurement (SEM)
}

/**
 * Calculates the probability of a correct response using the IRT 3-Parameter Logistic (3PL) model.
 */
export function irt3PL(theta: number, a: number, b: number, c: number): number {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

/**
 * Calculates the Fisher Information for a single item at a specific ability level.
 * Used for adaptive item selection (choosing the question with the most information).
 */
export function fisherInformation(theta: number, a: number, b: number, c: number): number {
  const pStar = 1 / (1 + Math.exp(-a * (theta - b)));
  const p = c + (1 - c) * pStar;
  const q = 1 - p;

  if (p * q < 0.0001) {
    return 0;
  }

  // The standard 3PL Fisher Information formula uses (p - c)^2, which matches standard psychometric literature.
  const I = (a * a * Math.pow(p - c, 2)) / (Math.pow(1 - c, 2) * p * q);
  return I;
}

/**
 * Estimates the student's ability (θ) using Expected a Posteriori (EAP) Bayesian estimation
 * with numerical quadrature across a normal prior distribution.
 */
export function estimateAbilityEAP(
  responses: IRTResponse[],
  priorMean: number = 0,
  priorSD: number = 1,
  points: number = 40
): IRTAbilityEstimate {
  // Edge case: Not enough responses to confidently estimate, return prior.
  if (responses.length < 5) {
    return { theta: priorMean, se: 1.0 };
  }

  const minTheta = -4;
  const maxTheta = 4;
  const step = (maxTheta - minTheta) / (points - 1);
  
  let sumThetaPosterior = 0;
  let sumPosterior = 0;

  for (let i = 0; i < points; i++) {
    const theta = minTheta + i * step;
    
    // Normal prior probability density function (PDF)
    const prior = (1 / (Math.sqrt(2 * Math.PI) * priorSD)) * Math.exp(-0.5 * Math.pow((theta - priorMean) / priorSD, 2));
    
    // Calculate the likelihood of the response pattern given this specific theta
    let likelihood = 1;
    for (const r of responses) {
      const p = irt3PL(theta, r.a, r.b, r.c);
      likelihood *= r.isCorrect ? p : (1 - p);
    }
    
    // Unnormalized posterior probability
    const posterior = likelihood * prior;
    
    sumThetaPosterior += theta * posterior;
    sumPosterior += posterior;
  }

  // Calculate Expected Value (EAP)
  let thetaEAP = priorMean;
  if (sumPosterior > 0) {
    thetaEAP = sumThetaPosterior / sumPosterior;
  }

  // Clamp the estimated ability strictly to [-3, 3] standard deviations
  thetaEAP = Math.max(-3, Math.min(3, thetaEAP));

  // Calculate Standard Error of Measurement (SEM) at the EAP estimate
  let sumFisher = 0;
  for (const r of responses) {
    sumFisher += fisherInformation(thetaEAP, r.a, r.b, r.c);
  }

  const se = sumFisher > 0 ? 1 / Math.sqrt(sumFisher) : 1.0;

  return {
    theta: thetaEAP,
    se,
  };
}
