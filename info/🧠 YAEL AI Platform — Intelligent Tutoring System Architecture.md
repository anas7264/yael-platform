# 🧠 YAEL AI Platform — Intelligent Tutoring System Architecture

*AI Research Engineer · Production AI Design · Arabic-Hebrew Pedagogical Intelligence*

---

## PART 0 — FOUNDATIONAL PHILOSOPHY

### The Four Laws of This AI System

```
LAW 1: NEVER CALL AN API WHEN A CACHE EXISTS
  Every AI output is a potential cache entry.
  Before any model invocation: check L1 → L2 → L3 → L4.
  Only generate when all cache layers miss.

LAW 2: NEVER USE AI WHEN MATH SUFFICES
  Score prediction = weighted sum formula, not AI.
  Next question selection = IRT + Thompson Sampling, not AI.
  Streak calculation = date arithmetic, not AI.
  AI handles language, insight, and generation. Not arithmetic.

LAW 3: EVERY AI OUTPUT IS STRUCTURED
  No free-form text stored in the system.
  Every model response → validated JSON schema → typed storage.
  Hallucinations are caught at the schema boundary.

LAW 4: CONTEXT IS THE PRODUCT
  A generic AI is worthless for YAEL prep.
  A YAEL expert AI with the student's full history is irreplaceable.
  Every prompt carries precisely assembled context.
  No context = no intelligence = no differentiation.
```

### Intelligence Stack Overview

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        INTELLIGENCE STACK                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  LAYER 5: GENERATIVE AI (Claude claude-sonnet-4-6)                                 ║
║  ┌────────────────────────────────────────────────────────────────────┐     ║
║  │  Essay Evaluation · Grammar Analysis · AI Tutor · Study Plans    │     ║
║  │  Progress Narratives · Explanation Generation · Bridge Insights  │     ║
║  └────────────────────────────────────────────────────────────────────┘     ║
║                           ↕ (cache-first, AI second)                        ║
║  LAYER 4: RETRIEVAL & SEMANTIC MATCHING                                      ║
║  ┌────────────────────────────────────────────────────────────────────┐     ║
║  │  pgvector ANN Search · Semantic Vocab Bridge · Similar Questions  │     ║
║  │  RAG Context Assembly · Explanation Cache Lookup                  │     ║
║  └────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  LAYER 3: STATISTICAL MODELS (no API cost)                                   ║
║  ┌────────────────────────────────────────────────────────────────────┐     ║
║  │  BKT Knowledge Tracing · IRT Ability Estimation                   │     ║
║  │  FSRS Spaced Repetition · Score Prediction Model                  │     ║
║  │  Thompson Sampling Item Selection                                  │     ║
║  └────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  LAYER 2: RULE-BASED SYSTEMS (deterministic, zero cost)                      ║
║  ┌────────────────────────────────────────────────────────────────────┐     ║
║  │  Streak Logic · XP Calculation · Mission Evaluation               │     ║
║  │  Achievement Triggers · Rate Limit Enforcement · Validation       │     ║
║  └────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║  LAYER 1: DATA LAYER (Postgres + pgvector + Redis)                           ║
║  ┌────────────────────────────────────────────────────────────────────┐     ║
║  │  Knowledge States · Question Bank · Explanation Cache             │     ║
║  │  Vocabulary Embeddings · Session History · User Profiles          │     ║
║  └────────────────────────────────────────────────────────────────────┘     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PART 1 — AI SUBSYSTEM MAP

### Ten AI Subsystems and Their Contracts

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    AI SUBSYSTEM REGISTRY                                      ║
╠═══════════════════════╦════════════════╦══════════════╦════════════╦══════════╣
║ SUBSYSTEM             ║ MODEL          ║ CACHE LAYER  ║ LATENCY    ║ COST/REQ ║
╠═══════════════════════╬════════════════╬══════════════╬════════════╬══════════╣
║ Diagnostic Engine     ║ Statistical    ║ None needed  ║ <10ms      ║ $0.000   ║
║ Score Predictor       ║ Statistical    ║ DB (summary) ║ <5ms       ║ $0.000   ║
║ Explanation Generator ║ claude-sonnet-4-6   ║ DB + Redis   ║ <200ms*    ║ $0.003*  ║
║ Study Plan Generator  ║ claude-sonnet-4-6   ║ DB           ║ <8s        ║ $0.045   ║
║ Essay Evaluator       ║ claude-sonnet-4-6   ║ None (unique)║ <15s       ║ $0.080   ║
║ Grammar Analyzer      ║ claude-sonnet-4-6   ║ Partial      ║ <5s        ║ $0.025   ║
║ AI Tutor              ║ claude-sonnet-4-6   ║ None (live)  ║ Streaming  ║ $0.015   ║
║ Progress Analyzer     ║ claude-sonnet-4-6   ║ DB (weekly)  ║ <20s       ║ $0.060   ║
║ Bridge Engine         ║ Embedding+Rules║ DB (pgvector)║ <50ms      ║ $0.0001  ║
║ Item Selector         ║ Statistical    ║ None needed  ║ <20ms      ║ $0.000   ║
╠═══════════════════════╩════════════════╩══════════════╩════════════╩══════════╣
║  * = cache hit rate > 95% — effective cost per user: ~$0.0001               ║
║  All times include prompt assembly and context injection                      ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

---

## PART 2 — CORE AI WORKFLOWS

### Workflow 1: The Adaptive Practice Loop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE PRACTICE LOOP (per question)                    │
└─────────────────────────────────────────────────────────────────────────────┘

USER ANSWERS QUESTION
        │
        ▼
┌───────────────────────────────┐
│  ANSWER RECORDING             │
│  (synchronous, <5ms)          │
│                               │
│  Validate: option 0–3         │
│  Record: question_attempts    │
│  Capture: time_ms, confidence │
└───────────────┬───────────────┘
                │
                ├─── BRANCH A: Correct Answer ──────────────────────────────┐
                │                                                            │
                ├─── BRANCH B: Wrong Answer ─────────────────────────────── │
                │                                                            │
                ▼                                                            │
┌───────────────────────────────┐                                           │
│  BKT UPDATE (Layer 3)         │◄──────────────────────────────────────────┘
│  (async, <10ms, no API)       │
│                               │  P(mastery_new) = BKT(
│  Runs in Edge Function        │    P(mastery_old),
│  Per skill touched            │    is_correct,
│  Updates knowledge_states     │    p_slip, p_guess, p_transit
│  Updates IRT theta estimate   │  )
└───────────────┬───────────────┘
                │
                ├─────────── ASYNC BRANCH: If Wrong ────────────────────────┐
                │                                                            │
                ▼                                                            ▼
