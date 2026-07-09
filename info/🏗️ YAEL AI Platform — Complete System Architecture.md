# 🏗️ YAEL AI Platform — Complete System Architecture

*Prepared by: Lead Software Architect · Senior UX Designer · Senior PM · AI Systems Engineer*

---

## 0. FOUNDATIONAL PHILOSOPHY

Before architecture, three non-negotiable truths that shape every decision:

> **Truth 1:** Arabic and Hebrew are sister Semitic languages. The platform's deepest competitive advantage is treating Arabic not as an obstacle, but as the **cognitive scaffolding** upon which Hebrew mastery is built.

> **Truth 2:** The goal is not "teaching Hebrew." The goal is **engineering a 120+ score with maximum probability in minimum time.** Every feature must be justified against that outcome.

> **Truth 3:** Free must mean genuinely free — not "free trial." The architecture must be cost-efficient enough to operate near-zero cost at thousands of users, scaling without a paywall decision.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         YAEL AI PLATFORM                                ║
║                    "من صفر إلى 120+" · מאפס ל-120                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐    ║
║  │                     PRESENTATION LAYER                          │    ║
║  │         Next.js 14 App Router  ·  PWA  ·  RTL-First            │    ║
║  │         Arabic UI  ·  Accessible  ·  Mobile-First               │    ║
║  └───────────────────────────┬─────────────────────────────────────┘    ║
║                              │                                           ║
║  ┌───────────────────────────▼─────────────────────────────────────┐    ║
║  │                    APPLICATION LAYER                            │    ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │    ║
║  │  │  Auth &  │ │ Session  │ │ Adaptive │ │   Content        │  │    ║
║  │  │  Identity│ │  Engine  │ │  Engine  │ │   Delivery       │  │    ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │    ║
║  └───────────────────────────┬─────────────────────────────────────┘    ║
║                              │                                           ║
║  ┌───────────────────────────▼─────────────────────────────────────┐    ║
║  │                   INTELLIGENCE LAYER                            │    ║
║  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐  │    ║
║  │  │  Knowledge   │ │  Score       │ │  AI Explanation        │  │    ║
║  │  │  Tracing     │ │  Prediction  │ │  & Tutoring Engine     │  │    ║
║  │  └──────────────┘ └──────────────┘ └────────────────────────┘  │    ║
║  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐  │    ║
║  │  │  Next-Item   │ │  Study Plan  │ │  Linguistic Bridge     │  │    ║
║  │  │  Selector    │ │  Generator   │ │  (AR ↔ HE Engine)      │  │    ║
║  │  └──────────────┘ └──────────────┘ └────────────────────────┘  │    ║
║  └───────────────────────────┬─────────────────────────────────────┘    ║
║                              │                                           ║
║  ┌───────────────────────────▼─────────────────────────────────────┐    ║
║  │                      DATA LAYER                                 │    ║
║  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │    ║
║  │  │ Question │ │  User    │ │  Vocab   │ │   Explanation    │  │    ║
║  │  │   Bank   │ │ Progress │ │  Engine  │ │     Cache        │  │    ║
║  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │    ║
║  └─────────────────────────────────────────────────────────────────┘    ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 2. TECHNOLOGY STACK & RATIONALE

