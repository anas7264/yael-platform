# 🗄️ YAEL AI Platform — Production Database Architecture

*Senior PostgreSQL Database Architect · Supabase · Designed for 10M+ Users*

---

## PART 0 — ARCHITECTURAL PHILOSOPHY

Before any table. Ten decisions that govern every choice below.

---

### Decision 1: UUID Everywhere, No Exceptions

```
All primary keys: UUID (gen_random_uuid())
Reason:
  → No sequential integer exposure (attacker cannot guess record counts)
  → Safe for future database sharding or federation
  → Supabase auth.users already uses UUID — consistency matters
  → No integer overflow at 2B rows
  
Rejected: BIGSERIAL
  → Fine technically but inconsistent with auth.users
  → Sequential = information leakage
```

### Decision 2: Soft Deletes, Always

```
Every user-owned and content table has:
  deleted_at TIMESTAMPTZ NULL DEFAULT NULL

Rules:
  → deleted_at IS NULL = active record (all default queries)
  → deleted_at IS NOT NULL = soft-deleted (audit trail preserved)
  → Partial indexes on WHERE deleted_at IS NULL (no bloat)
  → Cascade soft-delete: if user is soft-deleted, all their records are too
  → Hard delete ONLY for analytics raw events after 2-year archive window

Rejected: Hard deletes
  → Lose audit trail
  → Cannot recover from accidental deletion
  → Cannot comply with "right to know what was deleted" data requests
```

### Decision 3: Schema Separation for Isolation

```
public.*          → All core application tables
analytics.*       → High-volume event tables (isolated for performance)
cache.*           → Pre-computed and AI-generated cached content
admin.*           → Platform management tables

Why separate schemas?
  → analytics.* can be on a different tablespace (cheaper storage)
  → cache.* tables have different backup policies (re-generable)
  → admin.* tables have no RLS (admin service role only)
  → Prevents table name collision
  → Future: analytics.* can be moved to read replica
```

### Decision 4: Strategic Denormalization

```
DENORMALIZED intentionally:
  user_id on question_attempts    → Avoid JOIN through sessions for user queries
  skill_id on user_mistakes       → Avoid JOIN through questions
  score_delta on study_sessions   → Computed but stored (avoids re-computation)
  balance_after on xp_transactions → Running total avoids expensive SUM()
  user_progress_summary table     → Full read-optimized summary (materialized)

Rule: Denormalize only when:
  (a) The JOIN is extremely frequent AND
  (b) The data changes infrequently AND
  (c) The write cost of maintaining the redundancy is acceptable
```

### Decision 5: JSONB — When and When Not

```
USE JSONB for:
  → Configuration data with evolving shape (session_config, trigger_config)
  → Arrays of structured objects (grammar conjugation tables)
  → Locale variants (translation by Arabic dialect)
  → Metadata escape hatches (every table's metadata column)
  → Snapshot data (skills_snapshot at score prediction time)

NEVER use JSONB for:
  → Data that needs WHERE filtering at scale (use real columns)
  → Data that needs indexing individually (use real columns)
  → Data with FK relationships (use real columns + real FKs)
  → Booleans, simple scalars that are frequently queried
```

### Decision 6: Partitioning from Day One

```
TABLES TO PARTITION (cannot be added retroactively without downtime):

analytics.events           → RANGE on created_at (monthly partitions)
  Reason: Will reach 100M+ rows. Monthly partitions = fast time-range queries
          Old partitions archived to cold storage.

question_attempts          → RANGE on created_at (monthly partitions)
  Reason: At 1M users × 50 answers/day = 50M rows/day
          Without partitioning: queries become catastrophically slow

streak_history             → RANGE on activity_date (yearly partitions)
  Reason: One row per user per day × 1M users = 365M rows/year

Design rule: Add partitioning BEFORE launch.
             Converting existing table → massive downtime.
```

### Decision 7: Index Philosophy

```
ALWAYS index:
  → Every foreign key column (Postgres does NOT auto-index FKs)
  → Columns used in WHERE, ORDER BY, GROUP BY on large tables
  → Columns used in JOIN conditions

INDEX TYPES:
  B-Tree:    Default. For equality, range, ORDER BY on most columns
  GIN:       JSONB columns, text arrays (tags, related_ids), tsvector
  BRIN:      Time-series tables where physical order = insert order
             (analytics_events.created_at → tiny index, huge table)
  IVFFlat:   pgvector column (vocabulary embeddings semantic search)
  HNSW:      pgvector — higher memory, faster queries (future upgrade)

PARTIAL INDEXES (critical for performance):
  WHERE deleted_at IS NULL        (active records only)
  WHERE is_active = true          (active content only)
  WHERE is_resolved = false       (revision queue)
  WHERE status = 'active'         (live sessions)

COMPOSITE INDEXES (column order matters — most selective first):
  (user_id, created_at DESC)     (user timeline queries)
  (user_id, skill_id)            (knowledge state lookup)
  (question_id, wrong_option)    (explanation cache lookup)
  (user_id, activity_date)       (streak history)
```

### Decision 8: Row Level Security Strategy

```
POLICY CATEGORIES:

Category A — User-Owned Data (user_profiles, knowledge_states, etc.)
  SELECT: auth.uid() = user_id
  INSERT: auth.uid() = user_id
  UPDATE: auth.uid() = user_id
  DELETE: None (soft delete only, via UPDATE)

Category B — Public Content (questions, skills, vocabulary, grammar)
  SELECT: Authenticated users only (no anonymous access to content)
  INSERT/UPDATE/DELETE: Admin role only (via service role)

Category C — AI Cache (ai_explanations_cache)
  SELECT: All authenticated users (not user-specific)
  INSERT/UPDATE: Service role only (system writes)

Category D — Admin Only (analytics.platform_daily, adaptive_configs)
  ALL: has_role('admin') function — never exposed via client

Category E — System Tables (analytics.events insert-only for users)
  INSERT: auth.uid() = user_id (users can INSERT their own events)
  SELECT: Admin only (users cannot read analytics)

SECURITY FUNCTIONS:
  is_admin()          → Checks auth.users metadata for admin flag
  is_service_role()   → Used for background job bypass
  owns_resource(id)   → Reusable ownership check
```

### Decision 9: Audit Trail Architecture

```
EVERY TABLE has at minimum:
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  
UPDATED BY: Supabase trigger (moddatetime extension)
  → Every UPDATE automatically sets updated_at = NOW()
  → No developer needs to remember to set it

SENSITIVE OPERATIONS get full audit:
  Admin actions → admin.audit_log table (who, what, when, before, after)
  Question edits → questions.version_history JSONB (before/after snapshots)
  Score adjustments → tracked in xp_transactions with admin reference
```

### Decision 10: Cost Architecture at the Database Level

```
COST LEVERS (database controls these):

1. AI Explanation Cache
   → Single row per (question, wrong_option) — 3,000 rows covers 99% of cases
   → view_count tracked → replace low-quality high-volume explanations
   → Result: 95%+ cache hit rate → $0.003/user/month in AI costs

2. Score Prediction Cache
   → user_progress_summary stores last prediction — no re-compute on every page load
   → Only recomputed after session_end or manual request

3. Analytics Aggregation
   → analytics.daily_aggregates computed nightly via Supabase Edge Function
   → Dashboard queries hit aggregates, not raw events
   → Avoids COUNT(*) on 100M row tables

4. Vocabulary Embeddings
   → Generated once, stored in pgvector column
   → Queried via IVFFLAT approximate search (fast + cheap)
   → Re-generated only when word content changes

5. Selective Materialization
   → user_progress_summary is effectively a materialized view (maintained in app)
   → Avoids expensive real-time aggregation across millions of rows
```

---

## PART 1 — ENTITY RELATIONSHIP OVERVIEW

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ENTITY RELATIONSHIP MAP                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  auth.users (Supabase)                                                       ║
║      │                                                                       ║
║      ├──1:1──▶ user_profiles                                                ║
║      ├──1:1──▶ user_settings                                                ║
║      ├──1:1──▶ user_progress_summary                                        ║
║      ├──1:1──▶ user_streaks                                                 ║
║      │                                                                       ║
║      ├──1:N──▶ study_sessions ──1:N──▶ question_attempts ──N:1──▶ questions ║
║      │                │                                           │          ║
║      │                └──▶ score_predictions           ┌──N:1──▶ skills     ║
║      │                                                  │         │          ║
║      ├──1:N──▶ knowledge_states ──N:1──────────────────┘         │          ║
║      │                                                             │          ║
║      ├──1:N──▶ user_vocabulary_states ──N:1──▶ vocabulary_items   │          ║
║      │              │                                              │          ║
║      ├──1:N──▶ user_vocabulary_reviews                            │          ║
║      │                                                             │          ║
║      ├──1:N──▶ user_achievements ──N:1──▶ achievement_definitions │          ║
║      │                                                             │          ║
║      ├──1:N──▶ xp_transactions                                    │          ║
║      │                                                             │          ║
║      ├──1:N──▶ user_daily_missions ──N:1──▶ mission_templates     │          ║
║      │                                                             │          ║
║      ├──1:N──▶ user_essays ──1:1──▶ essay_feedback               │          ║
║      │                                                             │          ║
║      ├──1:N──▶ ai_reports                                         │          ║
║      │                                                             │          ║
║      ├──1:N──▶ user_notifications ──N:1──▶ notification_templates │          ║
║      │                                                             │          ║
║      ├──1:N──▶ user_mistakes ──N:1──▶ questions                  │          ║
║      │                                                             │          ║
║      ├──1:N──▶ revision_queue                                     │          ║
║      │                                                             │          ║
║      ├──1:N──▶ streak_history                                     │          ║
║      │                                                             │          ║
║      └──1:N──▶ reading_annotations                                │          ║
║                                                                    │          ║
║  questions ──N:1──▶ passages                                       │          ║
║  questions ──N:1──▶ skills ◀──────────────────────────────────────┘          ║
║  questions ──1:N──▶ ai_explanations_cache                                    ║
║                                                                              ║
║  skills ──self-ref──▶ skills (parent_id)                                     ║
║  skills ──N:M──▶ skills (skill_prerequisites)                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PART 2 — COMPLETE TABLE SPECIFICATIONS

---

## DOMAIN 1: USERS

### TABLE: `public.user_profiles`

**Purpose:** The single source of truth for everything about who the student is, what they want to achieve, and how they want to learn. Extends Supabase's `auth.users` which handles authentication credentials. This table handles learning identity.

```
COLUMNS:
┌──────────────────────────┬────────────────────────────┬────────────────────────────────────┐
│ Column                   │ Type                       │ Notes                              │
├──────────────────────────┼────────────────────────────┼────────────────────────────────────┤
│ id                       │ UUID PK                    │ = auth.users.id (not generated)    │
│ display_name             │ TEXT                       │ User-chosen name, not email         │
│ avatar_url               │ TEXT NULL                  │ Supabase Storage URL                │
│ arabic_dialect           │ TEXT                       │ msa/egyptian/levantine/gulf/etc.   │
│ native_language          │ TEXT DEFAULT 'ar'          │ ISO 639-1 code                     │
│ target_yael_level        │ SMALLINT                   │ 1–5, CHECK (1–5)                   │
│ target_score             │ SMALLINT DEFAULT 120       │ CHECK (50–150)                     │
│ exam_date                │ DATE NULL                  │ NULL = not yet set                 │
│ daily_study_minutes      │ SMALLINT DEFAULT 30        │ CHECK (5, 10, 15, 30, 45, 60, 90) │
│ education_level          │ TEXT                       │ high_school/undergrad/grad/other   │
│ ui_language              │ TEXT DEFAULT 'ar'          │ ar/en/ru/fr/am                     │
│ timezone                 │ TEXT DEFAULT 'Asia/Jerusalem'│ IANA timezone string             │
│ country_code             │ CHAR(2) NULL               │ ISO 3166-1 alpha-2                 │
│ city                     │ TEXT NULL                  │ Optional, for regional leaderboard │
│ onboarding_completed_at  │ TIMESTAMPTZ NULL           │ NULL = not yet done                │
│ placement_completed_at   │ TIMESTAMPTZ NULL           │ NULL = not yet done                │
│ account_status           │ TEXT DEFAULT 'active'      │ active/suspended/deactivated       │
│ referral_source          │ TEXT NULL                  │ How they heard about us            │
│ referral_code_used       │ TEXT NULL                  │ If came via referral               │
│ subscription_tier        │ TEXT DEFAULT 'free'        │ free/supporter — future            │
│ metadata                 │ JSONB DEFAULT '{}'         │ Escape hatch for new fields        │
│ created_at               │ TIMESTAMPTZ DEFAULT NOW()  │                                    │
│ updated_at               │ TIMESTAMPTZ DEFAULT NOW()  │ Auto-updated by trigger            │
│ deleted_at               │ TIMESTAMPTZ NULL           │ Soft delete                        │
└──────────────────────────┴────────────────────────────┴────────────────────────────────────┘

INDEXES:
  → PK on id (implicit)
  → INDEX on country_code (regional leaderboard queries)
  → INDEX on exam_date (to find users with upcoming exams for notifications)
  → INDEX on account_status WHERE deleted_at IS NULL (active user queries)
  → INDEX on arabic_dialect (for dialect-specific AI prompt tuning)

RELATIONSHIPS:
  → id → auth.users.id (ON DELETE CASCADE — Supabase handles this)
  → One-to-one: user_settings, user_progress_summary, user_streaks

CONSTRAINTS:
  → target_yael_level CHECK (target_yael_level BETWEEN 1 AND 5)
  → target_score CHECK (target_score BETWEEN 50 AND 150)
  → daily_study_minutes CHECK (daily_study_minutes IN (5,10,15,30,45,60,90,120))
  → account_status CHECK (account_status IN ('active','suspended','deactivated'))
  → ui_language CHECK (ui_language IN ('ar','en','ru','fr','am'))
  → NOT NULL: display_name, arabic_dialect, target_yael_level, timezone

RLS POLICIES:
  → SELECT: auth.uid() = id (own profile only)
  → UPDATE: auth.uid() = id (own profile only)
  → INSERT: auth.uid() = id (triggered by auth signup hook)
  → DELETE: NONE (soft delete only)

FUTURE-PROOFING:
  → metadata JSONB absorbs new fields without migrations
  → subscription_tier enables future monetization without schema change
  → referral_source enables growth analytics from day one
  → ui_language already has 5 slots — adding Russian, Amharic later costs nothing
```