┌───────────────────────────────┐         ┌────────────────────────────────┐
│  SCORE DELTA COMPUTATION      │         │  EXPLANATION PIPELINE          │
│  (Layer 3, <5ms, no API)      │         │  (See Workflow 3)              │
│                               │         └────────────────────────────────┘
│  ΔScore = Σ(                  │
│    skill_weight[i]            │
│    × skill_exam_weight[i]     │
│    × Δmastery[i]              │
│    × score_scale_factor       │
│  )                            │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  NEXT ITEM SELECTION          │
│  (Layer 3, <20ms, no API)     │
│                               │
│  Algorithm: Thompson Sampling │
│  + IRT optimal difficulty     │
│                               │
│  For each candidate question: │
│  score = E[gain] × w_section  │
│        - recency_penalty      │
│        - exam_time_factor     │
│                               │
│  E[gain] = P(correct | theta) │
│           × Δmastery_if_right │
│         + P(wrong | theta)    │
│           × Δmastery_if_wrong │
│                               │
│  Constraints:                 │
│  • Not seen in last 7 days    │
│  • Section weighting (exam %) │
│  • Prerequisite mastered      │
│  • Not flagged by user        │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  QUESTION DELIVERY            │
│  Pre-fetch explanation cache  │
│  for probable wrong answers   │
│  (background, non-blocking)   │
└───────────────────────────────┘
```

---

### Workflow 2: Placement Diagnostic Engine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PLACEMENT DIAGNOSTIC PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────────┘

PLACEMENT TEST: 20 ADAPTIVE QUESTIONS
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: QUESTION 1–4 (Calibration Phase)                               │
│                                                                           │
│  Selection: Balanced difficulty (b=0.5) × 5 sections                    │
│  Goal: Establish rough ability band                                      │
│  Method: Fixed-form, not adaptive yet                                    │
│  No IRT update yet (insufficient data)                                   │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: QUESTIONS 5–16 (Adaptive Calibration Phase)                    │
│                                                                           │
│  IRT: Maximum Likelihood Estimation of theta after each answer           │
│                                                                           │
│  theta_update = theta + [Σ a_i(u_i - P_i)] / [Σ a_i²P_i(1-P_i)]       │
│                                                                           │
│  P_i = c_i + (1-c_i) / (1 + e^(-Da_i(theta - b_i)))                   │
│                                                                           │
│  Next Q: Maximize Fisher Information at current theta estimate           │
│  I(theta) = [P'(theta)]² / [P(theta)(1-P(theta))]                       │
│                                                                           │
│  Section rotation: ensure all 5 sections sampled (2-3 questions each)   │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: QUESTIONS 17–20 (Confirmation Phase)                           │
│                                                                           │
│  Questions near estimated theta to reduce standard error                 │
│  SE(theta) target: < 0.35 (acceptable placement precision)               │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  PLACEMENT RESULT COMPUTATION (no API call — statistical)                │
│                                                                           │
│  1. Final theta estimate per section (5 values)                         │
│  2. Section scores = theta_to_yael_scale(theta_i, section_i)            │
│  3. Composite predicted score = Σ(section_score_i × exam_weight_i)      │
│  4. Knowledge state initialization: BKT priors set from IRT theta       │
│     mastery_probability ≈ sigmoid(theta - skill_difficulty_median)      │
│  5. Weak area detection: skills with mastery_probability < 0.40         │
│  6. Preliminary study plan trigger                                       │
│                                                                           │
│  RESULT JSON:                                                            │
│  {                                                                        │
│    estimated_score: 87.4,                                                │
│    confidence_interval: [82.1, 92.7],                                   │
│    yael_level_recommended: 3,                                            │
│    section_breakdown: {                                                  │
│      reading: 85.2,                                                      │
│      vocabulary: 79.1,                                                   │
│      grammar: 68.4,                                                      │
│      sentence_completion: 91.3,                                          │
│      reconstruction: null (not YAEL 3 required)                         │
│    },                                                                    │
│    top_weaknesses: [skill_id_grammar_piel, skill_id_vocab_academic],    │
│    top_strengths: [skill_id_reading_main_idea, skill_id_sentence_logic],│
│    arabic_speaker_advantages_detected: [                                 │
│      "root_recognition_speed",                                           │
│      "semitic_pattern_matching"                                          │
│    ]                                                                     │
│  }                                                                        │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### Workflow 3: Explanation Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              EXPLANATION GENERATION PIPELINE                                │
│              (The Most Critical Cost-Control System)                        │
└─────────────────────────────────────────────────────────────────────────────┘

INPUT: question_id + wrong_option_index + user_context
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CACHE CHECK — L1: IN-MEMORY (Edge Function scope)                         │
│  TTL: Duration of Edge Function invocation                                 │
│  Key: `explain:{question_id}:{option_index}`                               │
│  HIT RATE: ~40% (repeat lookups in same edge function batch)               │
│  LATENCY: <1ms                                                             │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ MISS
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CACHE CHECK — L2: REDIS (Vercel KV)                                       │
│  TTL: 24 hours (hot explanations stay warm)                                │
│  Key: `explain:v2:{question_id}:{option_index}`                            │
│  HIT RATE: ~35% (popular wrong answers cached here)                        │
│  LATENCY: 5–15ms                                                           │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ MISS
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CACHE CHECK — L3: POSTGRES (ai_explanations_cache table)                  │
│  TTL: Permanent (until question changes or quality score < 2.0)            │
│  Query: SELECT * FROM cache.ai_explanations                                │
│         WHERE question_id = $1 AND wrong_option_index = $2                │
│         AND needs_regeneration = FALSE                                     │
│  HIT RATE: ~20% (remaining unique question+option combos not in Redis)     │
│  LATENCY: 10–30ms                                                          │
│                                                                            │
│  On HIT: Write-back to L2 Redis (promote to hot cache)                    │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ MISS (true cache miss — calls AI)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTEXT ASSEMBLY (pre-AI step, <5ms)                                      │
│                                                                            │
│  Assemble from DB (single JOIN query):                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  question.question_text_he                                          │  │
│  │  question.options[wrong_option_index].text_he                       │  │
│  │  question.options[correct_option_index].text_he                     │  │
│  │  question.root_word_he (if vocabulary)                              │  │
│  │  question.binyan (if grammar)                                       │  │
│  │  skill.name_he + skill.name_ar                                      │  │
│  │  skill.arabic_bridge_insight                                        │  │
│  │  grammar_rule.arabic_parallel_ar (if grammar Q)                    │  │
│  │  vocabulary.root_ar + vocabulary.is_cognate (if vocab Q)           │  │
│  │  user_profile.arabic_dialect (personalization)                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  TOKEN ESTIMATE: ~600–800 input tokens                                     │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  RATE LIMIT CHECK                                                          │
│  User bucket: 100 live explanations / hour                                 │
│  Platform bucket: 5,000 API calls / hour                                   │
│                                                                            │
│  IF RATE LIMITED → Serve generic template (see Fallback Workflow)         │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ CLEARED
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLAUDE API CALL (claude-sonnet-4-6)                                            │
│                                                                            │
│  System Prompt: EXPLANATION_SYSTEM_V3 (versioned)                         │
│  Context: Assembled above                                                  │
│  Max tokens: 600                                                           │
│  Temperature: 0.3 (low — factual, consistent)                             │
│  Response format: JSON (enforced via system prompt structure)              │
│                                                                            │
│  Expected latency: 1,500–3,000ms                                           │
│  Expected cost: ~$0.003                                                    │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  OUTPUT VALIDATION + SCHEMA ENFORCEMENT                                    │
│                                                                            │
│  Parse JSON → validate against ExplanationSchema                          │
│  Required fields check                                                     │
│  Arabic text detection (ensure Arabic, not Hebrew/English output)         │
│  Length check: explanation_ar between 50–500 chars                        │
│  Bridge quality check: linguistic_bridge_ar references Arabic root        │
│                                                                            │
│  IF VALIDATION FAILS → retry once with explicit correction prompt         │
│  IF RETRY FAILS → serve generic template fallback                         │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ VALID
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CACHE WRITE (all three layers simultaneously)                             │
│                                                                            │
│  → L3: INSERT into cache.ai_explanations (permanent)                      │
│  → L2: SET in Redis KV, TTL=86400 (24hr)                                  │
│  → L1: Store in function memory                                            │
│                                                                            │
│  BACKGROUND: update questions.times_answered (async, non-blocking)        │
└─────────────────────────────────────────────────────────────────────────────┘

EXPECTED CACHE HIT DISTRIBUTION AT SCALE:
  L1 hits:  40%  → $0 cost, <1ms
  L2 hits:  35%  → $0 cost, <15ms
  L3 hits:  22%  → $0 cost, <30ms
  AI calls:  3%  → $0.003/call
  
  Effective cost per explanation served: $0.003 × 0.03 = $0.00009
  At 1,000,000 explanations/month: $90 total AI cost
```

---

### Workflow 4: Study Plan Generation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STUDY PLAN GENERATION PIPELINE                          │
└─────────────────────────────────────────────────────────────────────────────┘

TRIGGER: Placement completion | Exam date change | Manual request | 
         Weekly rebalance (if completion rate < 60%)

PHASE 1: DATA ASSEMBLY (statistical, no API)
  ├── Load all knowledge_states for user (30–50 rows)
  ├── Load user_profile: exam_date, target_score, daily_minutes
  ├── Load user_progress_summary: current_score, section_scores
  ├── Load recent study_sessions (last 14 days)
  ├── Compute days_available = exam_date - today
  ├── Compute total_study_minutes = days_available × daily_minutes
  └── Compute priority_matrix:
      For each skill:
        score_gap = target_score_on_section - current_section_score
        skill_weight = skill.exam_weight × section_weight
        current_mastery = knowledge_states[skill].mastery_probability
        potential_gain = (1 - current_mastery) × skill_weight × score_gap
        study_efficiency = potential_gain / est_minutes_to_mastery
        priority_score = study_efficiency × urgency_factor(days_available)

PHASE 2: STRATEGY SELECTION (rule-based)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  days_available > 60:  "foundation" strategy                        │
  │    → Address all gaps systematically                                 │
  │    → 40% weakest skills, 30% medium, 20% maintenance, 10% mock     │
  │                                                                      │
  │  30 < days_available ≤ 60: "balanced" strategy                     │
  │    → Focus on high-impact gaps                                       │
  │    → 50% top 3 weakest, 25% mock exams, 25% vocab/review           │
  │                                                                      │
  │  14 < days_available ≤ 30: "exam_sprint" strategy                  │
  │    → High-frequency high-weight skills only                          │
  │    → 40% mock exams, 40% grammar+vocab drills, 20% reading          │
  │                                                                      │
  │  days_available ≤ 14: "intensive" strategy                          │
  │    → Pure exam simulation + targeted drilling                        │
  │    → 60% mock exams, 40% weakest high-weight skills                 │
  └──────────────────────────────────────────────────────────────────────┘

PHASE 3: AI PLAN GENERATION (Claude claude-sonnet-4-6)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  INPUT PROMPT CONTAINS:                                              │
  │  • Priority matrix (top 10 skills with scores)                      │
  │  • Strategy type selected                                            │
  │  • Days available, daily minutes available                           │
  │  • Current section scores vs targets                                 │
  │  • Student's Arabic dialect (for example selection in plan)         │
  │  • Past week: which skills were practiced, completion rate          │
  │  • Key weaknesses with Arabic bridge insights to leverage           │
  │                                                                      │
  │  AI TASK:                                                            │
  │  1. Validate and adjust the priority matrix (human sense check)     │
  │  2. Map skills to specific days in a calendar                       │
  │  3. Write Arabic rationale for each week's focus                    │
  │  4. Identify "breakthrough moments" (when mastery expected)         │
  │  5. Schedule mock exams at optimal intervals                        │
  │  6. Write motivational Arabic plan summary                          │
  │                                                                      │
  │  TEMPERATURE: 0.4 (some creativity, mostly structured)              │
  │  MAX TOKENS: 2,000                                                   │
  │  ESTIMATED COST: $0.045                                              │
  └──────────────────────────────────────────────────────────────────────┘

PHASE 4: PLAN VALIDATION + STORAGE
  → Validate JSON output against StudyPlanSchema
  → Check all skill_ids exist in DB
  → Verify daily_minutes constraints respected
  → Verify mock exam distribution (not too early, not too late)
  → Compute completion_rate baseline = 0
  → Store in study_plans table
  → Deactivate previous plan (PARTIAL UNIQUE constraint enforces one active)
  → Generate day-1 mission entries

CACHE STRATEGY:
  → Plans cached in DB (not re-generated unless triggered)
  → Plan validity: until completion_rate drops below 60% OR exam date changes
  → Rebalance: weekly background job, uses same pipeline
  → Cost per rebalance: $0.045 (negligible at any scale)
```

---

### Workflow 5: Essay Evaluation Engine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESSAY EVALUATION PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

INPUT: essay text (Hebrew) + prompt_id + user_id

NOTE: Essays are unique. No cache. Every evaluation is unique.
      But essay evaluation is rare (1–2/week per student).
      Cost is justified.

PHASE 1: PRE-PROCESSING (no API)
  → Word count validation (reject if < 20 or > 500 words)
  → Hebrew character validation (minimum 80% Hebrew characters)
  → Spam detection: repeated characters, copy-paste detection
  → Retrieve essay_prompt details (target level, rubric, key vocabulary)
  → Retrieve sample_response_he (from essay_prompts, for reference)

PHASE 2: DUAL EVALUATION CALL (Claude claude-sonnet-4-6)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  CALL STRUCTURE: Single call, two analytical passes in one prompt   │
  │                                                                      │
  │  Pass A: Grammar Analysis                                            │
  │  → Identify grammar errors with character-precise locations         │
  │  → Classify by error type (gender/tense/binyan/agreement)          │
  │  → Severity: critical/major/minor                                   │
  │  → Arabic explanation per error                                     │
  │  → Correction with Hebrew explanation of the rule                  │
  │                                                                      │
  │  Pass B: Holistic Evaluation                                         │
  │  → Grammar score (0–100): accuracy and complexity                  │
  │  → Vocabulary score (0–100): range, appropriateness, level         │
  │  → Coherence score (0–100): structure, logical flow                │
  │  → YAEL level achieved (1–5): comparative assessment               │
  │  → Specific strengths (2–3) in Arabic                              │
  │  → Priority improvements (2–3) in Arabic                           │
  │  → Improved version (optional, if score < 70): rewritten in Hebrew │
  │                                                                      │
  │  TEMPERATURE: 0.2 (highly consistent, near-deterministic)           │
  │  MAX TOKENS: 3,000                                                   │
  │  ESTIMATED COST: $0.080                                              │
  │                                                                      │
  │  SYSTEM PROMPT INCLUDES:                                             │
  │  • Full scoring rubric from essay_prompts.scoring_rubric           │
  │  • Sample high-quality response (for calibration)                  │
  │  • Student's current skill level (from knowledge_states)           │
  │  • Student's Arabic dialect (for explanation style)                │
  │  • Common mistakes Arabic speakers make (from grammar_rules)       │
  └──────────────────────────────────────────────────────────────────────┘

PHASE 3: INLINE ANNOTATION ASSEMBLY
  → Map grammar_issues[].{start, end} to exact character positions
  → Validate positions against essay text (prevent hallucinated positions)
  → Sort issues by character position for sequential display
  → Build annotation map for inline highlighting

PHASE 4: KNOWLEDGE STATE UPDATE
  → For each grammar_issue.error_type → find matching skill_id
  → If skill_id found: apply BKT "wrong" update to knowledge_state
  → For each strength identified → apply BKT "partial correct" signal
  → This is the only essay-driven knowledge state update

PHASE 5: STORAGE + NOTIFICATION
  → INSERT essay_feedback with full structured output
  → UPDATE user_essays.submission_status = 'feedback_ready'
  → INSERT user_notifications: "تقييم مقالتك جاهز"
  → Trigger AI report if this is session's final activity

OUTPUT SCHEMA:
  {
    overall_score: 73.5,
    grammar_score: 68.0,
    vocabulary_score: 79.0,
    coherence_score: 73.5,
    yael_level_achieved: 3,
    grammar_issues: [
      {
        start: 45,
        end: 52,
        wrong_he: "הילדים",
        correct_he: "הילדות",
        error_type: "gender_agreement",
        error_severity: "critical",
        reason_ar: "الاسم مؤنث لأن السياق يشير إلى...",
        rule_reference: "grammar_rules.code: gender.noun.agreement"
      }
    ],
    vocabulary_suggestions: [...],
    strengths_ar: "...",
    improvements_ar: "...",
    overall_comment_ar: "...",
    improved_version_he: "..." (if score < 70)
  }
```

