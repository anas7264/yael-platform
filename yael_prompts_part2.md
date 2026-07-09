
---

## Prompt 11: User KC Mastery Table (BKT State)

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 10
**Estimated Complexity**: Medium

### Context

The `user_kc_mastery` table stores per-student, per-skill Bayesian Knowledge Tracing parameters. Each row represents a student's mastery state for one knowledge component, including the four BKT probabilities and the IRT ability estimate.

### Instructions

1. Create migration `supabase/migrations/00005_user_kc_mastery.sql`:
   ```sql
   CREATE TABLE public.user_kc_mastery (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     kc_id UUID NOT NULL REFERENCES public.knowledge_components(id) ON DELETE CASCADE,
     p_learned NUMERIC(6,5) NOT NULL DEFAULT 0.30000,
     p_transit NUMERIC(6,5) NOT NULL DEFAULT 0.09000,
     p_slip NUMERIC(6,5) NOT NULL DEFAULT 0.10000,
     p_guess NUMERIC(6,5) NOT NULL DEFAULT 0.25000,
     irt_ability NUMERIC(6,3) NOT NULL DEFAULT 0.000,
     total_attempts INTEGER NOT NULL DEFAULT 0,
     correct_attempts INTEGER NOT NULL DEFAULT 0,
     last_practiced_at TIMESTAMPTZ,
     mastery_level TEXT NOT NULL DEFAULT 'novice' CHECK (mastery_level IN ('novice','learning','practiced','mastered')),
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     UNIQUE(user_id, kc_id)
   );
   CREATE TRIGGER set_user_kc_mastery_updated_at BEFORE UPDATE ON public.user_kc_mastery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   ALTER TABLE public.user_kc_mastery ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can view own mastery" ON public.user_kc_mastery FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own mastery" ON public.user_kc_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own mastery" ON public.user_kc_mastery FOR UPDATE USING (auth.uid() = user_id);
   CREATE INDEX idx_user_kc_mastery_user ON public.user_kc_mastery(user_id);
   CREATE INDEX idx_user_kc_mastery_kc ON public.user_kc_mastery(kc_id);
   ```
2. Commit: `feat(db): add user_kc_mastery table for BKT/IRT state`
3. Push to GitHub.

### Acceptance Criteria

- BKT defaults: p_learned=0.3, p_transit=0.09, p_slip=0.1, p_guess=0.25
- UNIQUE(user_id, kc_id), RLS with SELECT/INSERT/UPDATE

### Verification Command

```bash
supabase db push --dry-run 2>&1 || echo "Verify SQL"
```

---

## Prompt 12: Questions Table (IRT Parameters)

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 11
**Estimated Complexity**: Medium

### Context

Each question has IRT 3PL calibration values (difficulty b, discrimination a, guessing c). Questions are linked to KCs and organized by YAEL section.

### Instructions

1. Create migration `supabase/migrations/00006_questions.sql`:
   ```sql
   CREATE TABLE public.questions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     section TEXT NOT NULL CHECK (section IN ('reading','vocabulary','writing','spelling')),
     kc_id UUID NOT NULL REFERENCES public.knowledge_components(id),
     text_hebrew TEXT NOT NULL, passage_hebrew TEXT,
     option_a_hebrew TEXT NOT NULL, option_b_hebrew TEXT NOT NULL,
     option_c_hebrew TEXT NOT NULL, option_d_hebrew TEXT NOT NULL,
     correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
     explanation_arabic TEXT,
     difficulty NUMERIC(5,3) NOT NULL DEFAULT 0.000,
     discrimination NUMERIC(5,3) NOT NULL DEFAULT 1.000,
     guessing NUMERIC(5,3) NOT NULL DEFAULT 0.200,
     times_shown INTEGER NOT NULL DEFAULT 0, times_correct INTEGER NOT NULL DEFAULT 0,
     tags TEXT[] NOT NULL DEFAULT '{}', is_active BOOLEAN NOT NULL DEFAULT true,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE TRIGGER set_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Auth view active questions" ON public.questions FOR SELECT TO authenticated USING (is_active = true);
   CREATE INDEX idx_questions_section ON public.questions(section);
   CREATE INDEX idx_questions_kc ON public.questions(kc_id);
   CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
   ```
2. Commit: `feat(db): add questions table with IRT 3PL parameters`
3. Push to GitHub.

### Acceptance Criteria

- IRT defaults: difficulty=0.0, discrimination=1.0, guessing=0.2
- Read-only RLS for authenticated users

### Verification Command

```bash
supabase db push --dry-run 2>&1 || echo "Verify SQL"
```

---

## Prompt 13: Practice Sessions + Answers Tables

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 12
**Estimated Complexity**: Medium

### Context

Practice sessions group question attempts. The answers table logs timing data and hint usage for BKT updates and analytics.

### Instructions

1. Create migration `supabase/migrations/00007_practice.sql`:
   ```sql
   CREATE TABLE public.practice_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     section TEXT NOT NULL CHECK (section IN ('reading','vocabulary','writing','spelling')),
     session_type TEXT NOT NULL DEFAULT 'practice' CHECK (session_type IN ('practice','diagnostic','exam')),
     total_questions INTEGER NOT NULL DEFAULT 0, correct_answers INTEGER NOT NULL DEFAULT 0,
     accuracy NUMERIC(5,4) DEFAULT 0.0, xp_earned INTEGER NOT NULL DEFAULT 0,
     duration_seconds INTEGER, started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     completed_at TIMESTAMPTZ, is_completed BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   CREATE TRIGGER set_sessions_updated_at BEFORE UPDATE ON public.practice_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   CREATE TABLE public.practice_answers (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
     question_id UUID NOT NULL REFERENCES public.questions(id),
     user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     selected_option TEXT NOT NULL CHECK (selected_option IN ('A','B','C','D','SKIP')),
     is_correct BOOLEAN NOT NULL, response_time_ms INTEGER,
     hints_used INTEGER NOT NULL DEFAULT 0, explanation_viewed BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.practice_answers ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users manage own sessions" ON public.practice_sessions FOR ALL USING (auth.uid() = user_id);
   CREATE POLICY "Users manage own answers" ON public.practice_answers FOR ALL USING (auth.uid() = user_id);
   CREATE INDEX idx_sessions_user ON public.practice_sessions(user_id);
   CREATE INDEX idx_answers_session ON public.practice_answers(session_id);
   ```
2. Commit: `feat(db): add practice_sessions and practice_answers tables`
3. Push to GitHub.

### Acceptance Criteria

- `session_type` CHECK (practice/diagnostic/exam), `selected_option` includes SKIP
- RLS scoped to user_id

### Verification Command

```bash
supabase db push --dry-run 2>&1 || echo "Verify SQL"
```

---

## Prompt 14: Vocabulary Tables (pgvector + FSRS)

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 13
**Estimated Complexity**: Critical

### Context

