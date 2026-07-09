
---

## Prompt 37: Dashboard Page — Hero + Stats Grid

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 36
**Estimated Complexity**: Critical

### Context

The dashboard is the main landing page after login. It displays the student's progress at a glance: predicted score, XP/level, streak, section masteries, recent activity, and quick-action CTA cards. This is the most visually complex page.

### Instructions

1. Create `src/app/(app)/dashboard/page.tsx` — server component:
   - Fetch user profile, progress, recent sessions, daily activity, due vocab count via server Supabase client
   - Pass data to client sub-components

2. Create dashboard sub-components in `src/components/dashboard/`:

   **a. `HeroSection.tsx`** — 'use client':
   - Top section with gradient-hero background
   - Greeting: "مرحباً، {name}! 👋" with motivational message (random from UI_TEXT.motivational)
   - Predicted score circle: large circular progress ring (SVG), center shows predicted score number (animated count-up), label "الدرجة المتوقعة"
   - Color based on score: <80 rose, 80-100 gold, 100-120 primary, 120+ emerald

   **b. `StatsGrid.tsx`** — 'use client':
   - 4-column responsive grid (2 cols on mobile, 4 on desktop)
   - Cards: Level (level number + progress bar to next), XP (total with gradient-gold badge), Streak (🔥 days + longest), Accuracy (percentage of correct answers)
   - Each card: bg-bg-secondary, rounded-lg, p-4, with Lucide icon, value in text-2xl font-bold, label in text-sm text-text-secondary
   - Animated number transitions

   **c. `SectionMasteryGrid.tsx`** — 'use client':
   - 4 cards for YAEL sections (reading, vocabulary, writing, spelling)
   - Each card: section icon + Arabic name, radial progress gauge showing mastery %, color-coded (rose→gold→emerald→primary as mastery increases), mastery label (مبتدئ/متعلم/متوسط/متقدم/خبير)
   - Clickable → navigates to practice for that section

   **d. `QuickActions.tsx`** — 'use client':
   - 3-4 CTA cards: "ابدأ تمرين" (primary gradient, sparkles icon), "راجع المفردات" (gold gradient, with due count badge), "امتحان تجريبي" (violet gradient, clipboard icon), "تحدث مع المعلم" (emerald gradient, message icon)
   - Each card has pulse-glow animation on hover

   **e. `RecentActivity.tsx`** — 'use client':
   - List of last 5 practice sessions with: section badge, date (formatRelativeTime), accuracy %, XP earned
   - "عرض الكل" link to analytics

   **f. `StreakCalendar.tsx`** — 'use client':
   - Mini heatmap calendar showing last 30 days of activity
   - Green dots for active days, empty for inactive
   - Streak freeze indicator

3. Commit: `feat(pages): add dashboard with hero, stats, mastery grid, and quick actions`
4. Push to GitHub.

### Acceptance Criteria

- Dashboard loads with real data from server component
- Predicted score ring animates on mount
- Stats grid is responsive (2 cols mobile → 4 cols desktop)
- Section mastery cards show correct mastery levels
- Quick action cards have hover animations
- All text in Arabic

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 38: Practice Session Page — Question Flow

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 37
**Estimated Complexity**: Critical

### Context

The practice page is an interactive question-answering flow with real-time adaptive feedback. The user selects a section, a session is created with adaptively selected questions, and they answer one at a time with immediate feedback.

### Instructions

1. Create `src/app/(app)/practice/page.tsx` — section selection page:
   - 4 large section cards (reading, vocabulary, writing, spelling)
   - Each card: icon, Arabic section name, mastery progress bar, "ابدأ تمرين" button
   - Display recommended section (weakest mastery, highlighted border)

2. Create `src/app/(app)/practice/[section]/page.tsx` — 'use client' session page:
   - On mount: POST `/api/practice/session` to create session
   - Use `usePracticeStore` for state management

