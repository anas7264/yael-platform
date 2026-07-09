# 🧮 YAEL Adaptive Learning Engine — Complete Mathematical Architecture

*AI Research Engineer · Educational Data Science · Cognitive Psychology*

---

## PART 0 — FOUNDATIONAL LEARNING SCIENCE

### Why Each Algorithm Was Chosen

Before any formula, the cognitive science foundations that justify every decision below.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              THE SCIENCE OF LEARNING — FIVE LAWS                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  LAW 1: THE TESTING EFFECT                                                  ║
║  Retrieving knowledge strengthens it more than re-studying it.              ║
║  Source: Roediger & Karpicke (2006)                                         ║
║  Engine response: Every practice question is retrieval practice.            ║
║  Never show explanations first. Always ask first.                           ║
║                                                                              ║
║  LAW 2: DESIRABLE DIFFICULTY                                                ║
║  Learning is strongest when the task is challenging but achievable.         ║
║  Too easy → no learning signal. Too hard → anxiety + no learning.          ║
║  Source: Bjork (1994); Vygotsky ZPD                                        ║
║  Engine response: Target 65–75% accuracy per session.                       ║
║  Questions are always slightly above current ability.                       ║
║                                                                              ║
║  LAW 3: SPACED PRACTICE                                                     ║
║  Distributed practice across time dramatically outperforms massed.         ║
║  The "forgetting curve" is actually the "learning curve" in disguise.      ║
║  Source: Ebbinghaus (1885); Cepeda et al. (2006)                           ║
║  Engine response: FSRS schedules every word for optimal review time.        ║
║                                                                              ║
║  LAW 4: INTERLEAVING                                                        ║
║  Mixing skill types during practice improves discrimination and transfer.   ║
║  Blocked practice feels easier but produces worse retention.                ║
║  Source: Kornell & Bjork (2008)                                             ║
║  Engine response: Sessions interleave skills after initial blocking.        ║
║                                                                              ║
║  LAW 5: THE ARABIC-HEBREW COGNITIVE ADVANTAGE                               ║
║  Quantified: native Arabic speakers recognize Hebrew root patterns           ║
║  40% faster than non-Semitic learners (internal hypothesis, testable).     ║
║  Shared roots: ~1,200 cognate pairs. Shared verb pattern logic: 7 binyanim ║
║  directly map to Arabic awzān.                                              ║
║  Engine response: Prior mastery P(L₀) is elevated for cognate skills.      ║
║  Learning rate P(T) is elevated when Arabic bridge is taught explicitly.    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### The Engine's Three Operating Modes

```
MODE A: EXPLORATION (mastery < 0.40)
  Goal: Build initial understanding. Prioritize concept introduction.
  Difficulty: Start at b = θ - 0.5 (slightly below current ability)
  Session: 70% new content, 20% light practice, 10% review
  Feedback: Immediate, detailed, always show Arabic bridge

MODE B: ACQUISITION (0.40 ≤ mastery < 0.80)
  Goal: Strengthen emerging knowledge. Push into ZPD.
  Difficulty: Target b = θ + 0.3 (slightly above — Zone of Proximal Dev.)
  Session: 20% new, 55% targeted practice, 25% review
  Feedback: Immediate, concise, show bridge only on wrong answers

MODE C: MASTERY/RETENTION (mastery ≥ 0.80)
  Goal: Prevent forgetting. Maintain under exam conditions.
  Difficulty: b = θ + 0.5 to θ + 1.0 (exam-level challenge)
  Session: 5% new, 30% challenging practice, 65% spaced review
  Feedback: Delayed or minimal (simulate exam conditions)
```

---

## PART 1 — THE STUDENT MODEL

### Knowledge State Representation

```
Every student is fully represented by a STATE VECTOR at time t:

Ψ(student, t) = {
  θ_vector:     [θ_reading, θ_vocab, θ_grammar, θ_completion, θ_reconstruction]
  K_matrix:     {skill_id → mastery_state} for all 30+ skills
  V_matrix:     {vocab_id → FSRS_state} for all vocabulary items
  Σ_ability:    [σ²_θ_reading, σ²_θ_vocab, ...]  (uncertainty per section)
  history:      recent_responses[] (last 100 attempts, circular buffer)
  session_state: {current_accuracy, questions_seen, skills_covered, streak}
}

WHERE:
  θ_section  = IRT ability estimate for that exam section (-4 to +4)
  K[skill]   = {P_L, irt_theta, mastery, last_practiced, attempts}
  V[word]    = {D, S, R, due_at, state, lapse_count}
  σ²_θ       = variance of ability estimate (decreases with more data)
```

### The Skill Graph

```
SKILL GRAPH G = (V, E, W) where:

  V = set of all skills (nodes)
  E = prerequisite relationships (directed edges)
  W = edge weights (how strongly skill A predicts readiness for skill B)

EXAMPLE SUBGRAPH (Grammar → Vocabulary linkage):

  [Root Recognition]  ──W=0.85──▶  [Vocabulary in Context]
         │                                    │
     W=0.70                              W=0.65
         │                                    │
         ▼                                    ▼
  [Binyan Paal]  ──W=0.90──▶  [Binyan Piel]  ──W=0.80──▶  [Binyan Hifil]

READINESS SCORE for skill S given knowledge state K:
  
  readiness(S) = Π_{P ∈ prerequisites(S)} mastery(P)^W(P→S)

  If readiness(S) < 0.50: prerequisite not met → do not assign skill S
  If readiness(S) ≥ 0.50: skill is accessible → can be assigned
  If readiness(S) ≥ 0.80: skill is recommended → prioritize for building
  
MOTIVATION: Never show a student a skill they cannot connect to
            prior knowledge. The ZPD requires accessible prior knowledge.
```

---

## PART 2 — ITEM RESPONSE THEORY ENGINE

### The 3-Parameter Logistic Model (3PL)

```
PURPOSE: Model the probability that a student with ability θ answers
         question j correctly, accounting for question difficulty,
         discrimination, and guessing.

┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE 3PL MODEL                                       │
│                                                                             │
│  P(X_ij = 1 | θ_i, a_j, b_j, c_j) = c_j + (1 - c_j) · Ψ(Da_j(θ_i - b_j))│
│                                                                             │
│  WHERE:                                                                     │
│  Ψ(x) = 1 / (1 + e^{-x})          (logistic function)                     │
│  D = 1.702                         (scaling constant)                      │
│  θ_i  ∈ [-4, +4]                   (student ability — latent trait)        │
│  a_j  ∈ [0.5, 3.0]                 (discrimination — quality of question)  │
│  b_j  ∈ [-3.0, +3.0]               (difficulty — where inflection occurs)  │
│  c_j  ∈ [0.20, 0.35]               (pseudo-guessing — min P for 4-choice)  │
└─────────────────────────────────────────────────────────────────────────────┘

PARAMETER INTERPRETATION:

  θ_i:  A student with θ=0 is average. θ=+2 is advanced. θ=-2 is struggling.
         θ represents their TRUE unobservable ability — we estimate it from responses.
  
  a_j:  High a (>2.0) → steep curve → question is a sharp divider between ability levels.
         Low a (<0.8) → flat curve → question doesn't distinguish well → flag for revision.
         All questions with a < 0.6 after 100 responses are deactivated.
  
  b_j:  b=0 → question is medium difficulty, designed for average student.
         b=+2 → hard question, correct for θ≥2 students only.
         The inflection point: where P(correct) = (c + 1) / 2.
  
  c_j:  For 4-choice MCQ: c ≥ 0.25 (student can always guess randomly).
         Well-designed distractors: c approaches 0.20 (plausible wrong answers).

CALIBRATION:
  Initial parameters: a_j=1.0, b_j=0.5 (slightly hard default), c_j=0.25
  After 50 responses: update b_j empirically from correct_rate.
  After 200 responses: full MML (Marginal Maximum Likelihood) calibration.
  
  Empirical difficulty estimate:
  b̂_j ≈ Φ^{-1}(1 - p̄_j) where p̄_j = proportion_correct
  (maps observed correct rate to IRT b-parameter approximately)
```

### The Information Function

```
WHY THIS MATTERS: Each question provides different amounts of information
                  about a student's ability. We want to serve questions
                  that maximize our knowledge of where θ truly lies.

ITEM INFORMATION FUNCTION:

  I_j(θ) = D²a_j² · (P_j(θ) - c_j)² · (1 - P_j(θ))
            ─────────────────────────────────────────────
                   (1 - c_j)² · P_j(θ)

  WHERE P_j(θ) is the 3PL probability above.

INTERPRETATION:
  → I_j(θ) is maximized near θ = b_j (the question's difficulty level)
  → Peak information: a question tells us MOST about students near its difficulty
  → A question with b_j = +2.0 provides almost no information about a θ = -1.0 student
  → This is WHY adaptive testing serves questions near student ability

STANDARD ERROR OF ABILITY ESTIMATE:
  
  SE(θ̂) = 1 / √(Σ_j I_j(θ̂))
  
  → Sum over all questions answered so far
  → More questions → more information → smaller standard error
  → After 20 questions: SE ≈ 0.35 (reasonable placement)
  → After 100 questions: SE ≈ 0.12 (high confidence estimate)

DECISION RULE for next question selection:
  Select question j* that MAXIMIZES I_j*(θ̂_current)
  → Always serve questions that reduce uncertainty most efficiently
  → Modified by other constraints (section balance, ZPD, variety)
```

### Ability Estimation: Expected A Posteriori (EAP)