---

### Workflow 6: AI Tutor Conversation Engine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI TUTOR PIPELINE (Real-time streaming)                 │
└─────────────────────────────────────────────────────────────────────────────┘

DESIGN PRINCIPLE:
  The tutor is not a generic chatbot.
  It is a specialized YAEL expert with full knowledge of this student.
  Every message includes compressed student context.

CONTEXT ASSEMBLY (per message, <30ms)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  STATIC CONTEXT (loaded once per conversation, cached in session)   │
  │  ─────────────────────────────────────────────────────────────────  │
  │  • user_profiles: dialect, target_level, exam_date, target_score   │
  │  • user_progress_summary: current_score, section_scores            │
  │  • Top 5 weak skills (from knowledge_states ORDER BY mastery ASC)  │
  │  • Top 3 current mistakes (from user_mistakes, unresolved)         │
  │  • Student name                                                     │
  │                                                                     │
  │  DYNAMIC CONTEXT (updated per message)                              │
  │  ─────────────────────────────────────────────────────────────────  │
  │  • Conversation history (last N turns, within token budget)        │
  │  • Current question (if tutoring about a specific question)        │
  │  • Relevant grammar rule (fetched via semantic search if needed)   │
  │  • Relevant vocabulary items (fetched via semantic search)         │
  │                                                                     │
  │  TOKEN BUDGET MANAGEMENT:                                           │
  │  Total budget: 8,000 tokens (input)                                │
  │  Allocation:                                                        │
  │    System prompt: ~1,500 tokens (fixed)                            │
  │    Static context: ~500 tokens (compressed)                        │
  │    Conversation history: up to 4,000 tokens (sliding window)      │
  │    Current message + retrieval: ~2,000 tokens                     │
  └──────────────────────────────────────────────────────────────────────┘

RETRIEVAL AUGMENTATION (semantic, per message)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  STEP 1: Query embedding                                             │
  │  Generate embedding for user's message (local model or cached)     │
  │                                                                     │
  │  STEP 2: Parallel semantic searches                                 │
  │  a) vocabulary_items: top 3 semantically relevant words            │
  │  b) grammar_rules: top 2 relevant rules                            │
  │  c) passages: top 1 relevant passage excerpt (if reading topic)   │
  │  All via pgvector cosine similarity <>=, threshold 0.82            │
  │                                                                     │
  │  STEP 3: Relevance filter                                           │
  │  Only inject retrieval results with similarity > 0.82              │
  │  Cap injected content at 500 tokens (retrieval budget)             │
  └──────────────────────────────────────────────────────────────────────┘

CONVERSATION MEMORY MANAGEMENT
  ┌──────────────────────────────────────────────────────────────────────┐
  │  WITHIN SESSION (short-term memory):                                │
  │  Full conversation history, sliding window                          │
  │  When history exceeds 4,000 tokens:                                │
  │    → Compress oldest messages into summary paragraph               │
  │    → Summary generated by cheap summarization call (or rule-based) │
  │    → Keep last 4 turns verbatim (recency bias)                     │
  │                                                                     │
  │  ACROSS SESSIONS (long-term memory):                               │
  │  Not stored as conversation turns                                  │
  │  Stored as structured knowledge state (knowledge_states table)     │
  │  And as mistake registry (user_mistakes table)                     │
  │  These are injected as static context (not raw conversation)       │
  │                                                                     │
  │  EPISODIC MEMORY (notable moments):                                │
  │  When tutor detects a recurring confusion:                         │
  │    → Add note to user_mistakes.user_note_ar                        │
  │    → Example: "Student confuses פיעל with הפעיל in causative sense" │
  │    → Injected in future sessions as "known confusion to address"   │
  └──────────────────────────────────────────────────────────────────────┘

STREAMING ARCHITECTURE
  → Vercel Edge Function streams Claude response via SSE
  → Client renders word-by-word (streaming visible)
  → Hebrew text within Arabic response: detected by charset,
    wrapped in <he dir="ltr"> tags client-side
  → On stream complete: save to ai_tutor_conversations.messages JSONB

COST PER CONVERSATION TURN:
  Input: ~2,500 tokens × $0.003/1K = $0.0075
  Output: ~400 tokens × $0.015/1K = $0.006
  Total per turn: ~$0.014
  Monthly budget per active user (30 turns/month): $0.42
```

---

### Workflow 7: Progress Analysis & Report Generation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROGRESS ANALYSIS PIPELINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

TRIGGER: Weekly (Sunday 00:00 UTC) OR Score milestone (every +5 points)
         OR User request OR Pre-exam (7 days before)

PHASE 1: STATISTICAL ANALYSIS (no API, Edge Function)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Data fetched for analysis window (7 or 30 days):                  │
  │                                                                     │
  │  PROGRESS METRICS:                                                  │
  │  • score_start vs score_end (from score_predictions)               │
  │  • score_delta_day[] from analytics.daily_aggregates               │
  │  • session_count, total_study_minutes                               │
  │  • questions_answered, accuracy_rate                                │
  │  • vocab_reviews, new_words_mastered                                │
  │                                                                     │
  │  SKILL ANALYSIS:                                                    │
  │  • knowledge_states: mastery_probability change per skill           │
  │  • Top 3 most improved skills (Δmastery DESC)                      │
  │  • Top 3 least improved skills (Δmastery ASC for practiced skills) │
  │                                                                     │
  │  ERROR PATTERN DETECTION:                                           │
  │  • user_mistakes grouped by skill_id: frequency_rank              │
  │  • user_mistakes grouped by error_pattern_code: recurring types   │
  │  • Low-confidence-but-correct answers (flag for attention)         │
  │  • High-accuracy speed outliers (taking too long)                  │
  │                                                                     │
  │  TRAJECTORY ANALYSIS:                                               │
  │  • Score velocity: Δscore / Δdays (points per day rate)           │
  │  • At current velocity, days_to_target = (target - current) / v   │
  │  • Confidence interval on target attainment                        │
  │  • Likelihood of hitting 120 by exam_date (probabilistic)         │
  └──────────────────────────────────────────────────────────────────────┘

PHASE 2: AI NARRATIVE GENERATION (Claude claude-sonnet-4-6)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  INPUT: Full statistical analysis (structured JSON, ~800 tokens)   │
  │         Student profile (dialect, goals, exam proximity)           │
  │         Previous report summary (avoid repeating same advice)      │
  │                                                                     │
  │  AI TASK: Generate human-quality Arabic learning narrative         │
  │                                                                     │
  │  OUTPUT SECTIONS:                                                   │
  │  1. executive_summary_ar (3 sentences)                             │
  │  2. narrative_ar (full "letter from tutor", 200–400 words)        │
  │  3. strengths: [{skill_id, evidence_ar, encouragement_ar}]         │
  │  4. weaknesses: [{skill_id, evidence_ar, strategy_ar}]             │
  │  5. breakthroughs: [{description_ar, happened_at}]                 │
  │  6. error_patterns: [{pattern, frequency, recommendation_ar}]      │
  │  7. predicted_score_on_plan: score if follows recommendations      │
  │  8. days_to_target: revised estimate                                │
  │  9. motivational_message_ar: personalized, not generic             │
  │  10. recommended_focus_skill_ids: top 3 for next week              │
  │                                                                     │
  │  TEMPERATURE: 0.6 (more human, varied, but accurate)               │
  │  MAX TOKENS: 2,500                                                   │
  │  ESTIMATED COST: $0.060                                              │
  │                                                                     │
  │  QUALITY CONSTRAINT:                                                │
  │  motivational_message must reference at least one specific         │
  │  achievement from the past week (not generic)                      │
  │  Validated by checking proper nouns match actual data              │
  └──────────────────────────────────────────────────────────────────────┘

FREQUENCY-BASED COST CONTROL:
  Weekly reports: 1 × $0.060 / user / week = $0.24/month
  At 10,000 MAU: $2,400/month in report generation
  
  OPTIMIZATION: Users who studied < 3 days → skip AI narrative,
                serve template-only report (rule-based)
  Reduces AI calls by ~30%: ~$1,680/month actual cost
```

---

## PART 3 — PROMPT PIPELINE ARCHITECTURE

### Prompt Registry

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROMPT REGISTRY                                     │
│              Versioned · Tested · A/B-Ready                                │
└─────────────────────────────────────────────────────────────────────────────┘

PROMPT VERSIONING SYSTEM:
  Storage: prompt_registry table OR versioned config files (config/)
  Format: {name}:{major}.{minor} e.g., "explanation:3.1"
  Deployment: New minor = backward compatible, New major = A/B test required
  Rollback: Previous version always stored and activatable instantly

PROMPT REGISTRY:
┌────────────────────────────────┬────────┬──────────────────────────────────┐
│ Prompt Name                    │Version │ Token Count (System)             │
├────────────────────────────────┼────────┼──────────────────────────────────┤
│ EXPLANATION_SYSTEM             │  3.2   │ ~1,200 tokens                    │
│ TUTOR_SYSTEM                   │  2.4   │ ~1,500 tokens                    │
│ STUDY_PLAN_SYSTEM              │  1.8   │ ~900 tokens                      │
│ ESSAY_EVALUATION_SYSTEM        │  2.1   │ ~1,100 tokens                    │
│ GRAMMAR_ANALYSIS_SYSTEM        │  1.5   │ ~800 tokens                      │
│ PROGRESS_REPORT_SYSTEM         │  1.3   │ ~700 tokens                      │
│ BRIDGE_INSIGHT_SYSTEM          │  1.1   │ ~600 tokens                      │
└────────────────────────────────┴────────┴──────────────────────────────────┘