Every choice is justified by: **cost · scalability · maintainability · performance.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY DECISIONS                            │
├─────────────────┬───────────────────────────┬───────────────────────────┤
│ LAYER           │ CHOICE                    │ RATIONALE                 │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Frontend        │ Next.js 14 (App Router)   │ SSR + ISR reduces AI API  │
│                 │ TypeScript                 │ calls. RTL native. Best   │
│                 │                           │ DX, largest ecosystem.    │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Styling         │ Tailwind CSS              │ RTL utilities built-in.   │
│                 │ CSS Variables             │ No runtime cost. Design   │
│                 │ shadcn/ui primitives       │ tokens for consistency.   │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ State           │ Zustand (client)          │ Lightweight. No boiler-   │
│                 │ TanStack Query (server)   │ plate. Cache + sync built │
│                 │                           │ into Query layer.         │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Database        │ Supabase (Postgres)       │ Free tier → scales cheap. │
│                 │ + pgvector extension      │ RLS = security built-in.  │
│                 │                           │ Realtime subscriptions.   │
│                 │                           │ Vector search for vocab.  │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Auth            │ Supabase Auth             │ JWT + RLS. Google OAuth.  │
│                 │                           │ Zero extra cost.          │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ AI — Primary    │ Claude API (Anthropic)    │ Best Arabic+Hebrew        │
│                 │ (claude-sonnet-4-6)       │ reasoning. Explanations   │
│                 │                           │ leverage Semitic insight. │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ AI — Embeddings │ text-embedding-3-small    │ $0.02/1M tokens. 1536-dim │
│                 │ (OpenAI) OR              │ stored in pgvector for    │
│                 │ Transformers.js (local)   │ semantic vocabulary match │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Hosting         │ Vercel                    │ Edge network. Free tier.  │
│                 │                           │ Scales to zero when idle. │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ CDN / Assets    │ Vercel Edge + Supabase    │ Audio files for pronun-   │
│                 │ Storage                   │ ciation served globally.  │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Caching         │ Vercel KV (Redis)         │ AI explanation cache.     │
│                 │                           │ Session state. Score      │
│                 │                           │ prediction cache.         │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Monitoring      │ Vercel Analytics          │ Free tier covers MVP.     │
│                 │ Sentry (errors)           │ Performance + error       │
│                 │                           │ tracking free tier.       │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ PWA / Offline   │ next-pwa + Workbox        │ Service worker for        │
│                 │                           │ offline practice. No      │
│                 │                           │ internet required for     │
│                 │                           │ cached content.           │
└─────────────────┴───────────────────────────┴───────────────────────────┘
```

### Cost Architecture at Scale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COST PROJECTION                                       │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│ USERS (MAU)          │ MONTHLY INFRA COST   │ COST PER USER             │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ 0 – 1,000            │ ~$0                  │ $0.00                     │
│ 1,000 – 10,000       │ ~$25                 │ $0.0025                   │
│ 10,000 – 50,000      │ ~$150                │ $0.003                    │
│ 50,000+              │ ~$500 + AI costs     │ $0.01                     │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│ AI COST STRATEGY: 85% of explanations are cache hits (same questions    │
│ answered wrong by many users). Live AI calls: ~$0.003 per unique miss.  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPLETE FEATURE MAP

```
YAEL AI PLATFORM
│
├── 🚪 ONBOARDING & PLACEMENT
│   ├── Welcome flow (Arabic-first, with Hebrew warmth)
│   ├── Goal setting (target score, exam date, daily time)
│   ├── Adaptive placement test (20 questions, IRT-calibrated)
│   ├── Initial knowledge state calculation
│   ├── Score baseline estimation
│   └── Personalized study plan generation
│
├── 🏠 DASHBOARD (Central Intelligence Hub)
│   ├── Today's mission card (what to study today and why)
│   ├── Live score predictor gauge (current → target)
│   ├── Days until exam countdown with readiness %
│   ├── Skill heatmap (6 domains × 5 sub-skills each)
│   ├── Streak system (daily study streak)
│   ├── Weekly progress spark lines
│   └── Quick-start practice button
│
├── 🎯 ADAPTIVE PRACTICE ENGINE
│   ├── Session types:
│   │   ├── Targeted (AI chooses weakest skill)
│   │   ├── Mixed (balanced across domains)
│   │   ├── Speed (timed, exam pressure training)
│   │   └── Review (spaced repetition of past errors)
│   ├── Question display (YAEL-authentic format)
│   ├── Real-time difficulty adjustment
│   ├── Confidence rating after each answer
│   ├── Instant feedback with Arabic explanation
│   ├── "Why was I wrong?" AI explanation
│   ├── Arabic-Hebrew linguistic bridge hints
│   └── Session summary with cognitive insights
│
├── 📖 YAEL EXAM SECTIONS
│   ├── הבנת הנקרא (Reading Comprehension)
│   │   ├── Literary texts
│   │   ├── Journalistic texts
│   │   ├── Scientific/academic texts
│   │   └── Expository texts
│   ├── אוצר מילים (Vocabulary)
│   │   ├── Context-based meaning
│   │   ├── Synonym/antonym
│   │   ├── Root identification (שורש)
│   │   └── Register appropriateness
│   ├── דקדוק (Grammar)
│   │   ├── Binyanim (verb patterns)
│   │   ├── Tense/aspect
│   │   ├── Agreement (gender/number)
│   │   └── Sentence structure
│   ├── השלמת משפטים (Sentence Completion)
│   │   ├── Logical completion
│   │   ├── Grammatical completion
│   │   └── Contextual completion
│   └── YAEL 4–5: שחזור טקסט (Text Reconstruction)
│
├── 📚 VOCABULARY INTELLIGENCE SYSTEM
│   ├── Arabic-Hebrew root bridge explorer
│   │   ├── Semitic root comparison (ש-ל-מ / س-ل-م)
│   │   ├── Cognate identification
│   │   └── False friend warnings
│   ├── FSRS spaced repetition algorithm
│   ├── Flashcard system (Hebrew → Arabic / context)
│   ├── Frequency-ranked word lists (by YAEL level)
│   ├── Word family trees (all binyan forms)
│   ├── Audio pronunciation (by native Israeli speaker)
│   └── Contextual usage examples from real texts
│
├── 🤖 AI TUTOR (HaTutor — המורה)
│   ├── Conversational tutoring in Arabic
│   ├── Context-aware (knows student's weak spots)
│   ├── Can explain any YAEL concept
│   ├── Comparative linguistics mode (AR ↔ HE)
│   ├── "Explain this text" for reading passages
│   ├── Grammar question answering
│   └── Motivational coaching mode
│
├── 📝 MOCK EXAM SYSTEM
│   ├── Full-length authentic YAEL simulations
│   ├── YAEL 1 / 2 / 3 / 4 / 5 variants
│   ├── Timed (exact YAEL conditions)
│   ├── Authentic question distribution
│   ├── Post-exam full analysis
│   ├── Comparison to predicted score
│   ├── Detailed section breakdowns
│   └── Highlighted questions for review
│
├── 📊 ANALYTICS & INSIGHTS
│   ├── Score trajectory graph
│   ├── Section-by-section breakdown
│   ├── Skill mastery heatmap
│   ├── Time-per-question analysis
│   ├── Error pattern analysis
│   ├── "Your biggest gains this week"
│   ├── Score prediction with confidence interval
│   └── Readiness assessment ("Are you ready to sit?")
│
├── 🗓️ STUDY PLAN ENGINE
│   ├── AI-generated personalized study calendar
│   ├── Daily session recommendations
│   ├── Adaptive rebalancing (after each session)
│   ├── Exam-day countdown optimization
│   └── Emergency plan ("Exam in 2 weeks" mode)
│
├── ⚙️ SETTINGS & PROFILE
│   ├── Arabic dialect preference (MSA / Egyptian / Levantine / Gulf)
│   ├── Target YAEL level
│   ├── Daily study time commitment
│   ├── Notification preferences
│   ├── Accessibility settings (font size, contrast)
│   └── Data export (progress report PDF)
│
└── 🛠️ ADMIN PANEL (Internal)
    ├── Question bank management
    ├── Content quality dashboard
    ├── User analytics (anonymized)
    ├── AI explanation review queue
    ├── A/B test management
    └── Platform health dashboard
```

---

## 4. DATABASE ARCHITECTURE

### Schema Overview

```
╔══════════════════════════════════════════════════════════════════════╗
║                     DATABASE ENTITY MAP                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────┐         ┌──────────────┐        ┌───────────────┐  ║
║  │    users    │────────▶│ user_profiles│───────▶│  study_plans  │  ║
║  └─────────────┘  1:1   └──────────────┘  1:1   └───────────────┘  ║
║        │                                                             ║
║        │ 1:N         ┌──────────────────┐                           ║
║        ├────────────▶│  study_sessions  │                           ║
║        │             └────────┬─────────┘                           ║
║        │                      │ 1:N                                 ║
║        │             ┌────────▼─────────┐      ┌────────────────┐  ║
║        │             │ question_attempts │─────▶│   questions    │  ║
║        │             └──────────────────┘ N:1  └───────┬────────┘  ║
║        │                                               │            ║
║        │ 1:N         ┌──────────────────┐             │ N:M        ║
║        ├────────────▶│ knowledge_states  │             ▼            ║
║        │             └──────────────────┘      ┌────────────────┐  ║
║        │                      │                │     skills     │  ║
║        │                      │ N:1            └───────┬────────┘  ║
║        │                      ▼                        │            ║
║        │             ┌──────────────────┐             │ hierarchy  ║
║        │             │   skills (same)  │◀────────────┘            ║
║        │                                                             ║
║        │ 1:N         ┌──────────────────┐      ┌────────────────┐  ║
║        └────────────▶│  vocab_reviews   │─────▶│  vocabulary    │  ║
║                       └──────────────────┘ N:1  └───────┬────────┘  ║
║                                                          │            ║
║                       ┌──────────────────┐             │            ║
║                       │  ai_explanations │◀────────────┘            ║
║                       │     (cache)      │                           ║
║                       └──────────────────┘                           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Table Definitions (Logical Schema)

```
TABLE: users
  id                 UUID PK
  email              TEXT UNIQUE NOT NULL
  created_at         TIMESTAMPTZ DEFAULT NOW()
  last_active_at     TIMESTAMPTZ
  is_admin           BOOLEAN DEFAULT FALSE

TABLE: user_profiles
  id                 UUID PK → users.id
  display_name       TEXT
  arabic_dialect     ENUM (msa, egyptian, levantine, gulf, moroccan, other)
  target_yael_level  SMALLINT (1–5)
  target_score       SMALLINT (DEFAULT 120)
  exam_date          DATE
  daily_study_min    SMALLINT (15/30/45/60/90)
  education_level    ENUM (high_school, undergraduate, other)
  ui_language        ENUM (ar, en, ru, fr, am)  -- for future expansion
  timezone           TEXT
  streak_count       INTEGER DEFAULT 0
  last_streak_date   DATE
  total_study_min    INTEGER DEFAULT 0
  onboarding_done    BOOLEAN DEFAULT FALSE

TABLE: skills
  id                 UUID PK
  parent_id          UUID → skills.id (NULL for top-level)
  section            ENUM (reading, vocabulary, grammar, completion, reconstruction)
  name_he            TEXT NOT NULL
  name_ar            TEXT NOT NULL
  level              SMALLINT (1=section, 2=topic, 3=skill, 4=microskill)
  yael_levels        INT[] (which YAEL levels test this skill)
  exam_weight        DECIMAL (% of exam score)
  arabic_bridge_note TEXT (key AR→HE insight for this skill)
  display_order      SMALLINT

TABLE: questions
  id                 UUID PK
  skill_id           UUID → skills.id
  yael_level         SMALLINT (1–5)
  difficulty         DECIMAL (0.0–1.0, IRT b-parameter)
  discrimination     DECIMAL (IRT a-parameter)
  guessing           DECIMAL (IRT c-parameter, default 0.25 for 4-choice)
  question_text_he   TEXT NOT NULL (the Hebrew question as shown on exam)
  passage_text_he    TEXT (for reading questions)
  options            JSONB (array of 4 options, Hebrew)
  correct_option     SMALLINT (0–3)
  root_word          TEXT (Hebrew root if vocabulary question)
  question_type      ENUM (mcq, passage_mcq, sentence_complete, reconstruction)
  tags               TEXT[]
  source_type        ENUM (original, adapted, official_sample)
  is_active          BOOLEAN DEFAULT TRUE
  times_answered     INTEGER DEFAULT 0
  correct_rate       DECIMAL (empirical difficulty, updates live)
  created_at         TIMESTAMPTZ
  created_by         UUID → users.id

TABLE: ai_explanations (CACHE — critical for cost control)
  id                 UUID PK
  question_id        UUID → questions.id
  option_chosen      SMALLINT (which wrong answer triggered this)
  explanation_ar     TEXT (Arabic explanation, AI-generated)
  explanation_he     TEXT (Hebrew reinforcement)
  linguistic_bridge  TEXT (Arabic-Hebrew insight)
  model_version      TEXT (which AI model generated)
  quality_score      DECIMAL (human-reviewed 0–5)
  generated_at       TIMESTAMPTZ
  view_count         INTEGER DEFAULT 0
  ── INDEX: (question_id, option_chosen) UNIQUE

TABLE: study_sessions
  id                 UUID PK
  user_id            UUID → users.id
  session_type       ENUM (targeted, mixed, speed, review, mock_exam, placement)
  yael_level         SMALLINT
  started_at         TIMESTAMPTZ
  ended_at           TIMESTAMPTZ
  duration_seconds   INTEGER
  questions_seen     INTEGER
  questions_correct  INTEGER
  score_before       DECIMAL (predicted score before session)
  score_after        DECIMAL (predicted score after session)
  focus_skill_id     UUID → skills.id (NULL if mixed)

TABLE: question_attempts
  id                 UUID PK
  session_id         UUID → study_sessions.id
  user_id            UUID → users.id (denormalized for query speed)
  question_id        UUID → questions.id
  option_chosen      SMALLINT
  is_correct         BOOLEAN
  time_spent_ms      INTEGER
  confidence_rating  SMALLINT (1–4: no idea / unsure / fairly sure / certain)
  hint_used          BOOLEAN DEFAULT FALSE
  explanation_viewed BOOLEAN DEFAULT FALSE
  attempted_at       TIMESTAMPTZ
  ── INDEX: (user_id, question_id) for deduplication
  ── INDEX: (user_id, attempted_at) for timeline

TABLE: knowledge_states
  id                 UUID PK
  user_id            UUID → users.id
  skill_id           UUID → skills.id
  mastery_p          DECIMAL (0.0–1.0, P(mastery) — BKT output)
  attempts           INTEGER DEFAULT 0
  correct            INTEGER DEFAULT 0
  last_practiced_at  TIMESTAMPTZ
  next_review_at     TIMESTAMPTZ (spaced repetition schedule)
  ease_factor        DECIMAL DEFAULT 2.5 (FSRS ease)
  stability          DECIMAL (FSRS stability parameter)
  difficulty_fsrs    DECIMAL (FSRS difficulty parameter)
  ── UNIQUE: (user_id, skill_id)

TABLE: score_predictions
  id                 UUID PK
  user_id            UUID → users.id
  predicted_score    DECIMAL
  confidence_low     DECIMAL
  confidence_high    DECIMAL
  section_scores     JSONB ({reading: 85, vocab: 70, grammar: 65, ...})
  computed_at        TIMESTAMPTZ
  session_id         UUID (what triggered this computation)
  ── INDEX: (user_id, computed_at DESC) for latest score

TABLE: vocabulary
  id                 UUID PK
  word_he            TEXT NOT NULL
  nikud_he           TEXT (vowelized form for pronunciation)
  root_he            TEXT (3–4 letter root)
  binyan             TEXT (verb pattern, if verb)
  translation_ar     TEXT NOT NULL
  root_ar            TEXT (Arabic cognate root, if exists)
  is_cognate         BOOLEAN (true if AR/HE roots match)
  false_friend_note  TEXT (if similar but different meaning)
  definition_he      TEXT (Hebrew definition for advanced learners)
  example_he         TEXT (example sentence in Hebrew)
  example_ar         TEXT (example sentence in Arabic)
  frequency_rank     INTEGER (1=most common on YAEL)
  yael_level         SMALLINT (when this word typically appears)
  skill_id           UUID → skills.id
  embedding          vector(1536) (for semantic search)
  audio_url          TEXT (pronunciation audio)
  tags               TEXT[]

TABLE: vocab_reviews (FSRS spaced repetition log)
  id                 UUID PK
  user_id            UUID → users.id
  vocab_id           UUID → vocabulary.id
  rating             SMALLINT (1=again, 2=hard, 3=good, 4=easy)
  reviewed_at        TIMESTAMPTZ
  next_review_at     TIMESTAMPTZ
  stability          DECIMAL
  difficulty_fsrs    DECIMAL
  elapsed_days       DECIMAL

TABLE: study_plans
  id                 UUID PK
  user_id            UUID → users.id
  generated_at       TIMESTAMPTZ
  exam_date          DATE
  daily_sessions     JSONB (array of {date, skill_ids, session_type, est_min})
  is_active          BOOLEAN DEFAULT TRUE
  completion_rate    DECIMAL

TABLE: ai_tutor_conversations
  id                 UUID PK
  user_id            UUID → users.id
  messages           JSONB (array of {role, content, timestamp})
  context_snapshot   JSONB (user's knowledge state at time of conversation)
  created_at         TIMESTAMPTZ
  last_message_at    TIMESTAMPTZ
  ── NOTE: Max 50 messages per conversation, then archive
```

### Database Design Principles

```
1. ROW LEVEL SECURITY (RLS) on every user-facing table
   → Users can ONLY read/write their own rows
   → Admin role bypasses RLS

2. EXPLANATION CACHE STRATEGY
   → ai_explanations has ~4 rows per question (one per wrong answer)
   → 1,000 questions × 3 wrong answers = 3,000 cached explanations
   → After warm-up: 95%+ cache hit rate → near-zero AI cost

3. VECTOR SEARCH
   → vocabulary.embedding enables "find words similar to this concept"
   → Enables: Arabic word → find Hebrew equivalents semantically

4. SOFT DELETES everywhere
   → deleted_at TIMESTAMPTZ instead of hard deletes
   → Never lose student data
```

---

## 5. AI / INTELLIGENCE PIPELINE

### Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI INTELLIGENCE PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT: Student answers a question                                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 1. RESPONSE RECORDING                                           │    │
│  │    question_id + option_chosen + time_ms + confidence           │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │ async (non-blocking)                     │
│  ┌───────────────────────────▼─────────────────────────────────────┐    │
│  │ 2. BAYESIAN KNOWLEDGE TRACING (BKT)                             │    │
│  │    For each skill touched by this question:                     │    │
│  │    P(mastery | evidence) = BKT update                           │    │
│  │    Parameters: P(learn), P(forget), P(slip), P(guess)          │    │
│  │    Output: Updated mastery probability per skill                │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│  ┌───────────────────────────▼─────────────────────────────────────┐    │
│  │ 3. SCORE PREDICTION ENGINE                                      │    │
│  │    Inputs: knowledge_states for all 30+ skills                  │    │
│  │    Formula: Σ(skill_mastery × skill_weight × section_weight)    │    │
│  │    × YAEL scoring scale calibration                             │    │
│  │    Output: Predicted score + 90% confidence interval            │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│  ┌───────────────────────────▼─────────────────────────────────────┐    │
│  │ 4. NEXT ITEM SELECTION (Thompson Sampling + IRT)                 │    │
│  │    Goal: Maximize expected score gain per minute                 │    │
│  │    Input: All knowledge states + IRT parameters                  │    │
│  │    Constraint: Exam proximity bias (closer exam = harder drill)  │    │
│  │    Constraint: Fatigue model (session length penalty)            │    │
│  │    Constraint: YAEL section weighting                            │    │
│  │    Output: Next question_id                                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  PARALLEL TRACK: If answer was WRONG                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 5. EXPLANATION ENGINE                                           │    │
│  │                                                                  │    │
│  │  ┌──────────────────┐     HIT ──▶ Return cached explanation     │    │
│  │  │  Cache Lookup    │                                            │    │
│  │  │  (question_id +  │                                            │    │
│  │  │   option_chosen) │     MISS ──▶ Generate via Claude API      │    │
│  │  └──────────────────┘              │                             │    │
│  │                                    ▼                             │    │
│  │                      ┌─────────────────────────┐                │    │
│  │                      │  CLAUDE API PROMPT       │                │    │
│  │                      │  System: Expert YAEL     │                │    │
│  │                      │  tutor, Semitic linguist │                │    │
│  │                      │                          │                │    │
│  │                      │  Context injected:       │                │    │
│  │                      │  - The Hebrew question   │                │    │
│  │                      │  - The correct answer    │                │    │
│  │                      │  - The wrong answer      │                │    │
│  │                      │  - Student's dialect     │                │    │
│  │                      │  - Student's weak skills │                │    │
│  │                      │  - Related Arabic root   │                │    │
│  │                      │                          │                │    │
│  │                      │  Output format:          │                │    │
│  │                      │  - Why wrong (Arabic)    │                │    │
│  │                      │  - Why right (Arabic)    │                │    │
│  │                      │  - AR↔HE bridge insight  │                │    │
│  │                      │  - Memory trick          │                │    │
│  │                      └────────────┬────────────┘                │    │
│  │                                   │ Cache for future            │    │
│  │                                   ▼                             │    │
│  │                      Store in ai_explanations                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  BACKGROUND JOB (after session end)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 6. STUDY PLAN REBALANCING                                       │    │
│  │    Triggered: after each session                                 │    │
│  │    Input: Updated knowledge states + days until exam            │    │
│  │    Algorithm: Greedy optimization toward 120                    │    │
│  │    Logic: Focus where Δscore/time is highest                    │    │
│  │    Output: Updated study_plans.daily_sessions                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Arabic-Hebrew Linguistic Bridge Engine

This is the platform's **irreplaceable differentiator.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│              SEMITIC BRIDGE ENGINE — DESIGN PRINCIPLES                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INSIGHT: Arabic and Hebrew share ~1,200 root correspondences.          │
│  A native Arabic speaker has an embedded head start that no other       │
│  learner group has. The platform makes this EXPLICIT and TEACHABLE.     │
│                                                                          │
│  BRIDGE RULE TYPES:                                                      │
│                                                                          │
│  1. COGNATE ROOTS (stored in vocabulary table)                          │
│     Arabic ص-ل-م / Hebrew ש-ל-מ (peace/completion)                      │
│     Arabic ك-ت-ب / Hebrew כ-ת-ב (write)                                │
│     Arabic ق-ر-أ / Hebrew ק-ר-א (read)                                 │
│                                                                          │
│  2. BINYAN ↔ AWZAN MAPPING (stored in skills.arabic_bridge_note)       │
│     Hebrew Pa'al    ↔ Arabic Fa'ala   (basic active verb)               │
│     Hebrew Pi'el    ↔ Arabic Fa''ala  (intensive, causative)            │
│     Hebrew Hif'il   ↔ Arabic Af'ala   (causative)                      │
│     Hebrew Hitpa'el ↔ Arabic Tafa'ala (reflexive)                       │
│                                                                          │
│  3. PHONOLOGICAL CORRESPONDENCES (systematic, teachable rules)          │
│     Arabic ث → Hebrew ש or ת                                            │
│     Arabic ح → Hebrew ח                                                 │
│     Arabic خ → Hebrew כ/ח                                              │
│     Arabic ض → Hebrew צ                                                │
│                                                                          │
│  4. FALSE FRIENDS (stored as warnings)                                  │
│     Hebrew בגד = clothes (NOT betrayal like Arabic بَغَى)               │
│     Hebrew קצין = officer (NOT judge)                                    │
│                                                                          │
│  AI PROMPT ENHANCEMENT:                                                  │
│  Every Claude API call includes the relevant bridge data from DB         │
│  so explanations are linguistically precise, not generic.               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Adaptive Algorithm: Knowledge Tracing + FSRS

```
KNOWLEDGE TRACING MODEL (Simplified BKT per skill)

  State: P(mastery_t) per skill

  Update on CORRECT answer:
  P(m_t+1) = P(correct | mastered) × P(m_t)
              ─────────────────────────────────────────────
              P(correct | mastered)×P(m_t) + P(guess)×(1-P(m_t))
  Then: P(m_t+1) = P(m_t+1_raw) + (1 - P(m_t+1_raw)) × P(learn)

  Update on WRONG answer:
  P(m_t+1) = P(slip) × P(m_t)
              ─────────────────────────────────────────
              P(slip)×P(m_t) + P(1-guess)×(1-P(m_t))
  Then: P(m_t+1) = P(m_t+1_raw) + (1 - P(m_t+1_raw)) × P(learn)

VOCABULARY SPACED REPETITION (FSRS 4.5)
  D_new = difficulty parameter (how hard this card is for this user)
  S = stability (days until 90% retention)
  Next review = NOW + S × (ln(0.9) / ln(retrievability))

  Rating 1 (Again): S × 0.2 (punishes forgetting)
  Rating 2 (Hard):  S × 1.2
  Rating 3 (Good):  S × 2.0
  Rating 4 (Easy):  S × 3.0
```

---

## 6. USER JOURNEY

### Journey Map: From Zero to 120+

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    THE STUDENT'S JOURNEY                              ║
╠════════════════════╦══════════════════════════════════════════════════╣
║ PHASE              ║ EXPERIENCE                                       ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  DAY 0             ║  Landing page in Arabic — immediate trust.      ║
║  Discovery         ║  "منصة مجانية 100% لاجتياز يعل بامتياز"         ║
║  & Trust           ║  No signup wall. Try a sample question first.   ║
║                    ║  Social proof: "1,240 طالب وصلوا 120+ هذا الشهر"║
║                    ║                                                  ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  DAY 0             ║  Sign up (Google or email) — 2 screens max.    ║
║  Onboarding        ║  Screen 1: "متى امتحانك؟" + target score       ║
║  (8 minutes)       ║  Screen 2: "كم دقيقة تستطيع تخصيصها يومياً؟"   ║
║                    ║  → Placement test begins immediately            ║
║                    ║  20 adaptive questions (feels like 5 minutes)   ║
║                    ║  → Dashboard loads with their baseline score    ║
║                    ║  → "تقديرك الحالي: 87 · هدفك: 120"             ║
║                    ║                                                  ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  DAYS 1–7          ║  Daily 20-minute sessions (AI-chosen content).  ║
║  Habit Formation   ║  Each session ends with a score update.         ║
║                    ║  Streak system builds daily habit.              ║
║                    ║  Weekly email: "هذا الأسبوع ارتفع تقديرك 4 نقاط"║
║                    ║                                                  ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  WEEKS 2–6         ║  Deep skill work begins.                        ║
║  Skill Building    ║  AI tutor on-demand for confusing topics.       ║
║                    ║  Vocabulary system activated (FSRS).            ║
║                    ║  First mock exam at Week 4.                     ║
║                    ║  Score prediction narrows (confidence ↑).       ║
║                    ║                                                  ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  WEEK 7–8          ║  Exam simulation mode.                          ║
║  Exam Prep         ║  Full mock exams under real conditions.         ║
║  Intensification   ║  Focus on highest-weight skills.                ║
║                    ║  AI generates "exam week plan."                 ║
║                    ║  Dashboard shows readiness %. "אתה מוכן"        ║
║                    ║                                                  ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  EXAM DAY          ║  "يوم الامتحان — أنت مستعد"                     ║
║                    ║  Last-minute review: top 20 vocab cards.        ║
║                    ║  Confidence message from platform.              ║
║                    ║                                                  ║
╠════════════════════╬══════════════════════════════════════════════════╣
║                    ║                                                  ║
║  POST-EXAM         ║  User reports their actual score.               ║
║  Loop              ║  Platform improves its prediction model.        ║
║                    ║  If retaking: new adaptive plan generated.      ║
║                    ║  Success stories feed social proof.             ║
║                    ║                                                  ║
╚════════════════════╩══════════════════════════════════════════════════╝
```

### UX Principles for Arabic-Speaking Students

```
1. LANGUAGE HIERARCHY
   Primary: Arabic (UI, explanations, feedback)
   Secondary: Hebrew (questions, content, vocabulary)
   Tertiary: English (fallback, international terms)
   → Never force the student to struggle with the UI itself

2. RTL-FIRST DESIGN
   → Not "LTR with RTL toggle"
   → Designed RTL from first pixel
   → Hebrew text in LTR islands within RTL layout
   → Mixed bidi text handled via unicode-bidi: isolate

3. COGNITIVE LOAD REDUCTION
   → One thing per screen during practice
   → Never show the score while answering (anxiety spike)
   → Explanation appears AFTER commitment to answer
   → Progress shown in narrative ("You've mastered 7/10 reading skills")
     not just numbers

4. MOBILE-FIRST (65%+ of target users are mobile)
   → Bottom navigation (thumb-reachable)
   → Question fits in one screen without scroll
   → No hover states as primary interactions
   → PWA install prompt at Day 3 (after habit formed)

5. ACCESSIBILITY
   → WCAG 2.1 AA minimum
   → Font minimum 16px (Hebrew + Arabic legibility)
   → High contrast mode (for bright outdoor mobile use)
   → Screen reader support (both RTL and LTR content)
```

---

## 7. COMPONENT HIERARCHY

```
<App>
├── <Providers>  (Auth, Query, Store, Theme, RTL Direction)
│
├── <AuthGuard>
│   ├── <LandingPage>  (unauthenticated)
│   │   ├── <HeroSection> (AR headline + HE word motif)
│   │   ├── <SampleQuestion> (try before signup)
│   │   ├── <SocialProof> (scores achieved)
│   │   ├── <ExamExplainer> (what is YAEL?)
│   │   └── <CTASection>
│   │
│   └── <AppShell>  (authenticated)
│       ├── <RTLLayout>
│       │   ├── <TopBar>
│       │   │   ├── <StreakBadge>
│       │   │   ├── <ScoreGaugeMini>
│       │   │   └── <ProfileMenu>
│       │   ├── <BottomNav> (mobile)
│       │   │   └── [Dashboard, Practice, Vocab, Exam, Profile]
│       │   └── <SideNav> (desktop)
│       │
│       ├── <DashboardPage>
│       │   ├── <TodayMissionCard>  ← most important daily touchpoint
│       │   │   ├── <MissionTitle> (what to study, why)
│       │   │   └── <StartSessionButton>
│       │   ├── <ScorePredictionGauge>
│       │   │   ├── <CurrentScore>
│       │   │   ├── <TargetScore>
│       │   │   ├── <ConfidenceInterval>
│       │   │   └── <DaysUntilExam>
│       │   ├── <SkillHeatmap>
│       │   │   └── <SkillCell> × 30 (color = mastery level)
│       │   ├── <StreakDisplay>
│       │   └── <RecentActivity>
│       │
│       ├── <PracticePage>
│       │   ├── <SessionConfig>  (choose session type)
│       │   └── <SessionShell>
│       │       ├── <SessionHeader>
│       │       │   ├── <ProgressBar>
│       │       │   ├── <SkillLabel>
│       │       │   └── <TimerDisplay> (speed mode only)
│       │       ├── <QuestionDisplay>
│       │       │   ├── <PassageBlock>  (Hebrew, RTL, scroll-fixed)
│       │       │   ├── <QuestionStem>  (Hebrew)
│       │       │   └── <AnswerOptions>
│       │       │       └── <OptionCard> × 4
│       │       │           ├── (unselected state)
│       │       │           ├── (selected, pending state)
│       │       │           ├── (correct revealed state)
│       │       │           └── (wrong revealed state)
│       │       ├── <FeedbackPanel>  (appears after answer)
│       │       │   ├── <CorrectBadge> or <WrongBadge>
│       │       │   ├── <ExplanationBlock>
│       │       │   │   ├── <WhyWrong>  (Arabic)
│       │       │   │   ├── <WhyRight>  (Arabic)
│       │       │   │   └── <ArabicHebrewBridge>  (linguistic insight)
│       │       │   ├── <ConfidenceRater>
│       │       │   └── <NextButton>
│       │       └── <SessionSummary>
│       │           ├── <ScoreChange>
│       │           ├── <TopInsight>
│       │           ├── <SkillsWorkedOn>
│       │           └── <NextSessionSuggestion>
│       │
│       ├── <VocabularyPage>
│       │   ├── <VocabDashboard>
│       │   │   ├── <DueReviewCount>
│       │   │   ├── <MasteredCount>
│       │   │   └── <SearchBar>
│       │   ├── <FlashcardSession>
│       │   │   ├── <CardFront>  (Hebrew word, nikud)
│       │   │   ├── <CardBack>   (Arabic translation, root, bridge)
│       │   │   └── <RatingButtons> (Again/Hard/Good/Easy)
│       │   └── <RootExplorer>
│       │       ├── <RootInput>
│       │       ├── <HebrewFamilyTree>
│       │       └── <ArabicBridgeCard>
│       │
│       ├── <MockExamPage>
│       │   ├── <ExamSelector>  (YAEL 1–5)
│       │   ├── <ExamShell>
│       │   │   ├── <ExamTimer>  (full screen, high salience)
│       │   │   ├── <SectionNavigator>
│       │   │   ├── <QuestionDisplay>  (same component, exam mode)
│       │   │   └── <SubmitButton>
│       │   └── <ExamReview>
│       │       ├── <ScoreCard>  (vs prediction, vs target)
│       │       ├── <SectionBreakdown>
│       │       └── <ReviewQuestionList>
│       │
│       ├── <AITutorPage>
│       │   ├── <ConversationHistory>
│       │   │   └── <MessageBubble>  (AR/HE mixed, bidi-aware)
│       │   ├── <SuggestedPrompts>
│       │   │   └── (based on current weak spots)
│       │   └── <InputBox>  (RTL, with HE keyboard support hint)
│       │
│       ├── <AnalyticsPage>
│       │   ├── <ScoreTrajectoryChart>
│       │   ├── <SectionRadarChart>
│       │   ├── <SkillBreakdownTable>
│       │   ├── <ErrorPatternInsights>
│       │   └── <StudyTimeChart>
│       │
│       └── <SettingsPage>
│           ├── <ProfileSection>
│           ├── <ExamGoalsSection>
│           ├── <PreferencesSection>
│           └── <DataSection>
│
└── <DesignSystem>  (shared across all)
    ├── <Typography>  (Noto Sans Arabic + Frank Ruhl Libre for Hebrew)
    ├── <ColorTokens>  (WCAG-compliant, 2 themes)
    ├── <HebrewText>  (wrapper: always dir="ltr", correct font)
    ├── <ArabicText>  (wrapper: always dir="rtl")
    └── <BilingualLabel>  (handles mixed AR/HE labels)
```

---

## 8. API ARCHITECTURE

### Design Principles

```
1. All routes under /api/v1/ (versioned from day one)
2. Auth: JWT via Supabase, validated middleware on every route
3. Rate limiting: per-user, per-endpoint, stored in KV
4. Response format: { data, error, meta } always
5. Mutations return the updated entity
6. No N+1 queries — joins at DB level, not application level
7. Slow routes (AI generation) use streaming where UX benefits
```

### Full API Map

```
AUTH
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/logout
  POST   /api/v1/auth/refresh
  GET    /api/v1/auth/me
  PATCH  /api/v1/auth/profile

PLACEMENT
  POST   /api/v1/placement/start        → creates session, returns first Q
  POST   /api/v1/placement/answer       → submits answer, returns next Q or results
  GET    /api/v1/placement/result/:id   → final placement results + initial plan

PRACTICE SESSIONS
  POST   /api/v1/sessions/start         → { type, yael_level? } → session_id + first Q
  POST   /api/v1/sessions/:id/answer    → { question_id, option, time_ms, confidence }
                                          → { is_correct, explanation?, next_question }
  POST   /api/v1/sessions/:id/end       → { session_id } → session summary
  GET    /api/v1/sessions/history       → paginated list of past sessions
  GET    /api/v1/sessions/:id           → full session detail

QUESTIONS
  GET    /api/v1/questions/next         → returns optimal next question (adaptive)
  GET    /api/v1/questions/:id          → question detail (admin/review)
  POST   /api/v1/questions/:id/flag     → user flags a question (quality feedback)

AI EXPLANATION
  GET    /api/v1/explain/:question_id   → { option_chosen }
                                          → cached or newly generated explanation
                                          (STREAMING for cache miss)

PROGRESS & ANALYTICS
  GET    /api/v1/progress/summary       → score prediction + streak + overview
  GET    /api/v1/progress/skills        → all knowledge_states for user
  GET    /api/v1/progress/score-history → timeline of score predictions
  GET    /api/v1/progress/section/:name → drill into one YAEL section

VOCABULARY
  GET    /api/v1/vocab/due              → next cards due for review (FSRS)
  POST   /api/v1/vocab/:id/review       → { rating: 1|2|3|4 } → next_review_at
  GET    /api/v1/vocab/search           → { q: "שלום" } → semantic + exact match
  GET    /api/v1/vocab/roots            → { root: "שלמ" } → full word family
  GET    /api/v1/vocab/explore          → { arabic_root: "سلم" } → HE bridge

STUDY PLAN
  GET    /api/v1/plan/current           → today's plan + full calendar
  POST   /api/v1/plan/regenerate        → trigger new plan (after schedule change)
  PATCH  /api/v1/plan/goals             → update exam date, target score

AI TUTOR
  POST   /api/v1/tutor/message          → { conversation_id?, message }
                                          → streaming Claude response
  GET    /api/v1/tutor/conversations    → list of past conversations
  DELETE /api/v1/tutor/conversations/:id

MOCK EXAM
  POST   /api/v1/exam/start             → { yael_level } → exam_id + questions[]
  POST   /api/v1/exam/:id/submit        → { answers[] } → full result
  GET    /api/v1/exam/:id/review        → detailed review with explanations

ADMIN (protected, admin role only)
  CRUD   /api/v1/admin/questions
  GET    /api/v1/admin/analytics/platform
  GET    /api/v1/admin/analytics/questions   → quality + difficulty calibration
  PATCH  /api/v1/admin/explain/:id/quality   → human rate an AI explanation
  GET    /api/v1/admin/users                 → anonymized user analytics
```

### API Response Format

```
Success:
{
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "timestamp": "ISO 8601",
    "cached": true | false
  }
}