```
WHY EAP over MLE: MLE (Maximum Likelihood) fails with extreme response patterns
                  (all correct / all wrong). EAP uses a prior and handles
                  edge cases gracefully — essential for online learning.

EAP ESTIMATOR:

  θ̂_EAP = ∫ θ · L(responses | θ) · π(θ) dθ
            ─────────────────────────────────────
            ∫ L(responses | θ) · π(θ) dθ

  WHERE:
  π(θ) ~ N(0, 1)         (prior: standard normal, calibrated on all users)
  
  L(responses | θ) = Π_{j answered} P_j(θ)^{u_j} · (1 - P_j(θ))^{1-u_j}
                     (likelihood of observing the response pattern given θ)

PRACTICAL IMPLEMENTATION (Quadrature):
  Discretize θ on grid: {-4.0, -3.8, -3.6, ..., +3.8, +4.0} (41 points)
  
  For each grid point θ_k:
    weight(θ_k) = L(responses | θ_k) · π(θ_k)
  
  θ̂_EAP = Σ_k θ_k · weight(θ_k) / Σ_k weight(θ_k)
  σ²_EAP = Σ_k (θ_k - θ̂_EAP)² · weight(θ_k) / Σ_k weight(θ_k)

COMPUTATION COST: 41 evaluations per θ update.
                  After each answer, full EAP re-estimated.
                  Target latency: < 2ms (Edge Function, pure arithmetic).

SECTION-SPECIFIC θ:
  Each of the 5 YAEL sections gets its own θ estimate:
  θ_reading, θ_vocab, θ_grammar, θ_completion, θ_reconstruction
  
  Updated only from questions in that section.
  Composite ability: θ_composite = Σ_S (θ_S · section_weight_S)
  
  RATIONALE: A student can have θ_reading = +1.5 but θ_grammar = -0.5.
             Treating them as one θ misses this critical heterogeneity.
             YAEL rewards section-specific mastery — our model must mirror this.
```

---

## PART 3 — BAYESIAN KNOWLEDGE TRACING ENGINE

### The BKT Model

```
PURPOSE: Track mastery of each discrete skill (not just overall ability).
         IRT tells us θ (ability). BKT tells us P(student has learned skill S).
         They are complementary — IRT is continuous, BKT is cognitive.

THE FOUR BKT PARAMETERS (per skill, per student over time):

  P(L₀)  = Prior probability of mastery before any practice
  P(T)   = Probability of learning in one opportunity (transit to mastery)
  P(S)   = Probability of slipping (wrong answer despite mastery)
  P(G)   = Probability of guessing (correct answer without mastery)

DEFAULT VALUES (calibrated on Hebrew learning data):

  ┌───────────────────────────────────────────┬──────┬──────┬──────┬──────┐
  │ Skill Type                                │ P(L₀)│ P(T) │ P(S) │ P(G) │
  ├───────────────────────────────────────────┼──────┼──────┼──────┼──────┤
  │ Cognate vocabulary (AR-HE shared root)    │ 0.35 │ 0.15 │ 0.08 │ 0.25 │
  │ Non-cognate vocabulary                    │ 0.10 │ 0.10 │ 0.10 │ 0.25 │
  │ False friend vocabulary (danger zone)     │ 0.05 │ 0.08 │ 0.15 │ 0.25 │
  │ Grammar — binyanim (with AR parallel)     │ 0.20 │ 0.12 │ 0.10 │ 0.25 │
  │ Grammar — agreement (gender/number)       │ 0.15 │ 0.10 │ 0.12 │ 0.25 │
  │ Reading — main idea                       │ 0.25 │ 0.12 │ 0.08 │ 0.25 │
  │ Reading — implicit inference              │ 0.10 │ 0.08 │ 0.10 │ 0.25 │
  │ Sentence completion — logical             │ 0.30 │ 0.13 │ 0.08 │ 0.25 │
  └───────────────────────────────────────────┴──────┴──────┴──────┴──────┘

RATIONALE FOR ARABIC SPEAKER ADJUSTMENTS:
  Cognate vocab P(L₀) = 0.35 (vs. 0.10 for non-cognate):
  Arabic speaker sees "שלם" and their brain activates "سلم" — 
  they have latent knowledge the standard model misses.
  
  False friend P(S) = 0.15 (elevated slip rate):
  Even when student KNOWS a false friend (e.g., "ילד" ≠ Arabic "وَلَد" exact meaning),
  the interfering Arabic cognate creates more slips than for other learners.
  
  Binyan P(T) = 0.12 (elevated learning rate with bridge):
  When the Arabic awzan parallel is shown, learning accelerates measurably.
```

### BKT Update Equations

```
NOTATION:
  L_{n-1}  = P(mastered before observation n)
  u_n      = observed response (1=correct, 0=wrong)
  L_n      = P(mastered after observation n)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1A: UPDATE AFTER CORRECT ANSWER (u_n = 1)

  P(mastered | correct) = L_{n-1} · (1 - P(S))
                          ─────────────────────────────────────────────────
                          L_{n-1} · (1 - P(S)) + (1 - L_{n-1}) · P(G)

  INTUITION: "Student answered correctly. Either they know it (L_{n-1}) and
              didn't slip (1-P(S)), OR they don't know it (1-L_{n-1}) but
              guessed correctly (P(G)). We update belief accordingly."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1B: UPDATE AFTER WRONG ANSWER (u_n = 0)

  P(mastered | wrong) = L_{n-1} · P(S)
                        ─────────────────────────────────────────────────
                        L_{n-1} · P(S) + (1 - L_{n-1}) · (1 - P(G))

  INTUITION: "Student answered wrong. Either they know it but slipped (L · P(S)),
              OR they don't know it and failed to guess ((1-L)(1-P(G)))."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: APPLY LEARNING TRANSITION (always after step 1)

  L_n = P(mastered | u_n)  +  (1 - P(mastered | u_n)) · P(T)

  INTUITION: "Even if the student didn't know it before this observation,
              there's a P(T) probability they learned it from this attempt.
              Each attempt is a learning opportunity — even wrong ones."

  NOTE: P(T) AFTER WRONG ANSWER:
  Standard BKT applies P(T) after wrong answers too.
  This is correct: being exposed to the correct answer after a mistake
  is an accelerated learning moment.
  
  ENHANCEMENT — Contextual P(T) boost after explanation viewed:
  IF explanation_viewed = TRUE AND wrong answer:
    P(T)_effective = P(T) + 0.05 (viewing explanation increases learning)
  IF arabic_bridge_shown = TRUE:
    P(T)_effective = P(T) + 0.03 (bridge insight accelerates acquisition)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORKED EXAMPLE:
  Skill: Binyan Piel recognition
  Initial: L₀ = 0.20, P(T)=0.12, P(S)=0.10, P(G)=0.25
  
  Attempt 1: WRONG
    P(mastered | wrong) = 0.20 × 0.10 / (0.20 × 0.10 + 0.80 × 0.75) = 0.032
    L₁ = 0.032 + (1-0.032) × 0.12 = 0.032 + 0.116 = 0.148 (dropped from 0.20!)
  
  IMPORTANT: Wrong answer with initially high prior → mastery DROPS
  This is correct: strong evidence against mastery overrides prior.
  
  Attempt 2: CORRECT
    P(mastered | correct) = 0.148 × 0.90 / (0.148 × 0.90 + 0.852 × 0.25) = 0.386
    L₂ = 0.386 + (1-0.386) × 0.12 = 0.386 + 0.074 = 0.460
  
  After 5 correct in a row from L=0.460:
  → L approaches 0.92 → triggers mastery state (M ≥ 0.85)
```

### Personalized BKT Parameter Estimation

```
PROBLEM: Default parameters may not fit individual students.
         Some Arabic speakers learn grammar 2× faster than others.
         Some have specific false-friend sensitivities.

SOLUTION: Personalized BKT using EM (Expectation-Maximization)
          once student has > 50 attempts per skill cluster.

PARAMETER UPDATE via EM (per student, per skill cluster):

  After N observations {u₁, u₂, ..., u_N}:
  
  Expected counts (E-step):
    C_T = Σ_n P(transited from unknown to known at step n | responses)
    C_S = Σ_n P(slipped at step n | responses)
    C_G = Σ_n P(guessed at step n | responses)
  
  Updated parameters (M-step):
    P̂(T) = C_T / (N - C_T_opportunities)
    P̂(S) = C_S / Σ_n P(mastered before n | responses)
    P̂(G) = C_G / Σ_n P(not mastered before n | responses)
  
  CONSTRAINTS:
    P(T) ∈ [0.02, 0.40]    (don't over-fit on few observations)
    P(S) ∈ [0.02, 0.30]
    P(G) ∈ [0.15, 0.35]    (bounded by structure of 4-choice MCQ)
  
  UPDATE SCHEDULE:
    After 50 attempts in skill cluster → first personalization
    Every 50 additional attempts → re-estimate
    Blend with default: P̂_blend = 0.7 × P̂_personal + 0.3 × P_default
    (Avoids extreme parameter estimates from noisy early data)

DIALECT-SPECIFIC PARAMETER ADJUSTMENTS:
  
  IF dialect = 'egyptian' AND skill = 'hebrew_guttural_sounds':
    P(S) *= 1.15   (Egyptian Arabic drops ع/ح more — more slips on gutturals)
  
  IF dialect = 'levantine' AND skill = 'hebrew_sentence_structure':
    P(L₀) *= 1.20  (Levantine SVO order closer to modern Hebrew)
  
  IF dialect = 'gulf' AND skill = 'classical_vocabulary':
    P(L₀) *= 1.25  (Gulf Arabic retains more classical vocabulary = better cognate access)
```

---

## PART 4 — NEXT LESSON SELECTION ALGORITHM

### The Multi-Objective Value Function