Three vocabulary tables: `vocabulary_words` (with pgvector 384-dim embeddings), `user_vocabulary` (FSRS state machine), and `vocab_reviews`. Two functions for semantic search and due-card retrieval.

### Instructions

1. Create migration `supabase/migrations/00008_vocabulary.sql` with:
   - `vocabulary_words` table: hebrew_word, hebrew_nikud, arabic_meaning, transliteration, part_of_speech (CHECK 8 values), root_hebrew, root_arabic, difficulty_level (CHECK 1-5), example sentences, `embedding vector(384)`, is_active, timestamps
   - `user_vocabulary` table: user_id FK, word_id FK, fsrs_stability DEFAULT 0.4, fsrs_difficulty DEFAULT 0.3, fsrs_elapsed_days, fsrs_scheduled_days, fsrs_reps, fsrs_lapses, fsrs_state CHECK('new','learning','review','relearning'), last_review_at, next_review_at, total_reviews, UNIQUE(user_id, word_id)
   - `vocab_reviews` table: user_vocab_id FK, rating CHECK(1-4), response_time_ms, stability_before/after, difficulty_before/after, interval_days
   - RLS on all three tables
   - `search_vocabulary(query_embedding, match_threshold, match_count)` function using cosine distance `<=>`
   - `get_due_vocabulary(p_user_id, p_limit)` function returning overdue cards ordered by urgency
2. Commit: `feat(db): add vocabulary tables with pgvector, FSRS, and search functions`
3. Push to GitHub.

### Acceptance Criteria

- `embedding vector(384)` column exists
- FSRS state machine columns with correct defaults
- Semantic search and due-card functions work

### Verification Command

```bash
supabase db push --dry-run 2>&1 || echo "Verify SQL"
```

---

## Prompt 15: Mock Exam + AI Cache + Chat + Gamification Tables

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 14
**Estimated Complexity**: High

### Context

Remaining database tables: mock exams (with per-section scores), AI response cache (TTL-based), chat conversations/messages, badges, daily activity (with UPSERT function), leaderboard, and notifications.

### Instructions

1. Create migration `supabase/migrations/00009_remaining_tables.sql` containing:
   - `mock_exams`: user_id FK, total/reading/vocabulary/writing/spelling_score (all NUMERIC(5,2)), total_questions, correct_answers, duration_seconds, started_at, completed_at, is_completed, ai_recommendations JSONB
   - `mock_exam_answers`: exam_id FK, question_id FK, selected_option (nullable), is_correct, is_flagged DEFAULT false, response_time_ms
   - `ai_response_cache`: cache_key TEXT UNIQUE, task_type, model, prompt_hash, response JSONB, tokens_used, hit_count, expires_at TIMESTAMPTZ
   - `chat_conversations`: user_id FK, title DEFAULT 'محادثة جديدة', topic, message_count, is_active
   - `chat_messages`: conversation_id FK, role CHECK('user','assistant'), content, tokens_used, model
   - `badges`: name_arabic, description_arabic, icon, category CHECK(5 values), criteria_type, criteria_value, xp_reward
   - `user_badges`: user_id FK, badge_id FK, earned_at, UNIQUE(user_id, badge_id)
   - `daily_activity`: user_id FK, activity_date DATE, study_time_minutes, questions_answered, correct_answers, xp_earned, vocab_reviewed, sessions_completed, UNIQUE(user_id, activity_date)
   - `upsert_daily_activity()` function with ON CONFLICT DO UPDATE incrementing counters
   - `leaderboard_entries`: user_id FK, period CHECK('daily','weekly','alltime'), period_start, xp, rank, UNIQUE(user_id, period, period_start)
   - `notifications`: user_id FK, type, title_arabic, body_arabic, data JSONB, is_read DEFAULT false
   - RLS on all tables, appropriate indexes
2. Commit: `feat(db): add mock exam, AI cache, chat, gamification tables`
3. Push to GitHub.

### Acceptance Criteria

- All tables created with correct constraints and RLS
- `upsert_daily_activity()` function atomically increments counters
- `ai_response_cache` has UNIQUE cache_key and TTL via expires_at

### Verification Command

```bash
supabase db push --dry-run 2>&1 || echo "Verify SQL"
```

---

## Prompt 16: Seed Data — Knowledge Components + Badges

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 15
**Estimated Complexity**: Medium

### Context

22 knowledge components and 11 badges must be seeded with exact Arabic/Hebrew names.

### Instructions

1. Create migration `supabase/migrations/00010_seed_data.sql`:
   - Reading (6): تحديد الفكرة الرئيسية, استخراج التفاصيل, الاستنتاج والتضمين, المفردات في السياق, غرض الكاتب, بنية النص
   - Vocabulary (6): المرادفات, الأضداد, الجذور والاشتقاق, المعنى السياقي, المتلازمات, التعابير والمصطلحات
   - Writing (5): بنية المقال, تماسك الفقرة, الدقة النحوية, ثراء المفردات, الحجاج
   - Spelling (5): أنماط الحركات, التجمعات الساكنة, الإملاء الشاذ, مطابقة الجنس, تصريف الأفعال
   - Each KC with corresponding Hebrew name, section, and order_index
   - 11 badges: أول خطوة, قارئ ماهر, خبير المفردات, كاتب موهوب, إملائي دقيق, مثابر, ملتزم, محارب, امتحان كامل, هدف 120, عبقري
   - Each badge with icon emoji, category, criteria_type, criteria_value, xp_reward
2. Commit: `feat(db): seed 22 knowledge components and 11 badges`
3. Push to GitHub.

### Acceptance Criteria

- 22 KCs with Arabic + Hebrew names across 4 sections
- 11 badges with Arabic descriptions and XP rewards

### Verification Command

```bash
supabase db push --dry-run 2>&1 || echo "Verify SQL"
```

---

## Prompt 17: Database Types + Type Helpers

**Phase**: 2 — Database & Backend Core
**Dependencies**: Prompt 16
**Estimated Complexity**: High

### Context

Complete TypeScript type definitions for every database table, consumed by all API routes and components.

### Instructions

1. Create `src/types/database.ts` with:
   - `Json` type for JSONB columns
   - Union types: `YAELSection`, `MasteryLevel`, `SessionType`, `AnswerOption`, `FSRSState`, `FSRSRating` (1|2|3|4), `Theme`, `ExperienceLevel`, `LeaderboardPeriod`, `BadgeCategory`, `ChatRole`
   - Row interfaces for all 20 tables: `Profile`, `UserProgress`, `KnowledgeComponent`, `UserKCMastery`, `Question`, `PracticeSession`, `PracticeAnswer`, `VocabularyWord`, `UserVocabulary`, `VocabReview`, `MockExam`, `MockExamAnswer`, `AIResponseCache`, `ChatConversation`, `ChatMessage`, `Badge`, `UserBadge`, `DailyActivity`, `LeaderboardEntry`, `Notification`
   - Insert types omitting auto-generated fields (id, created_at, updated_at)
   - Update types as Partial omitting PKs and timestamps