3. Create practice sub-components in `src/components/practice/`:

   **a. `QuestionCard.tsx`** — 'use client':
   - Question number / total indicator (e.g., "5 / 15")
   - Progress bar showing session progress
   - Timer (counting up from 0) per question
   - Passage section (if exists): `<HebrewIsland>` wrapper with scrollable Hebrew passage
   - Question text: `<HebrewIsland>` with text-lg font-hebrew
   - 4 answer options: A/B/C/D buttons
     - Default: bg-bg-tertiary border border-border-subtle rounded-lg p-4 text-start
     - Selected (before submit): border-primary-500 bg-primary-500/10
     - Correct (after submit): border-accent-emerald bg-accent-emerald/10, checkmark icon
     - Wrong (after submit): border-accent-rose bg-accent-rose/10, X icon, shake animation
     - Correct answer highlighted if user was wrong
   - Hebrew option text wrapped in `<HebrewIsland inline>`

   **b. `FeedbackPanel.tsx`** — 'use client':
   - Slides up after answer submission (animate-slide-up)
   - If correct: "!أحسنت" with emerald badge, XP float-up animation "+10 XP"
   - If wrong: "!حاول مرة أخرى" with explanation button
   - "اشرح لي" button → calls `/api/ai/explain`, shows AIResponse component
   - "تلميح" button (before answering) → calls `/api/ai/hint` with progressive tiers
   - "التالي" button → advance to next question

   **c. `SessionSummary.tsx`** — 'use client':
   - Shows after session complete (call `/api/practice/complete`)
   - Animated results: accuracy %, total XP earned, time taken
   - Per-skill breakdown: KC name + new mastery level
   - Badges earned (if any, with bounce-in animation)
   - "تمرين آخر" + "العودة للوحة التحكم" buttons

4. Commit: `feat(pages): add practice session with adaptive questions and feedback`
5. Push to GitHub.

### Acceptance Criteria

- Section selection shows mastery and recommendation
- Questions display Hebrew in HebrewIsland components
- Answer options animate correct/wrong states
- XP float-up animation on correct answer
- AI explanation loads on demand
- Session summary shows comprehensive results

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 39: Vocabulary Page — FSRS Flashcard Review

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 38
**Estimated Complexity**: Critical

### Context

The vocabulary page is a flashcard-based review system using FSRS scheduling. Cards flip to reveal meaning, and the user rates their recall (Again/Hard/Good/Easy). Due cards are fetched from the database.

### Instructions

1. Create `src/app/(app)/vocabulary/page.tsx` — server component:
   - Fetch due vocabulary count, total learned, total available via RPC `get_due_vocabulary()`
   - Stats bar: due count badge (pulsing if > 0), total learned, review streak

2. Create `src/app/(app)/vocabulary/review/page.tsx` — 'use client' review session:
   - Fetch due cards from API
   - Use `useVocabStore` for state

3. Create vocabulary sub-components in `src/components/vocabulary/`:

   **a. `FlashCard.tsx`** — 'use client':
   - 3D flip animation (perspective + rotateY via Framer Motion)
   - **Front** (question side):
     - `<HebrewIsland>` with large Hebrew word (text-4xl font-hebrew)
     - Nikud version below in text-text-secondary
     - Part of speech badge
     - Tap/click to flip indicator
   - **Back** (answer side):
     - Arabic meaning in text-2xl
     - Transliteration in text-sm text-text-tertiary
     - Root (Hebrew→Arabic) in a subtle badge
     - Example sentence in `<HebrewIsland>` with Arabic translation below
   - Card container: bg-bg-secondary rounded-xl p-8 shadow-lg, min-h-[300px]

   **b. `RatingButtons.tsx`** — 'use client':
   - 4 buttons in a row, visible only after card flip
   - Again (1): bg-accent-rose/10 text-accent-rose, label "مجدداً", shows "< 1 د" (< 1 min)
   - Hard (2): bg-accent-gold/10 text-accent-gold, label "صعب", shows interval
   - Good (3): bg-accent-emerald/10 text-accent-emerald, label "جيد", shows interval
   - Easy (4): bg-primary-500/10 text-primary-500, label "سهل", shows interval
   - Each button shows predicted next review interval (computeInterval from FSRS)
   - On click: POST `/api/vocab/review`, animate card exit, show next card

   **c. `VocabProgress.tsx`** — 'use client':
   - Top bar: cards remaining (countdown), session accuracy
   - State distribution: new/learning/review/relearning counts with color pills

   **d. `VocabBrowser.tsx`** — 'use client':
   - Searchable word list with search input
   - Grid/list toggle
   - Each word card: Hebrew word, Arabic meaning, difficulty stars, FSRS state badge
   - Filter by: difficulty level, part of speech, FSRS state

4. Commit: `feat(pages): add vocabulary review with FSRS flashcards and browser`
5. Push to GitHub.

### Acceptance Criteria

- 3D flip animation on flashcards
- 4 FSRS rating buttons with predicted intervals
- Due cards fetched and reviewed in order
- Vocabulary browser with search and filters
- All labels in Arabic

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 40: Mock Exam Page

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 39
**Estimated Complexity**: High

### Context

The mock exam simulates the real YAEL test with a timer, flag-for-review feature, and comprehensive results. It draws questions from all 4 sections proportionally.