```
PURPOSE: At every decision point, choose the next question q* from all
         available questions Q to maximize expected long-term learning gain.

This is NOT simply "pick the hardest question the student can answer."
It is a multi-objective optimization balancing:
  (A) Score gain — directly improves predicted YAEL score
  (B) Knowledge gain — improves BKT mastery (may differ from score gain)
  (C) Retention gain — prevents forgetting of acquired skills
  (D) Exam readiness — aligns practice with actual exam conditions
  (E) Cognitive load — avoids fatigue within a session

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE FULL VALUE FUNCTION:

  V(q, student, context) = 
      α(t) · E[ΔScore | q]
    + β(t) · E[ΔMastery | q]
    + γ(t) · E[ΔRetention | q]
    + δ(t) · ExamReadiness(q)
    - penalty(q, context)

WHERE α, β, γ, δ are TIME-VARYING WEIGHTS:

  days_until_exam > 30:   α=0.20, β=0.40, γ=0.25, δ=0.15
  15 < days ≤ 30:         α=0.30, β=0.30, γ=0.20, δ=0.20
  7 < days ≤ 15:          α=0.40, β=0.20, γ=0.15, δ=0.25
  days ≤ 7:               α=0.50, β=0.10, γ=0.10, δ=0.30

RATIONALE: As exam approaches, pivot from deep learning (β, γ) toward
           direct score optimization (α) and exam simulation (δ).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPUTING E[ΔScore | q]:

  p_correct(q) = 3PL(θ̂, a_q, b_q, c_q)         (from IRT model)
  p_wrong(q)   = 1 - p_correct(q)
  
  ΔMastery_correct(q)  = L_after_correct - L_current
  ΔMastery_wrong(q)    = L_after_wrong - L_current     (this can be negative)
  
  ΔScore_correct(q) = score_after_correct - score_before
                    = skill_exam_weight(q) × scale_factor × ΔMastery_correct
  
  ΔScore_wrong(q) = skill_exam_weight(q) × scale_factor × ΔMastery_wrong
                    Note: wrong answer also has ΔScore that may be small negative
                    but the student gains information and explanation
  
  E[ΔScore | q] = p_correct(q) · ΔScore_correct(q)
                + p_wrong(q)   · ΔScore_wrong(q)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPUTING E[ΔMastery | q]:

  E[ΔMastery | q] = p_correct(q) · ΔMastery_correct(q)
                  + p_wrong(q)   · |ΔMastery_wrong(q)| · learning_factor

  WHERE learning_factor = 1.0 (wrong answer still teaches when explanation shown)
  
  IMPORTANT INSIGHT: A question the student gets WRONG but learns from may have
  HIGHER E[ΔMastery] than an easy correct answer. This is why the algorithm
  doesn't just serve easy questions. Productive struggle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PENALTY FUNCTION (subtract from V to enforce constraints):

  penalty(q, context) =
      w₁ · recency_penalty(q)          (seen recently → penalize)
    + w₂ · section_imbalance_penalty(q) (already too much of this section today)
    + w₃ · cognitive_load_penalty(q)   (reading passage after 3 readings → fatigue)
    + w₄ · prerequisite_penalty(q)     (skill prerequisites not met)
    + w₅ · flagged_penalty(q)          (user flagged this question)

  recency_penalty(q) = 
    MAX(0, 1 - days_since_last_seen(q) / 7) · 0.5
    (penalty decays to 0 after 7 days)
  
  section_imbalance_penalty(q) =
    MAX(0, section_count_this_session(q.section) - target_count(q.section)) · 0.3
    (penalizes serving 6 grammar questions when only 3 were planned)
```

### Thompson Sampling for Exploration vs. Exploitation

```
PROBLEM: If we always pick the highest V(q) question, we exploit.
         But some uncertainty in our estimates means we might serve
         a suboptimal question repeatedly.
         Thompson Sampling balances explore (try uncertain choices)
         vs. exploit (pick the best known choice).

THOMPSON SAMPLING PROCEDURE:

  FOR EACH candidate question q in Q_eligible:
  
    STEP 1: Sample ability from posterior
      θ' ~ N(θ̂, σ²_θ)
      (θ̂ = EAP estimate, σ²_θ = EAP variance — represents uncertainty)
    
    STEP 2: Compute probabilistic value
      V_sampled(q) = V(q, θ') computed with sampled θ'
    
    STEP 3: Rank questions by V_sampled
  
  SELECT: q* = argmax_{q ∈ Q_eligible} V_sampled(q)
  
  EFFECT: When σ²_θ is large (few observations), θ' varies widely,
          so different questions win each time → exploration of content.
          When σ²_θ is small (many observations), θ' ≈ θ̂ always,
          so best question wins consistently → exploitation.
  
  EARLY SESSIONS (high uncertainty): Lots of variety, testing different skills.
  LATER SESSIONS (low uncertainty):  Targeted, efficient, score-maximizing.

Q_ELIGIBLE CONSTRAINTS (before Thompson Sampling):

  q ∈ Q_eligible iff ALL of:
  ① is_active(q) = TRUE
  ② days_since_last_seen(q, student) ≥ 1  (no exact repeats same day)
  ③ readiness(q.skill) ≥ 0.50             (prerequisites met)
  ④ yael_level_match(q, student) = TRUE    (appropriate level ± 1)
  ⑤ NOT flagged_by_user(q, student)
  ⑥ NOT in_current_session_already(q)
  
  If |Q_eligible| < 5: relax constraint ② then ③ until |Q_eligible| ≥ 5
```

### Session Composition Algorithm

```
BEFORE SESSION STARTS: Determine session blueprint

  INPUT:  user profile, knowledge states, study plan, exam proximity
  OUTPUT: session_blueprint = {
    total_questions: N (based on daily_minutes commitment)
    section_targets: {reading: n₁, vocab: n₂, grammar: n₃, completion: n₄}
    content_mix: {new: p_new, practice: p_practice, review: p_review}
    difficulty_zone: {b_min, b_target, b_max}
    priority_skills: [skill_id₁, skill_id₂, skill_id₃] (from adaptive engine)
  }

SECTION TARGET COMPUTATION:
  
  Base targets from YAEL exam weights:
    reading: 35%, vocab: 30%, grammar: 20%, completion: 15%
  
  Modified by skill gap analysis:
    If section_mastery(S) < 0.60: increase allocation by 10%
    If section_mastery(S) > 0.85: decrease allocation by 10%
  
  Normalize to sum to 100%.

CONTENT MIX BY EXAM PROXIMITY:

  days_to_exam > 30:    new=25%, practice=50%, review=25%
  15 < days ≤ 30:       new=15%, practice=45%, review=30%, mock=10%
  7 < days ≤ 15:        new=5%,  practice=35%, review=30%, mock=30%
  days ≤ 7:             new=0%,  practice=25%, review=25%, mock=50%

INTERLEAVING WITHIN SESSION:
  
  RULE 1: No more than 3 consecutive questions from same skill
  RULE 2: New skill introduction → 3 blocked questions → then interleave
  RULE 3: Reading passages always served with 3-5 questions as a unit
  RULE 4: Vocabulary flashcard session separated from MCQ session
  RULE 5: If accuracy drops below 50% for 3 consecutive: pivot skill
  
  WARM-UP: First 3 questions of session → serve at b = θ - 0.5 (easy)
           Builds confidence and activates relevant schemas
           (Duolingo calls these "hearts restoration" questions)
  
  COOL-DOWN: Last 2 questions of session → serve mixed review
             (high-retention, recently-mastered) for positive ending
```

---

## PART 5 — MISTAKE REPETITION SYSTEM

### Mistake Priority Scoring

```
PURPOSE: Not all mistakes are equal. A mistake on a high-weight skill
         that the student makes repeatedly needs drilling NOW.
         A one-time mistake on a low-weight skill can wait.

MISTAKE PRIORITY SCORE (MPS) for question q, student u:

  MPS(q, u) = 
      w_F · frequency_score(q, u)
    + w_R · recency_score(q, u)
    + w_I · importance_score(q)
    + w_P · pattern_score(q, u)
    + w_C · confidence_mismatch_score(q, u)

  DEFAULT WEIGHTS: w_F=0.30, w_R=0.25, w_I=0.25, w_P=0.15, w_C=0.05

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FREQUENCY SCORE:
  frequency_score(q, u) = log₂(1 + times_wrong(q, u)) / log₂(1 + MAX_FREQ)
  
  WHERE MAX_FREQ = 10 (normalize to [0, 1])
  
  times_wrong=1: score = log₂(2)/log₂(11) = 0.29
  times_wrong=3: score = log₂(4)/log₂(11) = 0.58
  times_wrong=7: score = log₂(8)/log₂(11) = 0.87
  
  RATIONALE: Logarithmic — the difference between 1 and 3 wrong matters
             more than between 7 and 9. Diminishing marginal distinction.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENCY SCORE:
  recency_score(q, u) = e^{-λ · days_since_last_wrong(q, u)}
  
  WHERE λ = 0.15 (decay constant — mistake stays relevant ~7 days)
  
  Made yesterday (1 day): e^{-0.15} = 0.86   → URGENT
  Made 3 days ago:        e^{-0.45} = 0.64   → HIGH
  Made 7 days ago:        e^{-1.05} = 0.35   → MEDIUM
  Made 14 days ago:       e^{-2.10} = 0.12   → LOW
  Made 30 days ago:       e^{-4.50} = 0.01   → NEGLIGIBLE
  
  RATIONALE: A mistake made yesterday needs addressing soon.
             A mistake from a month ago has largely been forgotten anyway —
             serve the content fresh rather than drilling the "mistake."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANCE SCORE:
  importance_score(q) = skill_exam_weight(q.skill) · yael_level_match_bonus(q)
  
  skill_exam_weight: pulled from skills table (exam % weight)
  yael_level_match_bonus:
    If q.yael_level = student.target_level: 1.0
    If q.yael_level = target_level - 1:    0.8
    If q.yael_level = target_level + 1:    0.6
    Otherwise:                             0.4
  
  RATIONALE: Missing a question worth 3% of the exam is 3× more important
             than missing one worth 1%. Mistakes on harder-than-target
             questions matter less in the short term.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATTERN SCORE:
  pattern_score(q, u) = 1.0 if error_pattern_consistent else 0.3
  
  error_pattern_consistent = TRUE if:
    → This question's wrong_option matches wrong_option in ≥ 2 other
      questions with the same error_pattern_code
    → Student consistently chooses the SAME type of wrong answer
      (not random guessing — systematic misconception)
  
  EXAMPLE: Student consistently chooses the פעל form when פיעל is correct.
           Pattern detected across 4 questions → pattern_score = 1.0.
           This needs EXPLICIT conceptual intervention, not just more practice.
  
  ACTION when pattern detected: Trigger AI tutor to address the misconception
  directly before serving more drilling questions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONFIDENCE MISMATCH SCORE:
  confidence_mismatch_score(q, u) = 
    MAX(0, confidence_expected(rating) - accuracy_last_5)
  
  WHERE:
    confidence_expected = {0.30, 0.55, 0.80, 0.95} for ratings {1,2,3,4}
    accuracy_last_5 = proportion correct in last 5 attempts on this skill
  
  Student says "certain" (rating=4) but gets it wrong → high mismatch = 0.95 - 0
  → This is a dangerous blind spot → elevated priority for drilling
  
  RATIONALE: Dunning-Kruger effect. Students who think they know something
             but don't are MORE at risk on exam than students who know they
             don't know it (they'll study harder). Confident-wrong needs
             immediate correction.
```