2. Create `src/types/index.ts`: `export * from './database'`
3. Commit: `feat(types): add complete database type definitions`
4. Push to GitHub.

### Acceptance Criteria

- 20+ interfaces matching all tables, all union types match CHECK constraints
- Insert/Update helper types for key tables

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 18: HebrewIsland + Providers

**Phase**: 3 — UI Primitives & Layout System
**Dependencies**: Prompt 17
**Estimated Complexity**: High

### Context

The `HebrewIsland` component is foundational — it wraps all Hebrew content in LTR direction with the correct font. Providers (Theme, Query, Toast) must wrap the entire app. This prompt establishes the provider hierarchy in the root layout.

### Instructions

1. Install packages:
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools framer-motion lucide-react zustand immer
   ```
2. Create `src/components/ui/HebrewIsland.tsx`:
   ```tsx
   'use client';
   import { cn } from '@/lib/utils/cn';

   interface HebrewIslandProps {
     children: React.ReactNode;
     className?: string;
     inline?: boolean;
   }

   export function HebrewIsland({ children, className, inline = false }: HebrewIslandProps) {
     const Tag = inline ? 'span' : 'div';
     return (
       <Tag
         dir="ltr"
         lang="he"
         className={cn('hebrew-island', className)}
         style={inline ? { unicodeBidi: 'isolate' } : undefined}
       >
         {children}
       </Tag>
     );
   }
   ```
3. Create `src/components/providers/ThemeProvider.tsx`:
   ```tsx
   'use client';
   import { createContext, useContext, useEffect, useState } from 'react';

   type Theme = 'dark' | 'light';
   interface ThemeContextType { theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void; }

   const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} });

   export function ThemeProvider({ children }: { children: React.ReactNode }) {
     const [theme, setTheme] = useState<Theme>('dark');

     useEffect(() => {
       const saved = localStorage.getItem('yael-theme') as Theme | null;
       if (saved) setTheme(saved);
     }, []);

     useEffect(() => {
       document.documentElement.classList.toggle('light', theme === 'light');
       localStorage.setItem('yael-theme', theme);
     }, [theme]);

     const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

     return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
   }

   export const useTheme = () => useContext(ThemeContext);
   ```
4. Create `src/components/providers/QueryProvider.tsx`:
   ```tsx
   'use client';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   import { useState } from 'react';

   export function QueryProvider({ children }: { children: React.ReactNode }) {
     const [client] = useState(() => new QueryClient({
       defaultOptions: {
         queries: { staleTime: 60_000, gcTime: 300_000, retry: 2, refetchOnWindowFocus: false },
         mutations: { retry: 0 },
       },
     }));

     return (
       <QueryClientProvider client={client}>
         {children}
         <ReactQueryDevtools initialIsOpen={false} />
       </QueryClientProvider>
     );
   }
   ```
5. Create `src/components/providers/RootProviders.tsx`:
   ```tsx
   'use client';
   import { ThemeProvider } from './ThemeProvider';
   import { QueryProvider } from './QueryProvider';

   export function RootProviders({ children }: { children: React.ReactNode }) {
     return (
       <ThemeProvider>
         <QueryProvider>
           {children}
         </QueryProvider>
       </ThemeProvider>
     );
   }
   ```
6. Update `src/app/layout.tsx` body to wrap children: `<RootProviders>{children}</RootProviders>`
7. Commit: `feat(ui): add HebrewIsland component and root providers`
8. Push to GitHub.

### Acceptance Criteria

- `HebrewIsland` renders with `dir="ltr" lang="he"` and hebrew-island CSS class
- ThemeProvider persists dark/light to localStorage, toggles `.light` class
- QueryProvider configured with staleTime: 60s, gcTime: 5min
- RootProviders wraps ThemeProvider → QueryProvider

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 19: Button + Card + Badge + Input Components

**Phase**: 3 — UI Primitives & Layout System
**Dependencies**: Prompt 18
**Estimated Complexity**: High

### Context

Core UI primitives used throughout the app. Each component uses CSS custom properties, supports dark/light themes via variable inheritance, and is RTL-native.

### Instructions

1. Create `src/components/ui/Button.tsx` — 'use client' component with:
   - Props: `variant` ('primary' | 'secondary' | 'ghost' | 'danger' | 'success'), `size` ('sm' | 'md' | 'lg' | 'xl'), `isLoading`, `leftIcon`, `rightIcon`, `children`, `className`, `disabled`, plus `ButtonHTMLAttributes<HTMLButtonElement>`
   - Primary: `bg-gradient-primary text-white`, Secondary: `bg-bg-tertiary text-text-primary border border-border-subtle`, Ghost: `bg-transparent hover:bg-bg-tertiary`, Danger: `bg-accent-rose text-white`, Success: `bg-accent-emerald text-white`
   - Sizes: sm=h-8 px-3 text-sm, md=h-10 px-4, lg=h-12 px-6 text-lg, xl=h-14 px-8 text-xl
   - Border radius: `rounded-md` (12px)
   - Hover: `hover:scale-[1.02] hover:shadow-md`, Active: `active:scale-[0.98]`
   - Disabled: `opacity-50 cursor-not-allowed`
   - Loading: show spinner SVG, disable button
   - Transition: `transition-all duration-200`

2. Create `src/components/ui/Card.tsx` — 'use client' component with:
   - Props: `variant` ('default' | 'elevated' | 'interactive' | 'highlighted'), `className`, `children`, `onClick`
   - Default: `bg-bg-secondary border border-border-subtle rounded-lg p-6`
   - Elevated: adds `shadow-md`
   - Interactive: adds `hover:border-border-medium hover:-translate-y-0.5 cursor-pointer transition-all duration-200`
   - Highlighted: adds `border-primary-500/30 bg-gradient-card`

3. Create `src/components/ui/Badge.tsx` with:
   - Props: `variant` ('default' | 'success' | 'warning' | 'danger' | 'info' | 'xp' | 'streak'), `size` ('sm' | 'md'), `children`, `className`
   - XP: `bg-gradient-gold text-white`
   - Streak: `bg-accent-rose/10 text-accent-rose`
   - Pill shape: `rounded-full inline-flex items-center`

4. Create `src/components/ui/Input.tsx` — 'use client' with:
   - Props: `label` (string, Arabic text), `error` (string), `leftIcon`, `rightIcon`, `className`, plus `InputHTMLAttributes`
   - Height: h-12, bg-bg-tertiary, border border-border-subtle, rounded-md
   - Focus: `focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
   - Error: `border-accent-rose` + error text below in text-accent-rose text-sm
   - Label: displayed above in text-sm text-text-secondary mb-2
   - RTL: text direction inherits from parent

5. Commit: `feat(ui): add Button, Card, Badge, and Input primitives`
6. Push to GitHub.

### Acceptance Criteria

- All 4 components exist with 'use client' directive
- Button has 5 variants, 4 sizes, loading state
- Card has 4 variants
- Input has label, error state, icon support
- All use `cn()` for class merging

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 20: Modal + Toast + Skeleton + ProgressBar + Tabs