### Instructions

1. Create `src/app/(app)/exam/page.tsx`:
   - Exam intro card: "الامتحان التجريبي" title, description, rules (time limit, question count, scoring)
   - "ابدأ الامتحان" CTA button
   - Previous exam history list

2. Create `src/app/(app)/exam/[examId]/page.tsx` — 'use client' exam session:
   - Create mock_exam via API
   - Countdown timer (90 minutes default) in header
   - Question navigator: grid of numbered circles (answered=filled, flagged=gold outline, current=primary border)
   - Question display similar to practice but without feedback
   - Flag button (bookmark icon) to mark for review
   - Section indicators on each question
   - Submit confirmation modal at end

3. Create `src/app/(app)/exam/[examId]/results/page.tsx`:
   - Total score with animated circle gauge
   - Per-section score breakdown (reading, vocab, writing, spelling) with bar chart
   - Performance vs target line
   - Flagged questions review section
   - AI recommendations (from ai_recommendations JSONB)
   - "تحليل مفصل" expandable sections per question
   - "إعادة الامتحان" + "العودة" buttons

4. Commit: `feat(pages): add mock exam with timer, flagging, and results analysis`
5. Push to GitHub.

### Acceptance Criteria

- Countdown timer persists across question navigation
- Flag feature marks/unmarks questions
- Results show per-section breakdown
- Question navigator allows jumping between questions

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 41: AI Tutor Chat Page

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 40
**Estimated Complexity**: High

### Context

The AI tutor is a conversational chat interface where students can ask questions about Hebrew grammar, YAEL exam strategies, and get personalized help. Uses SSE streaming for real-time response rendering.

### Instructions

1. Create `src/app/(app)/tutor/page.tsx` — 'use client':
   - Conversation list sidebar (on desktop, drawer on mobile)
   - Chat area with message bubbles
   - Input area with send button

2. Create tutor sub-components in `src/components/tutor/`:

   **a. `ChatBubble.tsx`** — 'use client':
   - User messages: bg-primary-500 text-white rounded-lg rounded-br-sm (RTL: bottom-left for user)
   - Assistant messages: bg-bg-tertiary rounded-lg rounded-bl-sm
   - Assistant messages use `<AIResponse>` component for Hebrew rendering
   - Timestamp in text-xs text-text-tertiary
   - Typing indicator: 3 bouncing dots animation

   **b. `ChatInput.tsx`** — 'use client':
   - Textarea (auto-resize) with bg-bg-tertiary border border-border-subtle rounded-xl
   - Send button: primary gradient circle, Arrow icon (RTL-flipped)
   - Enter to send, Shift+Enter for newline
   - Disabled state while AI is responding

   **c. `SuggestedTopics.tsx`** — 'use client':
   - Shown when conversation is empty
   - 6 pill buttons: "قواعد النحو", "استراتيجيات الامتحان", "المفردات الصعبة", "تمارين الكتابة", "الأخطاء الشائعة", "نصائح للإملاء"
   - Click sends as first message

   **d. `StreamingMessage.tsx`** — 'use client':
   - Reads from SSE stream via fetch + ReadableStream
   - Renders text progressively character-by-character with blinking cursor
   - Parses `<hebrew>` tags in real-time as they appear

3. Commit: `feat(pages): add AI tutor chat with streaming and suggested topics`
4. Push to GitHub.

### Acceptance Criteria

- Messages stream in real-time via SSE
- Hebrew content renders in HebrewIsland during streaming
- Suggested topics appear for new conversations
- Conversation history persists in sidebar

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 42: Analytics Page — Charts + Progress Tracking

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 41
**Estimated Complexity**: High

### Context

The analytics page provides data-driven insights into the student's learning journey with interactive charts showing progress over time, section breakdowns, and predictions.

### Instructions

1. Install: `npm install recharts`
2. Create `src/app/(app)/analytics/page.tsx`:
   - Fetch progress data, daily activity (30 days), session history, KC masteries via server component