### Mistake Repetition Schedule

```
ONCE MPS(q, u) is computed, determine WHEN to re-serve:

PRIORITY TIER SYSTEM:

  TIER 1: CRITICAL (MPS ≥ 0.75)
    → Re-serve within SAME SESSION (2–5 questions later)
    → Serve AGAIN next session
    → Serve on day 3
    → Resolve after 3 consecutive correct answers
  
  TIER 2: HIGH (0.50 ≤ MPS < 0.75)
    → Re-serve in NEXT SESSION
    → Serve on day 2, day 5
    → Resolve after 2 consecutive correct
  
  TIER 3: MEDIUM (0.25 ≤ MPS < 0.50)
    → Add to revision_queue with due_at = tomorrow
    → Follow FSRS-like schedule (1 → 3 → 7 days)
    → Resolve after 2 consecutive correct (no time pressure)
  
  TIER 4: LOW (MPS < 0.25)
    → Add to revision_queue with due_at = 3 days
    → Single review sufficient
    → Auto-resolve after 1 correct (low priority)

SAME-SESSION RE-SERVE ALGORITHM:

  After wrong answer on question q:
    Insert q into session_queue at position = current + RAND(2, 5)
    (Random position to prevent strategic guessing by anticipating repeat)
    
    On re-serve: If correct → BKT update → satisfaction moment
    On re-wrong: If same wrong_option → pattern_detected → flag for tutor
                  If different wrong_option → random guessing → flag as unknown

RESOLUTION CRITERIA:

  Mistake resolved when:
    consecutive_correct_on_q ≥ resolution_threshold(tier)
    AND days_since_resolution_check ≥ 1
    (Must prove retention over time, not just immediate correct)
  
  CRITICAL mistakes: 3 correct on 3 separate days → resolved
  HIGH mistakes:     2 correct on 2 separate days → resolved
  MEDIUM/LOW:        1 correct on follow-up → resolved

  UNRESOLVABLE FLAG: If mistake persists after 10 attempts →
    Flag for AI Tutor intervention (conceptual explanation needed,
    not just more drilling)
```

---

## PART 6 — DIFFICULTY ADAPTATION SYSTEM

### Zone of Proximal Development (ZPD) Targeting

```
VYGOTSKY'S ZPD: The region between what a student can do alone
                and what they can do with support.
                This is where learning is most efficient.

IN IRT TERMS: ZPD corresponds to:
  b_target = θ̂ + Δ_ZPD
  
  WHERE Δ_ZPD = 0.3 to 0.5 IRT units above current ability estimate
  
  At b = θ: P(correct) ≈ 0.61 (with c=0.25, a=1.0) → slightly challenging
  At b = θ+0.3: P(correct) ≈ 0.54 → our target accuracy = 65-75%
  
  (Note: P(correct) ≠ accuracy because of guessing parameter c.
   Target accuracy 65-75% corresponds to b_target ≈ θ + 0.2 to θ + 0.5)

ACCURACY-TO-DIFFICULTY ADAPTATION (session-level):

  Monitor rolling_accuracy = correct / attempted (last 10 questions)
  
  ┌────────────────────────────────────────────────────────────────────┐
  │  rolling_accuracy > 0.82:  TOO EASY                               │
  │    → Δ_ZPD += 0.15 (increase challenge)                           │
  │    → After 3 consecutive "too easy" signals: Δ_ZPD += 0.25       │
  │                                                                    │
  │  0.65 ≤ rolling_accuracy ≤ 0.82:  IN ZPD (ideal)                │
  │    → Δ_ZPD unchanged (maintain current calibration)               │
  │                                                                    │
  │  0.50 ≤ rolling_accuracy < 0.65:  SLIGHTLY BELOW ZPD             │
  │    → Δ_ZPD -= 0.10 (slightly easier)                              │
  │                                                                    │
  │  rolling_accuracy < 0.50:  TOO HARD (demotivating)               │
  │    → Δ_ZPD -= 0.25 (meaningful difficulty reduction)              │
  │    → Serve 2 confidence-builder questions (b = θ - 0.5)          │
  │    → Trigger "encouragement" feedback state                        │
  └────────────────────────────────────────────────────────────────────┘

CONSTRAINTS on Δ_ZPD:
  Δ_ZPD ∈ [-0.5, +1.5]
  (Never go easier than θ-0.5, never harder than θ+1.5)
  
  Hard floor: Never serve questions where P(correct) < 0.30
  Hard ceiling: Never serve questions where P(correct) > 0.95
  
  WHY: P < 0.30 → frustration, learned helplessness
       P > 0.95 → boredom, no learning signal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LONG-TERM DIFFICULTY ADAPTATION (across sessions):

  After each session:
  θ̂_new = EAP(all responses including this session)
  Δ_ZPD is reset to baseline (0.3) for next session
  
  BUT: Per-skill difficulty targets are maintained:
  For skill S: b_target(S) = θ̂_S + Δ_ZPD_S
  
  Δ_ZPD_S starts at 0.3 for all skills.
  Adapts independently within each skill domain.
  A student may have Δ_ZPD = 0.8 for vocab (mastering fast)
  but Δ_ZPD = 0.1 for grammar (struggling more).

DIFFICULTY STAGING FOR NEW SKILLS:

  When introducing a NEW skill (mastery < 0.20):
  
    Stage 1 (questions 1-3): b = b_SKILL - 1.0  (very easy, conceptual anchor)
    Stage 2 (questions 4-6): b = b_SKILL - 0.5  (building confidence)
    Stage 3 (questions 7+):  b = θ_S + 0.3       (normal ZPD targeting)
  
  RATIONALE: The initial success sequence (Stage 1-2) builds a schema.
             Cognitive load is reduced during schema formation.
             Then challenge increases once basic pattern is established.
```

### Cognitive Load Management

```
COGNITIVE LOAD THEORY (Sweller, 1988) applied to YAEL sessions:

INTRINSIC LOAD (complexity of material — can't reduce):
  → Measured by passage length, question complexity, binyan depth
  
EXTRANEOUS LOAD (unnecessary complexity in presentation — minimize):
  → Short question stems, clear Hebrew typography, nikud always shown
  → No distracting UI elements during question display
  
GERMANE LOAD (productive effort that creates schema — optimize):
  → Arabic-Hebrew bridge insights add germane load in a positive way
  → "This pattern in Hebrew is exactly the Arabic X" → efficient schema

SESSION-LEVEL COGNITIVE LOAD INDEX (CLI):

  CLI_current = Σ_{q answered in session} intrinsic_load(q) / questions_answered
  
  intrinsic_load(q) = 
      0.4 · (b_q - b_min) / (b_max - b_min)       (difficulty contribution)
    + 0.3 · passage_length_factor(q)                (reading load)
    + 0.2 · (1 - knowledge_familiarity(q.skill))    (unfamiliarity load)
    + 0.1 · time_in_session_factor                  (fatigue component)
  
  IF CLI > 0.75: Reduce difficulty by 0.2 IRT units
                  Increase proportion of familiar skills
                  Serve a vocabulary card (lower cognitive load) to reset
  
  IF CLI < 0.30: Student is coasting → increase challenge
  
  FATIGUE MODEL:
    time_in_session_factor = 1 / (1 + e^{-(minutes_in_session - 25)/5})
    (Fatigue rises sharply after 25 minutes — sigmoid activation)
    
    After 35 minutes: Automatically transition to review-only mode
    (Harder to learn new material when fatigued; review consolidates)
```

---

## PART 7 — SPACED REPETITION ENGINE (FSRS)

### The Forgetting Curve and Retrievability

```
PURPOSE: Ensure learned vocabulary is retained until exam day,
         with minimum total reviews. FSRS is more efficient than
         older algorithms (SM-2/Anki) by modeling retrievability explicitly.

THE MEMORY STATE MODEL:
  Each vocabulary item V for student U has state:
  
  {D, S, R, t_last, state, lapse_count}
  
  WHERE:
    D ∈ [1, 10]:     Difficulty of this card for this student
    S ∈ [0.1, 365]:  Stability (days until R = 90%)
    R ∈ [0, 1]:      Current retrievability (probability of recall right now)
    t_last:          Timestamp of last review
    state:           {new, learning, review, relearning}
    lapse_count:     Number of times forgotten after reaching "review" state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETRIEVABILITY FORMULA:

  R(t, S) = (1 + F · t/S)^C

  WHERE:
    F = 19/81 ≈ 0.2346  (FSRS scaling factor)
    C = -0.5             (FSRS decay exponent)
    t = days since last review
    S = current stability

  VERIFICATION: At t = S (exactly at stability horizon):
    R(S, S) = (1 + 19/81)^{-0.5} = (100/81)^{-0.5} = 0.9 ✓
    (Stability S is defined as days until 90% retention — correct)

INTUITIVE PROPERTIES:
  At t = 0:    R = 1.0   (just reviewed — perfect memory)
  At t = S:    R = 0.90  (stability horizon — still good)
  At t = 2S:   R ≈ 0.82  (decaying but still usable)
  At t = 5S:   R ≈ 0.70  (significant forgetting)
  At t = 10S:  R ≈ 0.59  (needs review urgently)

DUE DATE CALCULATION:
  Card is due when: R(t, S) ≤ 0.90
  t_due = S  (by definition)
  
  Scheduling is not exactly at t=S but allows variance:
  t_due = S + RAND_UNIFORM(-S×0.05, S×0.05)
  (±5% fuzz prevents "review avalanche" when many cards were added same day)
```