CORE SYSTEM PROMPT STRUCTURE (all prompts follow this template):
┌─────────────────────────────────────────────────────────────────────────────┐
│  SECTION 1: IDENTITY                                                       │
│  "You are HaTutor (המורה), an expert YAEL exam preparation tutor           │
│   specializing in teaching Hebrew to native Arabic speakers.                │
│   You are a certified Semitic linguist with 20 years of experience.        │
│   You respond ONLY in Arabic (MSA unless dialect specified).               │
│   Hebrew text appears ONLY as examples, never as explanation language."    │
│                                                                            │
│  SECTION 2: EXPERTISE DOMAIN                                               │
│  "Your expertise:                                                          │
│   • YAEL exam structure levels 1–5 and all sections                       │
│   • Hebrew grammar (all 7 binyanim, all verb tenses)                      │
│   • Arabic-Hebrew Semitic root correspondence system                       │
│   • Common mistakes made specifically by Arabic speakers learning Hebrew   │
│   • The phonological correspondence rules between Arabic and Hebrew        │
│   • FSRS spaced repetition pedagogy                                        │
│   • BKT knowledge tracing concepts (applied, not explained to students)"  │
│                                                                            │
│  SECTION 3: COMMUNICATION RULES                                            │
│  "Communication rules:                                                     │
│   • Always explain the WHY, not just the WHAT                             │
│   • Always connect Hebrew grammar to its Arabic parallel                  │
│   • Use the student's detected dialect: {arabic_dialect}                  │
│   • Provide Hebrew examples with full nikud (vowel marks)                │
│   • Provide Arabic transliteration only when requested                    │
│   • Never use romanization for Hebrew (use Hebrew script always)          │
│   • Tone: warm, encouraging, expert — like a trusted professor"          │
│                                                                            │
│  SECTION 4: TASK SPECIFICATION (varies by prompt)                         │
│  [Task-specific instructions]                                              │
│                                                                            │
│  SECTION 5: OUTPUT FORMAT                                                  │
│  "Output ONLY valid JSON matching this schema: {schema}"                  │
│  "Do not add explanatory text outside the JSON."                          │
│  "All Arabic text must be in Arabic script, not transliteration."         │
│  "All Hebrew text must include nikud."                                     │
│                                                                            │
│  SECTION 6: QUALITY RULES                                                  │
│  "Do not hallucinate grammar rules. If uncertain, state uncertainty."     │
│  "Linguistic bridge insights must be linguistically accurate."            │
│  "Motivation must reference specific student achievement, not generic."   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Context Assembly Templates

```
CONTEXT ASSEMBLY FOR EXPLANATION PROMPT:

Template: EXPLANATION_CONTEXT_V3
┌─────────────────────────────────────────────────────────────────────────────┐
│  QUESTION CONTEXT:                                                         │
│  Hebrew Question: {question_text_he}                                       │
│  Section: {skill.section} | Skill: {skill.name_he} ({skill.name_ar})      │
│  YAEL Level: {question.yael_level}                                         │
│                                                                            │
│  ANSWER ANALYSIS:                                                          │
│  Student chose: {wrong_option_text_he} (option {wrong_option_index})      │
│  Correct answer: {correct_option_text_he}                                  │
│                                                                            │
│  LINGUISTIC CONTEXT:                                                       │
│  {IF vocabulary:}                                                          │
│    Hebrew root: {question.root_word_he}                                   │
│    Arabic cognate root: {vocabulary.root_ar}                               │
│    Is cognate: {vocabulary.is_cognate}                                    │
│    Cognate note: {vocabulary.cognate_note_ar}                             │
│  {IF grammar:}                                                             │
│    Binyan tested: {question.binyan}                                        │
│    Arabic parallel: {grammar_rule.arabic_parallel_ar}                     │
│    Common mistake note: {skill.arabic_bridge_insight}                     │
│                                                                            │
│  STUDENT CONTEXT:                                                          │
│  Arabic dialect: {user_profile.arabic_dialect}                            │
│  Current mastery of this skill: {knowledge_state.mastery_probability}     │
│                                                                            │
│  TASK:                                                                     │
│  Explain why the student was wrong and what the correct answer means.     │
│  Provide a memorable Arabic-Hebrew bridge insight for this specific word. │
└─────────────────────────────────────────────────────────────────────────────┘
```

### JSON Output Schemas

```
EXPLANATION OUTPUT SCHEMA (ExplanationSchema v3):
  {
    "why_wrong_ar": string,           // Why chosen answer is wrong
    "why_right_ar": string,           // Why correct answer is right
    "linguistic_bridge_ar": string,   // Arabic-Hebrew insight
    "memory_trick_ar": string | null, // Mnemonic for Arabic speakers
    "reinforcement_example_he": string | null, // Another Hebrew example
    "related_skill_tip_ar": string | null,     // Broader skill tip
    "confidence": "high" | "medium" | "low"    // Model's confidence
  }
  Required: why_wrong_ar, why_right_ar, linguistic_bridge_ar

STUDY PLAN OUTPUT SCHEMA (StudyPlanSchema v2):
  {
    "plan_name_ar": string,
    "strategy_type": "foundation" | "balanced" | "exam_sprint" | "intensive",
    "strategy_rationale_ar": string,
    "expected_score_at_exam": number,
    "confidence_in_target": "high" | "medium" | "low",
    "daily_sessions": [
      {
        "date": "YYYY-MM-DD",
        "session_type": string,
        "skill_ids": [uuid],
        "focus_description_ar": string,
        "estimated_minutes": number,
        "priority": "critical" | "high" | "medium" | "maintenance"
      }
    ],
    "mock_exam_dates": ["YYYY-MM-DD"],
    "breakthrough_predictions": [
      {
        "skill_id": uuid,
        "predicted_mastery_date": "YYYY-MM-DD",
        "expected_score_impact": number
      }
    ],
    "weekly_summary_ar": [
      {"week": 1, "focus_ar": string, "expected_score_gain": number}
    ]
  }

ESSAY EVALUATION OUTPUT SCHEMA (EssayEvaluationSchema v2):
  {
    "scores": {
      "overall": number,      // 0-100
      "grammar": number,
      "vocabulary": number,
      "coherence": number,
      "yael_level_achieved": number  // 1-5
    },
    "grammar_issues": [
      {
        "start": number,           // Character position
        "end": number,
        "wrong_he": string,
        "correct_he": string,
        "error_type": string,      // gender/tense/binyan/agreement/etc.
        "error_severity": "critical" | "major" | "minor",
        "reason_ar": string,
        "rule_ar": string
      }
    ],
    "vocabulary_suggestions": [
      {
        "word_used_he": string,
        "better_word_he": string,
        "reason_ar": string,
        "level_upgrade": boolean
      }
    ],
    "strengths_ar": string,
    "improvements_ar": string,
    "overall_comment_ar": string,
    "motivational_close_ar": string,
    "improved_version_he": string | null,
    "skills_exercised_codes": [string]
  }

PROGRESS REPORT OUTPUT SCHEMA (ProgressReportSchema v1):
  {
    "executive_summary_ar": string,
    "narrative_ar": string,
    "motivational_message_ar": string,
    "predicted_score_on_plan": number,
    "days_to_target": number,
    "confidence_in_target": "high" | "medium" | "low",
    "strengths": [{"skill_id": uuid, "evidence_ar": string}],
    "weaknesses": [{"skill_id": uuid, "evidence_ar": string, "strategy_ar": string}],
    "breakthroughs": [{"description_ar": string, "happened_at": string}],
    "error_patterns": [{"pattern_code": string, "frequency": number, "recommendation_ar": string}],
    "recommended_focus_skill_ids": [uuid],
    "study_plan_adjustment_ar": string | null
  }

AI TUTOR RESPONSE SCHEMA (TutorResponseSchema v2):
  {
    "response_ar": string,              // Full Arabic response
    "hebrew_references": [             // Hebrew terms/examples used
      {"text_he": string, "translation_ar": string}
    ],
    "follow_up_suggestions_ar": [string],  // Optional suggested next questions
    "detected_confusion": string | null,   // If a misconception is detected
    "grammar_rule_referenced": string | null,  // Rule code if cited
    "vocab_items_referenced": [uuid]      // Vocab IDs mentioned for logging
  }
```

---

## PART 4 — MEMORY ARCHITECTURE

### Three-Layer Memory System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THREE-LAYER MEMORY SYSTEM                               │
└─────────────────────────────────────────────────────────────────────────────┘

LAYER 1: IN-CONTEXT MEMORY (Working Memory)
  ──────────────────────────────────────────
  Scope:   Current prompt window only
  Storage: None (vanishes after response)
  Content: Active question, conversation turns, retrieved context
  Budget:  8,000 tokens (input window utilization)
  
  TOKEN ALLOCATION MAP:
  ┌────────────────────────────────────────┬──────────┐
  │ Allocation                             │ Tokens   │
  ├────────────────────────────────────────┼──────────┤
  │ System prompt (versioned)              │ ~1,500   │
  │ Student identity context              │ ~300     │
  │ Current skill states (top 10)         │ ~400     │
  │ Recent mistakes (top 5)               │ ~300     │
  │ Conversation history (sliding window) │ ~3,000   │
  │ Current question/content              │ ~800     │
  │ Retrieved RAG context                 │ ~500     │
  │ Reserve (buffer)                      │ ~1,200   │
  ├────────────────────────────────────────┼──────────┤
  │ TOTAL                                 │ ~8,000   │
  └────────────────────────────────────────┴──────────┘

LAYER 2: SESSION MEMORY (Short-Term Memory)
  ──────────────────────────────────────────
  Scope:    Active study session (minutes to hours)
  Storage:  Vercel KV (Redis), TTL = 4 hours
  Content:  Questions seen this session, skills covered, mistakes made,
            running accuracy rate, XP earned, session context
  Format:   Compressed JSON (< 2KB per user)
  Purpose:  Avoid repetition within session, track session-level progress
  
  KEY: `session:{session_id}:memory`
  STRUCTURE:
  {
    questions_seen: [uuid],     // Don't re-show
    skills_covered: {           // Skill coverage this session
      [skill_id]: {attempts: N, correct: N}
    },
    current_streak: N,          // Correct in a row
    session_accuracy: 0.73,
    last_question_skill: uuid,  // Avoid same skill twice in a row
    mistakes_this_session: [    // For session summary
      {question_id, skill_id, wrong_option}
    ]
  }

LAYER 3: LONG-TERM MEMORY (Persistent Memory)
  ──────────────────────────────────────────────
  Scope:    Permanent (until user deletes account)
  Storage:  PostgreSQL (structured — NOT raw conversation logs)
  Content:  Everything important extracted into structured form
  
  LONG-TERM MEMORY = STRUCTURED DATABASE STATE:
  
  knowledge_states         → P(mastery) per skill (the most important memory)
  user_progress_summary    → Aggregated performance snapshot
  user_mistakes            → Recurring error registry
  vocabulary_states        → FSRS state per word (personalized schedule)
  score_predictions        → Historical score trajectory
  ai_tutor_conversations   → Last 3 conversations stored (episodic reference)
  study_plans              → Learning strategy and calendar
  
  WHAT IS NOT STORED IN LONG-TERM MEMORY:
  → Raw conversation transcripts beyond last 3 sessions
  → Every question attempt verbatim (aggregated into knowledge_states)
  → Temporary UI state