3. Create analytics sub-components in `src/components/analytics/`:

   **a. `ScoreTrendChart.tsx`** — 'use client':
   - Recharts LineChart showing predicted score over time
   - X-axis: dates (Arabic formatted), Y-axis: 50-150
   - Target score horizontal reference line (dashed, labeled "الهدف")
   - Gradient area fill under the line
   - Responsive: 100% width
   - Colors: primary-500 for line, primary-500/20 for area

   **b. `SectionRadarChart.tsx`** — 'use client':
   - Recharts RadarChart with 4 axes: استيعاب, مفردات, كتابة, إملاء
   - Current mastery vs target overlay
   - Fill: primary-500/30, stroke: primary-500

   **c. `DailyActivityChart.tsx`** — 'use client':
   - Recharts BarChart showing daily XP/questions for last 30 days
   - Stacked bars: questions (primary), vocab reviews (gold)
   - Study time line overlay

   **d. `SkillBreakdown.tsx`** — 'use client':
   - Expandable accordion for each section
   - Each KC: name (Arabic), mastery progress bar, attempt count, last practiced date
   - Sort by mastery (weakest first) or recent activity

   **e. `StudyInsights.tsx`** — 'use client':
   - AI-style insights cards:
     - "أكثر مهارة تحتاج تمرين" — weakest KC
     - "أفضل وقت للدراسة" — most active time period
     - "معدل التقدم" — XP per day trend

4. Commit: `feat(pages): add analytics with charts, radar, and insights`
5. Push to GitHub.

### Acceptance Criteria

- Score trend shows line chart with target reference
- Radar chart displays 4-section mastery
- Daily activity shows 30-day bar chart
- Skill breakdown is expandable per section
- All chart labels in Arabic

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 43: Leaderboard Page

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 42
**Estimated Complexity**: Medium

### Context

Competitive leaderboard with daily, weekly, and all-time rankings. Shows user avatars, levels, XP, and highlights the current user's position.

### Instructions

1. Create `src/app/(app)/leaderboard/page.tsx`:
   - Tabs component: يومي (daily) | أسبوعي (weekly) | كل الأوقات (alltime)
   - Fetch leaderboard data for selected period

2. Create leaderboard sub-components:

   **a. `TopThree.tsx`** — 'use client':
   - Podium-style display for ranks 1-3
   - Rank 1: center, largest (gold crown icon, scale-110)
   - Rank 2: left, medium (silver)
   - Rank 3: right, smaller (bronze)
   - Each: avatar, name, level badge, XP count

   **b. `LeaderboardTable.tsx`** — 'use client':
   - Ranks 4+ in a list
   - Each row: rank number, avatar, name, level, XP
   - Current user row highlighted: bg-primary-500/10 border-primary-500
   - Sticky current user row if not in viewport

   **c. `UserRankCard.tsx`** — 'use client':
   - Floating card at bottom showing: "ترتيبك: #X" with XP needed for next rank

3. Commit: `feat(pages): add leaderboard with podium and period tabs`
4. Push to GitHub.

### Acceptance Criteria

- Period tabs switch between daily/weekly/alltime
- Top 3 displayed as podium
- Current user highlighted in list
- All text in Arabic

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 44: Profile Page

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 43
**Estimated Complexity**: Medium

### Context

User profile page showing avatar, stats summary, earned badges, and study history.

### Instructions

1. Create `src/app/(app)/profile/page.tsx`:
   - Server component fetching profile, progress, badges, activity

2. Create profile sub-components:

   **a. `ProfileHeader.tsx`** — 'use client':
   - Large avatar (96px) with edit overlay on hover
   - Name, email, join date (formatDate)
   - Level badge with name (e.g., "المستوى 12 — متوسط")
   - XP progress bar to next level

   **b. `StatsOverview.tsx`**:
   - Grid: Total questions, Accuracy %, Study hours, Streak days, Predicted score

   **c. `BadgeShowcase.tsx`** — 'use client':
   - Grid of earned badges with icon, name, earned_at
   - Unearned badges shown as locked (grayscale, lock icon overlay)
   - Click badge for detail modal with progress toward earning

   **d. `ActivityHeatmap.tsx`** — 'use client':
   - GitHub-style contribution heatmap for last 12 months
   - Color scale: no activity → light → medium → intense (using primary color scale)

3. Commit: `feat(pages): add profile with badges and activity heatmap`
4. Push to GitHub.

### Acceptance Criteria

- Avatar upload to Supabase Storage
- Badges displayed with locked/unlocked states
- Activity heatmap shows 12 months

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 45: Settings Page

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 44
**Estimated Complexity**: Medium

### Context

Settings page for theme toggle, notification preferences, study schedule, and account management.

### Instructions

1. Create `src/app/(app)/settings/page.tsx` — 'use client':
   - Sections with Card containers:

   **a. Appearance (المظهر)**:
   - Theme toggle: dark/light switch with useTheme hook
   - Live preview transition

   **b. Study Preferences (تفضيلات الدراسة)**:
   - Target score: slider 80-150
   - Daily study time: 15/30/45/60 minute pills
   - Experience level: beginner/intermediate/advanced selector

   **c. Notifications (الإشعارات)**:
   - Toggle switches: daily reminder, streak warning, new badges, weekly report

   **d. Account (الحساب)**:
   - Change name: inline editable
   - Change password: form (old + new + confirm)
   - Delete account: red danger button with confirmation modal
   - Sign out button

   - All changes save via PATCH to `/api/user/profile`
   - Toast on successful save