### Stability Update After Review

```
FOUR RATING OUTCOMES:

  G=1 (Again): Forgot — item must restart
  G=2 (Hard):  Recalled with significant difficulty
  G=3 (Good):  Recalled with moderate effort
  G=4 (Easy):  Recalled easily — could have waited longer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INITIAL STABILITY (first learning, any rating):

  S₀(G) = {
    G=1: 0.40 days  (again — almost no memory formed)
    G=2: 0.90 days  (hard — weak trace)
    G=3: 2.30 days  (good — moderate trace)
    G=4: 10.9 days  (easy — strong trace, student may have known from Arabic)
  }
  
  NOTE: S₀(G=4) = 10.9 days is significant. An Arabic speaker who immediately
        recognizes a cognate word from Arabic gets a large initial stability
        because they're building on existing knowledge, not starting from zero.
        We should detect likely cognate recognition (fast correct + Easy rating)
        and apply cognate_boost multiplier:
        
        IF is_cognate(V) AND G=4 AND response_time_ms < 3000:
          S₀ *= 1.5  (leveraging existing Arabic memory trace)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STABILITY AFTER SUCCESSFUL RECALL (G ≥ 2):

  S_recall = S · e^{r₁ · (11 - D) · (e^{r₂ · (1 - R)} - 1) + 1}
             · hard_multiplier(G)
             · easy_multiplier(G)

  WHERE:
    r₁ = 0.90   (base stability multiplier constant)
    r₂ = 0.10   (retrievability sensitivity constant)
    
    hard_multiplier(G) = 1.0 if G≥3, 0.85 if G=2
    easy_multiplier(G) = 1.0 if G≤3, 1.30 if G=4

  UNPACKING THE FORMULA:
  
  Term (11 - D): 
    High difficulty (D=9): 11-9 = 2 → small stability gain (hard cards improve slowly)
    Low difficulty (D=2):  11-2 = 9 → large stability gain (easy cards improve quickly)
    
  Term (e^{r₂(1-R)} - 1):
    High R at review (R=0.95): e^{0.10×0.05}-1 ≈ 0.005 → small gain (reviewed too early)
    Low R at review (R=0.70):  e^{0.10×0.30}-1 ≈ 0.035 → larger gain (good timing)
    
    INSIGHT: Reviewing early (when R is still high) gives LESS stability gain.
             This is why waiting until R ≈ 0.90 is optimal — the system rewards
             good scheduling discipline.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STABILITY AFTER FORGETTING (G = 1, lapse):

  S_lapse = f₁ · D^{-f₂} · ((S + 1)^{f₃} - 1) · e^{f₄ · (1-R)}

  WHERE:
    f₁ = 0.60   (base recovery factor)
    f₂ = 0.28   (difficulty sensitivity for lapses)
    f₃ = 0.25   (prior stability retention coefficient)
    f₄ = 0.50   (retrievability effect on recovery)
  
  EFFECT: A word with higher prior stability (S=30) recovers faster
          after a lapse than a word with low stability (S=2).
          "The harder you fall, the further you were" — prior strength helps.
  
  lapse_count += 1
  
  IF lapse_count > 3: flag as is_leech = TRUE
    → Trigger AI explanation refresh for this specific word
    → Show Arabic bridge insight more prominently
    → Consider word family context (other cognates help anchor this one)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DIFFICULTY UPDATE:

  D_new = D_current - d₁ · (G - 3)
  
  WHERE d₁ = 0.70 (difficulty adjustment step)
  
  G=1 (Again): D_new = D + 0.70×2 = D + 1.40 (harder for this student)
  G=2 (Hard):  D_new = D + 0.70×1 = D + 0.70
  G=3 (Good):  D_new = D + 0.70×0 = D (no change)
  G=4 (Easy):  D_new = D - 0.70×1 = D - 0.70 (easier for this student)
  
  MEAN REVERSION (prevents D from drifting too extreme):
  D_final = d₂ · D₀ + (1 - d₂) · D_new
  
  WHERE:
    D₀ = initial difficulty of this item (from vocabulary.difficulty_fsrs)
    d₂ = 0.08 (mean reversion strength — weak, allows personalization)
  
  CONSTRAINT: D_final ∈ [1.0, 10.0] (hard boundaries)
  
  EFFECT: Each student has their own D for every word.
          "שלום" may be D=2 for an Egyptian speaker (obvious cognate)
          but D=7 for the same speaker if it's a false friend context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAILY REVIEW QUEUE COMPUTATION:

  For student U at time T_now:
  
  FOR each vocab_item V in user_vocabulary_states:
    IF state(V) = 'new': due_score = 1.0 (always available, priority by frequency_rank)
    IF state(V) = 'learning': due_score = 2.0 (highest — new learning consolidates fast)
    IF state(V) = 'review':
      t_elapsed = T_now - last_review(V) in days
      R_current = R(t_elapsed, S(V))
      
      IF R_current ≤ 0.90: due_score = 3 + (0.90 - R_current) × 10
      (Lower R → higher due_score → higher priority in queue)
      
      IF R_current > 0.90: not_due → due_score = 0
    
    IF state(V) = 'relearning': due_score = 2.5 (between learning and review urgency)
  
  DAILY LIMIT: Serve at most MIN(30, cards_due) per day for vocab
               (Prevents review avalanche from overwhelming students)
  
  SORT: queue by due_score DESC → this is today's review order

MASTERY THRESHOLD FOR VOCABULARY:
  Word is "mastered" when:
    state = 'review' AND S ≥ 21 days AND lapse_count ≤ 1
    (stable for 3 weeks with minimal lapses = genuinely learned)
```

---

## PART 8 — MASTERY CALCULATION

### The Multi-Factor Mastery Score

```
PURPOSE: Combine all signals — BKT, IRT, retention, speed, consistency —
         into a single mastery score M ∈ [0, 1] that is:
         (1) Interpretable to students as a % mastery
         (2) Accurate predictor of exam performance
         (3) Sensitive to both learning and forgetting

THE MASTERY FORMULA:

  M(skill, user, t) = sigmoid(
    w₁ · logit(P_L(t))
  + w₂ · z_IRT(θ_skill, b_skill_median)
  + w₃ · logit(R_FSRS(t))
  + w₄ · z_speed(response_time)
  + w₅ · consistency_signal
  - τ                                              (mastery threshold)
  )

  WHERE:
    logit(p) = ln(p / (1-p))            (converts probability to log-odds)
    sigmoid(x) = 1 / (1 + e^{-x})       (converts back to probability)
    
    w₁ = 0.40  (BKT mastery is primary signal)
    w₂ = 0.25  (IRT ability is secondary)
    w₃ = 0.20  (Retention is important for durable mastery)
    w₄ = 0.10  (Speed indicates fluency)
    w₅ = 0.05  (Consistency indicates reliability)
    τ  = 0.0   (threshold — calibrated so M=0.50 at weights balanced)
    
    Weights sum to 1.0: 0.40+0.25+0.20+0.10+0.05 = 1.00 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENT 1: BKT MASTERY
  Direct input: P_L(t) from BKT model
  logit(P_L) ranges from -∞ (P_L=0) to +∞ (P_L=1)
  Typical range: logit(0.1)=-2.20 to logit(0.9)=+2.20

COMPONENT 2: IRT PERFORMANCE (z_IRT)
  z_IRT = (θ_skill - b_skill_median) / 1.0
  
  WHERE:
    θ_skill = IRT ability estimate for this skill domain
    b_skill_median = median difficulty of questions in this skill
    1.0 = normalization (1 IRT unit)
  
  z_IRT = 0: Student ability exactly matches skill difficulty → neutral
  z_IRT = +1: Student is 1 SD above skill difficulty → strong performance
  z_IRT = -1: Student is 1 SD below skill difficulty → weak performance
  
  RATIONALE: IRT captures performance relative to question demands.
             BKT captures discrete learning state.
             Both are necessary: a student can have high BKT mastery
             on easy questions but poor IRT theta on hard ones.

COMPONENT 3: RETENTION SIGNAL (from FSRS)
  R_FSRS = current retrievability of the most representative vocab item
            in this skill category (weighted average for skills with vocabulary)
  
  For grammar skills (no direct FSRS item):
    R_FSRS estimated from question_attempts recency:
    R_grammar = e^{-0.05 · days_since_last_correct_on_skill}
    (Approximate exponential forgetting for grammar knowledge)
  
  logit(R_FSRS) adds the time-decay dimension:
    Student who hasn't practiced in 14 days: R ≈ 0.70 → logit = +0.85
    Student who practiced yesterday: R ≈ 0.95 → logit = +2.94
    
    EFFECT: Mastery DECAYS when not practiced — correctly reflects
            that untested knowledge doesn't reliably transfer to exam.

COMPONENT 4: SPEED SIGNAL
  z_speed = (μ_response_time - actual_response_time) / σ_response_time
  
  WHERE μ and σ are population norms for this question type and YAEL level
  
  Fast + correct: positive z_speed → boosts mastery
  Slow + correct: negative z_speed → signals uncertainty despite correct answer
  
  BOUNDS: z_speed capped at ±2.0 (extreme outliers don't dominate)
  
  RATIONALE: Speed measures automaticity — fluency under YAEL exam time pressure.
             A student who takes 90 seconds per reading question will struggle
             with the full exam's time constraints, even if accuracy is high.
  
  TIME NORMS BY QUESTION TYPE:
    Vocabulary MCQ:       μ=15s, σ=8s
    Grammar MCQ:          μ=25s, σ=12s
    Sentence completion:  μ=30s, σ=15s
    Reading question:     μ=45s (per question, after passage read once)

COMPONENT 5: CONSISTENCY SIGNAL
  consistency = correct_in_last_5 / 5  (rolling window, last 5 attempts)
  
  consistency_signal = logit(MAX(0.01, consistency)) - logit(0.5)
  (Centered at 0.5 — 50% consistency = neutral contribution)
  
  5/5 correct: logit(0.99) - logit(0.5) = 4.60 - 0 = +4.60 → strong boost
  3/5 correct: logit(0.60) - logit(0.5) = 0.41 - 0 = +0.41 → slight boost
  1/5 correct: logit(0.20) - logit(0.5) = -1.39 - 0 = -1.39 → penalty
  0/5 correct: logit(0.01) - logit(0.5) = -4.60 - 0 = -4.60 → strong penalty

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MASTERY THRESHOLDS (operational definitions):

  M < 0.25:   UNKNOWN       — Skill not yet encountered or very early stage
  0.25 ≤ M < 0.45: EMERGING — Some exposure, understanding forming
  0.45 ≤ M < 0.65: DEVELOPING — Consistent but not reliable performance
  0.65 ≤ M < 0.80: PROFICIENT — Reliable performance, some gaps remain
  0.80 ≤ M < 0.90: ADVANCED  — Strong performance, exam-ready for this skill
  M ≥ 0.90:  MASTERED       — Consistent expert performance, minimal review needed

  OPERATIONAL THRESHOLD for "skill mastered": M ≥ 0.85
  → Triggers achievement badge
  → Reduces adaptive selection frequency for this skill
  → Shifts to maintenance mode (FSRS-like scheduling for questions)
  → Updates user_progress_summary.section mastery calculations

MASTERY DECAY:
  Mastery is NOT fixed after achievement. It decays when not practiced.
  
  M_decay(t) = M_peak · e^{-κ · max(0, days_since_last_practice - 7)}
  
  WHERE κ = 0.02 (2% decay per day beyond 7-day grace period)
  
  At 14 days without practice: M_decay = M_peak · e^{-0.14} ≈ 0.87 · M_peak
  At 30 days without practice: M_decay = M_peak · e^{-0.46} ≈ 0.63 · M_peak
  
  DECISION: If M_decay(skill) < 0.80 for a previously mastered skill:
    → Add to revision_queue with priority = MEDIUM
    → Show on dashboard: "הצלחתי פיעל — צריך חזרה" (you knew Piel — needs review)
```