LAYER 3 → LAYER 1 INJECTION:
  When assembling context for any AI call:
  
  STUDENT CONTEXT BUILDER (executed every request):
  ┌──────────────────────────────────────────────────────────────────────┐
  │  FROM user_profiles:                                                │
  │  "Student: {display_name}, studying for YAEL {target_level}"       │
  │  "Target score: {target_score}, Current: {current_score}"          │
  │  "Exam date: {exam_date} ({days_until} days away)"                 │
  │  "Arabic dialect: {arabic_dialect}"                                 │
  │                                                                     │
  │  FROM knowledge_states (top 5 weakest):                            │
  │  "Primary weaknesses: {skill_1.name_ar} ({mastery_1}%), ..."       │
  │                                                                     │
  │  FROM user_mistakes (top 3 unresolved):                            │
  │  "Recurring mistakes: {mistake_1.description}"                     │
  │                                                                     │
  │  TOKEN COST: ~300 tokens (compressed student fingerprint)          │
  └──────────────────────────────────────────────────────────────────────┘

CONVERSATION HISTORY COMPRESSION:
  When conversation exceeds 3,000 tokens:
  
  COMPRESSION ALGORITHM:
  1. Keep: Last 3 full turns verbatim (recency critical)
  2. Compress: Turns 4–8 → 1-sentence per turn summary (rule-based)
  3. Archive: Turns 9+ → discard from context, save to DB if notable
  
  COMPRESSION RULES (no API needed — rule-based):
  → User question → extract topic in 10 words
  → AI answer → extract 1 key point in 15 words
  → Format: "Q: {topic} → A: {key_point}"
  → Result: ~4 turns compressed to ~60 tokens from ~400 tokens

EPISODIC MEMORY (long-term recall of notable moments):
  DETECTION: AI tutor detects a pattern flag in its response:
    detected_confusion field populated
  
  STORAGE: Appended to user_mistakes.user_note_ar
    "Student consistently confuses פיעל (Pi'el) with הפעיל (Hif'il) 
     when describing causative actions"
  
  INJECTION: In future tutor sessions, if relevant skill detected:
    "Historical note: This student has shown confusion about {note}"
    → 50 tokens of episodic memory significantly improves tutoring
```

---

## PART 5 — EMBEDDING & SEMANTIC SEARCH ARCHITECTURE

### Embedding Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EMBEDDING PIPELINE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

WHAT GETS EMBEDDED:
┌──────────────────────────────────────────────────────┬────────────────────┐
│ Content                                               │ Model              │
├──────────────────────────────────────────────────────┼────────────────────┤
│ vocabulary_items (word + definition + example)        │ text-embed-3-small │
│ grammar_rules (title + explanation)                   │ text-embed-3-small │
│ passages (full passage text, Hebrew)                  │ text-embed-3-small │
│ ai_tutor messages (user queries only, for retrieval) │ text-embed-3-small │
│ question stems (for similarity clustering)            │ text-embed-3-small │
└──────────────────────────────────────────────────────┴────────────────────┘

EMBEDDING MODEL SELECTION:
  Primary: OpenAI text-embedding-3-small
  → Dimension: 1536
  → Cost: $0.02 / 1M tokens
  → 10,000 vocab items × ~50 tokens = 500K tokens = $0.01 total (one-time)
  → Updates: re-embed only changed items (incremental)
  
  Alternative (zero cost, slightly lower quality):
  → Transformers.js (Xenova/multilingual-e5-small, 384-dim)
  → Runs client-side or edge runtime
  → No API cost
  → Lower accuracy for Hebrew-Arabic cross-lingual search
  → Used as fallback if embedding API unavailable

EMBEDDING TEXT CONSTRUCTION:
  For vocabulary_items:
  "{word_nikud_he} | {root_he} | {translation_ar} | {root_ar} | {example_he}"
  → Bilingual embedding captures semantic position in both languages
  → Cognate detection via embedding proximity (< 0.15 cosine distance)

  For grammar_rules:
  "{title_he} | {title_ar} | {binyan_code} | {arabic_parallel_ar}"
  
  For passages:
  First 200 tokens of passage only (topic/style captured in opening)

EMBEDDING STORAGE:
  → vocabulary_items.embedding: vector(1536)
  → grammar_rules.embedding: vector(1536)
  → passages.embedding: vector(1536)
  → IVFFLAT index (100 lists) for < 100K items
  → HNSW index (future, when > 100K items, faster queries)
```

### Semantic Search Query Patterns

```
PATTERN 1: Arabic Word → Hebrew Translation (vocabulary bridge)
  ─────────────────────────────────────────────────────────────
  USE CASE: Student types Arabic word in tutor chat
  QUERY:    Embed the Arabic word phrase
  SEARCH:   cosine similarity on vocabulary_items.embedding
  FILTER:   WHERE is_active = TRUE
  TOP-K:    3 results
  THRESHOLD: similarity > 0.80
  RETURN:   word_nikud_he, translation_ar, cognate_note_ar, audio_url

PATTERN 2: Question Concept → Grammar Rule
  ─────────────────────────────────────────────────────────────
  USE CASE: Tutor needs to find relevant grammar rule for user question
  QUERY:    Embed user's question text
  SEARCH:   cosine similarity on grammar_rules.embedding
  FILTER:   WHERE skill_id IN (user's weak skills)
  TOP-K:    2 results
  THRESHOLD: similarity > 0.82
  RETURN:   title_ar, explanation_ar, arabic_parallel_ar, examples

PATTERN 3: Similar Questions (related practice)
  ─────────────────────────────────────────────────────────────
  USE CASE: After mistake, find similar questions to drill the pattern
  QUERY:    question.embedding (pre-computed)
  SEARCH:   cosine similarity on questions.embedding
  FILTER:   WHERE skill_id = same_skill
             AND yael_level = same_level
             AND id != current_question
  TOP-K:    5 results
  THRESHOLD: similarity > 0.75
  RETURN:   question_ids (add to revision_queue)

PATTERN 4: Passage Topic Search
  ─────────────────────────────────────────────────────────────
  USE CASE: Student wants to practice reading about a specific topic
  QUERY:    Embed student's topic preference (Arabic input)
  SEARCH:   cosine similarity on passages.embedding
  FILTER:   WHERE yael_level = user.target_yael_level
  TOP-K:    3 results
  RETURN:   passage_id, title_he, topic_category, difficulty

PATTERN 5: Arabic Root → Hebrew Cognate Family
  ─────────────────────────────────────────────────────────────
  USE CASE: Bridge explorer - student wants to see Arabic root family in Hebrew
  QUERY:    Exact match on vocabulary_items.root_ar
            + semantic search for near-cognates
  SEARCH:   WHERE root_ar = '{input}' 
            UNION
            SELECT * FROM vocab 
            ORDER BY embedding <=> query_embedding 
            WHERE is_cognate = TRUE LIMIT 5
  RETURN:   Full word family in both languages

PATTERN 6: Error Pattern → Explanation Cluster
  ─────────────────────────────────────────────────────────────
  USE CASE: "I keep making this type of mistake — show me the pattern"
  QUERY:    Embed user_mistakes.error_pattern_code concept
  SEARCH:   cosine on cached explanations OR grammar rules
  RETURN:   Cluster of related explanations for the same error type
```

---

## PART 6 — CACHING ARCHITECTURE

### Multi-Layer Cache System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-LAYER CACHE ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

                    REQUEST
                       │
        ┌──────────────▼──────────────┐
        │         L0: CDN EDGE        │
        │    (Vercel Edge Network)    │
        │                             │
        │  What's cached here:        │
        │  • Static AI content        │
        │    (pre-generated examples, │
        │     grammar reference JSON) │
        │  • Immutable question JSON  │
        │    (questions rarely change)│
        │                             │
        │  TTL: 24 hours              │
        │  HIT RATE: ~25%             │
        │  LATENCY: <5ms              │
        └──────────────┬──────────────┘
                       │ MISS
        ┌──────────────▼──────────────┐
        │       L1: EDGE FUNCTION     │
        │       IN-MEMORY CACHE       │
        │   (Node.js module scope)    │
        │                             │
        │  What's cached here:        │
        │  • Skill taxonomy tree      │
        │    (30–50 rows, rarely      │
        │    changes, loaded once)    │
        │  • Achievement definitions  │
        │  • Mission templates        │
        │  • XP level thresholds     │
        │                             │
        │  TTL: Edge Function lifetime│
        │       (warm: hours)         │
        │  HIT RATE: ~60% of taxonomy │
        │  LATENCY: <1ms              │
        └──────────────┬──────────────┘
                       │ MISS
        ┌──────────────▼──────────────┐
        │       L2: REDIS             │
        │     (Vercel KV)             │
        │                             │
        │  What's cached here:        │
        │                             │
        │  SESSION CACHE:             │
        │  Key: session:{id}:memory   │
        │  TTL: 4 hours               │
        │                             │
        │  EXPLANATION HOT CACHE:     │
        │  Key: explain:v3:{q}:{opt}  │
        │  TTL: 24 hours              │
        │                             │
        │  USER SUMMARY CACHE:        │
        │  Key: user:{id}:dashboard   │
        │  TTL: 5 minutes             │
        │  (user_progress_summary)    │
        │                             │
        │  RATE LIMIT BUCKETS:        │
        │  Key: rl:{user_id}:{type}   │
        │  TTL: 1 hour (sliding)      │
        │                             │
        │  SCORE PREDICTION CACHE:    │
        │  Key: score:{user_id}       │
        │  TTL: Until session ends    │
        │                             │
        │  HIT RATE: ~35% for expls.  │
        │  LATENCY: 5–15ms            │
        └──────────────┬──────────────┘
                       │ MISS
        ┌──────────────▼──────────────┐
        │       L3: POSTGRES          │
        │   (Supabase — primary DB)   │
        │                             │
        │  What's cached here:        │
        │                             │
        │  EXPLANATION CACHE TABLE:   │
        │  cache.ai_explanations      │
        │  (permanent until flagged)  │
        │                             │
        │  USER PROGRESS SUMMARY:     │
        │  user_progress_summary      │
        │  (maintained — not computed)│
        │                             │
        │  STUDY PLAN:                │
        │  study_plans                │
        │  (AI generates, stores here)│
        │                             │
        │  HIT RATE: ~22% of expls.   │
        │  LATENCY: 10–30ms           │
        └──────────────┬──────────────┘
                       │ MISS
        ┌──────────────▼──────────────┐
        │       AI API CALL           │
        │    (Claude claude-sonnet-4-6)    │
        │                             │
        │  TRUE CACHE MISS:           │
        │  New unique request, no     │
        │  matching cached output     │
        │                             │
        │  Occurs for:                │
        │  • New questions being      │
        │    answered for first time  │
        │  • Unique essay evaluations │
        │  • Live tutor messages      │
        │  • New study plan requests  │
        │                             │
        │  After generation:          │
        │  Write back to L3, L2, L1  │
        │  (appropriate TTL per type) │
        │                             │
        │  HIT RATE: ~3% of expls.    │
        │  LATENCY: 1,500–8,000ms     │
        └─────────────────────────────┘