2. Create `src/app/api/user/profile/route.ts` (PATCH):
   - Validate and update profile fields
   - Return updated profile

3. Commit: `feat(pages): add settings with theme, preferences, and account management`
4. Push to GitHub.

### Acceptance Criteria

- Theme toggle immediately changes UI
- Target score and study time persist to DB
- Password change works via Supabase Auth
- Delete account has confirmation step

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 46: Error Pages + Loading States

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 45
**Estimated Complexity**: Medium

### Context

Custom error pages and loading states provide a polished experience during navigation and error recovery.

### Instructions

1. Create `src/app/not-found.tsx`:
   - Centered layout with large "404" text
   - Arabic message: "الصفحة غير موجودة"
   - Subtle illustration or emoji
   - "العودة للصفحة الرئيسية" button

2. Create `src/app/error.tsx` — 'use client' error boundary:
   - "حدث خطأ ما" heading
   - Error message display (sanitized)
   - "إعادة المحاولة" button calling `reset()`
   - "العودة" link

3. Create `src/app/(app)/loading.tsx`:
   - AppShell skeleton with:
   - Dashboard skeleton: hero skeleton, 4 stat card skeletons, 4 section card skeletons
   - Use Skeleton component with shimmer animation

4. Create `src/app/(app)/dashboard/loading.tsx` — dashboard-specific skeleton
5. Create `src/app/(app)/practice/loading.tsx` — practice-specific skeleton
6. Create `src/app/(app)/vocabulary/loading.tsx` — vocab-specific skeleton

7. Commit: `feat(pages): add 404, error boundary, and loading skeletons`
8. Push to GitHub.

### Acceptance Criteria

- 404 page shows Arabic message with home link
- Error boundary catches and displays errors with retry
- Loading states use Skeleton components

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 47: Real-time Features — Supabase Realtime

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 46
**Estimated Complexity**: Medium

### Context

Supabase Realtime enables live updates for leaderboard rankings, streak notifications, and badge unlocks without page refresh.

### Instructions

1. Create `src/hooks/useRealtimeSubscription.ts`:
   ```typescript
   'use client';
   import { useEffect } from 'react';
   import { createClient } from '@/lib/supabase/client';
   import { RealtimeChannel } from '@supabase/supabase-js';

   export function useRealtimeSubscription(
     table: string,
     filter: string,
     onUpdate: (payload: any) => void
   ) {
     useEffect(() => {
       const supabase = createClient();
       const channel: RealtimeChannel = supabase
         .channel(`${table}_changes`)
         .on('postgres_changes', { event: '*', schema: 'public', table, filter }, onUpdate)
         .subscribe();

       return () => { supabase.removeChannel(channel); };
     }, [table, filter, onUpdate]);
   }
   ```

2. Create `src/hooks/useNotifications.ts`:
   - Subscribe to notifications table for current user
   - Show Toast on new notification
   - Update unread count in header badge

3. Create `src/hooks/useBadgeUnlock.ts`:
   - Subscribe to user_badges for current user
   - On new badge: show celebratory modal with confetti animation, badge icon, Arabic name

4. Integrate into Header component: live notification count, live XP updates

5. Commit: `feat(realtime): add Supabase Realtime for notifications and badge unlocks`
6. Push to GitHub.

### Acceptance Criteria

- Notifications appear in real-time via toast
- Badge unlock triggers celebration modal
- Unread count updates live in header

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 48: PWA Setup + Service Worker

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 47
**Estimated Complexity**: Medium

### Context

Progressive Web App setup enables offline access to vocabulary cards and push notifications for study reminders.

### Instructions

1. Install: `npm install next-pwa`
2. Create `public/manifest.json`:
   ```json
   {
     "name": "يَعَل — منصة التحضير لامتحان יע\"ל",
     "short_name": "يَعَل",
     "description": "منصة ذكية لتحضير امتحان يע\"ל",
     "start_url": "/dashboard",
     "display": "standalone",
     "background_color": "#0F0F23",
     "theme_color": "#6366F1",
     "dir": "rtl",
     "lang": "ar",
     "icons": [
       { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```
3. Update `next.config.js` to include `next-pwa` wrapper with `dest: 'public'`
4. Add manifest link to `layout.tsx` head
5. Create `src/app/offline/page.tsx` — offline fallback page with Arabic message