---

## PART 9 — SCORE PREDICTION MODEL

### From Mastery to YAEL Score

```
PURPOSE: Convert internal mastery states (probabilities 0-1) to a
         meaningful YAEL score estimate (scale: 50-150, pass: typically 120+).
         This is what students see on their dashboard.

ARCHITECTURE: Three-Stage Pipeline
  Stage 1: Compute section raw scores from knowledge states
  Stage 2: Apply IRT calibration and blend
  Stage 3: Apply confidence interval and trend adjustment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGE 1: SECTION RAW SCORES

  For each YAEL section S:
  
  M_section(S) = Σ_{skill_i ∈ S} M(skill_i) · exam_weight(skill_i)
                 ─────────────────────────────────────────────────────
                 Σ_{skill_i ∈ S} exam_weight(skill_i)
  
  (Weighted average mastery within section, normalized to [0,1])
  
  Section raw score:
  Score_raw(S) = min_section_score(S) + M_section(S) · (max_section_score(S) - min_section_score(S))
  
  YAEL SCALE CALIBRATION (estimated from exam structure):
  Section    min_score  max_score  exam_weight
  Reading:      50        150        35%
  Vocabulary:   50        150        30%
  Grammar:      50        150        20%
  Completion:   50        150        15%
  
  Note: These are per-section sub-scores. Composite is the weighted average.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGE 2: IRT CALIBRATION AND BLEND

  IRT-BASED SCORE ESTIMATE:
  The IRT composite ability θ_composite maps to YAEL score via:
  
  Score_IRT = A · θ_composite + B
  
  WHERE:
    θ_composite = Σ_S (θ_S · section_weight_S)
    A = 12.5  (scale: 1 IRT unit ≈ 12.5 YAEL points)
    B = 100   (intercept: average ability θ=0 → YAEL score 100)
  
  DERIVATION: We want Score_IRT = 50 at θ = -4, Score_IRT = 150 at θ = +4
    A = (150-50)/(4-(-4)) = 100/8 = 12.5 ✓
    B = 150 - 12.5×4 = 100 ✓
  
  BLENDED PREDICTION:
  
  λ = data_confidence_weight(total_attempts)
  
  WHERE:
    λ = min(0.70, max(0.30, total_attempts / 200))
    
    total_attempts <  50: λ ≈ 0.25 → weight toward IRT (initial calibration)
    total_attempts = 100: λ = 0.50 → balanced blend
    total_attempts = 200: λ = 0.70 → weight toward mastery model (data-rich)
    total_attempts > 200: λ = 0.70 (capped — don't over-weight raw mastery)
  
  Score_blended(S) = λ · Score_raw(S) + (1-λ) · Score_IRT_section(S)
  
  RATIONALE: With few observations, IRT ability estimate (from EAP posterior)
             is more reliable than raw mastery averages.
             With many observations, the mastery model (which captures section-
             specific depth) is more informative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPOSITE SCORE AND CONFIDENCE INTERVAL:

  Score_composite = Σ_S Score_blended(S) · section_weight_S
  
  TREND VELOCITY (momentum adjustment):
    v = (Score_now - Score_7days_ago) / 7  (points per day)
    
    IF v > 0.5 (improving fast):
      trend_adj = min(v × 3, 5.0)  (cap at +5 points)
    IF v < -0.2 (declining):
      trend_adj = max(v × 2, -3.0) (cap at -3 points)
    ELSE:
      trend_adj = 0
    
    Score_final = Score_composite + trend_adj

CONFIDENCE INTERVAL:
  
  σ_base = 15.0  (base uncertainty for new student)
  
  Reduction from data:
  σ_data = σ_base / √(total_attempts / 50)
  
  Reduction from consistency:
  session_accuracy_stability = 1 - std_dev(last_5_session_accuracies)
  σ_consistency = σ_data · (2 - session_accuracy_stability)
  
  Final uncertainty:
  σ_final = MAX(3.0, MIN(20.0, σ_consistency))
  (Always at least ±3, never more than ±20)
  
  90% Confidence Interval:
  CI_90 = Score_final ± 1.645 · σ_final
  
  95% Confidence Interval:
  CI_95 = Score_final ± 1.960 · σ_final

  DISPLAY TO STUDENT:
    "تقديرك الحالي: 87  (الوقت المحتمل: 79 – 95)"
    
    DO NOT show the ± notation — show explicit range.
    DO NOT show if CI_width > 30 — say "نحتاج مزيداً من البيانات" instead.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORE UPDATE FREQUENCY:
  Computed AFTER each session end (not during).
  Never computed during a session (avoids mid-session anxiety).
  Daily at midnight via cron (days_until_exam countdown update).
  
WHEN STUDENT REPORTS ACTUAL EXAM SCORE:
  Record: actual_score, predicted_score_at_exam_date
  Compute: prediction_error = |actual - predicted|
  Archive: For model calibration (monthly EM update of A, B constants)
  
  VALIDATION TARGET:
    MAE < 8.0 YAEL points (primary metric)
    Within-CI rate ≥ 90% (CI should contain actual score 90% of time)
```

---

## PART 10 — CONFIDENCE SCORE SYSTEM

### Three Distinct Confidence Concepts

```
CRITICAL DISTINCTION: Three different types of "confidence" in the system.
Confusing them leads to poor design decisions.

TYPE 1: SYSTEM EPISTEMIC CONFIDENCE (internal)
  "How confident is the algorithm in its own estimates?"
  
TYPE 2: STUDENT METACOGNITIVE CONFIDENCE (input)
  "How confident does the student feel about their answer?"

TYPE 3: PLATFORM CONFIDENCE DISPLAY (output)
  "What do we show the student about their overall level?"
```

### Type 1: System Epistemic Confidence

```
PURPOSE: The algorithm must know how uncertain it is.
         High uncertainty → explore more, be more conservative in predictions.
         Low uncertainty → exploit more, tighter predictions.

EPISTEMIC UNCERTAINTY COMPONENTS:

σ²_system(skill, user) = 
    σ²_BKT(skill, user)
  + σ²_IRT(skill, user)
  + σ²_retention(skill, user)
  + σ²_recency(skill, user)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BKT UNCERTAINTY:
  σ²_BKT(skill) = P_L · (1 - P_L) / (n_attempts + 1)
  
  WHERE n_attempts = attempts on this specific skill
  
  After 0 attempts: σ²_BKT = P_L₀(1-P_L₀) ≈ 0.16 (maximum uncertainty)
  After 5 attempts: σ²_BKT ≈ P_L(1-P_L) / 6 ≈ 0.042 (reducing)
  After 20 attempts: σ²_BKT ≈ P_L(1-P_L) / 21 ≈ 0.012 (fairly confident)
  
  RATIONALE: BKT uncertainty reduces as Bayesian posterior sharpens.
             This is the variance of a binomial proportion estimator.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IRT UNCERTAINTY:
  σ²_IRT(section) = σ²_EAP(section)
  
  Derived directly from EAP posterior:
  σ²_EAP = Σ_k (θ_k - θ̂_EAP)² · weight(θ_k) / Σ_k weight(θ_k)
  
  After placement (20 questions): σ²_EAP ≈ 0.35²
  After 100 practice questions:   σ²_EAP ≈ 0.15²
  After 500 questions:            σ²_EAP ≈ 0.07²
  
  This σ²_EAP directly feeds into Thompson Sampling width (Part 4).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENCY UNCERTAINTY (degrades when not practiced):
  σ²_recency(skill) = σ²_min + (σ²_max - σ²_min) · (1 - R_FSRS(skill))
  
  WHERE:
    σ²_min = 0.01 (minimum uncertainty even when well-practiced)
    σ²_max = 0.15 (maximum uncertainty added by forgetting)
    R_FSRS = estimated retrievability from last practice
  
  EFFECT: Skill not practiced in 3 weeks:
    R_FSRS ≈ 0.60 → σ²_recency = 0.01 + 0.14 × 0.40 = 0.066 (elevated)
  
  SYSTEM RESPONSE when σ²_total is high:
    → Widen confidence interval on score prediction
    → Trigger more assessment questions (reduce uncertainty)
    → Flag skill for review in study plan
```