---

### TABLE: `public.user_settings`

**Purpose:** Separates learning preferences and accessibility configuration from identity. Allows settings to be reset without touching profile data. Loaded once per session and cached client-side.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK DEFAULT gen_random│                                  │
│ user_id                      │ UUID UNIQUE NOT NULL      │ → auth.users.id                  │
│ show_nikud                   │ BOOLEAN DEFAULT TRUE      │ Show Hebrew vowel marks          │
│ audio_auto_play              │ BOOLEAN DEFAULT FALSE     │ Auto-play pronunciation          │
│ show_arabic_bridge           │ BOOLEAN DEFAULT TRUE      │ Show AR↔HE linguistic insight    │
│ show_transliteration         │ BOOLEAN DEFAULT FALSE     │ Show Hebrew in Latin script      │
│ dark_mode                    │ TEXT DEFAULT 'auto'       │ auto/light/dark                  │
│ font_size                    │ TEXT DEFAULT 'md'         │ sm/md/lg/xl                      │
│ reduce_motion                │ BOOLEAN DEFAULT FALSE     │ Accessibility — respects OS pref │
│ high_contrast                │ BOOLEAN DEFAULT FALSE     │ Accessibility                    │
│ sound_effects_enabled        │ BOOLEAN DEFAULT TRUE      │ Correct/wrong sounds             │
│ notification_email_enabled   │ BOOLEAN DEFAULT TRUE      │                                  │
│ notification_push_enabled    │ BOOLEAN DEFAULT TRUE      │                                  │
│ notification_study_reminder  │ BOOLEAN DEFAULT TRUE      │                                  │
│ reminder_time                │ TIME DEFAULT '20:00:00'  │ Daily reminder time in user TZ   │
│ reminder_days                │ SMALLINT[] DEFAULT ARRAY  │ [1,2,3,4,5,6,7] = days of week  │
│                              │ [1,2,3,4,5]               │                                  │
│ keyboard_shortcuts_enabled   │ BOOLEAN DEFAULT TRUE      │                                  │
│ leaderboard_visible          │ BOOLEAN DEFAULT TRUE      │ User can hide from leaderboards  │
│ data_sharing_analytics       │ BOOLEAN DEFAULT TRUE      │ GDPR consent for analytics       │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on user_id (one settings row per user)
  → INDEX on notification_study_reminder, reminder_time
    (for notification job: "find all users due for reminder at 20:00")

RELATIONSHIPS:
  → user_id → auth.users.id (ON DELETE CASCADE)

CONSTRAINTS:
  → dark_mode CHECK (dark_mode IN ('auto','light','dark'))
  → font_size CHECK (font_size IN ('sm','md','lg','xl'))

RLS POLICIES:
  → Full CRUD: auth.uid() = user_id

FUTURE-PROOFING:
  → data_sharing_analytics column is the GDPR consent flag — built in from day one
  → leaderboard_visible enables privacy without removing the feature
  → reminder_days as array supports custom day selection
```

---

## DOMAIN 2: SKILLS (Content Taxonomy)

### TABLE: `public.skills`

**Purpose:** The authoritative, hierarchical taxonomy of everything YAEL tests. This tree has four levels: Section → Topic → Skill → Microskill. Every question, knowledge state, mission, and study plan references a node in this tree. Getting this right is architecturally critical — it cannot be easily restructured later.

```
SKILL TREE EXAMPLE (4 levels):
  Level 1 (Section):    "אוצר מילים" (Vocabulary)
  Level 2 (Topic):      "שורשים" (Roots)
  Level 3 (Skill):      "זיהוי שורש" (Root Identification)
  Level 4 (Microskill): "שורשים שלוש-אותיות" (Three-letter roots)

COLUMNS:
┌──────────────────────────┬───────────────────────────┬─────────────────────────────────────┐
│ Column                   │ Type                      │ Notes                               │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────────┤
│ id                       │ UUID PK                   │                                     │
│ parent_id                │ UUID NULL                 │ → skills.id (NULL = root/section)   │
│ code                     │ TEXT UNIQUE NOT NULL      │ e.g., "vocab.roots.identification"  │
│ section                  │ TEXT NOT NULL             │ reading/vocabulary/grammar/          │
│                          │                           │ sentence_completion/reconstruction   │
│ name_he                  │ TEXT NOT NULL             │ Hebrew display name                 │
│ name_ar                  │ TEXT NOT NULL             │ Arabic display name                 │
│ description_ar           │ TEXT NULL                 │ Arabic explanation for students     │
│ level                    │ SMALLINT NOT NULL         │ 1=section 2=topic 3=skill 4=micro   │
│ yael_levels              │ SMALLINT[] NOT NULL       │ Which YAEL levels test this         │
│ exam_weight              │ DECIMAL(5,4) DEFAULT 0    │ % of total exam score (sum=1.0)     │
│ arabic_bridge_insight    │ TEXT NULL                 │ Key AR→HE linguistic insight        │
│ display_order            │ SMALLINT DEFAULT 0        │ For UI ordering                     │
│ is_active                │ BOOLEAN DEFAULT TRUE      │                                     │
│ is_testable              │ BOOLEAN DEFAULT TRUE      │ False = taxonomy node, not tested   │
│ metadata                 │ JSONB DEFAULT '{}'        │                                     │
│ created_at               │ TIMESTAMPTZ DEFAULT NOW() │                                     │
│ updated_at               │ TIMESTAMPTZ DEFAULT NOW() │                                     │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────────┘

INDEXES:
  → PK on id
  → INDEX on parent_id (tree traversal)
  → UNIQUE on code
  → INDEX on section, level WHERE is_active = TRUE (section-level queries)
  → INDEX on yael_levels USING GIN (array containment: "find skills for YAEL 3")
  → INDEX on exam_weight WHERE exam_weight > 0 (scoring queries)

RELATIONSHIPS:
  → parent_id → skills.id (self-referential, ON DELETE RESTRICT)
  → Referenced by: questions.skill_id, knowledge_states.skill_id,
                   vocabulary_items.skill_id, grammar_rules.skill_id,
                   mission_templates.skill_id, study_plans (via JSON)

CONSTRAINTS:
  → level CHECK (level BETWEEN 1 AND 4)
  → section CHECK (section IN ('reading','vocabulary','grammar','sentence_completion','reconstruction'))
  → exam_weight CHECK (exam_weight BETWEEN 0 AND 1)
  → code must follow pattern: "{section}.{topic}.{skill}.{microskill}" (enforced in app)

FUTURE-PROOFING:
  → Self-referential allows unlimited depth — add Level 5 with no schema change
  → yael_levels as array — add YAEL 6 someday by just adding value to arrays
  → arabic_bridge_insight is the unique differentiator — kept at taxonomy level
    so every question inherits it without duplication
```

---

### TABLE: `public.skill_prerequisites`

**Purpose:** Explicit many-to-many prerequisite relationships between skills. "You must understand פעל (Paal) before attempting פיעל (Piel)." Used by the adaptive engine to avoid assigning advanced skills before foundations are set.

```
COLUMNS:
┌──────────────────────────┬───────────────────────────┬─────────────────────────────────────┐
│ Column                   │ Type                      │ Notes                               │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────────┤
│ id                       │ UUID PK                   │                                     │
│ skill_id                 │ UUID NOT NULL             │ → skills.id (the dependent skill)   │
│ prerequisite_skill_id    │ UUID NOT NULL             │ → skills.id (must be mastered first)│
│ prerequisite_strength    │ TEXT DEFAULT 'required'   │ required/recommended/helpful        │
│ created_at               │ TIMESTAMPTZ DEFAULT NOW() │                                     │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────────┘

INDEXES:
  → UNIQUE on (skill_id, prerequisite_skill_id)
  → INDEX on skill_id
  → INDEX on prerequisite_skill_id (reverse lookup: "what does this skill unlock?")

CONSTRAINTS:
  → skill_id ≠ prerequisite_skill_id (cannot be own prerequisite)
  → prerequisite_strength CHECK (IN ('required','recommended','helpful'))
```

---

## DOMAIN 3: CONTENT (Questions, Passages, Grammar)

### TABLE: `public.questions`

**Purpose:** Master table for all practice questions across all YAEL sections. Uses IRT (Item Response Theory) parameters for adaptive selection. This table is read extremely frequently and written rarely — optimize aggressively for reads.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ skill_id                     │ UUID NOT NULL             │ → skills.id                      │
│ yael_level                   │ SMALLINT NOT NULL         │ 1–5                              │
│ question_type                │ TEXT NOT NULL             │ mcq/passage_mcq/sentence_        │
│                              │                           │ completion/reconstruction/        │
│                              │                           │ writing_prompt                   │
│ difficulty_irt               │ DECIMAL(4,3) DEFAULT 0.5  │ IRT b-param: difficulty (-3 to 3)│
│ discrimination_irt           │ DECIMAL(4,3) DEFAULT 1.0  │ IRT a-param: discrimination      │
│ guessing_irt                 │ DECIMAL(4,3) DEFAULT 0.25 │ IRT c-param: pseudo-guessing     │
│ question_text_he             │ TEXT NOT NULL             │ Hebrew question stem             │
│ question_text_ar             │ TEXT NULL                 │ Arabic instruction (if needed)   │
│ passage_id                   │ UUID NULL                 │ → passages.id (reading Qs only)  │
│ options                      │ JSONB NOT NULL            │ [{text_he, label}] × 4 options  │
│ correct_option_index         │ SMALLINT NOT NULL         │ 0–3                              │
│ correct_option_text_he       │ TEXT NOT NULL             │ Denormalized for fast feedback   │
│ root_word_he                 │ TEXT NULL                 │ Hebrew root if vocab question    │
│ binyan                       │ TEXT NULL                 │ Verb pattern if grammar question │
│ question_source              │ TEXT DEFAULT 'original'   │ original/official_sample/        │
│                              │                           │ adapted/ai_generated             │
│ times_answered               │ INTEGER DEFAULT 0         │ Empirical stats (cached)         │
│ times_correct                │ INTEGER DEFAULT 0         │                                  │
│ empirical_difficulty         │ DECIMAL(4,3) NULL         │ times_correct/times_answered     │
│ empirical_discrimination     │ DECIMAL(4,3) NULL         │ Point-biserial correlation       │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ is_reviewed                  │ BOOLEAN DEFAULT FALSE     │ Human quality review done        │
│ review_notes                 │ TEXT NULL                 │ Internal reviewer notes          │
│ quality_score                │ SMALLINT NULL             │ 1–5, reviewer-assigned          │
│ version                      │ SMALLINT DEFAULT 1        │ Increment on edit                │
│ version_history              │ JSONB DEFAULT '[]'        │ Array of previous versions       │
│ tags                         │ TEXT[] DEFAULT '{}'       │ GIN indexed                      │
│ metadata                     │ JSONB DEFAULT '{}'        │                                  │
│ created_by                   │ UUID NOT NULL             │ → auth.users.id (admin)          │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ deleted_at                   │ TIMESTAMPTZ NULL          │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → PK on id
  → INDEX on skill_id WHERE is_active = TRUE AND deleted_at IS NULL
  → INDEX on yael_level, difficulty_irt WHERE is_active = TRUE
    (adaptive engine: "find hard questions at level 3")
  → INDEX on question_type WHERE is_active = TRUE
  → GIN INDEX on tags
  → INDEX on is_reviewed, quality_score (admin review queue)
  → INDEX on passage_id WHERE passage_id IS NOT NULL
  → INDEX on (skill_id, yael_level, difficulty_irt) — composite for adaptive engine
  → INDEX on empirical_difficulty WHERE times_answered > 50 (calibrated items only)

RELATIONSHIPS:
  → skill_id → skills.id (ON DELETE RESTRICT — don't delete skills with questions)
  → passage_id → passages.id (ON DELETE RESTRICT)
  → created_by → auth.users.id
  → Referenced by: question_attempts, ai_explanations_cache, user_mistakes,
                   revision_queue, next_item_selections

CONSTRAINTS:
  → yael_level CHECK (BETWEEN 1 AND 5)
  → correct_option_index CHECK (BETWEEN 0 AND 3)
  → question_source CHECK (IN ('original','official_sample','adapted','ai_generated'))
  → times_correct CHECK (times_correct <= times_answered)
  → options must be JSONB array of exactly 4 objects (enforced in app + trigger)

FUTURE-PROOFING:
  → version + version_history: safe editing with full audit trail
  → discrimination_irt + empirical stats: IRT calibration improves over time
  → question_text_ar: allows Arabic instruction text for complex question types
  → tags array: flexible categorization without schema changes
  → ai_generated source: prepares for AI-assisted content expansion
```