6. Commit: `feat(pwa): add PWA manifest and service worker configuration`
7. Push to GitHub.

### Acceptance Criteria

- manifest.json has RTL direction and Arabic name
- App installable on mobile
- Offline page shows Arabic fallback

### Verification Command

```bash
npm run build
```

---

## Prompt 49: Accessibility + RTL Polish

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 48
**Estimated Complexity**: Medium

### Context

Full accessibility audit and RTL polish pass across all components to ensure WCAG 2.1 AA compliance.

### Instructions

1. Audit and update ALL components for:
   - `aria-label` on icon-only buttons (Arabic labels)
   - `aria-live="polite"` on dynamic content areas (score updates, toast container)
   - `role="alert"` on error messages
   - `aria-current="page"` on active navigation items
   - Keyboard navigation: all interactive elements focusable and operable via keyboard
   - Skip-to-content link: "تخطي إلى المحتوى الرئيسي" as first focusable element
   - Focus trap in modals
   - Color contrast ratio ≥ 4.5:1 for all text

2. RTL polish:
   - Replace all `margin-left/right` with `margin-inline-start/end`
   - Replace all `padding-left/right` with `padding-inline-start/end`
   - Replace all `border-left/right` with `border-inline-start/end`
   - Replace `text-left/right` with `text-start/end`
   - Ensure all Lucide icons that are directional (arrows, chevrons) use `rtl-flip` class
   - Test all Framer Motion slide animations work correctly in RTL (slide-right = slide from left in LTR)

3. Commit: `feat(a11y): add WCAG 2.1 AA compliance and RTL polish`
4. Push to GitHub.

### Acceptance Criteria

- Skip-to-content link exists
- All icon buttons have aria-labels in Arabic
- No hardcoded left/right CSS properties
- Keyboard navigation works across all pages
- Color contrast meets 4.5:1 minimum

### Verification Command

```bash
npm run build
```

---

## Prompt 50: Custom React Hooks Library

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 49
**Estimated Complexity**: Medium

### Context

Reusable hooks for common patterns across the app.

### Instructions

1. Create `src/hooks/useDebounce.ts`: Debounce a value by specified delay
2. Create `src/hooks/useLocalStorage.ts`: Typed localStorage get/set with SSR safety
3. Create `src/hooks/useMediaQuery.ts`: Match media queries (e.g., isMobile, isDesktop)
4. Create `src/hooks/useCountUp.ts`: Animated number counting from 0 to target using requestAnimationFrame
5. Create `src/hooks/useAuth.ts`: Hook wrapping useAuthStore with hydration from Supabase session
6. Create `src/hooks/useUserProgress.ts`: TanStack Query hook fetching user progress with real-time subscriptions
7. Create `src/hooks/usePractice.ts`: Hook orchestrating practice session API calls
8. Create `src/hooks/useVocabReview.ts`: Hook orchestrating FSRS review flow
9. Create `src/hooks/index.ts`: Barrel export

10. Commit: `feat(hooks): add reusable custom hooks library`
11. Push to GitHub.

### Acceptance Criteria

- All hooks are 'use client' compatible
- useDebounce works with generic types
- useCountUp provides smooth number animation
- useAuth hydrates from Supabase on mount

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 51: API Rate Limiting + Error Handling

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 50
**Estimated Complexity**: Medium

### Context

Production-grade API protection with rate limiting, standardized error responses, and request validation middleware.

### Instructions

1. Create `src/lib/api/rate-limiter.ts`:
   - In-memory token bucket rate limiter (Map-based for serverless)
   - Config per route type: AI routes (10 req/min), practice (30 req/min), general (60 req/min)
   - Return 429 with Arabic error message and Retry-After header

2. Create `src/lib/api/errors.ts`:
   - `AppError` class extending Error with statusCode, code, messageArabic
   - Standard error codes: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, RATE_LIMITED, VALIDATION_ERROR, INTERNAL_ERROR
   - `handleApiError(error)`: catches AppError and unknown errors, returns standardized NextResponse JSON
   - Arabic error messages for each code

3. Create `src/lib/api/middleware.ts`:
   - `withAuth(handler)`: HOF that checks auth, passes user to handler
   - `withRateLimit(handler, type)`: HOF that applies rate limiting
   - `withValidation(schema, handler)`: HOF that validates request body with Zod

4. Refactor 2-3 existing API routes to use these middleware wrappers as demonstration

5. Commit: `feat(api): add rate limiting, error handling, and validation middleware`
6. Push to GitHub.