**Phase**: 3 — UI Primitives & Layout System
**Dependencies**: Prompt 19
**Estimated Complexity**: High

### Context

Interactive UI components for feedback, loading states, and navigation. The Toast system uses a Zustand store for global state management.

### Instructions

1. Create `src/stores/useToastStore.ts`:
   ```typescript
   import { create } from 'zustand';

   export type ToastType = 'success' | 'error' | 'info' | 'warning';

   interface Toast {
     id: string;
     type: ToastType;
     message: string;
     duration?: number;
   }

   interface ToastStore {
     toasts: Toast[];
     addToast: (toast: Omit<Toast, 'id'>) => void;
     removeToast: (id: string) => void;
   }

   export const useToastStore = create<ToastStore>((set) => ({
     toasts: [],
     addToast: (toast) => {
       const id = Math.random().toString(36).slice(2, 9);
       set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
       setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), toast.duration ?? 4000);
     },
     removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
   }));
   ```

2. Create `src/components/ui/Modal.tsx` — Framer Motion animated modal with:
   - Overlay: `bg-black/50 backdrop-blur-sm`, fade in/out
   - Container: `bg-bg-secondary rounded-xl max-w-lg w-full mx-4 p-8`, scale + slide up animation
   - Props: `isOpen`, `onClose`, `title` (Arabic), `children`, `size` ('sm' | 'md' | 'lg')
   - Close on overlay click and Escape key
   - Focus trap within modal

3. Create `src/components/ui/Toast.tsx` — renders from useToastStore:
   - Position: fixed top-4 left-1/2 -translate-x-1/2 (centered for RTL)
   - Colors: success=accent-emerald border, error=accent-rose, info=primary-500, warning=accent-gold
   - Pill shape, max 3 visible, slide-down + fade animation
   - Dismiss button on each toast

4. Create `src/components/ui/Skeleton.tsx`:
   - Base: `bg-bg-tertiary rounded-md animate-shimmer`
   - Variants: `text` (h-4 w-full), `circle` (rounded-full), `card` (h-32 w-full), `avatar` (h-10 w-10 rounded-full)
   - Shimmer gradient animation via CSS background

5. Create `src/components/ui/ProgressBar.tsx`:
   - Props: `value` (0-100), `variant` ('primary' | 'success' | 'gold'), `size` ('sm' | 'md' | 'lg'), `showLabel`, `className`
   - Track: `bg-bg-tertiary rounded-full`
   - Fill: animated width with `transition-all duration-500 ease-out`
   - Primary: `bg-gradient-primary`, Success: `bg-gradient-success`, Gold: `bg-gradient-gold`

6. Create `src/components/ui/Tabs.tsx`:
   - Props: `tabs: {id, label}[]`, `activeTab`, `onTabChange`, `className`
   - Pill-shaped container with `bg-bg-tertiary rounded-lg p-1`
   - Active tab: `bg-primary-500 text-white rounded-md`, smooth transition
   - Arabic labels

7. Commit: `feat(ui): add Modal, Toast, Skeleton, ProgressBar, and Tabs components`
8. Push to GitHub.

### Acceptance Criteria

- Toast store manages global notification state
- Modal has Framer Motion animation, backdrop blur, and escape close
- Skeleton has shimmer animation
- ProgressBar animates width changes
- Tabs use pill style with active indicator

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 21: AppShell Layout + Sidebar + Header + BottomNav

**Phase**: 3 — UI Primitives & Layout System
**Dependencies**: Prompt 20
**Estimated Complexity**: High

### Context

The app layout contains a desktop sidebar (280px, hidden on mobile), a top header (sticky, h-16), and a mobile bottom navigation bar (fixed, visible only on mobile). This is the chrome around every authenticated page.

### Instructions

1. Create `src/stores/useAppStore.ts`:
   ```typescript
   import { create } from 'zustand';
   interface AppStore { sidebarOpen: boolean; toggleSidebar: () => void; setSidebarOpen: (open: boolean) => void; }
   export const useAppStore = create<AppStore>((set) => ({
     sidebarOpen: false,
     toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
     setSidebarOpen: (open) => set({ sidebarOpen: open }),
   }));
   ```

2. Create `src/components/layout/Sidebar.tsx` with:
   - Width: 280px, bg-bg-secondary, border-inline-end: 1px solid border-subtle
   - Logo: "يَعَل" in text-2xl font-bold text-primary-500
   - Navigation items using Lucide icons (LayoutDashboard, BookOpen, Languages, ClipboardCheck, Sparkles, BarChart3, User, Trophy) with Arabic labels from UI_TEXT.nav
   - Active item: bg-primary-500/10 text-primary-500 border-inline-start-2 border-primary-500
   - Settings link at bottom: Settings → الإعدادات
   - Hidden on mobile (hidden lg:flex flex-col)

3. Create `src/components/layout/Header.tsx` with:
   - Sticky top-0, h-16, bg-bg-secondary/80 backdrop-blur, border-b border-border-subtle
   - Mobile: hamburger menu button (Menu icon) on right side
   - Page title slot
   - Left side: XP badge, streak flame with count, notification bell with unread dot, user avatar

4. Create `src/components/layout/BottomNav.tsx` with:
   - Fixed bottom, h-16, bg-bg-secondary border-t border-border-subtle
   - 5 items: Dashboard, Practice, Vocab, Exam, Tutor (with Lucide icons)
   - Active: text-primary-500, inactive: text-text-tertiary
   - Visible only on mobile (lg:hidden)

5. Create `src/components/layout/AppShell.tsx`:
   - Flex layout: Sidebar (desktop) + main content area + BottomNav (mobile)
   - Main content: flex-1 min-h-screen with padding

6. Create `src/app/(app)/layout.tsx`:
   - Import AppShell, fetch user session via server Supabase client
   - Pass user data to AppShell

7. Commit: `feat(layout): add AppShell with Sidebar, Header, and BottomNav`
8. Push to GitHub.

### Acceptance Criteria

- Sidebar 280px wide on desktop, hidden on mobile
- BottomNav visible on mobile, hidden on desktop
- Header is sticky with backdrop blur
- All navigation labels in Arabic
- Active nav item highlighted with primary-500

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 22: Auth Pages — Login + Signup + Forgot Password

**Phase**: 3 — UI Primitives & Layout System
**Dependencies**: Prompt 21
**Estimated Complexity**: High

### Context

Authentication pages with Arabic validation, Google OAuth, and glassmorphism design. Uses React Hook Form + Zod for form validation with Arabic error messages.

### Instructions