---

### TABLE: `public.passages`

**Purpose:** Reading passages used in reading comprehension questions. Stored separately because one passage can have 3–8 questions. Prevents duplication and enables passage-level analytics (which passage types are hardest, which topics recur on YAEL).

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ title_he                     │ TEXT NULL                 │ Hebrew title (some have none)    │
│ content_he                   │ TEXT NOT NULL             │ Full passage in Hebrew           │
│ content_he_tsvector          │ TSVECTOR NULL             │ Full-text search (auto-computed) │
│ word_count                   │ INTEGER NOT NULL          │ Computed on insert               │
│ passage_type                 │ TEXT NOT NULL             │ literary/journalistic/academic/  │
│                              │                           │ scientific/expository/narrative   │
│ yael_level                   │ SMALLINT NOT NULL         │ 1–5                              │
│ difficulty                   │ DECIMAL(4,3) DEFAULT 0.5  │ 0.0–1.0                          │
│ topic_category               │ TEXT NULL                 │ society/education/science/etc.  │
│ topic_summary_ar             │ TEXT NULL                 │ Arabic summary for student prep  │
│ vocabulary_preview           │ JSONB DEFAULT '[]'        │ [{word_he, translation_ar}]      │
│ estimated_reading_min        │ DECIMAL(4,2) NULL         │ Estimated for timer hints        │
│ source_attribution           │ TEXT NULL                 │ If adapted from real publication │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ times_used                   │ INTEGER DEFAULT 0         │ How many times assigned          │
│ avg_score                    │ DECIMAL(4,3) NULL         │ Average score on Qs about this   │
│ metadata                     │ JSONB DEFAULT '{}'        │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ deleted_at                   │ TIMESTAMPTZ NULL          │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → PK on id
  → INDEX on yael_level, passage_type WHERE is_active = TRUE
  → INDEX on difficulty WHERE is_active = TRUE
  → GIN INDEX on content_he_tsvector (full-text Hebrew search)
  → INDEX on topic_category
  → TRIGGER: auto-compute content_he_tsvector and word_count on INSERT/UPDATE

FUTURE-PROOFING:
  → content_he_tsvector enables future passage discovery by topic/keyword
  → vocabulary_preview enables pre-reading vocab primer feature
  → topic_category enables topic-based study (student studying biology can practice
    with science passages)
```

---

### TABLE: `public.grammar_rules`

**Purpose:** The structured knowledge base of Hebrew grammar rules, with Arabic parallel structures and examples. Referenced by questions, explanations, and the AI tutor. The Arabic parallel column is the pedagogical core of the platform's grammar teaching.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ skill_id                     │ UUID NOT NULL             │ → skills.id                      │
│ code                         │ TEXT UNIQUE NOT NULL      │ e.g., "binyan.piel.present"      │
│ title_he                     │ TEXT NOT NULL             │                                  │
│ title_ar                     │ TEXT NOT NULL             │                                  │
│ explanation_ar               │ TEXT NOT NULL             │ Full Arabic explanation          │
│ short_explanation_ar         │ TEXT NULL                 │ 1–2 sentence summary             │
│ arabic_parallel_ar           │ TEXT NULL                 │ The equivalent Arabic construct  │
│ comparison_table             │ JSONB NULL                │ Side-by-side AR/HE patterns      │
│ examples                     │ JSONB DEFAULT '[]'        │ [{he, ar, transliteration, note}]│
│ common_mistakes              │ JSONB DEFAULT '[]'        │ [{wrong_he, correct_he, reason}] │
│ binyan_code                  │ TEXT NULL                 │ paal/piel/hifil/hitpael/etc.    │
│ yael_frequency               │ TEXT DEFAULT 'medium'     │ very_high/high/medium/low        │
│ difficulty                   │ DECIMAL(4,3) DEFAULT 0.5  │                                  │
│ display_order                │ SMALLINT DEFAULT 0        │                                  │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → PK on id
  → UNIQUE on code
  → INDEX on skill_id
  → INDEX on binyan_code WHERE binyan_code IS NOT NULL
  → INDEX on yael_frequency (for "most important grammar to study" queries)

FUTURE-PROOFING:
  → comparison_table JSONB: richer side-by-side can evolve without migration
  → examples as JSONB array: growing example library over time
  → binyan_code enables filtering grammar by the 7 binyanim
```

---

### TABLE: `public.essay_prompts`

**Purpose:** Writing prompts for the academic Hebrew writing section. Structured to enable difficulty progression and topic variety.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ skill_id                     │ UUID NOT NULL             │ → skills.id                      │
│ prompt_he                    │ TEXT NOT NULL             │ Hebrew writing prompt            │
│ prompt_ar                    │ TEXT NOT NULL             │ Arabic explanation of task       │
│ topic_category               │ TEXT NOT NULL             │ society/education/technology/    │
│                              │                           │ environment/culture/economics     │
│ yael_level                   │ SMALLINT NOT NULL         │                                  │
│ target_word_count_min        │ INTEGER DEFAULT 80        │                                  │
│ target_word_count_max        │ INTEGER DEFAULT 120       │                                  │
│ difficulty                   │ DECIMAL(4,3) DEFAULT 0.5  │                                  │
│ sample_response_he           │ TEXT NULL                 │ Expert sample (for AI reference) │
│ key_vocabulary               │ JSONB DEFAULT '[]'        │ Suggested words for this prompt  │
│ scoring_rubric               │ JSONB NULL                │ Grammar/vocab/coherence weights  │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ times_attempted              │ INTEGER DEFAULT 0         │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

---

## DOMAIN 4: PROGRESS

### TABLE: `public.user_progress_summary`

**Purpose:** The most-read table in the entire system. Every dashboard load reads this. A fully denormalized, maintained-by-code summary of everything relevant about a user's academic standing. Never computed on the fly — always updated after each session ends. This is the architectural key to affordable scale.

```
COLUMNS:
┌──────────────────────────────────┬────────────────────────────┬────────────────────────────────┐
│ Column                           │ Type                       │ Notes                          │
├──────────────────────────────────┼────────────────────────────┼────────────────────────────────┤
│ id                               │ UUID PK = auth.users.id   │ Same as user_id — 1:1          │
│ user_id                          │ UUID UNIQUE NOT NULL       │ → auth.users.id                │
│ current_predicted_score          │ DECIMAL(5,2) NULL          │ Latest score estimate          │
│ score_confidence_low             │ DECIMAL(5,2) NULL          │ 90% CI lower bound             │
│ score_confidence_high            │ DECIMAL(5,2) NULL          │ 90% CI upper bound             │
│ score_at_placement               │ DECIMAL(5,2) NULL          │ Baseline from placement test   │
│ score_peak                       │ DECIMAL(5,2) NULL          │ Highest ever predicted score   │
│ section_scores                   │ JSONB DEFAULT '{}'         │ {reading:85, vocab:70, ...}    │
│ total_questions_answered         │ INTEGER DEFAULT 0          │                                │
│ total_questions_correct          │ INTEGER DEFAULT 0          │                                │
│ overall_accuracy_rate            │ DECIMAL(5,4) DEFAULT 0     │ Maintained, not computed       │
│ total_study_minutes              │ INTEGER DEFAULT 0          │                                │
│ total_sessions_completed         │ INTEGER DEFAULT 0          │                                │
│ total_xp                         │ INTEGER DEFAULT 0          │ Authoritative XP balance       │
│ current_level_number             │ SMALLINT DEFAULT 1         │ Denormalized from xp_levels    │
│ current_level_name_ar            │ TEXT DEFAULT 'مبتدئ'       │ Denormalized for fast display  │
│ xp_to_next_level                 │ INTEGER DEFAULT 100        │ Computed on XP update          │
│ best_mock_exam_score             │ DECIMAL(5,2) NULL          │                                │
│ mock_exams_completed             │ INTEGER DEFAULT 0          │                                │
│ total_vocab_mastered             │ INTEGER DEFAULT 0          │ Words at FSRS 'mastered' state │
│ total_vocab_in_review            │ INTEGER DEFAULT 0          │                                │
│ reading_passages_completed       │ INTEGER DEFAULT 0          │                                │
│ essays_submitted                 │ INTEGER DEFAULT 0          │                                │
│ last_session_at                  │ TIMESTAMPTZ NULL           │                                │
│ last_score_update_at             │ TIMESTAMPTZ NULL           │                                │
│ days_until_exam                  │ INTEGER NULL               │ Recomputed daily (cron)        │
│ readiness_percentage             │ DECIMAL(5,2) NULL          │ AI-computed exam readiness     │
│ created_at                       │ TIMESTAMPTZ DEFAULT NOW()  │                                │
│ updated_at                       │ TIMESTAMPTZ DEFAULT NOW()  │                                │
└──────────────────────────────────┴────────────────────────────┴────────────────────────────────┘

INDEXES:
  → UNIQUE on user_id
  → INDEX on current_predicted_score (leaderboard, analytics)
  → INDEX on total_xp (XP leaderboard)
  → INDEX on last_session_at (find inactive users for re-engagement)
  → INDEX on days_until_exam WHERE days_until_exam IS NOT NULL
    (notification system: "find users with exam in 7 days")

UPDATE STRATEGY:
  → Written by Supabase Edge Function after every session_end event
  → Also written by daily cron job for days_until_exam
  → Never computed at query time
  → If this table is wrong, session_end function recomputes from source of truth

FUTURE-PROOFING:
  → section_scores JSONB: add new section without migration
  → readiness_percentage: AI-computed metric, evolves independently
  → score_at_placement: enables "progress from baseline" calculation forever
```

---

### TABLE: `public.score_predictions`

**Purpose:** Time-series of every score prediction ever made for a user. The score trajectory chart is built from this. Also enables retrospective ML model accuracy evaluation (compare predicted scores to actual exam results students report).

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ predicted_score              │ DECIMAL(5,2) NOT NULL     │                                  │
│ confidence_interval_low      │ DECIMAL(5,2) NOT NULL     │                                  │
│ confidence_interval_high     │ DECIMAL(5,2) NOT NULL     │                                  │
│ section_scores               │ JSONB NOT NULL            │ Score breakdown per section      │
│ skills_snapshot              │ JSONB NOT NULL            │ All knowledge states at this time│
│ trigger_type                 │ TEXT NOT NULL             │ session_end/mock_exam/placement/ │
│                              │                           │ daily_compute/manual             │
│ trigger_reference_id         │ UUID NULL                 │ Session or exam ID that triggered│
│ prediction_model_version     │ TEXT NOT NULL             │ Which algorithm version          │
│ actual_exam_score            │ DECIMAL(5,2) NULL         │ Filled in when user reports score│
│ prediction_error             │ DECIMAL(5,2) NULL         │ ABS(predicted - actual)          │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, created_at DESC) — timeline query
  → INDEX on (user_id, trigger_type) — filter by trigger
  → INDEX on actual_exam_score WHERE actual_exam_score IS NOT NULL
    (for model accuracy analysis: "how good are our predictions?")
  → INDEX on prediction_model_version (compare models)

RETENTION POLICY:
  → Keep all rows (thin rows, valuable for ML training)
  → After 3 years: archive to cold storage, keep monthly aggregates

FUTURE-PROOFING:
  → actual_exam_score + prediction_error: enables model accuracy tracking and
    improvement. When students report real exam scores, we learn how good we are.
  → prediction_model_version: A/B test different scoring algorithms
  → skills_snapshot: enables offline analysis of what state led to what outcome