CACHE KEY TAXONOMY:
┌──────────────────────────────────────────────────┬───────────┬──────────┐
│ Key Pattern                                       │ Layer     │ TTL      │
├──────────────────────────────────────────────────┼───────────┼──────────┤
│ explain:v3:{question_id}:{option_idx}            │ L2 + L3   │ ∞ / 24h  │
│ session:{session_id}:memory                      │ L2        │ 4h       │
│ user:{user_id}:dashboard                         │ L2        │ 5min     │
│ user:{user_id}:knowledge_states                  │ L2        │ 30min    │
│ vocab:due:{user_id}                              │ L2        │ 15min    │
│ plan:active:{user_id}                            │ L2        │ 1h       │
│ taxonomy:skills:all                              │ L1        │ 1h       │
│ rl:{user_id}:tutor                               │ L2        │ 1h       │
│ rl:{user_id}:explain                             │ L2        │ 1h       │
│ rl:platform:api_calls                            │ L2        │ 1h       │
│ score:predict:{user_id}                          │ L2        │ 30min    │
│ questions:{skill_id}:{level}:{difficulty_band}   │ L2        │ 2h       │
└──────────────────────────────────────────────────┴───────────┴──────────┘

CACHE INVALIDATION RULES:
  INVALIDATE user:{id}:dashboard WHEN:
  → study_sessions.status changes to 'completed'
  → user_progress_summary.updated_at changes
  
  INVALIDATE explain:{q}:{opt} WHEN:
  → cache.ai_explanations.needs_regeneration set to TRUE
  → quality_score drops below 2.0 after review
  
  INVALIDATE vocab:due:{id} WHEN:
  → user_vocabulary_reviews INSERT for this user
  
  INVALIDATE plan:active:{id} WHEN:
  → study_plans UPDATE for this user
  → exam_date changes
  
  INVALIDATE user:{id}:knowledge_states WHEN:
  → knowledge_states UPDATE for any skill of this user

CACHE WARM-UP STRATEGY (on deployment):
  BATCH 1 — Explanation cache warm-up (highest priority):
  → Fetch top 1,000 questions by times_answered DESC
  → For each: generate explanations for top 2 wrong options
  → 2,000 API calls × $0.003 = $6 warm-up cost
  → After warm-up: ~85% of explanation requests are cache hits
  
  BATCH 2 — Question bank pre-loading:
  → Pre-compute and cache question sets per (skill, level, difficulty_band)
  → Eliminates DB query for adaptive selection (serve from L2)
  → Cache 200 question sets: negligible cost
  
  BATCH 3 — Vocabulary embeddings:
  → Generate embeddings for all vocabulary_items (10,000 items)
  → 500K tokens × $0.02/1M = $0.01 one-time cost
  → Store in pgvector — permanent until word content changes
```

---

## PART 7 — COST OPTIMIZATION ARCHITECTURE

### Token Budget Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TOKEN BUDGET MANAGEMENT SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────────┘

MONTHLY TOKEN BUDGET (target: $300/month at 10,000 MAU)
  $300 / $0.003 per 1K input tokens ≈ 100M input tokens/month budget
  At 10,000 MAU: 10,000 tokens/user/month budget

PER-FEATURE TOKEN BUDGET (monthly per user):
┌───────────────────────────────┬──────────┬───────────────────────────────┐
│ Feature                       │ Budget   │ Optimization                  │
├───────────────────────────────┼──────────┼───────────────────────────────┤
│ Explanations (live AI)        │ 500      │ 97% cache hit → actual: 15    │
│ AI Tutor (30 turns/month)     │ 4,000    │ Context compression           │
│ Study Plan (1/month)          │ 1,200    │ Cached until triggered        │
│ Progress Report (4/month)     │ 3,200    │ Template for low-activity     │
│ Essay Evaluation (4/month)    │ 1,200    │ No cache (unique content)     │
│ Grammar Analysis              │ 600      │ Partial cache on common text  │
├───────────────────────────────┼──────────┼───────────────────────────────┤
│ TOTAL                         │ 10,700   │ Within 10,000 budget          │
└───────────────────────────────┴──────────┴───────────────────────────────┘

PROMPT COMPRESSION TECHNIQUES:
  1. Abbreviate skill names in context:
     "אוצר מילים (vocabulary)" → "vocab"
     Saves ~3 tokens per skill × 10 skills = 30 tokens per call

  2. Compress knowledge state injection:
     Full format: "Student has mastered 45% of vocabulary root identification skill"
     Compressed: "vocab.root_id: 0.45"
     Saves ~12 tokens per skill × 10 skills = 120 tokens

  3. Strip redundant instructions from repeated system prompts:
     Cache compiled system prompt token count
     Alert if system prompt > 1,600 tokens (compression review)

  4. Truncate conversation history aggressively:
     Keep only last 3 turns verbatim (not 5)
     Compress turns 4-6 to 1 sentence each
     Saves ~800 tokens per tutor call

MODEL SELECTION DECISION TREE:
  ┌────────────────────────────────────────────────────────────────────┐
  │  IS THIS A LANGUAGE/UNDERSTANDING TASK?                           │
  │           │                                                        │
  │     YES   │   NO → Use statistical/rule-based (free)              │
  │           ▼                                                        │
  │  IS QUALITY CRITICAL? (essay, plan, narrative)                    │
  │           │                                                        │
  │     YES   │   NO → Consider cheaper model tier                    │
  │           ▼                                                        │
  │  IS IT CACHED OR CACHEABLE?                                       │
  │           │                                                        │
  │     YES   │   NO (live conversation, unique essay)                │
  │  Serve cache ← → Use claude-sonnet-4-6 (best quality)            │
  └────────────────────────────────────────────────────────────────────┘

TASK-TO-MODEL ROUTING:
┌─────────────────────────────────┬──────────────────┬──────────────────┐
│ Task                            │ Model            │ Reason           │
├─────────────────────────────────┼──────────────────┼──────────────────┤
│ Explanation generation          │ claude-sonnet-4-6     │ Cached → rarely │
│                                 │ (or cached)      │ actually called  │
│ AI Tutor conversation           │ claude-sonnet-4-6     │ Quality critical│
│ Essay evaluation                │ claude-sonnet-4-6     │ Nuanced feedback│
│ Study plan generation           │ claude-sonnet-4-6     │ Complex planning│
│ Progress report narrative       │ claude-sonnet-4-6     │ Human-quality   │
│ Grammar analysis                │ claude-sonnet-4-6     │ Accuracy critical│
│ Bridge insight generation       │ claude-sonnet-4-6     │ Linguistic prec.│
│ Score prediction                │ None (formula)   │ Pure math        │
│ Item selection                  │ None (IRT+BKT)   │ Pure math        │
│ Knowledge state update          │ None (BKT)       │ Pure math        │
│ Vocabulary embedding query      │ Local or OAI     │ Low latency      │
│ Session summary (post-session)  │ claude-sonnet-4-6     │ Short, cached   │
│ Notification content            │ Template only    │ No AI needed     │
│ Achievement evaluation          │ Rule-based       │ Deterministic    │
└─────────────────────────────────┴──────────────────┴──────────────────┘

COST ANOMALY DETECTION:
  → Track daily AI cost in analytics.platform_daily
  → Alert if: daily_ai_cost > 2× rolling_7_day_avg
  → Alert if: cache_hit_rate < 85% (explanation cache degraded)
  → Auto-throttle if: hourly_api_calls > 80% of rate limit
  → Report: weekly cost attribution by feature
```

---

## PART 8 — RATE LIMITING ARCHITECTURE

### Multi-Level Rate Limiting

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING SYSTEM                                    │
└─────────────────────────────────────────────────────────────────────────────┘

LEVEL 1: ANTHROPIC API LIMITS (hard ceiling — external)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  claude-sonnet-4-6 rate limits (Anthropic):                              │
  │  • 500,000 input tokens/minute                                       │
  │  • 5,000,000 input tokens/day                                        │
  │  • 4,000 requests/minute                                             │
  │                                                                      │
  │  Platform response to limit approach:                                │
  │  → 70% of limit: log warning                                        │
  │  → 85% of limit: activate aggressive caching (extend TTLs)         │
  │  → 95% of limit: queue non-critical requests (reports, plans)      │
  │  → 100% of limit: serve fallback for all non-critical features     │
  └──────────────────────────────────────────────────────────────────────┘

LEVEL 2: PLATFORM-WIDE LIMITS (enforce in middleware)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  STORED IN: Redis key `rl:platform:{feature}:{window}`              │
  │                                                                      │
  │  Feature          Limit/hour    Window    Enforcement               │
  │  ─────────────── ─────────── ────────── ─────────────────          │
  │  explanations     5,000        rolling   Queue + serve cache        │
  │  tutor messages   2,000        rolling   Queue + degrade            │
  │  essay evals      200          rolling   Queue (non-real-time)     │
  │  study plans      500          rolling   Queue                     │
  │  progress reports 300          rolling   Queue                     │
  │  embeddings       10,000       rolling   Local model fallback      │
  └──────────────────────────────────────────────────────────────────────┘

LEVEL 3: PER-USER LIMITS (enforce per user_id)
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Algorithm: Token Bucket (refill continuously, not fixed windows)   │
  │  Storage: Redis KV `rl:{user_id}:{feature}`                        │
  │                                                                      │
  │  Feature           Capacity   Refill Rate   On Exceed              │
  │  ───────────────── ──────── ─────────────── ──────────────────     │
  │  live explanations    100    10/minute        Serve cache/template │
  │  tutor messages        30    1/minute          Queue + notify      │
  │  essay evaluations      3    1/day             Queue to tomorrow   │
  │  study plans            3    1/week            Return current plan │
  │  progress reports       5    1/day             Return last report  │
  │  placement tests        2    1/month           Block (explain why) │
  └──────────────────────────────────────────────────────────────────────┘

LEVEL 4: ADAPTIVE THROTTLING
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Detect unusual usage patterns:                                      │
  │                                                                      │
  │  TRIGGER 1: User answers > 200 questions/hour                      │
  │  → Likely automated/botting                                         │
  │  → Action: CAPTCHA + suspend adaptive session                      │
  │                                                                      │
  │  TRIGGER 2: Essay submitted every < 60 seconds                     │
  │  → Likely testing system, not learning                              │
  │  → Action: 10-minute cooldown between submissions                  │
  │                                                                      │
  │  TRIGGER 3: Tutor receives identical messages                       │
  │  → Likely prompt injection attempt                                  │
  │  → Action: Log for review + serve generic response                 │
  │                                                                      │
  │  TRIGGER 4: IP sends > 10 different user requests/minute           │
  │  → Likely account farming or automated scraping                    │
  │  → Action: IP-level rate limit, alert security                     │
  └──────────────────────────────────────────────────────────────────────┘