1. Install: `npm install react-hook-form @hookform/resolvers zod`
2. Create `src/app/(auth)/layout.tsx`: Full-screen gradient-hero bg, centered container max-w-md
3. Create `src/app/(auth)/login/page.tsx` — 'use client':
   - Logo "يَعَل" with glow effect
   - Glass card: `bg-bg-secondary/50 backdrop-blur-xl border border-border-subtle rounded-xl p-8`
   - Email input: label "البريد الإلكتروني", Mail icon
   - Password input: label "كلمة المرور", Lock icon, visibility toggle (Eye/EyeOff)
   - Zod schema: `email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صالح')`, `password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')`
   - Submit button: "تسجيل الدخول" primary lg full-width, loading state
   - Divider with "أو"
   - Google OAuth button with Google icon
   - "نسيت كلمة المرور؟" link to /forgot-password
   - "ليس لديك حساب؟" link to /signup
   - On submit: call `supabase.auth.signInWithPassword`, show toast on error, redirect to /dashboard on success
4. Create `src/app/(auth)/signup/page.tsx` — similar form with full_name, email, password, confirmPassword (must match)
5. Create `src/app/(auth)/forgot-password/page.tsx` — email-only form, `supabase.auth.resetPasswordForEmail`
6. Create `src/app/(auth)/callback/route.ts` — Route Handler for OAuth: exchange code for session, redirect based on onboarding_completed
7. Commit: `feat(auth): add login, signup, forgot-password pages with Arabic validation`
8. Push to GitHub.

### Acceptance Criteria

- All forms use Zod validation with Arabic error messages
- Google OAuth flow implemented via callback route
- Password visibility toggle works
- Loading states on submit buttons
- Toast notifications for errors

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 23: Next.js Middleware + Zustand Stores + Query Keys

**Phase**: 3 — UI Primitives & Layout System
**Dependencies**: Prompt 22
**Estimated Complexity**: Medium

### Context

Next.js middleware protects authenticated routes and redirects. Zustand stores manage client-side state per domain. TanStack Query keys follow a factory pattern for cache management.

### Instructions

1. Create `src/middleware.ts`:
   - Use `updateSession()` from Supabase middleware client
   - Protected routes: `/dashboard`, `/practice`, `/vocabulary`, `/exam`, `/tutor`, `/analytics`, `/profile`, `/leaderboard`, `/settings`
   - If no user + protected route → redirect `/login`
   - If user + auth pages (`/login`, `/signup`) → redirect `/dashboard`
   - Matcher: exclude `_next/static`, `_next/image`, `favicon.ico`, `api/`

2. Create remaining Zustand stores:
   - `src/stores/useAuthStore.ts`: user (Profile | null), session, isLoading, setUser, setSession, signOut
   - `src/stores/usePracticeStore.ts`: currentSession, currentQuestion, questionIndex, selectedAnswer, isAnswerSubmitted, sessionResults, methods to advance
   - `src/stores/useVocabStore.ts`: currentCard, cardsRemaining, isFlipped, sessionStats, flipCard, rateCard, nextCard

3. Create `src/lib/query/query-keys.ts`:
   ```typescript
   export const queryKeys = {
     user: {
       profile: (id: string) => ['user', 'profile', id] as const,
       progress: (id: string) => ['user', 'progress', id] as const,
     },
     practice: {
       session: (id: string) => ['practice', 'session', id] as const,
       questions: (section: string) => ['practice', 'questions', section] as const,
     },
     vocabulary: {
       dueCards: (userId: string) => ['vocabulary', 'due', userId] as const,
       allWords: (params?: Record<string, string>) => ['vocabulary', 'words', params] as const,
     },
     analytics: {
       progress: (userId: string) => ['analytics', 'progress', userId] as const,
       prediction: (userId: string) => ['analytics', 'prediction', userId] as const,
     },
     leaderboard: {
       list: (period: string) => ['leaderboard', period] as const,
     },
     badges: {
       all: () => ['badges'] as const,
       user: (userId: string) => ['badges', 'user', userId] as const,
     },
   };
   ```
4. Commit: `feat(core): add middleware, Zustand stores, and query key factory`
5. Push to GitHub.

### Acceptance Criteria

- Middleware correctly protects routes and redirects
- 5 Zustand stores created for auth, practice, vocab, app, toast
- Query keys follow factory pattern with typed tuples

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 24: Adaptive Engine Types + Math Utilities

**Phase**: 4 — Mathematical Adaptive Engine
**Dependencies**: Prompt 23
**Estimated Complexity**: Medium

### Context

The adaptive engine is a pure TypeScript module with zero external dependencies. Types define the interfaces for BKT, IRT, and FSRS. Math utilities provide shared functions used across all algorithms.

### Instructions

1. Create `src/lib/adaptive/types.ts` with all interfaces: `BKTParams`, `BKTResult`, `IRTParams`, `IRTAbilityEstimate`, `FSRSCard`, `FSRSScheduleResult`, `QuestionCandidate`, `SessionPlan`, `ScorePrediction`
2. Create `src/lib/adaptive/math-utils.ts` with pure functions:
   - `clamp(value, min, max)`, `sigmoid(x)` = 1/(1+e^(-x)), `normalPDF(x, mean, sd)`, `weightedAverage(values[], weights[])`, `standardDeviation(values[])`, `lerp(a, b, t)`
3. All functions must be pure (no side effects), fully typed, and have JSDoc comments
4. Commit: `feat(adaptive): add types and math utility functions`
5. Push to GitHub.

### Acceptance Criteria

- Types cover all adaptive engine interfaces
- Math functions are pure with no dependencies
- `sigmoid(0)` returns 0.5

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 25: Bayesian Knowledge Tracing (BKT)

**Phase**: 4 — Mathematical Adaptive Engine
**Dependencies**: Prompt 24
**Estimated Complexity**: Critical

### Context

BKT is the core learning model. It estimates the probability a student has "learned" a skill based on their response history. The four parameters (P(L), P(T), P(S), P(G)) are updated after each response using Bayesian inference.

### Instructions

1. Create `src/lib/adaptive/bkt.ts`:
   - `BKT_DEFAULTS = { pLearned: 0.3, pTransit: 0.09, pSlip: 0.1, pGuess: 0.25 }`
   - `updateBKT(params: BKTParams, isCorrect: boolean): BKTResult`:
     - **Posterior calculation**:
       - If correct: `pLearned_posterior = pL * (1 - pS) / (pL * (1 - pS) + (1 - pL) * pG)`
       - If incorrect: `pLearned_posterior = pL * pS / (pL * pS + (1 - pL) * (1 - pG))`
     - **Learning transition**: `pLearned_new = pLearned_posterior + (1 - pLearned_posterior) * pT`
     - **Predict next**: `pCorrect = pLearned_new * (1 - pS) + (1 - pLearned_new) * pG`
     - Clamp pLearned to [0.0001, 0.9999]
     - `mastered = pLearned_new >= 0.95`
   - `getMasteryLevel(pLearned)`: <0.40 'novice', 0.40-0.70 'learning', 0.70-0.95 'practiced', ≥0.95 'mastered'
   - `applyDecay(pLearned, daysInactive)`: `pLearned * (0.95 ** daysInactive)`, minimum 0.1