```

---

### TABLE: `public.knowledge_states`

**Purpose:** The core of the adaptive learning engine. One row per user per skill, tracking their current mastery probability using Bayesian Knowledge Tracing. This table is read before every question selection and written after every answer. It must be extremely fast.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ skill_id                     │ UUID NOT NULL             │ → skills.id                      │
│ mastery_probability          │ DECIMAL(6,5) NOT NULL     │ BKT P(mastery): 0.00000–1.00000  │
│ attempts_count               │ INTEGER DEFAULT 0         │                                  │
│ correct_count                │ INTEGER DEFAULT 0         │                                  │
│ consecutive_correct          │ SMALLINT DEFAULT 0        │ Reset on wrong answer            │
│ consecutive_wrong            │ SMALLINT DEFAULT 0        │ Reset on correct answer          │
│ p_transit                    │ DECIMAL(6,5) DEFAULT 0.10 │ BKT personalized learn rate      │
│ p_slip                       │ DECIMAL(6,5) DEFAULT 0.10 │ BKT: P(wrong | mastered)        │
│ p_guess                      │ DECIMAL(6,5) DEFAULT 0.25 │ BKT: P(correct | not mastered)  │
│ irt_theta                    │ DECIMAL(6,3) NULL         │ IRT ability estimate (per skill) │
│ priority_score               │ DECIMAL(8,5) DEFAULT 0    │ Score gain per minute if studied │
│ last_practiced_at            │ TIMESTAMPTZ NULL          │                                  │
│ first_practiced_at           │ TIMESTAMPTZ NULL          │                                  │
│ mastered_at                  │ TIMESTAMPTZ NULL          │ When P(mastery) first hit 0.85   │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, skill_id) — one state per user per skill
  → INDEX on user_id (load all states for a user in one query)
  → INDEX on (user_id, mastery_probability) — "find weakest skills for user"
  → INDEX on (user_id, priority_score DESC) — adaptive engine: pick highest priority
  → INDEX on (user_id, last_practiced_at) — spaced repetition scheduling
  → INDEX on mastered_at WHERE mastered_at IS NOT NULL (achievement triggers)

UPDATE PATTERN:
  → Updated by Supabase Edge Function after every question_attempt
  → BKT computation happens in Edge Function (not client)
  → Atomic update: read current state → apply BKT → write back (serialized per user)

CONSTRAINTS:
  → mastery_probability CHECK (BETWEEN 0 AND 1)
  → p_transit CHECK (BETWEEN 0 AND 1)
  → p_slip CHECK (BETWEEN 0 AND 1)
  → p_guess CHECK (BETWEEN 0 AND 1)
  → UNIQUE (user_id, skill_id)

FUTURE-PROOFING:
  → irt_theta per skill: enables sophisticated IRT ability tracking per domain
  → priority_score: computed field that drives adaptive selection, evolves
    with algorithm improvements without schema change
  → Personalized BKT params (p_transit, p_slip): system learns each student's
    learning rate over time — more accurate predictions at scale
```

---

## DOMAIN 5: VOCABULARY

### TABLE: `public.vocabulary_items`

**Purpose:** Master vocabulary table — every Hebrew word students need to know for YAEL. The Arabic cognate system, pgvector semantic embedding, and FSRS integration make this the most data-rich content table in the system.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ word_he                      │ TEXT NOT NULL             │ Hebrew (no nikud, for searching) │
│ word_nikud_he                │ TEXT NOT NULL             │ Hebrew with full vowel marks     │
│ root_he                      │ TEXT NULL                 │ Root: ש-ל-מ format               │
│ binyan                       │ TEXT NULL                 │ Verb pattern (if verb)           │
│ part_of_speech               │ TEXT NOT NULL             │ noun/verb/adjective/adverb/etc.  │
│ gender                       │ TEXT NULL                 │ masculine/feminine/both/none     │
│ number                       │ TEXT DEFAULT 'singular'   │ singular/plural/both            │
│ singular_form_id             │ UUID NULL                 │ → vocabulary_items.id (if plural)│
│ translation_ar               │ TEXT NOT NULL             │ Primary Arabic translation (MSA) │
│ translation_ar_dialects      │ JSONB DEFAULT '{}'        │ {egyptian, levantine, gulf, ...} │
│ root_ar                      │ TEXT NULL                 │ Arabic cognate root (if exists)  │
│ is_cognate                   │ BOOLEAN DEFAULT FALSE     │ True = same Semitic root         │
│ cognate_note_ar              │ TEXT NULL                 │ Arabic explanation of connection  │
│ false_friend_warning_ar      │ TEXT NULL                 │ Warning if misleadingly similar  │
│ definition_he                │ TEXT NULL                 │ Hebrew-language definition       │
│ example_sentence_he          │ TEXT NULL                 │ Example in Hebrew                │
│ example_sentence_ar          │ TEXT NULL                 │ Arabic translation of example    │
│ frequency_rank               │ INTEGER NULL              │ 1=most common in YAEL corpus     │
│ yael_level_first_appears     │ SMALLINT NULL             │ Which level this word appears    │
│ skill_id                     │ UUID NULL                 │ → skills.id (vocab sub-skill)   │
│ audio_url                    │ TEXT NULL                 │ Supabase Storage URL             │
│ audio_duration_ms            │ INTEGER NULL              │                                  │
│ embedding                    │ vector(1536) NULL         │ pgvector: semantic embedding     │
│ embedding_model              │ TEXT NULL                 │ Which model generated embedding  │
│ tags                         │ TEXT[] DEFAULT '{}'       │                                  │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ is_cognate_verified          │ BOOLEAN DEFAULT FALSE     │ Human-verified cognate claim     │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ deleted_at                   │ TIMESTAMPTZ NULL          │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → PK on id
  → INDEX on word_he (exact match lookup)
  → INDEX on root_he WHERE root_he IS NOT NULL (root family queries)
  → INDEX on root_ar WHERE root_ar IS NOT NULL (AR→HE bridge queries)
  → INDEX on is_cognate WHERE is_cognate = TRUE (show cognates as bridge)
  → INDEX on frequency_rank WHERE is_active = TRUE (most common first)
  → INDEX on yael_level_first_appears WHERE is_active = TRUE
  → INDEX on skill_id WHERE is_active = TRUE
  → GIN INDEX on tags
  → IVFFLAT INDEX on embedding (pgvector approximate nearest neighbor)
    Lists: 100 for 10K words, 500 for 100K words
    Probes: 10 at query time (balance speed/accuracy)

PGVECTOR USAGE:
  → Semantic search: "find words semantically similar to this concept"
  → Arabic word → find Hebrew near-neighbor by meaning
  → Cluster vocabulary by semantic field
  → Power "related words" feature without manual tagging

CONSTRAINTS:
  → part_of_speech CHECK (IN ('noun','verb','adjective','adverb','preposition',
                               'conjunction','pronoun','numeral','particle'))
  → gender CHECK (IN ('masculine','feminine','both','none') OR gender IS NULL)
  → embedding vector(1536): dimension must match embedding model output

FUTURE-PROOFING:
  → embedding_model: when models improve, regenerate and track which version
  → translation_ar_dialects JSONB: add Moroccan, Iraqi dialects without migration
  → is_cognate_verified: human quality control separate from AI-generated flag
  → singular_form_id: enables plurals to link to their singular form
```

---

### TABLE: `public.user_vocabulary_states`

**Purpose:** One row per user per vocabulary item — the current FSRS (Free Spaced Repetition Scheduler) state for that word. Determines when the word is next due for review. Queried every time the vocab session is started.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ vocab_id                     │ UUID NOT NULL             │ → vocabulary_items.id            │
│ fsrs_state                   │ TEXT DEFAULT 'new'        │ new/learning/review/relearning   │
│ stability                    │ DECIMAL(10,4) DEFAULT 1.0 │ FSRS: days until 90% retention  │
│ difficulty_fsrs              │ DECIMAL(6,4) DEFAULT 5.0  │ FSRS: item difficulty 1–10       │
│ retrievability               │ DECIMAL(6,5) NULL         │ P(recall) at last review time    │
│ due_at                       │ TIMESTAMPTZ NOT NULL      │ When to review next              │
│ last_review_at               │ TIMESTAMPTZ NULL          │                                  │
│ review_count                 │ INTEGER DEFAULT 0         │ Total reviews                    │
│ lapse_count                  │ INTEGER DEFAULT 0         │ Times rated "Again" after review │
│ is_mastered                  │ BOOLEAN DEFAULT FALSE     │ stability > 21 days threshold    │
│ is_suspended                 │ BOOLEAN DEFAULT FALSE     │ User paused this card            │
│ is_user_added                │ BOOLEAN DEFAULT FALSE     │ User manually added this word    │
│ is_leech                     │ BOOLEAN DEFAULT FALSE     │ Too many lapses — flag for help  │
│ leech_flagged_at             │ TIMESTAMPTZ NULL          │                                  │
│ added_to_deck_at             │ TIMESTAMPTZ NULL          │ When user added to their deck    │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, vocab_id)
  → INDEX on (user_id, due_at) WHERE is_suspended = FALSE
    — Critical: "find all words due for user X right now" — most common query
  → INDEX on (user_id, fsrs_state) — "how many new/learning/review words?"
  → INDEX on (user_id, is_mastered) — count of mastered words
  → INDEX on is_leech WHERE is_leech = TRUE (find struggling words)

CONSTRAINTS:
  → fsrs_state CHECK (IN ('new','learning','review','relearning'))
  → stability CHECK (stability > 0)
  → difficulty_fsrs CHECK (BETWEEN 1.0 AND 10.0)

FUTURE-PROOFING:
  → is_leech: identifies cards that are "leeches" (student keeps forgetting them)
    → triggers AI explanation refresh for that specific word
  → is_user_added: supports user-created cards in future
```

---

### TABLE: `public.user_vocabulary_reviews`

**Purpose:** Immutable log of every vocabulary review event. The raw data behind FSRS computation, user analytics, and platform analytics. This is an append-only audit table.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ vocab_id                     │ UUID NOT NULL             │ → vocabulary_items.id            │
│ session_id                   │ UUID NULL                 │ → study_sessions.id              │
│ rating                       │ SMALLINT NOT NULL         │ 1=Again 2=Hard 3=Good 4=Easy    │
│ response_time_ms             │ INTEGER NULL              │ Time from card shown to rated    │
│ state_before                 │ TEXT NOT NULL             │ fsrs_state at review time        │
│ stability_before             │ DECIMAL(10,4) NOT NULL    │                                  │
│ stability_after              │ DECIMAL(10,4) NOT NULL    │                                  │
│ difficulty_before            │ DECIMAL(6,4) NOT NULL     │                                  │
│ difficulty_after             │ DECIMAL(6,4) NOT NULL     │                                  │
│ due_before                   │ TIMESTAMPTZ NOT NULL      │ When it was due                  │
│ due_after                    │ TIMESTAMPTZ NOT NULL      │ When next due after this review  │
│ elapsed_days                 │ DECIMAL(10,4) NOT NULL    │ Days since last review           │
│ scheduled_days               │ DECIMAL(10,4) NOT NULL    │ Days until next review           │
│ is_lapse                     │ BOOLEAN DEFAULT FALSE     │ Again on a "review" state card   │
│ reviewed_at                  │ TIMESTAMPTZ NOT NULL      │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, reviewed_at DESC)
  → INDEX on (user_id, vocab_id, reviewed_at DESC) — review history per word
  → INDEX on rating WHERE is_lapse = TRUE — lapse rate analytics
  → INDEX on reviewed_at — platform-wide review analytics

CONSTRAINTS:
  → rating CHECK (BETWEEN 1 AND 4)
  → is append-only (no UPDATE, no DELETE via RLS)

PARTITIONING (future, at 50M+ rows):
  → RANGE on reviewed_at (monthly partitions)
```

---

## DOMAIN 6: SESSIONS & ATTEMPTS

### TABLE: `public.study_sessions`

**Purpose:** Every time a user starts a study session, mock exam, or vocab review, a row is created here. This is the central unit of learning activity. Used for streak tracking, score delta computation, progress analytics, and study plan fulfillment.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ session_type                 │ TEXT NOT NULL             │ placement/targeted/mixed/speed/  │
│                              │                           │ review/mock_exam/vocabulary/      │
│                              │                           │ grammar/reading/writing          │
│ yael_level                   │ SMALLINT NULL             │ Level targeted this session      │
│ focus_skill_id               │ UUID NULL                 │ → skills.id (for targeted)       │
│ study_plan_date              │ DATE NULL                 │ Which plan day this fulfills     │
│ status                       │ TEXT DEFAULT 'active'     │ active/completed/abandoned       │
│ started_at                   │ TIMESTAMPTZ NOT NULL      │                                  │
│ ended_at                     │ TIMESTAMPTZ NULL          │ NULL = still active              │
│ duration_seconds             │ INTEGER NULL              │ Computed on completion           │
│ questions_presented          │ INTEGER DEFAULT 0         │                                  │
│ questions_answered           │ INTEGER DEFAULT 0         │                                  │
│ questions_correct            │ INTEGER DEFAULT 0         │                                  │
│ accuracy_rate                │ DECIMAL(5,4) NULL         │ Computed on completion           │
│ score_before                 │ DECIMAL(5,2) NULL         │ Predicted score at session start │
│ score_after                  │ DECIMAL(5,2) NULL         │ Predicted score at session end   │
│ score_delta                  │ DECIMAL(5,2) NULL         │ score_after - score_before       │
│ xp_earned                    │ INTEGER DEFAULT 0         │                                  │
│ avg_response_time_ms         │ INTEGER NULL              │                                  │
│ is_timed                     │ BOOLEAN DEFAULT FALSE     │ Speed mode                       │
│ time_limit_seconds           │ INTEGER NULL              │                                  │
│ time_remaining_seconds       │ INTEGER NULL              │ If abandoned mid-timer          │
│ device_type                  │ TEXT NULL                 │ mobile/tablet/desktop            │
│ algorithm_version            │ TEXT NULL                 │ Which adaptive algorithm used    │
│ session_config               │ JSONB DEFAULT '{}'        │ Config snapshot for reproducibility│
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on user_id (all sessions for user)
  → INDEX on (user_id, started_at DESC) — session history
  → INDEX on (user_id, status) WHERE status = 'active' — find open sessions
  → INDEX on (user_id, session_type) — filter by type
  → INDEX on started_at — platform analytics
  → INDEX on score_delta WHERE score_delta IS NOT NULL — improvement analytics
  → INDEX on study_plan_date WHERE study_plan_date IS NOT NULL

CONSTRAINTS:
  → session_type CHECK (IN ('placement','targeted','mixed','speed','review',
                            'mock_exam','vocabulary','grammar','reading','writing'))
  → status CHECK (IN ('active','completed','abandoned'))
  → questions_correct CHECK (questions_correct <= questions_answered)
```