RATE LIMIT COMMUNICATION TO USER:
  → Tutor limited: "أنهيت جلساتك اليوم — عد غداً للمزيد 🌙"
                   (You've finished today's sessions — come back tomorrow)
  → Explanation limited: Serve cached version silently
  → Essay limited: "يمكنك تقديم مقالة أخرى غداً 📝"
  → Never show technical error messages to users
  → Never reveal rate limit numbers to users
```

---

## PART 9 — FALLBACK LOGIC ARCHITECTURE

### Cascading Fallback System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASCADING FALLBACK CHAINS                               │
└─────────────────────────────────────────────────────────────────────────────┘

FALLBACK CHAIN 1: EXPLANATION GENERATION
  ┌────────────────────────────────────────────────────────────────────┐
  │  ATTEMPT 1: Cache Lookup (L2 Redis + L3 Postgres)                 │
  │  SUCCESS → return cached explanation                               │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 2: Claude API Generation                                  │
  │  SUCCESS → cache + return                                          │
  │  FAIL (API error / timeout) ↓                                     │
  │                                                                    │
  │  ATTEMPT 3: Retry with 2s delay (single retry)                   │
  │  SUCCESS → cache + return                                          │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 4: Partial template fallback                              │
  │  → Retrieve: correct_option_text_he from DB                       │
  │  → Retrieve: skill.arabic_bridge_insight from DB                  │
  │  → Construct template:                                             │
  │    "الإجابة الصحيحة هي {correct_answer}."                         │
  │    "تذكير: {arabic_bridge_insight}"                               │
  │    "راجع قاعدة {skill.name_ar} لفهم أعمق."                       │
  │  → Mark for async regeneration (add to queue)                     │
  │  → Return template (graceful degradation)                         │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 5: Generic explanation                                    │
  │  → "الإجابة الصحيحة هي: {correct_option}. راجع درس {skill_name}" │
  │  → No AI at all — pure text construction                          │
  │  → Log: explanation_fallback_count metric                         │
  └────────────────────────────────────────────────────────────────────┘

FALLBACK CHAIN 2: AI TUTOR
  ┌────────────────────────────────────────────────────────────────────┐
  │  ATTEMPT 1: Claude API (streaming)                                 │
  │  SUCCESS → stream response                                         │
  │  FAIL (API error, rate limit) ↓                                   │
  │                                                                    │
  │  ATTEMPT 2: Retry once after 2 seconds                            │
  │  SUCCESS → stream response                                         │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 3: Check if question is about a specific skill           │
  │  → IF skill detected: return grammar_rules.explanation_ar         │
  │  → Plus: "سيعود المساعد قريباً. في هذه الأثناء، إليك الشرح:"     │
  │  → Redirect to Grammar reference page                             │
  │  FAIL (no skill detected) ↓                                       │
  │                                                                    │
  │  ATTEMPT 4: Semantic search for relevant content                  │
  │  → Embed user question (local model)                              │
  │  → Retrieve top grammar rule or vocabulary item                   │
  │  → Present as: "ربما تقصد هذا:" + retrieved content              │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 5: Service degradation message                           │
  │  → "نعتذر — المساعد الذكي مؤقتاً غير متاح."                     │
  │  → "يمكنك التدرب عادياً أو مراجعة قواعد النحو."                  │
  │  → Show grammar reference link                                    │
  │  → Queue user message for async processing + notify when ready    │
  └────────────────────────────────────────────────────────────────────┘

FALLBACK CHAIN 3: STUDY PLAN GENERATION
  ┌────────────────────────────────────────────────────────────────────┐
  │  ATTEMPT 1: Claude API generation                                  │
  │  SUCCESS → store + return                                          │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 2: Use previous active plan (if exists and < 2 weeks old)│
  │  → Return existing plan with banner: "خطتك الحالية (تحديث قريباً)"│
  │  → Queue plan generation for background processing               │
  │  FAIL (no existing plan) ↓                                        │
  │                                                                    │
  │  ATTEMPT 3: Rule-based plan generator                              │
  │  → Select top 5 skills by priority_score (pure SQL)              │
  │  → Distribute skills across available days (round-robin algorithm)│
  │  → No AI narrative, just structured session recommendations       │
  │  → Mark as system_generated: true (different UI treatment)        │
  └────────────────────────────────────────────────────────────────────┘

FALLBACK CHAIN 4: SCORE PREDICTION
  ┌────────────────────────────────────────────────────────────────────┐
  │  ATTEMPT 1: Full prediction model (weighted knowledge states)      │
  │  Always succeeds (pure math) → return score                       │
  │                                                                    │
  │  EDGE CASE: < 5 knowledge states (new user, minimal data)        │
  │  → Use placement test score directly if available                 │
  │  → Show wider confidence interval (±15 instead of ±8)            │
  │  → Label as: "تقدير أولي — سيتحسن بعد المزيد من التدريب"         │
  └────────────────────────────────────────────────────────────────────┘

FALLBACK CHAIN 5: ESSAY EVALUATION
  ┌────────────────────────────────────────────────────────────────────┐
  │  ATTEMPT 1: Claude API evaluation                                  │
  │  SUCCESS → return evaluation                                       │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 2: Retry after 5 second delay                            │
  │  SUCCESS → return                                                  │
  │  FAIL ↓                                                            │
  │                                                                    │
  │  ATTEMPT 3: Queue for async processing                             │
  │  → Save essay, mark status = 'feedback_pending'                   │
  │  → Run evaluation in background (cron every 10 min)               │
  │  → Notify user via push: "تقييم مقالتك جاهز"                     │
  │  → NEVER return partial or fake evaluation                        │
  └────────────────────────────────────────────────────────────────────┘

GLOBAL ERROR HANDLING:
  ALL AI pipeline errors →
  1. Log to Sentry (error type, model, prompt version, latency)
  2. Increment platform error counter in Redis
  3. If error_rate > 5%/minute: trigger PagerDuty alert
  4. If error_rate > 20%/minute: activate full degradation mode
     (serve all cached, queue all new AI requests)
  5. User-facing message: Arabic only, friendly, no technical details
```

---

## PART 10 — COMPLETE AI PIPELINE MAP

### End-to-End Data Flow

```
╔══════════════════════════════════════════════════════════════════════════════╗
║               COMPLETE AI PIPELINE — DATA FLOW DIAGRAM                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  USER ACTION                                                                 ║
║      │                                                                       ║
║      ├─[SIGNUP]──────────────────────────────────────────────────────────── ║
║      │   └── Profile creation → No AI                                       ║
║      │                                                                       ║
║      ├─[PLACEMENT TEST]──────────────────────────────────────────────────── ║
║      │   └── 20 Qs → IRT (Layer 3) → Knowledge States → Plan Generation   ║
║      │         ↳ Claude API (plan only, 1 call = $0.045)                   ║
║      │                                                                       ║
║      ├─[PRACTICE SESSION]─────────────────────────────────────────────────  ║
║      │   QUESTION N:                                                         ║
║      │   ┌─ Item Selection (BKT+IRT, free)                                  ║
║      │   ├─ Display question                                                 ║
║      │   ├─ Record answer (DB write)                                         ║
║      │   ├─ BKT Update (Edge Function, free)                                ║
║      │   ├─ Score Delta Computation (formula, free)                         ║
║      │   └─ IF WRONG:                                                        ║
║      │       └─ Explanation Pipeline                                         ║
║      │           ├─ L2 Cache (free)                                          ║
║      │           ├─ L3 Cache (free)                                          ║
║      │           └─ Claude API ($0.003, 3% of cases)                        ║
║      │                                                                       ║
║      │   ON SESSION END:                                                     ║
║      │   ├─ Stats computation (free)                                         ║
║      │   ├─ Progress summary update (DB, free)                               ║
║      │   ├─ Achievement evaluation (rules, free)                             ║
║      │   ├─ XP award (formula, free)                                         ║
║      │   ├─ Streak update (rules, free)                                      ║
║      │   └─ Mission progress update (rules, free)                           ║
║      │                                                                       ║
║      ├─[VOCABULARY REVIEW]──────────────────────────────────────────────── ║
║      │   ├─ FSRS queue computation (algorithm, free)                         ║
║      │   ├─ Flash card display (DB, free)                                    ║
║      │   ├─ FSRS state update (algorithm, free)                              ║
║      │   └─ Semantic search for similar words (pgvector, free)              ║
║      │                                                                       ║
║      ├─[AI TUTOR]─────────────────────────────────────────────────────────  ║
║      │   ├─ Context assembly (DB query, free)                                ║
║      │   ├─ RAG retrieval (pgvector, free)                                   ║
║      │   ├─ Rate limit check (Redis, free)                                   ║
║      │   ├─ Claude API streaming ($0.014/turn)                              ║
║      │   └─ Knowledge update if confusion detected (DB, free)               ║
║      │                                                                       ║
║      ├─[ESSAY SUBMISSION]──────────────────────────────────────────────────  ║
║      │   ├─ Pre-processing validation (rules, free)                          ║
║      │   ├─ Claude API evaluation ($0.080)                                  ║
║      │   ├─ Grammar issue extraction (from JSON output, free)               ║
║      │   ├─ Knowledge state update (BKT, free)                              ║
║      │   └─ Notification trigger (free)                                      ║
║      │                                                                       ║
║      ├─[MOCK EXAM]──────────────────────────────────────────────────────── ║
║      │   ├─ Fixed-form question set (DB, free)                               ║
║      │   ├─ All answers recorded (batch, free)                               ║
║      │   ├─ Full IRT scoring (algorithm, free)                               ║
║      │   └─ Score prediction update (formula, free)                         ║
║      │                                                                       ║
║      └─[WEEKLY CRON]──────────────────────────────────────────────────────  ║
║          ├─ Daily aggregates computation (SQL, free)                         ║
║          ├─ Progress report generation (Claude API, $0.060/user)           ║
║          ├─ Study plan rebalancing check (algorithm, free)                  ║
║          │   └─ IF rebalance needed: Claude API ($0.045/user affected)     ║
║          ├─ Mission generation (rules, free)                                 ║
║          ├─ Streak risk evaluation (rules, free)                             ║
║          └─ Notification dispatch (rules, free)                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PART 11 — SEMANTIC SEARCH INFRASTRUCTURE

### Vector Index Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VECTOR INDEX ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

PGVECTOR CONFIGURATION:
  Extension: pgvector 0.7+
  Dimension: 1536 (text-embedding-3-small)

INDEXES:
  vocabulary_items:
    Type: IVFFLAT (lists=100 for 10K items, lists=500 for 100K)
    Probes: 10 (query-time: balance speed/recall)
    Operator: <=> (cosine distance)
    Expected recall: ~95% at probes=10
    Build time: ~30 seconds for 10K items
    Query time: ~20ms
    
  grammar_rules:
    Type: IVFFLAT (lists=10, only ~200 rules)
    Probes: 5
    Query time: <5ms
    
  passages:
    Type: IVFFLAT (lists=20 for ~500 passages)
    Probes: 5
    Query time: <10ms

  When > 100K vocabulary items (future):
    Type: HNSW (m=16, ef_construction=64)
    ef: 40 (query-time)
    Build time: ~5 minutes for 100K items
    Query time: ~5ms
    Higher memory usage: ~1.5GB for 100K × 1536-dim

SIMILARITY THRESHOLDS (calibrated on YAEL content):
  vocabulary semantic match:   cosine similarity > 0.80
  grammar rule match:          cosine similarity > 0.82
  passage topic match:         cosine similarity > 0.75
  cognate detection:           cosine distance < 0.20 (very close)
  related question clustering: cosine similarity > 0.75

HYBRID SEARCH (semantic + keyword):
  For vocabulary search (combines exact + semantic):
  
  STEP 1: Exact match (keyword):
  SELECT * FROM vocabulary_items
  WHERE word_he ILIKE '%{query}%' OR root_he = '{query}'
  LIMIT 5
  
  STEP 2: Semantic match (vector):
  SELECT * FROM vocabulary_items
  ORDER BY embedding <=> query_vector
  LIMIT 10
  
  STEP 3: Reciprocal Rank Fusion (merge results):
  score_merged = Σ (1 / (k + rank_in_list)) for each list
  Default k=60 (standard RRF parameter)
  
  FINAL: Return top 5 by merged score
```