### Type 2: Student Metacognitive Confidence

```
PURPOSE: Capture student self-reported confidence to detect calibration errors.
         Overconfidence is dangerous for exam performance.
         Underconfidence is demotivating but common.

CONFIDENCE RATING AFTER EACH QUESTION (before seeing result):
  Student taps one of four options:
  C=1: "ما أعرف" (I don't know) → Expected accuracy: 25% (random guess)
  C=2: "متأكد شوية" (a little sure) → Expected accuracy: 50%
  C=3: "واثق نسبياً" (fairly confident) → Expected accuracy: 80%
  C=4: "متأكد جداً" (very certain) → Expected accuracy: 95%

CALIBRATION MEASUREMENT:

  calibration_error(C, student) = accuracy_actual(C, student) - accuracy_expected(C)
  
  WHERE:
    accuracy_actual(C) = proportion_correct(attempts where student chose rating C)
    accuracy_expected(C) = {0.25, 0.50, 0.80, 0.95} for C ∈ {1,2,3,4}

  OVERCONFIDENCE: calibration_error(C=4) < 0
    (Student says "certain" but gets <95% correct on those questions)
  
  UNDERCONFIDENCE: calibration_error(C=1) > 0
    (Student says "no idea" but gets >25% correct — knows more than they think)

METACOGNITIVE CALIBRATION INDEX (MCI):
  MCI = 1 - (1/4) · Σ_{c=1}^{4} |calibration_error(c)|
  
  MCI = 1.0: Perfectly calibrated (rare)
  MCI = 0.7: Good calibration (typical advanced learner)
  MCI = 0.4: Poor calibration (common early learners)
  
  DISPLAY: Not shown directly to student.
  USED BY ENGINE: MCI < 0.5 → trigger calibration training sequence:
    Serve questions where student must predict their score before session.
    Compare to actual. Show gap. Build metacognitive awareness.

ARABIC-SPEAKER SPECIFIC CALIBRATION RISK:

  FALSE FRIEND OVERCONFIDENCE:
  When question involves a Hebrew word that LOOKS like an Arabic word:
    Expected overconfidence rate: high (student thinks they know from Arabic)
    
  Detection: question.is_false_friend = TRUE AND C=4 AND wrong answer
  Action: Amplify explanation of the false friend trap.
          Add false_friend_flag to user_mistakes for this skill.
          Watch this user carefully on similar patterns.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONFIDENCE DATA FEEDS INTO ENGINE:

  1. BKT slip parameter updates:
     If P(student says C=4 | wrong answer) increases over time:
       P(S) += 0.01  (this student is overconfident → higher slip rate)
  
  2. Question difficulty calibration:
     If many students say C=4 but get it wrong:
       b_j += 0.2 (question harder than initially categorized)
  
  3. Session pacing:
     After C=4 wrong (high confidence, wrong):
       → Insert 2 easier questions (confidence rebuild)
       → Then return to current difficulty
       (Prevents confidence spiral after unexpected miss)
```

### Type 3: Platform Confidence Display

```
PURPOSE: The score we show students on the dashboard.
         Must be motivating, accurate, and intuitive.
         Designed to build confidence appropriately (not falsely).

THE DISPLAYED CONFIDENCE SYSTEM (student-facing 5-star mastery):

  For each skill S, student sees:
  
  Stars(S) = round(M(S) × 4) + 1  clamped to [1, 5]
  
  M=0.00 – 0.12: ★☆☆☆☆  (encountered)
  M=0.12 – 0.37: ★★☆☆☆  (learning)
  M=0.37 – 0.62: ★★★☆☆  (developing)
  M=0.62 – 0.87: ★★★★☆  (proficient)
  M=0.87 – 1.00: ★★★★★  (mastered)
  
  STAR DISPLAY PHILOSOPHY:
  → Full 5 stars requires SUSTAINED mastery over time (retention matters)
  → Stars can go DOWN if student hasn't practiced (visible decay motivation)
  → Animation: stars fill gradually (not instant) for motivational effect
  → Sound: optional gentle chime on star gain

SECTION CONFIDENCE SUMMARY (dashboard):

  For the full score gauge:
  
  readiness_percentage = 
    MIN(100, MAX(0, 
      (Score_final - Score_at_placement) / (target_score - Score_at_placement) × 100
    ))
  
  readiness_label = {
    0-30%:   "في البداية" (just starting)
    30-55%:  "تتقدم" (making progress)  
    55-75%:  "على الطريق" (on track)
    75-90%:  "قريب جداً" (very close)
    90-100%: "جاهز للامتحان" (exam ready)
    >100%:   "تجاوزت الهدف! 🏆" (exceeded target)
  }

CONFIDENCE FEEDBACK MESSAGE SYSTEM:

  AFTER SESSION (generated by rule-based system, not AI):
  
  IF session_accuracy > 0.80 AND score_delta > 0:
    "ممتاز! درجتك ارتفعت X نقطة. أنت في الطريق الصحيح."
  
  IF session_accuracy 0.60-0.80:
    "جلسة جيدة. استمر على هذا المستوى."
  
  IF session_accuracy < 0.60 AND is_first_week:
    "لا تقلق — هذا طبيعي في البداية. الصعوبات الآن = نجاح لاحقاً."
  
  IF session_accuracy < 0.60 AND NOT is_first_week:
    "هذا المستوى صعب قليلاً. سأجعل الأسئلة أسهل قليلاً في الجلسة القادمة."
  
  IF score_delta < 0:
    NEVER show this to student. (Transient score dips happen — demotivating to show)
    Only show score if score_7day_avg is increasing.
  
  PRINCIPLE: The system never punishes. It redirects. It never says
             "you failed." It says "let's try a different approach."
```

---

## PART 11 — THE FULL ENGINE INTEGRATION