---

### TABLE: `public.question_attempts` *(PARTITIONED)*

**Purpose:** Every answer to every question, ever. The most granular and highest-volume table in the system. At 1M users answering 30 questions/day = 30M rows/day. Must be partitioned from day one. Contains knowledge state before/after for ML training data.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ session_id                   │ UUID NOT NULL             │ → study_sessions.id              │
│ user_id                      │ UUID NOT NULL             │ Denormalized — critical!         │
│ question_id                  │ UUID NOT NULL             │ → questions.id                   │
│ skill_id                     │ UUID NOT NULL             │ Denormalized from question       │
│ question_number              │ SMALLINT NOT NULL         │ Position within session (1-N)    │
│ option_chosen                │ SMALLINT NULL             │ 0–3, NULL if skipped             │
│ is_correct                   │ BOOLEAN NOT NULL          │                                  │
│ is_skipped                   │ BOOLEAN DEFAULT FALSE     │                                  │
│ response_time_ms             │ INTEGER NOT NULL          │                                  │
│ confidence_rating            │ SMALLINT NULL             │ 1=no idea 2=unsure 3=sure 4=cert │
│ hint_requested               │ BOOLEAN DEFAULT FALSE     │                                  │
│ explanation_viewed           │ BOOLEAN DEFAULT FALSE     │                                  │
│ explanation_helpful          │ BOOLEAN NULL              │ User rated explanation           │
│ is_flagged                   │ BOOLEAN DEFAULT FALSE     │ User flagged question            │
│ flag_reason                  │ TEXT NULL                 │                                  │
│ mastery_before               │ DECIMAL(6,5) NULL         │ P(mastery) for skill before      │
│ mastery_after                │ DECIMAL(6,5) NULL         │ P(mastery) for skill after       │
│ irt_theta_before             │ DECIMAL(6,3) NULL         │ IRT ability estimate before      │
│ irt_theta_after              │ DECIMAL(6,3) NULL         │ IRT ability estimate after       │
│ difficulty_seen              │ DECIMAL(4,3) NULL         │ IRT difficulty at time of Q      │
│ created_at                   │ TIMESTAMPTZ NOT NULL      │ PARTITION KEY                    │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

PARTITIONING:
  → PARTITION BY RANGE (created_at)
  → Monthly partitions: question_attempts_2025_01, _2025_02, etc.
  → Old partitions: archive to Supabase cold storage after 18 months
  → New partition creation: automated via pg_cron or migration script

INDEXES (on each partition):
  → INDEX on (user_id, created_at DESC) — "user's answer history"
  → INDEX on question_id — "how many times was this question answered?"
  → INDEX on (user_id, question_id) — "has user seen this question before?"
  → INDEX on is_correct, skill_id — analytics: accuracy by skill
  → INDEX on is_flagged WHERE is_flagged = TRUE — admin review queue
  → BRIN INDEX on created_at (ordered by insert time — very cheap)

CONSTRAINTS:
  → option_chosen CHECK (BETWEEN 0 AND 3 OR option_chosen IS NULL)
  → confidence_rating CHECK (BETWEEN 1 AND 4 OR confidence_rating IS NULL)
  → mastery_before CHECK (BETWEEN 0 AND 1 OR mastery_before IS NULL)
  → mastery_after CHECK (BETWEEN 0 AND 1 OR mastery_after IS NULL)

RLS:
  → SELECT: auth.uid() = user_id (own attempts only)
  → INSERT: auth.uid() = user_id
  → UPDATE: NONE (attempts are immutable — no changing answers)
  → DELETE: NONE (immutable record)

FUTURE-PROOFING:
  → mastery_before/after: gold standard ML training data
  → irt_theta columns: IRT ability tracking per attempt (research value)
  → explanation_helpful: feedback loop to improve AI explanation quality
  → Monthly partitioning: built-in scalability to billions of rows
```

---

## DOMAIN 7: ESSAYS

### TABLE: `public.user_essays`

**Purpose:** Stores student-written Hebrew essays with full draft history. The draft_history JSONB enables version recovery and writing progress analysis.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ prompt_id                    │ UUID NOT NULL             │ → essay_prompts.id               │
│ session_id                   │ UUID NULL                 │ → study_sessions.id              │
│ content_he                   │ TEXT NOT NULL             │ Final submitted Hebrew essay     │
│ word_count                   │ INTEGER NOT NULL          │ Computed on save                 │
│ char_count                   │ INTEGER NOT NULL          │                                  │
│ submission_status            │ TEXT DEFAULT 'draft'      │ draft/submitted/feedback_pending/│
│                              │                           │ feedback_ready                   │
│ submitted_at                 │ TIMESTAMPTZ NULL          │ When final submission happened   │
│ time_spent_seconds           │ INTEGER NULL              │ Total writing time               │
│ draft_history                │ JSONB DEFAULT '[]'        │ [{content, saved_at, word_count}]│
│ revision_count               │ INTEGER DEFAULT 0         │ How many times edited            │
│ ai_feedback_requested_at     │ TIMESTAMPTZ NULL          │ When AI was invoked              │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ deleted_at                   │ TIMESTAMPTZ NULL          │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, created_at DESC)
  → INDEX on (user_id, submission_status)
  → INDEX on ai_feedback_requested_at WHERE feedback_ready (for async job queue)
  → INDEX on prompt_id (which prompts are most used?)
```

---

### TABLE: `public.essay_feedback`

**Purpose:** AI-generated (and optionally human-reviewed) structured feedback on student essays. One row per essay. The grammar_issues and vocabulary_suggestions are JSONB arrays with character-precise error locations for inline annotation in the UI.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ essay_id                     │ UUID UNIQUE NOT NULL      │ → user_essays.id (one per essay) │
│ user_id                      │ UUID NOT NULL             │ Denormalized                     │
│ feedback_type                │ TEXT NOT NULL             │ ai_only/human_reviewed/ai_plus_  │
│                              │                           │ human                            │
│ overall_score                │ DECIMAL(5,2) NULL         │ 0–100                            │
│ grammar_score                │ DECIMAL(5,2) NULL         │                                  │
│ vocabulary_score             │ DECIMAL(5,2) NULL         │                                  │
│ coherence_score              │ DECIMAL(5,2) NULL         │                                  │
│ yael_level_achieved          │ SMALLINT NULL             │ What YAEL level does this reach  │
│ overall_comment_ar           │ TEXT NULL                 │ Arabic overall feedback          │
│ strengths_ar                 │ TEXT NULL                 │ What was done well               │
│ improvements_ar              │ TEXT NULL                 │ What to improve                  │
│ grammar_issues               │ JSONB DEFAULT '[]'        │ [{start, end, wrong, correct,    │
│                              │                           │   reason_ar, severity}]          │
│ vocabulary_suggestions       │ JSONB DEFAULT '[]'        │ [{word_used, better_word,        │
│                              │                           │   reason_ar}]                    │
│ structure_feedback_ar        │ TEXT NULL                 │ Paragraph structure feedback     │
│ improved_version_he          │ TEXT NULL                 │ AI-rewritten version (optional)  │
│ skill_ids_exercised          │ UUID[] DEFAULT '{}'       │ Which skills this essay tested   │
│ ai_model_version             │ TEXT NULL                 │                                  │
│ ai_prompt_version            │ TEXT NULL                 │ Which prompt template was used   │
│ generation_time_ms           │ INTEGER NULL              │                                  │
│ reviewed_by                  │ UUID NULL                 │ → auth.users.id (admin reviewer) │
│ reviewed_at                  │ TIMESTAMPTZ NULL          │                                  │
│ student_rating               │ SMALLINT NULL             │ 1–5: did student find it useful? │
│ generated_at                 │ TIMESTAMPTZ NOT NULL      │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on essay_id
  → INDEX on user_id, generated_at DESC
  → INDEX on yael_level_achieved (calibration analytics)
  → INDEX on ai_model_version (compare model quality)
  → INDEX on student_rating WHERE student_rating IS NOT NULL (quality feedback)
```

---

## DOMAIN 8: AI SYSTEMS

### TABLE: `cache.ai_explanations`

**Purpose:** Cached AI-generated explanations for every (question, wrong_option) combination. This is the primary cost control mechanism. After initial warm-up of the question bank, 95%+ of explanation requests hit this cache rather than calling the Claude API. Stored in `cache` schema — different backup policy, re-generable.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ question_id                  │ UUID NOT NULL             │ → questions.id                   │
│ wrong_option_index           │ SMALLINT NOT NULL         │ 0–3 (which wrong answer chosen)  │
│ explanation_ar               │ TEXT NOT NULL             │ Why this answer is wrong (Arabic)│
│ correct_explanation_ar       │ TEXT NOT NULL             │ Why the right answer is right    │
│ linguistic_bridge_ar         │ TEXT NULL                 │ AR↔HE linguistic insight         │
│ memory_trick_ar              │ TEXT NULL                 │ Mnemonic for Arabic speakers     │
│ reinforcement_example_he     │ TEXT NULL                 │ Extra Hebrew example             │
│ related_grammar_rule_id      │ UUID NULL                 │ → grammar_rules.id              │
│ related_vocab_ids            │ UUID[] DEFAULT '{}'       │ → vocabulary_items.id           │
│ quality_score                │ DECIMAL(3,1) NULL         │ 1.0–5.0, human-reviewed         │
│ quality_reviewed_by          │ UUID NULL                 │ → auth.users.id (admin)         │
│ quality_reviewed_at          │ TIMESTAMPTZ NULL          │                                  │
│ quality_notes                │ TEXT NULL                 │ Reviewer notes for regeneration  │
│ ai_model_version             │ TEXT NOT NULL             │ Which Claude model generated     │
│ ai_prompt_version            │ TEXT NOT NULL             │ Which prompt template version    │
│ generation_time_ms           │ INTEGER NULL              │                                  │
│ view_count                   │ INTEGER DEFAULT 0         │ Cache hit counter                │
│ helpful_count                │ INTEGER DEFAULT 0         │ User feedback: helpful           │
│ unhelpful_count              │ INTEGER DEFAULT 0         │ User feedback: not helpful       │
│ generated_at                 │ TIMESTAMPTZ NOT NULL      │                                  │
│ last_served_at               │ TIMESTAMPTZ NULL          │                                  │
│ needs_regeneration           │ BOOLEAN DEFAULT FALSE     │ Flagged for refresh              │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (question_id, wrong_option_index)
    — The primary lookup: always (question_id, option) → one row
  → INDEX on quality_score WHERE quality_score IS NOT NULL
  → INDEX on view_count DESC — "most used explanations" (prioritize for human review)
  → INDEX on needs_regeneration WHERE needs_regeneration = TRUE
  → INDEX on ai_model_version (for bulk regeneration when model upgrades)

RLS:
  → SELECT: All authenticated users (explanation cache is not user-specific)
  → INSERT/UPDATE: Service role only
  → DELETE: Service role only (when regenerating)

CACHE WARM-UP STRATEGY:
  → On launch: generate all explanations for top wrong answers per question
  → Priority: question.times_answered DESC (warm most-seen questions first)
  → 1,000 questions × 3 wrong options = 3,000 rows = complete coverage
  → Estimated generation cost: 3,000 × $0.003 = ~$9 one-time cost

FUTURE-PROOFING:
  → helpful_count/unhelpful_count: user feedback loop for quality
  → needs_regeneration: when model upgrades, flag all rows for background refresh
  → related_vocab_ids: enables "words from this explanation you should study" feature
```

---

### TABLE: `public.ai_reports`