### Acceptance Criteria

- Rate limiter returns 429 with Arabic message
- AppError provides structured error responses
- Middleware wrappers are composable

### Verification Command

```bash
npx tsc --noEmit && npm run build
```

---

## Prompt 52: Comprehensive SEO + Metadata

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 51
**Estimated Complexity**: Low

### Context

Every page needs proper metadata for SEO, social sharing, and Arabic language discovery.

### Instructions

1. Add `generateMetadata()` to every page:
   - Dashboard: "لوحة التحكم — يَعَل"
   - Practice: "التمرين — يَعَل"
   - Vocabulary: "المفردات — يَعَل"
   - Exam: "الامتحان التجريبي — يَعَل"
   - Tutor: "المعلم الذكي — يَعَل"
   - Analytics: "التحليلات — يَعَل"
   - Profile: "الملف الشخصي — يَعَل"
   - Leaderboard: "لوحة المتصدرين — يَعَل"
   - Settings: "الإعدادات — يَعَل"

2. Add OpenGraph metadata with Arabic descriptions per page
3. Create `src/app/robots.ts` and `src/app/sitemap.ts` for SEO crawling
4. Add structured data (JSON-LD) for EducationalOrganization schema on landing page

5. Commit: `feat(seo): add comprehensive Arabic metadata and structured data`
6. Push to GitHub.

### Acceptance Criteria

- Every page has unique Arabic title and description
- robots.txt and sitemap.xml generated
- JSON-LD structured data on landing page

### Verification Command

```bash
npm run build
```

---

## Prompt 53: Performance Optimization

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 52
**Estimated Complexity**: Medium

### Context

Optimization pass for Core Web Vitals: code splitting, lazy loading, image optimization, and bundle analysis.

### Instructions

1. Add dynamic imports for heavy components:
   ```typescript
   const Chart = dynamic(() => import('@/components/analytics/ScoreTrendChart'), {
     loading: () => <Skeleton variant="card" />,
     ssr: false,
   });
   ```
   - Apply to: all Recharts components, Modal, FlashCard (3D), StreamingMessage

2. Add `React.memo()` to pure display components: StatsGrid cards, BadgeShowcase items, LeaderboardTable rows

3. Add `useMemo` / `useCallback` where appropriate:
   - Memoize calculated values in analytics
   - Memoize event handlers passed to child components

4. Image optimization:
   - All avatars use `next/image` with width/height and priority for above-fold
   - Blur placeholder for content images

5. Bundle optimization:
   - Add `@next/bundle-analyzer` for analysis
   - Ensure Recharts is dynamically imported (not in main bundle)
   - Tree-shake Lucide icons (import individual icons, not the package)

6. Commit: `perf: add code splitting, lazy loading, and bundle optimization`
7. Push to GitHub.

### Acceptance Criteria

- Heavy components are dynamically imported
- Recharts not in initial bundle
- Lucide icons imported individually
- next/image used for all images

### Verification Command

```bash
npm run build && ls -la .next/static/chunks/ | head -20
```

---

## Prompt 54: Testing Setup + Critical Path Tests

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 53
**Estimated Complexity**: High

### Context

Unit tests for the adaptive engine (BKT, IRT, FSRS) and integration tests for critical API routes.

### Instructions

1. Install testing dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
   ```

2. Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.ts'],
       globals: true,
     },
     resolve: {
       alias: { '@': path.resolve(__dirname, './src') },
     },
   });
   ```

3. Create `src/test/setup.ts`: import `@testing-library/jest-dom`

4. Create test files:

   **a. `src/lib/adaptive/__tests__/bkt.test.ts`**:
   - Test: correct answer increases P(L)
   - Test: incorrect answer decreases P(L)
   - Test: mastery at P(L) ≥ 0.95
   - Test: decay reduces P(L) by 5% per day
   - Test: P(L) clamped to [0.0001, 0.9999]

   **b. `src/lib/adaptive/__tests__/irt.test.ts`**:
   - Test: irt3PL(0, 1, 0, 0) ≈ 0.5
   - Test: irt3PL(0, 1, 0, 0.2) ≈ 0.6
   - Test: higher ability → higher probability
   - Test: Fisher Information peaks near difficulty
   - Test: EAP with empty responses returns prior

   **c. `src/lib/adaptive/__tests__/fsrs.test.ts`**:
   - Test: initial stability matches weight for each rating
   - Test: retrievability = 1 at elapsed = 0
   - Test: retrievability decreases over time
   - Test: stability increases after successful recall
   - Test: state transitions: new→learning→review→relearning

   **d. `src/lib/adaptive/__tests__/score-prediction.test.ts`**:
   - Test: score clamped between 50 and 150
   - Test: all mastery = 1.0 → score near 150
   - Test: all mastery = 0.0 → score near 50