2. Commit: `feat(adaptive): implement Bayesian Knowledge Tracing (BKT)`
3. Push to GitHub.

### Acceptance Criteria

- Correct answer increases P(L), wrong answer decreases it
- Mastery threshold at P(L) ≥ 0.95
- Decay reduces P(L) by 5% per inactive day, floor at 0.1

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 26: Item Response Theory (IRT 3PL)

**Phase**: 4 — Mathematical Adaptive Engine
**Dependencies**: Prompt 25
**Estimated Complexity**: Critical

### Context

IRT 3PL models the probability of a correct response as a function of student ability (θ) and three item parameters: discrimination (a), difficulty (b), and guessing (c). Fisher Information measures how much information a question provides at a given ability level, used for adaptive item selection.

### Instructions

1. Create `src/lib/adaptive/irt.ts`:
   - `irt3PL(theta, a, b, c): number` — `P = c + (1-c) / (1 + Math.exp(-a * (theta - b)))`
   - `fisherInformation(theta, a, b, c): number`:
     - `pStar = 1 / (1 + Math.exp(-a * (theta - b)))`
     - `p = c + (1 - c) * pStar`
     - `q = 1 - p`
     - Guard: if `p * q < 0.0001` return 0
     - `I = a * a * ((pStar - c) ** 2) / ((1 - c) ** 2 * p * q)`
   - `estimateAbilityEAP(responses: {isCorrect, a, b, c}[], priorMean=0, priorSD=1, points=40): IRTAbilityEstimate`:
     - Quadrature from θ=-4 to θ=4 with `points` nodes
     - For each node: compute likelihood (product of P(response|θ)), multiply by normal prior
     - θ_EAP = Σ(θ × posterior) / Σ(posterior)
     - SEM = 1 / √(Σ fisherInfo at θ_EAP)
     - Clamp θ to [-3, 3]
   - Edge cases: <5 responses → return priorMean with SE=1.0
2. Commit: `feat(adaptive): implement IRT 3PL with Fisher Information and EAP estimation`
3. Push to GitHub.

### Acceptance Criteria

- `irt3PL(0, 1, 0, 0.2)` ≈ 0.6 (correct for P when θ=b with guessing=0.2)
- Fisher Information is highest near difficulty level
- EAP estimation converges with more responses

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 27: FSRS Implementation

**Phase**: 4 — Mathematical Adaptive Engine
**Dependencies**: Prompt 26
**Estimated Complexity**: Critical

### Context

FSRS v4 (Free Spaced Repetition Scheduler) manages vocabulary review scheduling. It uses 19 weight parameters to compute stability (how well a memory is retained) and difficulty (how hard a card is to learn). This implementation must match the exact FSRS v4 algorithm with the published default weights.

### Instructions

1. Create `src/lib/adaptive/fsrs.ts`:
   - `FSRS_DEFAULT_WEIGHTS` = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589, 1.5330, 0.1544, 1.0100, 1.9279, 0.1443, 0.0325, 2.1214, 0.2927, 2.9898, 0.5960, 0.4477]
   - `computeRetrievability(elapsedDays, stability)` = `(1 + elapsedDays / (9 * stability)) ** -1`
   - `initDifficulty(rating, w)` = `clamp(w[4] - Math.exp(w[5] * (rating - 1)) + 1, 1, 10)`
   - `initStability(rating, w)` = `Math.max(0.1, w[rating - 1])`
   - `updateDifficulty(d, rating, w)` = `clamp(w[6] * initDifficulty(3, w) + (1 - w[6]) * (d - w[7] * (rating - 3)), 1, 10)`
   - `stabilityAfterRecall(d, s, r, rating, w)`:
     - `hardPenalty = rating === 2 ? w[15] : 1`
     - `easyBonus = rating === 4 ? w[16] : 1`
     - `S' = s * (1 + Math.exp(w[8]) * (11 - d) * s ** (-w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * hardPenalty * easyBonus)`
   - `stabilityAfterForget(d, s, r, w)` = `w[11] * d ** (-w[12]) * ((s + 1) ** w[13] - 1) * Math.exp(w[14] * (1 - r))`
   - `computeInterval(stability, requestRetention=0.9)` = `Math.round(9 * stability * (1/requestRetention - 1))`
   - `scheduleCard(card: FSRSCard, rating: FSRSRating, now: Date, weights?, requestRetention?, maxInterval?)`: Complete state machine (new→learning, learning→review, review→relearning on lapse, etc.)
2. Commit: `feat(adaptive): implement FSRS v4 spaced repetition scheduler`
3. Push to GitHub.

### Acceptance Criteria

- 19 default weights match published FSRS v4 values
- Retrievability decreases over time
- Stability increases after successful recall
- State machine handles all 4 states correctly

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 28: Question Selector + Session Planner + Score Prediction

**Phase**: 4 — Mathematical Adaptive Engine
**Dependencies**: Prompt 27
**Estimated Complexity**: High

### Context

These three modules compose BKT + IRT into actionable learning decisions: which question to show next, how to plan a session, and what score to predict.

### Instructions

1. Create `src/lib/adaptive/question-selector.ts`:
   - `selectNextQuestion(params)`:
     - Filter out answered questions
     - Find weakest KCs (P(L) < 0.95, sorted ascending, top 3)
     - Filter candidates to weak KC questions
     - Score each by Fisher Information at student θ
     - Take top 5, weighted random selection by information score

2. Create `src/lib/adaptive/session-planner.ts`:
   - `planSession(params)`:
     - Calculate question count from daily study minutes (1.5 min/question)
     - Categorize KCs: weak(<0.40), learning(0.40-0.70), practiced(0.70-0.95)
     - Distribution: 60% weak, 30% learning, 10% practiced
     - Return `SessionPlan` with `questionDistribution` array

3. Create `src/lib/adaptive/score-prediction.ts`:
   - `predictYAELScore(params)`:
     - Section weights: reading 0.30, vocabulary 0.30, writing 0.20, spelling 0.20
     - BKT score: Σ(mastery × weight × 150)
     - IRT score: map θ [-3,3] → [50,150]
     - Empirical: 50 + accuracy × 100
     - Combined: BKT(35%) + IRT(35%) + Empirical(30%) — or with mock exams: BKT(25%) + IRT(25%) + Empirical(20%) + ExamAvg(30%)
     - Clamp [50, 150]
     - Confidence: min(0.95, 0.3 + totalAttempts × 0.01)

4. Create `src/lib/adaptive/index.ts` barrel export for all modules
5. Commit: `feat(adaptive): add question selector, session planner, and score prediction`
6. Push to GitHub.

### Acceptance Criteria

- Question selector prioritizes weak skills with highest information value
- Session planner distributes 60/30/10 across weak/learning/practiced
- Score prediction combines BKT + IRT + Empirical with correct weights
- All functions handle edge cases (empty arrays, no data)

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 29: Groq Client + AI Types + Configuration

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 28
**Estimated Complexity**: Medium

### Context