Error:
{
  "error": {
    "code": "QUESTION_NOT_FOUND",
    "message": "لم يتم العثور على السؤال",     ← Arabic
    "message_he": "השאלה לא נמצאה",           ← Hebrew fallback
    "http_status": 404
  }
}

Streaming (AI routes):
Content-Type: text/event-stream
data: {"chunk": "..."}
data: {"chunk": "..."}
data: [DONE]
```

---

## 9. SECURITY ARCHITECTURE

```
╔═══════════════════════════════════════════════════════════════════════╗
║                      SECURITY LAYERS                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 1: NETWORK                                                     ║
║  → HTTPS everywhere (Vercel auto-provisions TLS)                      ║
║  → HSTS header (max-age=31536000; includeSubDomains)                  ║
║  → Strict Content-Security-Policy                                     ║
║  → X-Frame-Options: DENY                                              ║
║  → X-Content-Type-Options: nosniff                                    ║
║  → Vercel DDoS protection (built-in)                                  ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 2: AUTHENTICATION                                              ║
║  → Supabase Auth: JWT access tokens (1hr expiry)                      ║
║  → Refresh tokens: 7-day rotation                                     ║
║  → HttpOnly cookies for token storage (not localStorage)              ║
║  → Google OAuth 2.0 as primary social auth                            ║
║  → Email verification required before exam access                     ║
║  → Rate limiting on auth endpoints: 10 attempts/15min per IP          ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 3: AUTHORIZATION (Database Level)                              ║
║  → Row Level Security (RLS) on ALL user-owned tables                  ║
║  → Policy: user_id = auth.uid()                                       ║
║  → Admin role: separate service role key, never in client             ║
║  → No user can read another user's knowledge state or attempts        ║
║  → Questions are READ-ONLY for users, WRITE for admin service role    ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 4: API PROTECTION                                              ║
║  → Rate limiting: Vercel KV per (user_id × endpoint)                 ║
║     - Practice: 500 answers/hour                                      ║
║     - AI Tutor: 30 messages/hour                                      ║
║     - Explanation: 100/hour (cache reduces actual AI calls)           ║
║  → Input validation: Zod schemas on every API handler                 ║
║  → SQL injection: impossible (Supabase parameterized queries)         ║
║  → No raw SQL from user input anywhere                                ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 5: AI PROMPT SECURITY                                          ║
║  → No PII injected into AI prompts (user_id only, not email/name)    ║
║  → Prompt injection defense: user text never in system prompts        ║
║  → AI responses sanitized before DB storage (no script injection)     ║
║  → Content moderation: Claude's built-in + Supabase NSFW filter      ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 6: DATA PRIVACY (Israeli + GDPR aligned)                       ║
║  → Minimum data collection principle                                  ║
║  → No selling/sharing data with third parties                         ║
║  → Analytics: anonymized (no PII in events)                           ║
║  → User data export: full JSON export on request                      ║
║  → Right to deletion: CASCADE DELETE on user account removal          ║
║  → Retention policy: inactive accounts → anonymize after 2 years      ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  LAYER 7: CONTENT INTEGRITY                                           ║
║  → Question bank: admin-only write, no user modifications             ║
║  → AI explanations: quality score reviewed before high-volume serve   ║
║  → Question flagging: user can flag, goes to review queue             ║
║  → No user-generated content in main flow (safety by design)          ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 10. FOLDER STRUCTURE