---

## PART 12 — AI QUALITY ASSURANCE ARCHITECTURE

### Quality Control Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI QUALITY CONTROL SYSTEM                               │
└─────────────────────────────────────────────────────────────────────────────┘

AUTOMATED QUALITY CHECKS (every AI output):
  ┌──────────────────────────────────────────────────────────────────────┐
  │  CHECK 1: JSON SCHEMA VALIDATION                                    │
  │  → Parse response as JSON                                           │
  │  → Validate against versioned schema                                │
  │  → Check all required fields present                                │
  │  → Check field types correct                                        │
  │  → FAIL: trigger retry, then fallback                               │
  │                                                                     │
  │  CHECK 2: LANGUAGE DETECTION                                        │
  │  → Arabic fields: verify > 80% Arabic characters                   │
  │  → Hebrew fields: verify > 80% Hebrew characters                   │
  │  → FAIL: log and flag for review, serve previous version           │
  │                                                                     │
  │  CHECK 3: CONTENT PLAUSIBILITY                                      │
  │  → Explanation mentions question content (not hallucinated topic)  │
  │  → Linguistic bridge cites an actual root (exists in vocabulary DB)│
  │  → Score is within expected range for essay evaluation             │
  │  → FAIL: serve fallback, queue for manual review                   │
  │                                                                     │
  │  CHECK 4: SAFETY CHECK                                              │
  │  → No content outside educational domain detected                  │
  │  → No PII about student repeated back (privacy check)             │
  │  → No Hebrew error exposed as Arabic (cross-language contamination)│
  │  → FAIL: immediately discard, serve template                       │
  └──────────────────────────────────────────────────────────────────────┘

HUMAN QUALITY REVIEW QUEUE (admin panel):
  → Explanations flagged by users (user_explains.is_flagged = true)
  → Explanations with helpful_count / view_count < 0.4 (< 40% helpful rate)
  → Explanation quality_score < 3.0 (after admin review)
  → Tutor messages with detected_confusion signal
  → Essay evaluations with student_rating ≤ 2

FEEDBACK LOOP ARCHITECTURE:
  ┌──────────────────────────────────────────────────────────────────────┐
  │  USER SIGNAL: "Was this explanation helpful?" (thumbs up/down)     │
  │  → Increment helpful_count or unhelpful_count                      │
  │  → If unhelpful_count > 10 AND rate > 30%: flag for regeneration  │
  │                                                                     │
  │  ADMIN ACTION: Quality score 1–5 on explanation                    │
  │  → Score < 3: set needs_regeneration = true                        │
  │  → Score 5: mark as reference quality, never auto-replace          │
  │                                                                     │
  │  MODEL UPGRADE TRIGGER:                                             │
  │  → New Claude model released                                        │
  │  → Set needs_regeneration = true for all explanations with         │
  │    quality_score < 4 (keep high-quality ones)                      │
  │  → Background batch regeneration over 7 days                       │
  │  → A/B test: 10% of traffic gets new model, compare helpful rates  │
  └──────────────────────────────────────────────────────────────────────┘

PROMPT A/B TESTING FRAMEWORK:
  ┌──────────────────────────────────────────────────────────────────────┐
  │  WHEN: New prompt version deployed                                   │
  │                                                                     │
  │  ASSIGNMENT: user_id hash → group A (50%) or group B (50%)        │
  │  TRACKED: helpful_count, unhelpful_count, student_rating           │
  │  DURATION: 2 weeks minimum (significance threshold)                │
  │  DECISION: Statistical test (proportion Z-test, α=0.05)            │
  │  PROMOTION: Winner becomes default, stored as new major version    │
  │                                                                     │
  │  PROTECTED: High-value explanations (quality_score=5) never        │
  │             assigned to B group — only new questions get tested    │
  └──────────────────────────────────────────────────────────────────────┘
```

---

## PART 13 — SCORE PREDICTION MODEL

### Statistical Score Prediction (No API Required)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCORE PREDICTION MODEL                                   │
│                    (100% Statistical — Zero API Cost)                      │
└─────────────────────────────────────────────────────────────────────────────┘

MODEL ARCHITECTURE: Weighted Bayesian Score Predictor

INPUTS:
  • knowledge_states[skill_id].mastery_probability for all skills
  • skills[skill_id].exam_weight (% of section)
  • skills[skill_id].section (which YAEL section)
  • YAEL section weights (reading=35%, vocab=30%, grammar=20%, completion=15%)
  • question_attempts: accuracy × question_difficulty (IRT calibration)
  • sessions: recent trend (last 7 days vs. prior 7 days)

STEP 1: SECTION SCORE COMPUTATION
  For each section S:
    section_raw_score(S) = Σ[ mastery(skill_i) × exam_weight(skill_i) ]
                           for all skill_i IN section S
    
    section_score(S) = map_to_yael_scale(
      section_raw_score(S),
      section = S
    )
    // Mapping: [0,1] raw mastery → [50, 150] YAEL-equivalent score
    // Calibrated against known exam data points

STEP 2: COMPOSITE SCORE COMPUTATION
  composite_raw = Σ[ section_score(S) × section_weight(S) ]
                  for all sections S
  
  composite_score = clip(composite_raw, 0, 150)

STEP 3: IRT CALIBRATION ADJUSTMENT
  // Adjust raw prediction with empirical IRT performance
  irt_theta_estimate = mean(knowledge_states.irt_theta for active skills)
  irt_expected_score = irt_to_yael_scale(irt_theta_estimate)
  
  // Blend BKT-based and IRT-based estimates
  final_score = 0.7 × composite_score + 0.3 × irt_expected_score

STEP 4: CONFIDENCE INTERVAL
  // More attempts → narrower confidence interval
  total_attempts = Σ knowledge_states[skill].attempts_count
  
  base_uncertainty = 15 points (very few data)
  uncertainty = base_uncertainty / sqrt(total_attempts / 100)
  uncertainty = clip(uncertainty, 3, 20)  // Between 3 and 20 points
  
  confidence_low = final_score - uncertainty
  confidence_high = final_score + uncertainty

STEP 5: TREND ADJUSTMENT
  // If student is rapidly improving, project forward
  week1_score = avg score prediction 7-14 days ago
  week2_score = avg score prediction 0-7 days ago
  delta_per_week = week2_score - week1_score
  
  IF delta_per_week > 2:  // Improving
    trend_boost = min(delta_per_week × 0.5, 5)  // Max +5 boost
    final_score = final_score + trend_boost

OUTPUT:
  {
    predicted_score: 91.4,
    confidence_low: 86.8,
    confidence_high: 96.0,
    section_scores: {
      reading: 94.2,
      vocabulary: 88.7,
      grammar: 79.1,
      sentence_completion: 96.4,
      reconstruction: null
    },
    prediction_basis: {
      bkt_weight: 0.7,
      irt_weight: 0.3,
      total_attempts: 847,
      uncertainty_level: "medium",
      trend_direction: "improving",
      trend_delta_per_week: 3.2
    }
  }

ACCURACY IMPROVEMENT OVER TIME:
  → actual_exam_score column filled when student reports real score
  → prediction_error = ABS(predicted - actual) per user
  → Monthly: analyze residuals, re-calibrate section weights
  → Target prediction accuracy: ±8 points (YAEL scale)
  
CALIBRATION VALIDATION:
  Model is validated against:
  1. Placement test scores (internal baseline)
  2. Mock exam scores (internal, authentic format)
  3. Reported actual exam scores (gold standard)
  
  MAE target: < 8.0 YAEL points
  RMSE target: < 12.0 YAEL points
```

---

## ARCHITECTURE SUMMARY

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    INTELLIGENT TUTORING SYSTEM                              ║
║                        ARCHITECTURE SUMMARY                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  10 AI SUBSYSTEMS              3 ARE STATISTICAL (free)                     ║
║                                7 USE CLAUDE API (cached)                    ║
║                                                                              ║
║  4 CACHE LAYERS                L0: CDN Edge (static AI content)             ║
║                                L1: Function memory (taxonomy)               ║
║                                L2: Redis (hot explanations)                 ║
║                                L3: Postgres (permanent cache)               ║
║                                                                              ║
║  3 MEMORY TYPES                Working (token window)                       ║
║                                Session (Redis KV)                           ║
║                                Long-term (structured Postgres)              ║
║                                                                              ║
║  5 VECTOR SEARCH PATTERNS      Vocab bridge · Grammar retrieval             ║
║                                Similar questions · Passage topic            ║
║                                Root cognate family                          ║
║                                                                              ║
║  5 FALLBACK CHAINS             Explanation · Tutor · Plan                   ║
║                                Score · Essay                                ║
║                                                                              ║
║  COST AT 10K MAU               ~$300/month total AI cost                    ║
║  COST PER USER/MONTH           ~$0.03 (with cache optimization)             ║
║  EXPLANATION CACHE HIT RATE    97%                                          ║
║  SCORE PREDICTION COST         $0.000 (pure mathematics)                    ║
║  ADAPTIVE SELECTION COST       $0.000 (IRT + Thompson Sampling)            ║
║                                                                              ║
║  SINGLE DIFFERENTIATOR:        Arabic-Hebrew Semitic bridge                 ║
║  injected into every prompt, retrieval result, and explanation.             ║
║  Not one feature — the pedagogical DNA of the entire system.               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*The architecture above treats AI not as a feature, but as infrastructure — invisible when working, transformative in its outcomes. Every component serves one mission: maximizing the probability that an Arabic-speaking student walks out of the YAEL exam with 120+.*