**Purpose:** Comprehensive AI-generated learning reports. Narrative summaries of progress, insights, and recommendations. Generated weekly or at milestones. The narrative_ar is the "letter from your tutor" — the most human moment of the AI experience.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ report_type                  │ TEXT NOT NULL             │ weekly/monthly/pre_exam/milestone│
│                              │                           │ /session/placement_result        │
│ report_period_start          │ DATE NULL                 │                                  │
│ report_period_end            │ DATE NULL                 │                                  │
│ trigger_type                 │ TEXT NOT NULL             │ scheduled/session_count/         │
│                              │                           │ score_milestone/user_request/    │
│                              │                           │ pre_exam                         │
│ trigger_reference_id         │ UUID NULL                 │ Session, exam, or event that     │
│                              │                           │ triggered this report            │
│ score_at_start               │ DECIMAL(5,2) NULL         │ Score at period start            │
│ score_at_end                 │ DECIMAL(5,2) NULL         │ Score at report time             │
│ score_delta                  │ DECIMAL(5,2) NULL         │ Improvement this period          │
│ strengths                    │ JSONB DEFAULT '[]'        │ [{skill_id, evidence_ar,         │
│                              │                           │   recommendation_ar}]            │
│ weaknesses                   │ JSONB DEFAULT '[]'        │ Same structure                   │
│ breakthroughs                │ JSONB DEFAULT '[]'        │ [{description_ar, happened_at}]  │
│ error_patterns_detected      │ JSONB DEFAULT '[]'        │ [{pattern_code, frequency,       │
│                              │                           │   recommendation_ar}]            │
│ study_plan_adjustments       │ JSONB NULL                │ AI-recommended changes           │
│ recommended_focus_skill_ids  │ UUID[] DEFAULT '{}'       │                                  │
│ predicted_score_on_plan      │ DECIMAL(5,2) NULL         │ If follows recommendations       │
│ days_to_target               │ INTEGER NULL              │ Estimated days to hit target     │
│ executive_summary_ar         │ TEXT NOT NULL             │ 3-sentence Arabic summary        │
│ narrative_ar                 │ TEXT NOT NULL             │ Full Arabic narrative (the "letter")│
│ motivational_message_ar      │ TEXT NOT NULL             │ Personalized motivational close  │
│ ai_model_version             │ TEXT NOT NULL             │                                  │
│ generation_time_ms           │ INTEGER NULL              │                                  │
│ is_read                      │ BOOLEAN DEFAULT FALSE     │                                  │
│ read_at                      │ TIMESTAMPTZ NULL          │                                  │
│ student_rating               │ SMALLINT NULL             │ 1–5: was this report useful?     │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, created_at DESC)
  → INDEX on (user_id, report_type)
  → INDEX on is_read WHERE is_read = FALSE (unread notification badge)
  → INDEX on report_type, created_at (platform: "all weekly reports this month")
```

---

## DOMAIN 9: ACHIEVEMENTS & GAMIFICATION

### TABLE: `public.achievement_definitions`

**Purpose:** The complete catalog of all possible achievements. Separated from user achievements so the catalog can evolve without touching user data. The trigger_config JSONB defines the exact conditions in a machine-readable format that the achievement engine can evaluate.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ code                         │ TEXT UNIQUE NOT NULL      │ e.g., "streak_7", "vocab_100"    │
│ category                     │ TEXT NOT NULL             │ streak/vocabulary/grammar/        │
│                              │                           │ reading/practice/exam/social/    │
│                              │                           │ milestone/special                │
│ name_ar                      │ TEXT NOT NULL             │                                  │
│ name_he                      │ TEXT NULL                 │ Optional Hebrew name             │
│ description_ar               │ TEXT NOT NULL             │                                  │
│ icon_name                    │ TEXT NOT NULL             │ Design system icon identifier    │
│ icon_color                   │ TEXT NOT NULL             │ Hex color                        │
│ badge_tier                   │ TEXT DEFAULT 'bronze'     │ bronze/silver/gold/platinum/     │
│                              │                           │ diamond                          │
│ xp_reward                    │ INTEGER DEFAULT 0         │                                  │
│ trigger_type                 │ TEXT NOT NULL             │ automatic/manual/scheduled       │
│ trigger_config               │ JSONB NOT NULL            │ {metric, operator, threshold,    │
│                              │                           │  time_window, skill_id?}         │
│ trigger_event                │ TEXT NULL                 │ DB event that should check this  │
│ is_hidden                    │ BOOLEAN DEFAULT FALSE     │ Mystery badge — description hidden│
│ is_repeatable                │ BOOLEAN DEFAULT FALSE     │ Can be earned multiple times?    │
│ repeat_cooldown_days         │ INTEGER NULL              │ If repeatable: days between      │
│ prerequisite_achievement_ids │ UUID[] DEFAULT '{}'       │                                  │
│ display_order                │ SMALLINT DEFAULT 0        │ UI ordering                      │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

TRIGGER_CONFIG EXAMPLES:
  Streak 7:    {"metric": "streak_days", "operator": ">=", "threshold": 7}
  Vocab 100:   {"metric": "vocab_mastered_count", "operator": ">=", "threshold": 100}
  Perfect:     {"metric": "session_accuracy", "operator": "=", "threshold": 1.0}
  Speed:       {"metric": "avg_response_ms", "operator": "<=", "threshold": 30000}
  Level 3:     {"metric": "score_predicted", "operator": ">=", "threshold": 100}

INDEXES:
  → UNIQUE on code
  → INDEX on category WHERE is_active = TRUE
  → INDEX on trigger_event WHERE trigger_event IS NOT NULL
    (achievement engine: "check all achievements triggered by this event")
```

---

### TABLE: `public.user_achievements`

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ achievement_id               │ UUID NOT NULL             │ → achievement_definitions.id     │
│ earned_at                    │ TIMESTAMPTZ NOT NULL      │                                  │
│ trigger_context              │ JSONB DEFAULT '{}'        │ {session_id, score, streak_count}│
│ xp_awarded                   │ INTEGER NOT NULL          │ Copied from definition at time   │
│ is_shown_to_user             │ BOOLEAN DEFAULT FALSE     │ Has unlock screen been shown?    │
│ shown_at                     │ TIMESTAMPTZ NULL          │                                  │
│ is_shared                    │ BOOLEAN DEFAULT FALSE     │ User shared on social            │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, achievement_id) — one per user per badge (for non-repeatable)
  → INDEX on user_id, earned_at DESC
  → INDEX on is_shown_to_user WHERE is_shown_to_user = FALSE
    — "find all unseen achievements to show user on login"
  → INDEX on achievement_id (platform analytics: "most earned badge?")
```

---

## DOMAIN 10: XP SYSTEM

### TABLE: `public.xp_levels`

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ level_number                 │ SMALLINT UNIQUE NOT NULL  │ 1, 2, 3, ... 20                 │
│ name_ar                      │ TEXT NOT NULL             │ "مبتدئ", "متعلم", "ماهر"...    │
│ name_he                      │ TEXT NULL                 │                                  │
│ xp_required_from_zero        │ INTEGER NOT NULL          │ Cumulative XP from level 1       │
│ xp_range_min                 │ INTEGER NOT NULL          │ Min XP for this level            │
│ xp_range_max                 │ INTEGER NOT NULL          │ Max XP for this level            │
│ badge_icon                   │ TEXT NOT NULL             │                                  │
│ badge_color_primary          │ TEXT NOT NULL             │ Hex                              │
│ badge_color_secondary        │ TEXT NULL                 │ Hex for gradient                 │
│ perks                        │ JSONB DEFAULT '[]'        │ [{feature unlocked, description}]│
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

---

### TABLE: `public.xp_transactions`

**Purpose:** Immutable ledger of every XP earning event. The `balance_after` column eliminates the need for SUM() queries to find current XP balance — a common performance trap in gamification systems.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ amount                       │ INTEGER NOT NULL          │ Positive = earned, negative rare │
│ balance_after                │ INTEGER NOT NULL          │ Running total — never compute SUM│
│ transaction_type             │ TEXT NOT NULL             │ question_correct/session_complete│
│                              │                           │ vocab_review/streak_bonus/       │
│                              │                           │ achievement/daily_mission/       │
│                              │                           │ essay_submit/mock_exam/level_up/ │
│                              │                           │ admin_adjustment                 │
│ reference_type               │ TEXT NULL                 │ "question_attempt", "session",   │
│                              │                           │ "achievement", etc.              │
│ reference_id                 │ UUID NULL                 │ The specific entity              │
│ multiplier                   │ DECIMAL(4,2) DEFAULT 1.0  │ Streak bonus multiplier applied  │
│ description_ar               │ TEXT NULL                 │ Human-readable reason            │
│ created_at                   │ TIMESTAMPTZ NOT NULL      │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, created_at DESC) — user XP history
  → INDEX on transaction_type — "how much XP from achievements this month?"
  → INDEX on (user_id, transaction_type) — breakdown by type
  → BRIN INDEX on created_at (time-series append pattern)

CONSTRAINTS:
  → balance_after CHECK (balance_after >= 0)
  → transaction_type CHECK (IN (...all valid types...))
  → Immutable: no UPDATE, no DELETE via RLS

CONCURRENCY SAFETY:
  → balance_after is computed in the same transaction as INSERT
  → Serialized per user via advisory lock in Edge Function
  → Prevents race condition where two concurrent XP grants give wrong balance
```

---

## DOMAIN 11: STREAKS

### TABLE: `public.user_streaks`

**Purpose:** Current streak state per user. Denormalized for instant dashboard display. The grace-use system (one free miss per 30 days) is tracked here. Streak freezes (earned or purchasable) are stored as a count.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID UNIQUE NOT NULL      │ → auth.users.id                  │
│ current_streak_days          │ INTEGER DEFAULT 0         │                                  │
│ longest_streak_days          │ INTEGER DEFAULT 0         │ All-time record                  │
│ streak_started_at            │ DATE NULL                 │ When current streak began        │
│ last_activity_date           │ DATE NULL                 │ In user's local timezone         │
│ grace_period_used_at         │ DATE NULL                 │ Date grace was last used         │
│ grace_periods_this_month     │ SMALLINT DEFAULT 0        │ Max 1 per 30 days                │
│ total_active_days            │ INTEGER DEFAULT 0         │ Lifetime days with any activity  │
│ streak_freezes_remaining     │ SMALLINT DEFAULT 0        │ Purchased/earned freeze count    │
│ longest_streak_started_at    │ DATE NULL                 │ For historical reference         │
│ longest_streak_ended_at      │ DATE NULL                 │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on user_id
  → INDEX on last_activity_date — notification: "find users who haven't studied today"
  → INDEX on current_streak_days DESC — streak leaderboard

STREAK UPDATE LOGIC (enforced in Edge Function, not DB):
  → On any qualifying activity: check last_activity_date
  → If last_activity_date = yesterday: increment current_streak_days
  → If last_activity_date = today: no change (already counted)
  → If last_activity_date = 2 days ago and grace_periods_this_month < 1:
    Apply grace, keep streak, increment grace_periods_this_month
  → If last_activity_date > 2 days ago: reset streak to 1
  → Update last_activity_date = today, total_active_days + 1
```

---

### TABLE: `public.streak_history`

**Purpose:** Daily log of streak activity. One row per user per day. Enables "calendar view" of past activity, analytics on study patterns, and retrospective grace period validation.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ activity_date                │ DATE NOT NULL             │ In user's local timezone         │
│ was_active                   │ BOOLEAN NOT NULL          │                                  │
│ study_minutes                │ SMALLINT DEFAULT 0        │                                  │
│ questions_answered           │ SMALLINT DEFAULT 0        │                                  │
│ sessions_completed           │ SMALLINT DEFAULT 0        │                                  │
│ streak_day_number            │ INTEGER NULL              │ Day N of their streak            │
│ grace_day_used               │ BOOLEAN DEFAULT FALSE     │                                  │
│ freeze_used                  │ BOOLEAN DEFAULT FALSE     │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, activity_date)
  → INDEX on user_id, activity_date DESC — calendar view
  → INDEX on activity_date — platform analytics: "how many users active on X date?"

PARTITIONING (when > 365M rows):
  → RANGE on activity_date (yearly partitions)
```

---

## DOMAIN 12: DAILY MISSIONS

### TABLE: `public.mission_templates`

**Purpose:** The library of mission types that the system assigns daily. Weighted random selection with YAEL-level filtering ensures missions are always appropriate and varied.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ code                         │ TEXT UNIQUE NOT NULL      │ e.g., "answer_10_correct"        │
│ title_ar                     │ TEXT NOT NULL             │                                  │
│ description_ar               │ TEXT NOT NULL             │                                  │
│ mission_type                 │ TEXT NOT NULL             │ questions_correct/study_minutes/ │
│                              │                           │ vocab_reviews/streak_maintain/   │
│                              │                           │ skill_focus/mock_exam/reading/   │
│                              │                           │ essay_submit                     │
│ target_metric                │ TEXT NOT NULL             │ The metric to track              │
│ target_value                 │ INTEGER NOT NULL          │ How much of the metric needed    │
│ xp_reward                    │ INTEGER NOT NULL          │                                  │
│ difficulty_tier              │ TEXT DEFAULT 'medium'     │ easy/medium/hard                 │
│ skill_id                     │ UUID NULL                 │ → skills.id (skill-specific)     │
│ yael_level_min               │ SMALLINT NULL             │ Only assign to users at this +   │
│ yael_level_max               │ SMALLINT NULL             │ Only assign to users at this -   │
│ days_since_registration_min  │ INTEGER NULL              │ Only assign after N days         │
│ selection_weight             │ INTEGER DEFAULT 10        │ Weighted random selection        │
│ is_daily                     │ BOOLEAN DEFAULT TRUE      │                                  │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

---

### TABLE: `public.user_daily_missions`