```
yael-platform/
│
├── 📁 app/                              # Next.js App Router
│   ├── (marketing)/                     # Unauthenticated pages
│   │   ├── page.tsx                     # Landing page
│   │   ├── about/
│   │   └── layout.tsx
│   │
│   ├── (auth)/                          # Auth flow
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify/
│   │   └── layout.tsx
│   │
│   ├── (onboarding)/                    # New user flow
│   │   ├── goals/                       # Step 1: exam date + target
│   │   ├── schedule/                    # Step 2: daily time
│   │   ├── placement/                   # Step 3: diagnostic test
│   │   ├── results/                     # Step 4: baseline + plan reveal
│   │   └── layout.tsx
│   │
│   ├── (app)/                           # Main authenticated app
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── practice/
│   │   │   ├── page.tsx                 # Session type selector
│   │   │   └── session/
│   │   │       └── [sessionId]/
│   │   │           └── page.tsx         # Live practice session
│   │   ├── vocabulary/
│   │   │   ├── page.tsx                 # Vocab dashboard
│   │   │   ├── review/
│   │   │   │   └── page.tsx             # FSRS flashcard session
│   │   │   └── explore/
│   │   │       └── page.tsx             # Root explorer
│   │   ├── exam/
│   │   │   ├── page.tsx                 # Exam selector
│   │   │   ├── [examId]/
│   │   │   │   └── page.tsx             # Live mock exam
│   │   │   └── results/
│   │   │       └── [examId]/
│   │   │           └── page.tsx         # Exam review
│   │   ├── tutor/
│   │   │   └── page.tsx                 # AI tutor chat
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── plan/
│   │   │   └── page.tsx                 # Study plan calendar
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx                   # App shell (nav, auth guard)
│   │
│   ├── (admin)/                         # Admin panel
│   │   ├── questions/
│   │   ├── analytics/
│   │   ├── explanations/                # Review AI explanation quality
│   │   └── layout.tsx
│   │
│   └── api/                             # API routes
│       └── v1/
│           ├── auth/
│           ├── placement/
│           ├── sessions/
│           ├── questions/
│           ├── explain/
│           ├── progress/
│           ├── vocab/
│           ├── plan/
│           ├── tutor/
│           ├── exam/
│           └── admin/
│
├── 📁 components/
│   ├── ui/                              # Base design system
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── rtl-layout.tsx              # RTL wrapper + direction provider
│   │   ├── app-shell.tsx
│   │   ├── top-bar.tsx
│   │   ├── bottom-nav.tsx              # Mobile nav
│   │   └── side-nav.tsx               # Desktop nav
│   │
│   ├── typography/
│   │   ├── hebrew-text.tsx             # Always LTR, Frank Ruhl Libre
│   │   ├── arabic-text.tsx             # Always RTL, Noto Sans Arabic
│   │   └── bilingual-label.tsx         # Mixed AR/HE text
│   │
│   ├── dashboard/
│   │   ├── today-mission-card.tsx
│   │   ├── score-gauge.tsx
│   │   ├── skill-heatmap.tsx
│   │   ├── streak-display.tsx
│   │   └── recent-activity.tsx
│   │
│   ├── practice/
│   │   ├── question-display.tsx
│   │   ├── passage-block.tsx
│   │   ├── answer-options.tsx
│   │   ├── option-card.tsx
│   │   ├── feedback-panel.tsx
│   │   ├── explanation-block.tsx
│   │   ├── confidence-rater.tsx
│   │   ├── session-header.tsx
│   │   └── session-summary.tsx
│   │
│   ├── vocabulary/
│   │   ├── flashcard.tsx
│   │   ├── flashcard-session.tsx
│   │   ├── rating-buttons.tsx
│   │   ├── root-tree.tsx
│   │   └── arabic-bridge-card.tsx
│   │
│   ├── analytics/
│   │   ├── score-trajectory-chart.tsx
│   │   ├── section-radar-chart.tsx
│   │   ├── skill-breakdown-table.tsx
│   │   └── study-time-chart.tsx
│   │
│   ├── tutor/
│   │   ├── conversation.tsx
│   │   ├── message-bubble.tsx
│   │   └── suggested-prompts.tsx
│   │
│   └── exam/
│       ├── exam-shell.tsx
│       ├── exam-timer.tsx
│       ├── section-navigator.tsx
│       └── exam-score-card.tsx
│
├── 📁 lib/
│   ├── adaptive/
│   │   ├── bkt.ts                      # Bayesian Knowledge Tracing
│   │   ├── fsrs.ts                     # FSRS spaced repetition
│   │   ├── irt.ts                      # Item Response Theory utilities
│   │   ├── next-item-selector.ts       # Thompson sampling selection
│   │   └── score-predictor.ts          # Score estimation
│   │
│   ├── ai/
│   │   ├── client.ts                   # Anthropic client singleton
│   │   ├── explanation-generator.ts   # Generates + caches explanations
│   │   ├── tutor.ts                    # AI tutor conversation handler
│   │   ├── plan-generator.ts           # Study plan generation
│   │   ├── prompts/
│   │   │   ├── explanation.ts          # System prompt for explanations
│   │   │   ├── tutor.ts                # System prompt for tutor
│   │   │   └── plan.ts                 # System prompt for study plans
│   │   └── bridge/
│   │       ├── root-mapper.ts          # AR root → HE root lookup
│   │       └── phonology-rules.ts      # AR→HE sound correspondence rules
│   │
│   ├── db/
│   │   ├── client.ts                   # Supabase client (server + client)
│   │   ├── queries/
│   │   │   ├── questions.ts
│   │   │   ├── knowledge-states.ts
│   │   │   ├── sessions.ts
│   │   │   ├── vocabulary.ts
│   │   │   └── progress.ts
│   │   └── types.ts                    # Generated Supabase types
│   │
│   ├── auth/
│   │   ├── middleware.ts               # Auth middleware for API routes
│   │   └── session.ts                  # Session utilities
│   │
│   └── utils/
│       ├── rtl.ts                      # RTL/LTR detection utilities
│       ├── hebrew.ts                   # Hebrew text utilities (nikud, etc.)
│       ├── arabic.ts                   # Arabic text utilities
│       ├── date.ts
│       └── validation.ts              # Zod schemas
│
├── 📁 hooks/
│   ├── use-adaptive-session.ts         # Manages live practice session
│   ├── use-knowledge-state.ts          # User's skill mastery data
│   ├── use-score-prediction.ts         # Live score estimate
│   ├── use-flashcard-queue.ts          # FSRS vocab review queue
│   ├── use-tutor.ts                    # AI tutor conversation
│   └── use-streak.ts                   # Streak tracking
│
├── 📁 store/                           # Zustand stores
│   ├── session-store.ts                # Active practice session state
│   ├── user-store.ts                   # User profile + preferences
│   └── exam-store.ts                   # Mock exam in-progress state
│
├── 📁 types/
│   ├── question.ts
│   ├── session.ts
│   ├── user.ts
│   ├── skill.ts
│   ├── vocabulary.ts
│   └── ai.ts
│
├── 📁 config/
│   ├── skills-taxonomy.ts              # Authoritative skill tree
│   ├── yael-weights.ts                 # Score weighting per section/level
│   ├── bkt-params.ts                   # Default BKT parameters
│   └── fsrs-params.ts                  # Default FSRS parameters
│
├── 📁 supabase/
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   ├── 0003_vector_extension.sql
│   │   └── 0004_seed_skills.sql
│   ├── functions/                      # Supabase Edge Functions
│   │   ├── compute-knowledge-state/    # Runs after each answer
│   │   ├── generate-study-plan/        # Background plan generation
│   │   └── score-prediction/           # Score computation
│   └── seed/
│       ├── skills.sql                  # Skills taxonomy seed
│       └── sample-questions.sql        # First 100 questions
│
├── 📁 public/
│   ├── fonts/                          # Self-hosted (performance + privacy)
│   │   ├── frank-ruhl-libre/           # Hebrew body font
│   │   └── noto-sans-arabic/           # Arabic UI font
│   ├── audio/                          # Hebrew pronunciation (short clips)
│   ├── icons/
│   └── manifest.json                   # PWA manifest
│
├── 📁 docs/
│   ├── architecture/                   # This document
│   ├── content-guidelines/             # Question writing standards
│   ├── linguistic-bridge/              # AR-HE correspondence database
│   └── api/                            # OpenAPI spec
│
├── middleware.ts                        # Next.js middleware (auth + RTL)
├── tailwind.config.ts
├── next.config.ts
└── .env.example
```