5. Add test script to package.json: `"test": "vitest run"`, `"test:watch": "vitest"`

6. Commit: `test: add unit tests for BKT, IRT, FSRS, and score prediction`
7. Push to GitHub.

### Acceptance Criteria

- 15+ test cases across 4 test files
- All tests pass with `npm test`
- Tests cover edge cases and boundary conditions
- Vitest configured with path aliases

### Verification Command

```bash
npm test
```

---

## Prompt 55: Production Build + Deployment Configuration

**Phase**: 6 — Pages, Features & Production Polish
**Dependencies**: Prompt 54
**Estimated Complexity**: Medium

### Context

Final production readiness: Vercel deployment configuration, environment variable validation, health check endpoint, and production build verification.

### Instructions

1. Create `vercel.json`:
   ```json
   {
     "framework": "nextjs",
     "regions": ["fra1"],
     "crons": [
       {
         "path": "/api/cron/cleanup-cache",
         "schedule": "0 3 * * *"
       }
     ]
   }
   ```

2. Create `src/lib/env.ts` — runtime environment validation:
   ```typescript
   import { z } from 'zod';

   const envSchema = z.object({
     NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
     NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
     SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
     GROQ_API_KEY: z.string().min(1),
     NEXT_PUBLIC_APP_URL: z.string().url(),
     NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
   });

   export const env = envSchema.parse({
     NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
     NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
     SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
     GROQ_API_KEY: process.env.GROQ_API_KEY,
     NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
     NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
   });
   ```

3. Create `src/app/api/health/route.ts` (GET):
   ```typescript
   import { NextResponse } from 'next/server';

   export async function GET() {
     return NextResponse.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version ?? '1.0.0',
     });
   }
   ```

4. Create `src/app/api/cron/cleanup-cache/route.ts` (GET):
   - Delete expired rows from ai_response_cache where expires_at < now()
   - Vercel cron auth check via `CRON_SECRET` header
   - Return count of deleted rows

5. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm
         - run: npm ci
         - run: npx tsc --noEmit
         - run: npm test
         - run: npm run build
   ```

6. Update README.md with:
   - Project description in Arabic and English
   - Setup instructions
   - Environment variable documentation
   - Tech stack overview
   - Deployment guide

7. Commit: `feat(deploy): add Vercel config, env validation, CI/CD, and health check`
8. Push to GitHub.

### Acceptance Criteria

- `npm run build` succeeds with zero errors
- `npm test` passes all tests
- `npx tsc --noEmit` has zero type errors
- Health endpoint returns JSON status
- Cache cleanup cron configured
- CI workflow runs lint, test, and build
- README documented in Arabic

### Verification Command

```bash
npx tsc --noEmit && npm test && npm run build
```

---

# 🏁 Pipeline Complete

**Total Prompts**: 55
**Phase Breakdown**:
- Phase 1 (Foundation): Prompts 01–06
- Phase 2 (Database): Prompts 07–17
- Phase 3 (UI/Layout): Prompts 18–23
- Phase 4 (Adaptive Engine): Prompts 24–28
- Phase 5 (AI Pipeline): Prompts 29–35
- Phase 6 (Pages & Polish): Prompts 36–55

**Critical Path**: Prompts 25 (BKT), 26 (IRT), 27 (FSRS), 34 (Practice API), 37 (Dashboard), 38 (Practice UI), 39 (Vocabulary)

**After completing all 55 prompts, the platform will have**:
- ✅ Full Next.js 14 app with TypeScript strict mode
- ✅ Complete Supabase PostgreSQL schema (13 tables, 5 functions, 22 KCs, 11 badges)
- ✅ RTL-first Arabic UI with Hebrew islands and dark/light themes
- ✅ Bayesian Knowledge Tracing adaptive engine
- ✅ IRT 3PL item selection and ability estimation
- ✅ FSRS v4 spaced repetition for vocabulary
- ✅ Groq-powered AI tutor with streaming chat
- ✅ Predicted YAEL score (50-150) with multi-model fusion
- ✅ Gamification: XP, levels, streaks, badges, leaderboard
- ✅ Mock exam simulator
- ✅ Analytics dashboard with Recharts
- ✅ PWA support for mobile install
- ✅ WCAG 2.1 AA accessibility
- ✅ Unit tests for all adaptive algorithms
- ✅ Production deployment configuration