The Groq API provides ultra-fast LLM inference. We set up the client with model constants, task-specific configurations, and a fallback chain (primary → secondary → fallback model).

### Instructions

1. Install: `npm install groq-sdk`
2. Create `src/lib/ai/groq.ts`:
   ```typescript
   import Groq from 'groq-sdk';

   const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

   export const MODELS = {
     complex: 'llama-3.1-70b-versatile',
     simple: 'llama-3.1-8b-instant',
     fallback: 'mixtral-8x7b-32768',
   } as const;

   export const TASK_CONFIGS = {
     explanation: { model: MODELS.complex, temperature: 0.3, maxTokens: 1024 },
     hint: { model: MODELS.simple, temperature: 0.5, maxTokens: 256 },
     feedback: { model: MODELS.complex, temperature: 0.4, maxTokens: 2048 },
     chat: { model: MODELS.complex, temperature: 0.7, maxTokens: 1024 },
     translation: { model: MODELS.simple, temperature: 0.1, maxTokens: 512 },
     vocab_context: { model: MODELS.simple, temperature: 0.3, maxTokens: 512 },
   } as const;

   export type TaskType = keyof typeof TASK_CONFIGS;

   export async function callGroq(messages: Groq.ChatCompletionMessageParam[], taskType: TaskType): Promise<string> {
     const config = TASK_CONFIGS[taskType];
     try {
       const response = await groq.chat.completions.create({
         model: config.model,
         messages,
         temperature: config.temperature,
         max_tokens: config.maxTokens,
       });
       return response.choices[0]?.message?.content ?? '';
     } catch {
       // Fallback to secondary model
       const response = await groq.chat.completions.create({
         model: MODELS.fallback,
         messages,
         temperature: config.temperature,
         max_tokens: config.maxTokens,
       });
       return response.choices[0]?.message?.content ?? '';
     }
   }

   export { groq };
   ```
3. Create `src/lib/ai/types.ts` with AI-specific interfaces
4. Commit: `feat(ai): add Groq client with model configs and fallback chain`
5. Push to GitHub.

### Acceptance Criteria

- Groq client initialized with GROQ_API_KEY
- 6 task configs with correct model/temperature/maxTokens
- Fallback chain catches errors and retries with mixtral

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 30: Arabic Prompt Templates

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 29
**Estimated Complexity**: High

### Context

All AI prompt templates use Arabic as the instruction language. The system prompt establishes the AI as a Hebrew language tutor for Arabic speakers. Templates use `<hebrew></hebrew>` markers for Hebrew content that the frontend renders via HebrewIsland components.

### Instructions

1. Create `src/lib/ai/prompts.ts` with:
   - `SYSTEM_PROMPT`: Arabic text establishing the AI as "أنت معلم لغة عبرية خبير متخصص في تحضير الطلاب العرب لامتحان יע"ל" with 6 rules (respond in Arabic, use <hebrew> markers, reference Arabic-Hebrew parallels, encourage, be concise, cite grammar rules)
   - `EXPLANATION_PROMPT(context)`: Template for question explanations with placeholders for question text, options, correct answer, student's answer, section, skill, difficulty. Output format: JSON {explanation, tip, related_rule}
   - `HINT_PROMPT(context, tier)`: 3-tier hint system — tier 1 (توجيه): vague direction, tier 2 (إشارة): narrower hint, tier 3 (مساعدة): near-answer
   - `WRITING_FEEDBACK_PROMPT(context)`: 4 rubric criteria — content 30%, organization 25%, grammar 25%, vocabulary 20%. Output: JSON scores + strengths + improvements
   - `CHAT_PROMPT(context, history)`: Conversational tutoring with history injection
   - `VOCAB_CONTEXT_PROMPT(word)`: 3 example sentences for a Hebrew word
   - All templates must use exact Arabic instructional text
2. Commit: `feat(ai): add Arabic prompt templates with <hebrew> markers`
3. Push to GitHub.

### Acceptance Criteria

- System prompt is entirely in Arabic
- All templates output structured JSON
- `<hebrew></hebrew>` markers used for Hebrew content
- Hint system has 3 progressive tiers

### Verification Command

```bash
npx tsc --noEmit
```

---

## Prompt 31: AI Cache System + Bridge Parser

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 30
**Estimated Complexity**: Medium

### Context

The cache system uses SHA256 keys to store Groq API responses with TTL-based expiration. The bridge parser converts `<hebrew>` markers in AI responses into HebrewIsland components.

### Instructions

1. Create `src/lib/ai/cache.ts`:
   - `generateCacheKey(params)`: JSON.stringify → SHA256 via Web Crypto API
   - `getCachedResponse(key, supabaseAdmin)`: query ai_response_cache, increment hit_count on hit
   - `setCachedResponse(params, supabaseAdmin)`: insert with calculated expires_at based on task type TTLs
   - CACHE_TTLS: explanation=7d, hint=7d, vocab_context=30d, feedback=0 (no cache), chat=0

2. Create `src/lib/ai/bridge-parser.ts`:
   - `parseAIResponse(text)`: regex `/<hebrew>(.*?)<\/hebrew>/gs` → array of `{type: 'arabic'|'hebrew', content}` segments

3. Create `src/components/shared/AIResponse.tsx` — 'use client':
   - Takes raw AI text, parses with `parseAIResponse`
   - Renders Arabic text directly, Hebrew text in `<HebrewIsland inline>` components
   - Supports both inline and block Hebrew rendering

4. Commit: `feat(ai): add response cache with SHA256 keys and bridge parser`
5. Push to GitHub.

### Acceptance Criteria

- Cache key generation is deterministic
- TTLs match specified values per task type
- Bridge parser correctly splits Arabic/Hebrew segments
- AIResponse component renders mixed content

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 32: AI API Routes — Explain + Hint

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 31
**Estimated Complexity**: High

### Context

The explain and hint API routes are the most-called AI endpoints. Explanations are cached aggressively (7-day TTL). Hints are tiered (3 levels of specificity) with XP deductions for deeper hints.

### Instructions

1. Create `src/app/api/ai/explain/route.ts` (POST):
   - Auth check via server Supabase client
   - Validate input: `{ questionId, selectedAnswer, section, skillName }` with Zod
   - Generate cache key from (questionId, selectedAnswer)
   - Check cache → if hit, return cached
   - If miss: fetch question from DB, build EXPLANATION_PROMPT context, call `callGroq('explanation')`
   - Parse JSON response, validate structure, cache it
   - Return `{ explanation, tip, related_rule }`

2. Create `src/app/api/ai/hint/route.ts` (POST):
   - Validate: `{ questionId, hintTier: 1|2|3, previousHints }`
   - Cache key includes hintTier
   - Use HINT_PROMPT with appropriate tier
   - Model: 'simple' (fast) for hints
   - Return `{ hint, tier }`

3. Commit: `feat(api): add AI explain and hint API routes with caching`
4. Push to GitHub.

### Acceptance Criteria