---

## 11. FUTURE ROADMAP

```
╔═════════════════════════════════════════════════════════════════════╗
║                    PRODUCT EVOLUTION ROADMAP                        ║
╠══════════╦══════════════════════════════════════════════════════════╣
║ PHASE    ║ DELIVERABLES                             TARGET          ║
╠══════════╬══════════════════════════════════════════════════════════╣
║          ║                                                          ║
║ PHASE 0  ║  • Question bank: 200 questions (all levels)            ║
║  MVP     ║  • Adaptive practice engine                  Month 1–2  ║
║          ║  • Basic dashboard + score prediction                    ║
║          ║  • AI explanations (cached)                              ║
║          ║  • YAEL 1–3 mock exams                                  ║
║          ║  • Arabic UI, RTL-first                                  ║
║          ║                                                          ║
╠══════════╬══════════════════════════════════════════════════════════╣
║          ║                                                          ║
║ PHASE 1  ║  • Vocabulary system + FSRS                             ║
║ Depth    ║  • Arabic-Hebrew root explorer              Month 3–4   ║
║          ║  • AI Tutor (live Claude chat)                          ║
║          ║  • Full skill heatmap + analytics                        ║
║          ║  • Study plan engine (AI-generated)                      ║
║          ║  • Question bank: 500+ questions                         ║
║          ║  • PWA (offline practice)                                ║
║          ║                                                          ║
╠══════════╬══════════════════════════════════════════════════════════╣
║          ║                                                          ║
║ PHASE 2  ║  • YAEL 4–5 (text reconstruction)                      ║
║ Complete ║  • Pronunciation audio library              Month 5–6   ║
║          ║  • Speed training mode (exam anxiety)                    ║
║          ║  • Social features: study groups                         ║
║          ║  • Score certificate / sharing                           ║
║          ║  • Question bank: 1,000+ questions                       ║
║          ║  • Real exam calibration (collect actual scores)         ║
║          ║                                                          ║
╠══════════╬══════════════════════════════════════════════════════════╣
║          ║                                                          ║
║ PHASE 3  ║  • Russian UI (next largest olim group)                 ║
║ Expand   ║  • Amharic UI (Ethiopian community)         Month 7–10  ║
║          ║  • Parent/educator dashboard                             ║
║          ║  • Class management (ulpan integration)                  ║
║          ║  • Advanced IRT model (calibrated on real data)          ║
║          ║  • Content API (let ulpanim import content)              ║
║          ║                                                          ║
╠══════════╬══════════════════════════════════════════════════════════╣
║          ║                                                          ║
║ PHASE 4  ║  • Native mobile apps (React Native / Expo)             ║
║ Mobile   ║  • Offline-first architecture                Year 2     ║
║          ║  • Push notification study reminders                     ║
║          ║  • Camera: photo a text, get explanation                 ║
║          ║  • Voice: pronounce a word, get feedback                 ║
║          ║                                                          ║
╠══════════╬══════════════════════════════════════════════════════════╣
║          ║                                                          ║
║ PHASE 5  ║  • Psychometric exam prep (Bagrut adjacent)            ║
║ Platform ║  • Hebrew for workplace (professional level) Year 2–3   ║
║          ║  • Platform API (white-label for institutions)           ║
║          ║  • Research partnerships (Hebrew acquisition data)       ║
║          ║                                                          ║
╚══════════╩══════════════════════════════════════════════════════════╝
```