**Purpose:** Daily missions as assigned to specific users. Generated each day by a Supabase cron job that runs at midnight in each user's timezone. Expires at end of calendar day.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ template_id                  │ UUID NOT NULL             │ → mission_templates.id           │
│ mission_date                 │ DATE NOT NULL             │ Date in user's timezone          │
│ status                       │ TEXT DEFAULT 'pending'    │ pending/in_progress/completed/   │
│                              │                           │ failed/skipped                   │
│ target_value                 │ INTEGER NOT NULL          │ Snapshot from template           │
│ current_value                │ INTEGER DEFAULT 0         │ Progress counter                 │
│ xp_reward                    │ INTEGER NOT NULL          │ Snapshot from template           │
│ xp_awarded                   │ BOOLEAN DEFAULT FALSE     │ Has XP been credited?            │
│ completed_at                 │ TIMESTAMPTZ NULL          │                                  │
│ expires_at                   │ TIMESTAMPTZ NOT NULL      │ End of day in user's timezone    │
│ context                      │ JSONB DEFAULT '{}'        │ {skill_id, yael_level, etc.}     │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, template_id, mission_date)
  → INDEX on (user_id, mission_date) — "today's missions for user"
  → INDEX on (status, expires_at) WHERE status != 'completed'
    — Expiry job: find all missions that expired unfulfilled
  → INDEX on mission_date, status — platform analytics
```

---

## DOMAIN 13: ADAPTIVE LEARNING

### TABLE: `public.study_plans`

**Purpose:** AI-generated personalized study calendars. One active plan per user at a time. The daily_sessions JSONB is a pre-computed calendar of exactly what to study on which day, updated when the adaptive engine detects plan divergence.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ plan_name_ar                 │ TEXT NOT NULL             │ e.g., "خطة 30 يوم لـ 120+"      │
│ exam_date                    │ DATE NOT NULL             │ Snapshot of exam date            │
│ target_score                 │ DECIMAL(5,2) NOT NULL     │ Snapshot of target               │
│ baseline_score               │ DECIMAL(5,2) NOT NULL     │ Score when plan was generated    │
│ strategy_type                │ TEXT NOT NULL             │ exam_sprint/foundation/          │
│                              │                           │ balanced/intensive               │
│ total_planned_sessions       │ INTEGER NOT NULL          │                                  │
│ total_planned_minutes        │ INTEGER NOT NULL          │                                  │
│ daily_sessions               │ JSONB NOT NULL            │ [{date, skill_ids[], session_type│
│                              │                           │  est_minutes, priority, focus}]  │
│ completion_rate              │ DECIMAL(5,4) DEFAULT 0    │ Completed days / total days      │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │ Only one active plan per user    │
│ is_auto_rebalancing          │ BOOLEAN DEFAULT TRUE      │ AI can adjust plan automatically │
│ last_rebalanced_at           │ TIMESTAMPTZ NULL          │                                  │
│ rebalance_count              │ INTEGER DEFAULT 0         │                                  │
│ ai_model_version             │ TEXT NOT NULL             │                                  │
│ ai_reasoning_ar              │ TEXT NULL                 │ Why AI chose this structure      │
│ generated_at                 │ TIMESTAMPTZ NOT NULL      │                                  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, is_active) WHERE is_active = TRUE
  → INDEX on exam_date — "find users with exam this week"
  → PARTIAL UNIQUE on (user_id) WHERE is_active = TRUE
    — Enforces one active plan per user at DB level

CONSTRAINTS:
  → PARTIAL UNIQUE on (user_id) WHERE is_active = TRUE
    (only one active plan per user — critical business rule)
```

---

### TABLE: `public.next_item_selections`

**Purpose:** Audit log of every decision the adaptive engine made about which question to serve next. Invaluable for algorithm debugging, A/B testing different selection strategies, and retrospective analysis of why a user did or didn't improve.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ session_id                   │ UUID NOT NULL             │ → study_sessions.id              │
│ selected_question_id         │ UUID NOT NULL             │ → questions.id                   │
│ algorithm_version            │ TEXT NOT NULL             │ Which selection algorithm        │
│ candidate_count              │ INTEGER NOT NULL          │ How many Qs were considered      │
│ selection_reason             │ JSONB NOT NULL            │ {primary_reason, scores:{}}      │
│ skill_priority_used          │ UUID NULL                 │ Which skill drove selection      │
│ expected_score_gain          │ DECIMAL(5,3) NULL         │ Predicted ΔScore if answered     │
│ irt_optimal_difficulty       │ DECIMAL(4,3) NULL         │ Target difficulty at user's theta│
│ actual_difficulty_served     │ DECIMAL(4,3) NULL         │ Question's actual difficulty     │
│ was_correct                  │ BOOLEAN NULL              │ Filled in after answer           │
│ created_at                   │ TIMESTAMPTZ NOT NULL      │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (session_id) — replay a session's decisions
  → INDEX on (user_id, created_at DESC)
  → INDEX on algorithm_version — compare algorithms (A/B)
  → INDEX on expected_score_gain, was_correct — "how accurate is our gain prediction?"

RETENTION:
  → 6 months online, then archive
  → Summarized into algorithm performance metrics before archive
```

---

## DOMAIN 14: MISTAKES & REVISION

### TABLE: `public.user_mistakes`

**Purpose:** Curated mistake registry. Unlike question_attempts (every attempt), this table surfaces meaningful patterns — one row per question, updated on repeat mistakes, resolved when the student consistently gets it right. The error_pattern_code links to AI-classified mistake categories.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ question_id                  │ UUID NOT NULL             │ → questions.id                   │
│ skill_id                     │ UUID NOT NULL             │ Denormalized from question       │
│ first_attempt_id             │ UUID NOT NULL             │ → question_attempts.id           │
│ latest_attempt_id            │ UUID NOT NULL             │ → question_attempts.id           │
│ mistake_type                 │ TEXT NOT NULL             │ wrong_answer/slow_response/      │
│                              │                           │ low_confidence_correct/          │
│                              │                           │ inconsistent_correct_wrong       │
│ wrong_option_chosen          │ SMALLINT NULL             │ Most recently chosen wrong option│
│ times_made                   │ INTEGER DEFAULT 1         │ How many times this Q was missed │
│ error_pattern_code           │ TEXT NULL                 │ → error_patterns.code            │
│ first_made_at                │ TIMESTAMPTZ NOT NULL      │                                  │
│ last_made_at                 │ TIMESTAMPTZ NOT NULL      │                                  │
│ is_resolved                  │ BOOLEAN DEFAULT FALSE     │ Got 3 correct in a row           │
│ resolved_at                  │ TIMESTAMPTZ NULL          │                                  │
│ in_revision_queue            │ BOOLEAN DEFAULT TRUE      │                                  │
│ user_note_ar                 │ TEXT NULL                 │ User can add their own note      │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, question_id) — one mistake record per question
  → INDEX on (user_id, is_resolved) WHERE is_resolved = FALSE
    — Dashboard: "how many unresolved mistakes?"
  → INDEX on (user_id, skill_id) WHERE is_resolved = FALSE
    — "What skills have the most unresolved mistakes?"
  → INDEX on error_pattern_code WHERE error_pattern_code IS NOT NULL
  → INDEX on last_made_at DESC — most recent mistakes first
```

---

### TABLE: `public.revision_queue`

**Purpose:** Priority-sorted queue of items (questions or vocabulary) that a user should review. Combines FSRS-scheduled vocab with mistake-triggered question review. The priority_score determines ordering — computed by the adaptive engine considering recency, error frequency, and exam proximity.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ item_type                    │ TEXT NOT NULL             │ question / vocabulary            │
│ item_id                      │ UUID NOT NULL             │ Polymorphic: question or vocab ID│
│ queue_reason                 │ TEXT NOT NULL             │ wrong_answer/low_confidence/     │
│                              │                           │ fsrs_scheduled/ai_flagged/       │
│                              │                           │ user_added/pre_exam_priority     │
│ priority_score               │ DECIMAL(10,5) DEFAULT 0   │ Higher = review sooner           │
│ due_at                       │ TIMESTAMPTZ NOT NULL      │ Earliest this should be reviewed │
│ skill_id                     │ UUID NULL                 │ → skills.id (denormalized)       │
│ times_in_queue               │ SMALLINT DEFAULT 1        │ How many times queued            │
│ times_reviewed               │ SMALLINT DEFAULT 0        │                                  │
│ last_reviewed_at             │ TIMESTAMPTZ NULL          │                                  │
│ is_resolved                  │ BOOLEAN DEFAULT FALSE     │                                  │
│ resolved_at                  │ TIMESTAMPTZ NULL          │                                  │
│ source_mistake_id            │ UUID NULL                 │ → user_mistakes.id if applicable │
│ source_vocab_state_id        │ UUID NULL                 │ → user_vocabulary_states.id      │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → PARTIAL UNIQUE on (user_id, item_type, item_id) WHERE is_resolved = FALSE
    — One active queue entry per item
  → INDEX on (user_id, due_at, priority_score DESC) WHERE is_resolved = FALSE
    — Primary queue query: "next items due for user, ordered by priority"
  → INDEX on (user_id, item_type) WHERE is_resolved = FALSE
    — "How many vocab vs. question items in queue?"
```

---

## DOMAIN 15: ANALYTICS

### TABLE: `analytics.events` *(PARTITIONED)*

**Purpose:** Raw event stream from all user interactions. The source of truth for all behavioral analytics. Completely isolated from main application queries to prevent interference. Partitioned monthly from day one.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID NOT NULL             │ PK includes created_at           │
│ user_id                      │ UUID NULL                 │ NULL for pre-auth events         │
│ session_reference            │ TEXT NULL                 │ Browser session identifier       │
│ event_name                   │ TEXT NOT NULL             │ e.g., "question_answered"        │
│ event_category               │ TEXT NOT NULL             │ practice/vocab/exam/nav/onboard  │
│ properties                   │ JSONB DEFAULT '{}'        │ Event-specific payload           │
│ user_agent_hash              │ TEXT NULL                 │ Hashed — no PII                  │
│ device_type                  │ TEXT NULL                 │ mobile/tablet/desktop            │
│ country_code                 │ CHAR(2) NULL              │ From IP geolocation (not stored) │
│ app_version                  │ TEXT NULL                 │                                  │
│ created_at                   │ TIMESTAMPTZ NOT NULL      │ PARTITION KEY                    │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

PARTITIONING:
  → PARTITION BY RANGE (created_at) on month
  → analytics_events_2025_01, _2025_02, etc.
  → Partition creation: automated monthly via pg_cron
  → Archive policy: move partitions > 18 months to Supabase cold storage

INDEXES (per partition):
  → BRIN on created_at — extremely cheap for time-series
  → INDEX on user_id WHERE user_id IS NOT NULL
  → INDEX on event_name — aggregate by event type
  → GIN on properties — query inside JSONB event data

RLS:
  → INSERT: auth.uid() = user_id (users generate own events)
  → SELECT: Admin service role ONLY
  → UPDATE: NONE
  → DELETE: NONE

PRIVACY DESIGN:
  → No raw IP addresses stored — country_code derived and IP discarded
  → user_agent_hash not user_agent (fingerprinting prevention)
  → GDPR: users with data_sharing_analytics = FALSE have events dropped
```

---

### TABLE: `analytics.daily_aggregates`

**Purpose:** Pre-aggregated daily stats per user. Computed nightly by Edge Function from analytics.events + question_attempts. Dashboard and statistics page query this, never raw events. This is the bridge between expensive raw event queries and fast dashboard reads.

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ agg_date                     │ DATE NOT NULL             │                                  │
│ questions_answered           │ INTEGER DEFAULT 0         │                                  │
│ questions_correct            │ INTEGER DEFAULT 0         │                                  │
│ accuracy_rate                │ DECIMAL(5,4) NULL         │                                  │
│ study_minutes                │ INTEGER DEFAULT 0         │                                  │
│ vocab_reviews                │ INTEGER DEFAULT 0         │                                  │
│ sessions_completed           │ INTEGER DEFAULT 0         │                                  │
│ xp_earned                    │ INTEGER DEFAULT 0         │                                  │
│ predicted_score_eod          │ DECIMAL(5,2) NULL         │ End-of-day score prediction      │
│ score_delta_day              │ DECIMAL(5,2) NULL         │ Score change this day            │
│ skills_practiced             │ UUID[] DEFAULT '{}'       │ Which skills were practiced      │
│ new_vocab_learned            │ INTEGER DEFAULT 0         │                                  │
│ vocab_mastered_cumulative    │ INTEGER DEFAULT 0         │ Total mastered at end of day     │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → UNIQUE on (user_id, agg_date)
  → INDEX on (user_id, agg_date DESC) — score trajectory chart
  → INDEX on agg_date — platform-level daily stats
```

---

## DOMAIN 16: NOTIFICATIONS

### TABLE: `public.notification_templates`

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ code                         │ TEXT UNIQUE NOT NULL      │ e.g., "streak_at_risk"           │
│ delivery_channel             │ TEXT NOT NULL             │ push/email/in_app/all            │
│ trigger_event                │ TEXT NOT NULL             │ What system event fires this     │
│ title_ar                     │ TEXT NOT NULL             │ With {{variable}} placeholders   │
│ body_ar                      │ TEXT NOT NULL             │                                  │
│ email_subject_ar             │ TEXT NULL                 │ For email notifications          │
│ email_html_template          │ TEXT NULL                 │ Full HTML with placeholders      │
│ icon_name                    │ TEXT NULL                 │                                  │
│ action_deep_link             │ TEXT NULL                 │ e.g., "/practice" or "/streak"   │
│ priority                     │ TEXT DEFAULT 'medium'     │ low/medium/high/urgent           │
│ throttle_hours               │ INTEGER DEFAULT 24        │ Don't send same type twice in N h│
│ send_at_user_time            │ TEXT NULL                 │ e.g., "20:00" — user local time  │
│ is_active                    │ BOOLEAN DEFAULT TRUE      │                                  │
│ ab_test_variant              │ TEXT NULL                 │ A/B testing different copies     │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
│ updated_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
```