- Explain route checks cache before calling Groq
- Hint route supports 3 tiers
- Both routes validate auth and input
- Responses are JSON structured

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 33: AI API Routes — Chat (Streaming) + Feedback

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 32
**Estimated Complexity**: High

### Context

The chat route uses Server-Sent Events (SSE) for streaming AI responses to the tutor interface. The feedback route processes essay submissions against a 4-criterion rubric. Neither is cached.

### Instructions

1. Create `src/app/api/ai/chat/route.ts` (POST):
   - Validate: `{ message, conversationId? }`
   - If conversationId: fetch last 5 messages from chat_messages
   - Build context with CHAT_PROMPT + conversation history
   - Create/get conversation in DB, save user message
   - Stream response using `groq.chat.completions.create({ stream: true })`
   - Return as `ReadableStream` with `Content-Type: text/event-stream`
   - After stream complete: save full assistant message to chat_messages, update message_count

2. Create `src/app/api/ai/feedback/route.ts` (POST):
   - Validate: `{ essayText, topicHebrew }`
   - Use WRITING_FEEDBACK_PROMPT with rubric
   - Model: complex, temp: 0.4, maxTokens: 2048
   - NO caching
   - Return `{ overall_score, content_score, organization_score, grammar_score, vocabulary_score, strengths[], improvements[], general_feedback }`

3. Commit: `feat(api): add streaming chat and essay feedback API routes`
4. Push to GitHub.

### Acceptance Criteria

- Chat streams via SSE (text/event-stream)
- Chat saves messages to DB after completion
- Feedback returns 5 numeric scores and text feedback
- Neither route uses caching

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 34: Practice API Routes — Session + Submit + Complete

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 33
**Estimated Complexity**: Critical

### Context

These are the most complex API routes — they orchestrate the adaptive engine: creating sessions with planned question distribution, processing answers with BKT/IRT updates, XP calculations, streak management, and session completion with badge checks.

### Instructions

1. Create `src/app/api/practice/session/route.ts` (POST):
   - Validate: `{ section, questionsCount? }`
   - Create practice_session in DB
   - Fetch user's KC masteries for this section
   - Plan session using `planSession()`
   - Select first question using `selectNextQuestion()`
   - Return `{ sessionId, firstQuestion, sessionPlan }`

2. Create `src/app/api/practice/submit/route.ts` (POST):
   - Validate: `{ sessionId, questionId, selectedOption, responseTimeMs }`
   - Check correctness against questions table
   - Save to practice_answers
   - Update BKT: `updateBKT()`, save new p_learned to user_kc_mastery
   - Update mastery_level via `getMasteryLevel()`
   - Calculate XP (5/10/15 based on question difficulty)
   - Update user_progress: xp, total_questions_answered, total_correct_answers, level via calculate_level
   - Call `upsert_daily_activity()`
   - Update question stats: times_shown++, times_correct++ if correct
   - Select next question
   - Return `{ isCorrect, correctOption, xpEarned, masteryUpdate, nextQuestion }`

3. Create `src/app/api/practice/complete/route.ts` (POST):
   - Validate: `{ sessionId }`
   - Calculate session accuracy, total XP, duration
   - Perfect session bonus (+25 XP)
   - Update practice_session: is_completed, accuracy, xp_earned, completed_at
   - Update section mastery on user_progress
   - Call `update_user_streak()`
   - Return session summary

4. Commit: `feat(api): add practice session, submit, and complete API routes`
5. Push to GitHub.

### Acceptance Criteria

- Session creation uses adaptive planner
- Submit updates BKT, IRT, XP, daily activity, and question stats
- Complete calculates session summary and updates streak
- All routes validate auth and input

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 35: Vocabulary + Analytics API Routes

**Phase**: 5 — Groq API & AI Pipeline
**Dependencies**: Prompt 34
**Estimated Complexity**: High

### Context

Vocabulary routes handle FSRS review submissions and semantic search. Analytics routes provide progress data and score predictions for the dashboard.

### Instructions

1. Create `src/app/api/vocab/review/route.ts` (POST):
   - Validate: `{ userVocabId, rating: 1|2|3|4, responseTimeMs }`
   - Fetch current user_vocabulary FSRS state
   - Call `scheduleCard()` from FSRS module
   - Save to vocab_reviews (stability_before/after, difficulty_before/after)
   - Update user_vocabulary with new FSRS state, next_review_at
   - Call `upsert_daily_activity()` for vocab_reviewed
   - Return `{ nextReviewDate, intervalDays, newState }`

2. Create `src/app/api/vocab/search/route.ts` (GET):
   - Query param: `q`
   - Text search on hebrew_word and arabic_meaning (ILIKE `%q%`)
   - Return matching words with relevance ordering

3. Create `src/app/api/analytics/progress/route.ts` (GET):
   - Fetch user_progress, all user_kc_mastery, last 10 practice_sessions, last 30 days daily_activity
   - Return comprehensive progress data

4. Create `src/app/api/analytics/predict/route.ts` (GET):
   - Fetch section masteries, IRT ability, recent accuracy, mock exam scores
   - Call `predictYAELScore()`
   - Update user_progress.predicted_score
   - Return ScorePrediction

5. Commit: `feat(api): add vocabulary review/search and analytics API routes`
6. Push to GitHub.

### Acceptance Criteria

- FSRS review updates all card state fields
- Search supports text matching
- Progress returns comprehensive data for dashboard
- Prediction updates predicted_score in DB

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 36: Onboarding Wizard Page

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 35
**Estimated Complexity**: High

### Context

The onboarding wizard is a 5-step flow that collects user preferences before they start learning. It sets experience level, target score, and daily study time, then runs a diagnostic test.

### Instructions

1. Create `src/app/(onboarding)/layout.tsx`: Clean layout, no sidebar, gradient background, step indicator dots
2. Create `src/app/(onboarding)/page.tsx` — 'use client', multi-step wizard:
   - **Step 1 (Welcome)**: "!مرحباً بك في يَعَل", CTA "يلا نبدأ!"
   - **Step 2 (Experience)**: "ما هو مستواك الحالي؟", 3 selectable cards: مبتدئ/متوسط/متقدم
   - **Step 3 (Target Score)**: "ما هي درجتك المستهدفة؟", Slider 80-150 default 120
   - **Step 4 (Schedule)**: "كم وقت يمكنك تخصيصه يومياً؟", 4 pills: 15/30/45/60 دقيقة
   - **Step 5 (Diagnostic)**: 10-15 adaptive questions for placement
   - Progress dots with animated fill
   - Framer Motion slide transitions (RTL-aware)
   - On complete: update profile, set onboarding_completed=true, redirect /dashboard
3. Commit: `feat(pages): add 5-step onboarding wizard`
4. Push to GitHub.

### Acceptance Criteria

- 5 steps with smooth transitions
- All Arabic text matches design spec
- Profile updated on completion
- Redirects to dashboard after onboarding

### Verification Command

```bash
npx tsc --noEmit && npm run build
```