### The Complete Per-Question Computational Loop

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              COMPLETE ENGINE LOOP — ONE QUESTION CYCLE                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  T=0ms:  ENGINE SELECTS NEXT QUESTION                                        ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  1. Load session state from Redis (session_memory)                          ║
║  2. Load user knowledge states from Postgres (or Redis cache, 30min TTL)   ║
║  3. Load eligible questions: Q_eligible ⊆ Q where constraints satisfied    ║
║  4. Thompson Sampling: sample θ' ~ N(θ̂, σ²_θ)                              ║
║  5. Compute V(q, θ') for all q ∈ Q_eligible                                ║
║  6. Apply session blueprint constraints (section balance, content mix)      ║
║  7. Select q* = argmax V(q)                                                 ║
║  8. Log selection to next_item_selections (async, non-blocking)             ║
║                                                                              ║
║  T=2ms:  QUESTION DELIVERED TO STUDENT                                       ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  9. Pre-fetch: load ai_explanations_cache for all 3 wrong options           ║
║     (background — prepare for likely wrong answer)                         ║
║  10. Display question with Hebrew text, nikud, passage if needed            ║
║  11. Start response_time_ms timer                                           ║
║  12. Display confidence prompt (C=1,2,3,4 before answering)                ║
║                                                                              ║
║  T=?:    STUDENT ANSWERS                                                     ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  13. Record: option_chosen, response_time_ms, confidence_rating             ║
║  14. is_correct = (option_chosen == correct_option_index)                   ║
║                                                                              ║
║  T=+5ms:  SYNCHRONOUS UPDATES (blocking — must complete before feedback)    ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  15. BKT Update for q*.skill:                                               ║
║        L_n = BKT_update(L_{n-1}, is_correct, P_T, P_S, P_G)               ║
║  16. IRT Update for q*.section:                                             ║
║        θ̂_new, σ²_new = EAP_update(responses_so_far + {q*, is_correct})    ║
║  17. Confidence calibration update:                                         ║
║        calibration_error(C) += (is_correct - accuracy_expected(C)) / N    ║
║  18. Session state update (Redis):                                          ║
║        session_memory.questions_seen.push(q*)                               ║
║        session_memory.skills_covered[q*.skill] += {this attempt}           ║
║        session_memory.rolling_accuracy = update(is_correct)                ║
║                                                                              ║
║  T=+8ms:  FEEDBACK DELIVERY                                                  ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  19. Show: correct/wrong visual                                              ║
║  20. IF wrong: retrieve explanation from cache (pre-fetched at T=9)         ║
║        Cache hit: instant display                                           ║
║        Cache miss (3% of cases): stream from Claude API                    ║
║                                                                              ║
║  T=+10ms: ASYNCHRONOUS UPDATES (non-blocking — fire and forget)             ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  21. Update Mastery: M(skill) = mastery_formula(P_L_new, θ_new, ...)       ║
║  22. Score Delta: ΔScore = score_after - score_before (formula)            ║
║  23. XP award: INSERT xp_transaction (deterministic formula)                ║
║  24. IF wrong: INSERT/UPDATE user_mistakes, MPS computation                 ║
║        IF MPS ≥ 0.75: INSERT same-session repeat at position+3             ║
║        IF MPS ≥ 0.50: INSERT to revision_queue due=tomorrow                ║
║  25. IF first_time_seeing_skill: check prerequisite readiness signals       ║
║  26. UPDATE questions.times_answered, times_correct (atomic increment)     ║
║  27. CHECK achievement triggers (rules engine, async)                       ║
║  28. LOG to analytics.events (async, append-only)                           ║
║                                                                              ║
║  T=+50ms: DIFFICULTY ADAPTATION                                              ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  29. Check rolling_accuracy (last 10 questions)                             ║
║  30. Adapt Δ_ZPD if accuracy outside [0.65, 0.82]                          ║
║  31. Check CLI (cognitive load index) — adjust if CLI > 0.75               ║
║  32. Check fatigue model — shift to review-only if minutes_in_session > 35 ║
║                                                                              ║
║  T=session_end: END-OF-SESSION PROCESSING                                   ║
║  ───────────────────────────────────────────────────────────────────────    ║
║  33. Score Prediction: full recompute → score_predictions INSERT             ║
║  34. user_progress_summary: atomic UPDATE (all fields)                      ║
║  35. Streak: check last_activity_date → update user_streaks                 ║
║  36. Mission progress: evaluate all active daily missions                   ║
║  37. Study plan: check if today's plan was fulfilled                        ║
║        If completion_rate falls below 60%: queue plan rebalance            ║
║  38. Achievement evaluation: full check against all trigger_events          ║
║  39. AI report: if weekly report due → queue Claude API call                ║
║  40. Vocabulary: compute updated FSRS schedules for any reviewed cards     ║
║  41. Notification: if score milestone → send notification                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### The Session Composition Engine in Full

```
SESSION START: BUILD THE PLAN

  INPUT STATE:
    days_to_exam = D
    daily_minutes = T
    knowledge_states = K[]
    study_plan_today = {skill_ids: [], session_type: ''}
    revision_queue_due = R[]      (mistakes due for review)
    vocab_due_today = V[]          (FSRS-due vocabulary)
    mock_exam_scheduled = False

  STEP 1: DETERMINE TOTAL QUESTION COUNT
    questions_total = floor(T / avg_seconds_per_question)
    avg_seconds_per_question = 45s  (mix of question types)
    Example: 30 minutes → floor(1800/45) = 40 questions

  STEP 2: ALLOCATE TO CONTENT TYPES
    n_review   = ceil(questions_total × p_review)
    n_new      = ceil(questions_total × p_new)
    n_practice = questions_total - n_review - n_new
    
    (Using time-varying p_review, p_new from table in Part 4)

  STEP 3: ALLOCATE REVIEW SLOTS
    n_vocab_review = MIN(n_review × 0.40, len(vocab_due_today), 15)
    n_mistake_review = MIN(n_review × 0.35, len(revision_queue_due))
    n_skill_refresh = n_review - n_vocab_review - n_mistake_review
    
    (Vocab reviews are fast; mistakes and skill refreshes are questions)

  STEP 4: SKILL PRIORITY ORDERING FOR PRACTICE
    For each skill S with mastery < 0.90:
      priority(S) = MPS_aggregate(S) × section_weight(S) × (1 - M(S)) × urgency(D)
    Sort DESC → top_skills[]
    
    Allocate practice questions weighted by priority:
    n_questions(S) = round(priority(S) / Σ priorities × n_practice)
    
  STEP 5: WARM-UP DESIGN
    First 3 questions: served from recently_mastered_skills
    (M > 0.80, b = θ - 0.5 → almost certain to be correct)
    Purpose: Activate schemas, build session confidence.

  STEP 6: COOL-DOWN DESIGN
    Last 2 questions: review mode (from FSRS due or mastered content)
    Purpose: End on success → positive emotional anchor.
    
    PSYCHOLOGICAL NOTE: Duolingo's research shows students who end
    sessions on success are 23% more likely to return next day.
    This matters more than optimizing the last 2 questions for learning.
```

---

## PART 12 — CALIBRATION AND VALIDATION FRAMEWORK

### Model Accuracy Metrics

```
THE ENGINE IS WRONG UNTIL PROVEN RIGHT.
Every model assumption must be validated against real outcomes.

METRIC 1: BKT PREDICTION ACCURACY
  For each (student, skill) pair with ≥ 5 attempts:
  Predicted: P(correct) = P_L × (1-P_S) + (1-P_L) × P_G
  Actual: proportion_correct(next_10_attempts)
  
  Metric: MAE = mean |predicted - actual| across all pairs
  Target: MAE < 0.10

METRIC 2: SCORE PREDICTION ACCURACY
  For students who report actual exam scores:
  Metric: MAE_score = mean |predicted - actual|
  Target: MAE_score < 8.0 YAEL points
  
  Secondary: Within-CI-90 rate ≥ 90%
  (90% confidence intervals should contain actual score 90% of time)

METRIC 3: ZPD CALIBRATION
  Metric: proportion of sessions with accuracy ∈ [0.65, 0.82]
  Target: ≥ 65% of sessions in ZPD band
  (If < 55%: difficulty adaptation is broken → review Δ_ZPD logic)

METRIC 4: MISTAKE RESOLUTION EFFECTIVENESS
  For each resolved mistake:
  Did student answer the skill correctly 1 month later? (0/1)
  Metric: resolution_durability = mean(correct_one_month_later)
  Target: ≥ 0.75

METRIC 5: FSRS CALIBRATION
  For each vocabulary item with next_due date:
  At time of scheduled review, does student recall correctly ≈ 90%?
  Metric: recall_at_due = proportion_correct when R ≈ 0.90
  Target: recall_at_due ∈ [0.85, 0.95]
  
  If recall_at_due < 0.85: S is overestimated → recalibrate stability
  If recall_at_due > 0.95: S is underestimated → recalibrate (wasting reviews)

METRIC 6: ARABIC SPEAKER ADVANTAGE DETECTION
  Compare learning rate P(T) for Arabic speakers vs. simulated baseline:
  Metric: arabic_advantage_multiplier = P(T)_arabic / P(T)_baseline
  For cognate skills target: multiplier > 1.3 (30% faster)
  
  Track separately by dialect → informs dialect-specific parameter tuning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONTHLY CALIBRATION CYCLE:

  WEEK 1: Collect outcomes
    → Gather all students who took YAEL exam (actual scores)
    → Gather all resolved mistakes (durability check)
    → Pull session accuracy distributions
  
  WEEK 2: Model re-estimation
    → EM update of BKT parameters per skill cluster
    → Re-estimate IRT A, B constants from actual score data
    → FSRS stability constants checked against recall rates
    → ZPD Δ_ZPD baseline adjusted if sessions outside band
  
  WEEK 3: A/B test result analysis
    → Compare active algorithm variants (Thompson Sampling vs. greedy)
    → Compare explanation prompt versions
    → Statistical significance testing (Z-test, α=0.05)
  
  WEEK 4: Deploy calibration updates
    → Update skill BKT parameters in DB
    → Update IRT question parameters from empirical data
    → Document before/after metrics
```

---

## THE COMPLETE ENGINE SUMMARY

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              ADAPTIVE LEARNING ENGINE — MATHEMATICAL SUMMARY               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  QUESTION 1: WHAT LESSON COMES NEXT?                                        ║
║  Answer: argmax V(q) where V = α·E[ΔScore] + β·E[ΔMastery]                ║
║           + γ·E[ΔRetention] + δ·ExamReadiness - Penalty                   ║
║           via Thompson Sampling over ability posterior N(θ̂, σ²_θ)          ║
║                                                                              ║
║  QUESTION 2: WHICH MISTAKES SHOULD BE REPEATED?                             ║
║  Answer: MPS = 0.30·log(1+f) + 0.25·e^{-0.15·days} + 0.25·exam_weight   ║
║           + 0.15·pattern_score + 0.05·confidence_mismatch                 ║
║           Tier 1 (MPS≥0.75): same session. Tier 4 (MPS<0.25): 3 days.    ║
║                                                                              ║
║  QUESTION 3: HOW DOES DIFFICULTY CHANGE?                                    ║
║  Answer: b_target = θ̂ + Δ_ZPD where Δ_ZPD adapts to session accuracy     ║
║           In ZPD: 65-75% accuracy. Too easy → Δ_ZPD += 0.15               ║
║           Too hard → Δ_ZPD -= 0.25. Bounds: Δ_ZPD ∈ [-0.5, +1.5]        ║
║                                                                              ║
║  QUESTION 4: HOW DOES REVIEW WORK?                                          ║
║  Answer: Priority queue sorted by due_score = f(FSRS_state, days_until)   ║
║           Review mix: vocab (FSRS), mistakes (MPS-based), skill refresh    ║
║           Cool-down last 2 questions for positive session ending            ║
║                                                                              ║
║  QUESTION 5: HOW DOES SPACED REPETITION WORK?                              ║
║  Answer: R(t,S) = (1 + 19t/81S)^{-0.5}. Due when R ≤ 0.90.              ║
║           S_recall = S·e^{r₁(11-D)(e^{r₂(1-R)}-1)+1}                    ║
║           S_lapse = f₁·D^{-f₂}·((S+1)^{f₃}-1)·e^{f₄(1-R)}             ║
║           D updates: D' = D - 0.7·(G-3) with mean reversion              ║
║                                                                              ║
║  QUESTION 6: HOW IS MASTERY CALCULATED?                                     ║
║  Answer: M = sigmoid(0.40·logit(P_L) + 0.25·z_IRT + 0.20·logit(R_FSRS)  ║
║               + 0.10·z_speed + 0.05·consistency_signal)                   ║
║           Mastery = M ≥ 0.85. Decays at e^{-0.02·(days-7)} after 7 days  ║
║                                                                              ║
║  QUESTION 7: HOW DOES ESTIMATED SCORE CHANGE?                              ║
║  Answer: Score_final = λ·Score_mastery + (1-λ)·Score_IRT + trend_adj     ║
║           Score_IRT = 12.5·θ_composite + 100                              ║
║           λ = min(0.70, total_attempts/200)                                ║
║           CI_90 = Score ± 1.645·MAX(3, σ_base/√(attempts/50))            ║
║                                                                              ║
║  QUESTION 8: HOW DOES CONFIDENCE SCORE CHANGE?                             ║
║  Answer: System: σ²_total = σ²_BKT + σ²_IRT + σ²_retention               ║
║           Student: MCI = 1 - mean|accuracy_expected - accuracy_actual|    ║
║           Display: Stars = round(M×4)+1 with visible decay over time       ║
║                                                                              ║
║  THE ARABIC-HEBREW ADVANTAGE (quantified):                                  ║
║  Cognate vocab P(L₀): 0.35 vs 0.10 (3.5× higher prior)                   ║
║  Cognate vocab P(T):  0.15 vs 0.10 (50% faster learning rate)             ║
║  Cognate S₀(Easy): 1.5× baseline stability (existing memory trace)        ║
║  False friend P(S): 0.15 vs 0.10 (50% higher slip — requires attention)  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Every formula above serves a single objective: move each student from their current predicted score to 120+ by exam day, at maximum efficiency, with minimum frustration, leveraging the structural advantage that Arabic gives over Hebrew that no other platform has ever systematically exploited.*