---

## 12. THE KEY ARCHITECTURAL DECISIONS — AND WHY

```
┌─────────────────────────────────────────────────────────────────────┐
│              DECISIONS CHALLENGED AND RESOLVED                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ❌ Rejected: Separate backend (Node/FastAPI)                       │
│  ✅ Chosen: Next.js API Routes + Supabase Edge Functions            │
│  WHY: Eliminates CORS complexity, reduces deployment surfaces,      │
│       collapses infra cost. Edge Functions handle background jobs.  │
│                                                                     │
│  ❌ Rejected: Real-time adaptive (update every keystroke)           │
│  ✅ Chosen: End-of-answer updates, background rebalancing          │
│  WHY: Real-time adds latency to the critical path.                 │
│       Users don't need sub-second knowledge state updates.          │
│       Async is correct here.                                        │
│                                                                     │
│  ❌ Rejected: AI explanation per live request always               │
│  ✅ Chosen: Cache-first with warm-up strategy                      │
│  WHY: Same wrong answer, same explanation needed.                   │
│       Pre-generate top wrong-answer explanations during seeding.    │
│       95%+ cache hit = near-zero AI cost at scale.                 │
│                                                                     │
│  ❌ Rejected: Simple difficulty tags (easy/medium/hard)            │
│  ✅ Chosen: IRT b-parameter (continuous 0.0–1.0 difficulty)        │
│  WHY: Real adaptive systems need granular difficulty.               │
│       IRT enables precise question matching to student ability.     │
│                                                                     │
│  ❌ Rejected: English-first with Arabic translation                 │
│  ✅ Chosen: Arabic-first design (RTL as primary axis)              │
│  WHY: The psychological cost of fighting your own UI is real.       │
│       Students who feel at home in the UI learn better.             │
│                                                                     │
│  ❌ Rejected: Generic Hebrew learning platform                     │
│  ✅ Chosen: Semitic bridge as core pedagogical framework           │
│  WHY: Arabic speakers have an untapped 40% head start.             │
│       Making this explicit is a genuine competitive moat.           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## READY STATE

The architecture is complete. Every layer is designed with these properties confirmed:

- **Scalable** — from 1 to 100,000 users without architectural rework
- **Maintainable** — single language (TypeScript), clear module boundaries
- **Cost-optimized** — near-$0 for first 5,000 MAU, ~$500/month at 50,000
- **AI-native** — intelligence is embedded in the learning loop, not bolted on
- **RTL-first** — Arabic speakers get a platform designed for them, not adapted for them
- **Extensible** — language modules, new exam types, and mobile apps all slot in cleanly

**Next decision: Where do we build first?**

Recommended order:
1. Database schema + seed data (the foundation)
2. Auth + onboarding flow (the gate)
3. Placement test + dashboard (the first impression)
4. Adaptive practice session (the core loop)
5. AI explanation engine (the differentiator)

Say the word. The team builds.