---

### TABLE: `public.user_notifications`

```
COLUMNS:
┌──────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
│ Column                       │ Type                      │ Notes                            │
├──────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
│ id                           │ UUID PK                   │                                  │
│ user_id                      │ UUID NOT NULL             │ → auth.users.id                  │
│ template_id                  │ UUID NOT NULL             │ → notification_templates.id      │
│ delivery_channel             │ TEXT NOT NULL             │ push/email/in_app                │
│ title_ar                     │ TEXT NOT NULL             │ Resolved — placeholders filled   │
│ body_ar                      │ TEXT NOT NULL             │                                  │
│ action_url                   │ TEXT NULL                 │                                  │
│ is_read                      │ BOOLEAN DEFAULT FALSE     │                                  │
│ read_at                      │ TIMESTAMPTZ NULL          │                                  │
│ send_status                  │ TEXT DEFAULT 'pending'    │ pending/sent/failed/cancelled    │
│ sent_at                      │ TIMESTAMPTZ NULL          │                                  │
│ send_error                   │ TEXT NULL                 │ Error message if failed          │
│ retry_count                  │ SMALLINT DEFAULT 0        │                                  │
│ scheduled_for                │ TIMESTAMPTZ NULL          │ Future-dated notifications       │
│ expires_at                   │ TIMESTAMPTZ NULL          │ Don't send after this            │
│ context_data                 │ JSONB DEFAULT '{}'        │ What data was used to render it  │
│ created_at                   │ TIMESTAMPTZ DEFAULT NOW() │                                  │
└──────────────────────────────┴───────────────────────────┴──────────────────────────────────┘

INDEXES:
  → INDEX on (user_id, is_read) WHERE is_read = FALSE — unread badge count
  → INDEX on (user_id, created_at DESC) — notification inbox
  → INDEX on (send_status, scheduled_for) WHERE send_status = 'pending'
    — Notification worker: "find all pending to send now"
  → INDEX on expires_at WHERE send_status = 'pending'
    — Expiry cleanup: cancel unsent expired notifications
```

---

## PART 3 — CROSS-CUTTING CONCERNS

### RLS Policy Architecture (Complete)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    ROW LEVEL SECURITY MATRIX                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  TABLE                      SELECT      INSERT      UPDATE      DELETE  ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  user_profiles              own         own         own         never   ║
║  user_settings              own         own         own         never   ║
║  user_progress_summary      own         service     service     never   ║
║  knowledge_states           own         service     service     never   ║
║  score_predictions          own         service     never       never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  skills                     authed      admin       admin       admin   ║
║  questions                  authed      admin       admin       admin   ║
║  passages                   authed      admin       admin       admin   ║
║  grammar_rules              authed      admin       admin       admin   ║
║  essay_prompts              authed      admin       admin       admin   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  study_sessions             own         own         own         never   ║
║  question_attempts          own         own         never       never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  vocabulary_items           authed      admin       admin       admin   ║
║  user_vocabulary_states     own         own         own         never   ║
║  user_vocabulary_reviews    own         own         never       never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  ai_explanations_cache      authed      service     service     admin   ║
║  ai_reports                 own         service     service     never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  achievement_definitions    authed      admin       admin       admin   ║
║  user_achievements          own         service     service     never   ║
║  xp_levels                  authed      admin       admin       admin   ║
║  xp_transactions            own         service     never       never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  user_streaks               own         service     service     never   ║
║  streak_history             own         service     never       never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  mission_templates          authed      admin       admin       admin   ║
║  user_daily_missions        own         service     service     never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  study_plans                own         service     service     never   ║
║  next_item_selections       own         service     service     never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  user_mistakes              own         service     service     never   ║
║  revision_queue             own         service     service     never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  analytics.events           never       own         never       never   ║
║  analytics.daily_aggregates own         service     service     never   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  user_notifications         own         service     own(read)   never   ║
║  notification_templates     authed      admin       admin       admin   ║
║  ─────────────────────────────────────────────────────────────────────  ║
║  user_essays                own         own         own         never   ║
║  essay_feedback             own         service     service     never   ║
║                                                                          ║
║  KEY:  own = auth.uid() = user_id                                        ║
║        authed = any authenticated user                                   ║
║        service = service_role only (Edge Functions)                      ║
║        admin = has_role('admin') custom function                         ║
║        never = no DML allowed                                            ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

### Supabase Edge Functions (Database Triggers)

```
FUNCTION 1: on_session_end
  Triggered: study_sessions.status changes to 'completed'
  Actions:
    → Compute final session stats (accuracy_rate, score_delta)
    → Call knowledge_state_updater for all skills touched
    → Update score_predictions (new prediction)
    → Update user_progress_summary (single atomic write)
    → Update user_streaks.last_activity_date
    → Evaluate daily missions progress
    → Check achievement triggers
    → Award XP (xp_transactions INSERT + update balance_after)
    → Schedule study_plan rebalance if needed

FUNCTION 2: on_question_answered
  Triggered: question_attempts INSERT
  Actions:
    → Run BKT update for affected skill (knowledge_states UPDATE)
    → Update questions.times_answered, times_correct (atomically)
    → Check if explanation cache exists (if not, queue generation)
    → If wrong: add/update user_mistakes, add to revision_queue

FUNCTION 3: nightly_cron (runs 02:00 UTC)
  Actions:
    → Generate analytics.daily_aggregates for previous day
    → Update user_progress_summary.days_until_exam for all users
    → Generate user_daily_missions for the coming day (per timezone)
    → Evaluate expired daily missions (mark as failed)
    → Evaluate streak risks (send notifications to at-risk users)
    → Compute revision_queue.priority_scores
    → Generate weekly AI reports for users whose report is due

FUNCTION 4: on_vocab_reviewed
  Triggered: user_vocabulary_reviews INSERT
  Actions:
    → Compute new FSRS state (stability, difficulty, due_at)
    → Update user_vocabulary_states
    → Update revision_queue for this vocab item
    → Update user_progress_summary.total_vocab_mastered if newly mastered
    → Award XP

FUNCTION 5: achievement_evaluator
  Triggered: Called by other functions on significant events
  Actions:
    → For each trigger_event: query achievement_definitions
    → Evaluate trigger_config conditions
    → If met and not already earned: INSERT user_achievements
    → INSERT user_notification for badge unlock
    → Award XP
```

---

### Indexes — Complete Priority Map

```
TIER 1 — CRITICAL (query speed < 10ms required):
  knowledge_states(user_id, mastery_probability) — adaptive engine
  user_vocabulary_states(user_id, due_at) WHERE NOT suspended — vocab queue
  revision_queue(user_id, due_at, priority_score) WHERE NOT resolved — review
  user_progress_summary(user_id) — dashboard (UNIQUE lookup)
  ai_explanations_cache(question_id, wrong_option_index) — explanation cache
  study_sessions(user_id, status) WHERE active — open session check

TIER 2 — IMPORTANT (query speed < 100ms):
  questions(skill_id, yael_level, difficulty_irt) — adaptive selection
  user_achievements(user_id, is_shown) WHERE NOT shown — unlock notification
  user_daily_missions(user_id, mission_date) — daily mission loading
  user_streaks(user_id) — dashboard streak display
  xp_transactions(user_id, created_at DESC) — XP history

TIER 3 — ANALYTICS (batch queries, < 5 seconds acceptable):
  analytics.events — BRIN on created_at (not B-tree)
  question_attempts — BRIN on created_at per partition
  score_predictions(user_id, created_at) — trajectory chart

TIER 4 — ADMIN (can be slow, human patience):
  questions(is_reviewed, quality_score) — review queue
  ai_explanations_cache(view_count, quality_score) — curation
  user_notifications(send_status, scheduled_for) — send queue
```

---

### Data Integrity — Constraint Summary

```
RANGE CONSTRAINTS:
  mastery_probability    BETWEEN 0.00000 AND 1.00000
  difficulty_irt         BETWEEN -3.0 AND 3.0 (IRT scale)
  exam_weight            BETWEEN 0 AND 1 (must sum to 1 at section level)
  confidence_rating      BETWEEN 1 AND 4
  yael_level             BETWEEN 1 AND 5
  xp_transactions.balance_after  >= 0 (XP cannot go negative)
  accuracy_rate          BETWEEN 0 AND 1
  overall_score          BETWEEN 0 AND 100

REFERENTIAL INTEGRITY:
  All FK columns: ON DELETE RESTRICT unless stated
  Exceptions:
    user_id FKs → auth.users: ON DELETE CASCADE
    (when Supabase user deleted, all their data follows)
    session_id on question_attempts: ON DELETE SET NULL
    (don't lose attempts if session record is cleaned up)

BUSINESS RULES ENFORCED IN DB:
  PARTIAL UNIQUE on study_plans(user_id) WHERE is_active = TRUE
  → Only one active plan per user

  PARTIAL UNIQUE on revision_queue(user_id, item_type, item_id) WHERE NOT resolved
  → No duplicate active queue entries

  CHECK on question_attempts: questions_correct <= questions_answered
  
  CHECK on xp_transactions: balance_after = balance_before + amount
  (enforced in Edge Function with serialized access)
```

---

### Future-Proofing Summary

```
DECISION                     FUTURE IT ENABLES
─────────────────────────────────────────────────────────────────────────

pgvector on vocabulary        → Semantic search, concept clustering,
                                Arabic word → Hebrew equivalent finder

metadata JSONB everywhere     → New fields without migrations for 80%
                                of feature additions

Partitioned events/attempts   → Billion-row scale, archive old data,
                                multi-region read replicas per partition

actual_exam_score column      → Prediction model accuracy measurement,
                                ML training data for model improvement

prediction_model_version      → A/B test scoring algorithms safely

embedding_model column        → Switch embedding models, track versioning

is_cognate_verified flag      → Human quality control pipeline for the
                                Arabic-Hebrew bridge content

is_repeatable achievements    → Time-limited, seasonal, or challenge
                                achievements that recur

subscription_tier on profile  → Monetization without schema change

language columns everywhere   → Russian, French, Amharic UI expansion
                                without content table refactoring

algorithm_version on sessions → Ship algorithm improvements, measure
                                impact by cohort

study_plan.strategy_type      → Different AI planning strategies, A/B
                                testable without schema change

error_pattern_code            → AI error classification enriches over
                                time with zero schema change

content_he_tsvector           → Hebrew full-text search for AI tutor,
                                passage discovery, content search

streak_freezes_remaining      → Monetizable feature (buy a freeze) or
                                earnable reward, already in schema
```

---

## PART 4 — MIGRATION SEQUENCE

```
Migration execution order (dependencies respected):

Migration 001: Enable extensions
  pgvector, uuid-ossp, pg_cron, moddatetime, unaccent

Migration 002: Schema creation
  CREATE SCHEMA analytics, cache, admin

Migration 003: Content tables (no user dependencies)
  skills → skill_prerequisites → grammar_rules → grammar_patterns
  passages → essay_prompts

Migration 004: Question bank
  questions (depends on skills, passages)

Migration 005: User profile tables
  user_profiles → user_settings

Migration 006: Progress tables
  xp_levels → user_progress_summary → knowledge_states → score_predictions

Migration 007: Vocabulary tables
  vocabulary_items → user_vocabulary_states → user_vocabulary_reviews

Migration 008: Session tables (PARTITIONED)
  study_sessions → question_attempts (create 12-month initial partitions)

Migration 009: Essay tables
  user_essays → essay_feedback

Migration 010: AI tables
  cache.ai_explanations → public.ai_reports

Migration 011: Gamification tables
  achievement_definitions → user_achievements → xp_transactions

Migration 012: Streak tables
  user_streaks → streak_history (PARTITIONED — create initial partition)

Migration 013: Mission tables
  mission_templates → user_daily_missions

Migration 014: Adaptive tables
  adaptive_configs → study_plans → next_item_selections

Migration 015: Mistake tables
  error_patterns → user_mistakes → revision_queue

Migration 016: Analytics tables (PARTITIONED)
  analytics.events → analytics.daily_aggregates → analytics.platform_daily

Migration 017: Notification tables
  notification_templates → user_notifications

Migration 018: Reading annotation table
  reading_annotations

Migration 019: RLS policies (all tables)

Migration 020: Indexes (ordered by tier)

Migration 021: Edge Function triggers

Migration 022: pg_cron scheduled jobs

Migration 023: Seed data
  skills taxonomy → xp_levels → achievement_definitions →
  mission_templates → adaptive_configs → grammar_rules
```

---

*The schema is complete. 40 tables across 6 schemas. Every relationship, constraint, and index serves the mission: maximizing each student's probability of achieving 120+ on the YAEL exam, at millions of users, at near-zero operational cost.*

*When you say build, we build.*