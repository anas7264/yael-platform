# 🏗️ YAEL Platform — Complete Frontend Architecture

*Principal Frontend Engineer · Next.js 14 App Router · RTL-First · Production-Grade*

---

## PART 0 — ARCHITECTURAL PRINCIPLES

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    EIGHT ARCHITECTURAL LAWS                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  LAW 1: RTL IS NOT AN AFTERTHOUGHT                                          ║
║  The entire component system is built dir="rtl" first.                      ║
║  LTR is an ISLAND — a contained exception for Hebrew content.               ║
║  No component assumes text direction. All components receive it as context. ║
║                                                                              ║
║  LAW 2: SERVER FIRST, CLIENT WHEN NECESSARY                                 ║
║  Every component starts as a Server Component.                              ║
║  "use client" is a deliberate, documented decision, not a default.          ║
║  Client components are leaves, not roots.                                   ║
║                                                                              ║
║  LAW 3: THE BUNDLE IS A BUDGET                                              ║
║  Every dependency is a line item. Every kilobyte is justified.              ║
║  Lazy load everything not visible in the initial viewport.                  ║
║  Code-split at the route boundary AND at the feature boundary.             ║
║                                                                              ║
║  LAW 4: TYPES ARE CONTRACTS                                                 ║
║  TypeScript strict mode. No `any`. No `@ts-ignore` without comment.        ║
║  Database types generated from Supabase schema — single source of truth.   ║
║  API response types shared between server and client.                       ║
║                                                                              ║
║  LAW 5: ACCESSIBILITY IS NOT A FEATURE                                      ║
║  WCAG 2.1 AA is the floor, not the ceiling.                                ║
║  Every interactive element: keyboard navigable, screen-reader announced,   ║
║  focus-visible always. Arabic screen reader support is first-class.         ║
║                                                                              ║
║  LAW 6: ERROR STATES ARE FIRST-CLASS CITIZENS                              ║
║  Every async operation has three states: loading, success, error.          ║
║  Every error state has a recovery path.                                     ║
║  Errors never crash the full application — boundaries contain them.         ║
║                                                                              ║
║  LAW 7: OPTIMISTIC BY DEFAULT                                               ║
║  Mutations update the UI before server confirmation.                        ║
║  Rollback silently on failure. Users feel speed, not latency.              ║
║                                                                              ║
║  LAW 8: PERFORMANCE IS A FEATURE                                            ║
║  Core Web Vitals are tracked and owned by the frontend team.               ║
║  LCP < 2.5s, INP < 200ms, CLS < 0.1 — hard targets, not aspirations.     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PART 1 — COMPLETE FOLDER STRUCTURE

```
yael-platform/
│
├── 📁 app/                                    # Next.js App Router root
│   │
│   ├── 📁 (marketing)/                        # Route group — unauthenticated
│   │   ├── 📁 _components/                    # Marketing-only components
│   │   │   ├── hero-section.tsx
│   │   │   ├── interactive-question.tsx       # "Try before signup" question
│   │   │   ├── root-discovery.tsx             # AR↔HE bridge animation
│   │   │   ├── score-transformation-wall.tsx  # Social proof feed
│   │   │   ├── insight-section.tsx
│   │   │   └── faq-section.tsx
│   │   │
│   │   ├── page.tsx                           # Landing page (SSG)
│   │   ├── layout.tsx                         # Marketing layout (minimal nav)
│   │   └── loading.tsx
│   │
│   ├── 📁 (auth)/                             # Route group — auth flow
│   │   ├── 📁 login/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── 📁 register/
│   │   │   └── page.tsx
│   │   ├── 📁 callback/                       # OAuth callback handler
│   │   │   └── route.ts                       # Route handler
│   │   ├── 📁 verify/
│   │   │   └── page.tsx
│   │   └── layout.tsx                         # Auth layout (centered card)
│   │
│   ├── 📁 (onboarding)/                       # Route group — new user flow
│   │   ├── 📁 _components/
│   │   │   ├── onboarding-shell.tsx           # Step wrapper + progress dots
│   │   │   ├── step-exam-date.tsx
│   │   │   ├── step-daily-time.tsx
│   │   │   └── step-placement-intro.tsx
│   │   ├── 📁 goals/
│   │   │   └── page.tsx
│   │   ├── 📁 schedule/
│   │   │   └── page.tsx
│   │   ├── 📁 placement/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── 📁 results/
│   │   │   └── page.tsx
│   │   └── layout.tsx                         # Onboarding layout (no nav)
│   │
│   ├── 📁 (app)/                              # Route group — main app
│   │   ├── 📁 _components/                    # App-shell components
│   │   │   ├── app-shell.tsx                  # Root layout wrapper
│   │   │   ├── sidebar-nav.tsx                # Desktop navigation
│   │   │   ├── bottom-nav.tsx                 # Mobile navigation
│   │   │   ├── top-bar.tsx                    # App top bar
│   │   │   ├── streak-badge.tsx
│   │   │   ├── xp-counter.tsx
│   │   │   └── profile-menu.tsx
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   ├── page.tsx                       # Dashboard (ISR — 5min)
│   │   │   ├── loading.tsx                    # Skeleton dashboard
│   │   │   ├── error.tsx                      # Dashboard error boundary
│   │   │   └── 📁 _components/
│   │   │       ├── today-mission-card.tsx
│   │   │       ├── score-gauge.tsx
│   │   │       ├── skill-garden.tsx           # Skill heatmap as garden
│   │   │       ├── streak-display.tsx
│   │   │       ├── recent-activity.tsx
│   │   │       └── study-plan-preview.tsx
│   │   │
│   │   ├── 📁 practice/
│   │   │   ├── page.tsx                       # Session type selector
│   │   │   ├── loading.tsx
│   │   │   └── 📁 session/
│   │   │       └── 📁 [sessionId]/
│   │   │           ├── page.tsx               # Live practice session
│   │   │           ├── loading.tsx
│   │   │           ├── error.tsx
│   │   │           └── 📁 _components/
│   │   │               ├── question-display.tsx
│   │   │               ├── passage-block.tsx
│   │   │               ├── answer-options.tsx
│   │   │               ├── option-card.tsx
│   │   │               ├── feedback-panel.tsx
│   │   │               ├── explanation-block.tsx
│   │   │               ├── confidence-rater.tsx
│   │   │               ├── session-header.tsx
│   │   │               ├── session-progress.tsx
│   │   │               └── session-summary.tsx
│   │   │
│   │   ├── 📁 vocabulary/
│   │   │   ├── page.tsx                       # Vocab hub
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── vocab-dashboard.tsx
│   │   │       ├── flashcard-session.tsx
│   │   │       ├── flashcard.tsx
│   │   │       ├── rating-buttons.tsx
│   │   │       ├── bridge-card.tsx
│   │   │       ├── root-explorer.tsx
│   │   │       └── word-tooltip.tsx
│   │   │
│   │   ├── 📁 grammar/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── grammar-hub.tsx
│   │   │       ├── skill-tree.tsx
│   │   │       ├── binyan-reference.tsx
│   │   │       ├── conjugation-builder.tsx
│   │   │       └── grammar-question.tsx
│   │   │
│   │   ├── 📁 reading/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── passage-reader.tsx
│   │   │       ├── vocab-primer.tsx
│   │   │       ├── annotation-toolbar.tsx
│   │   │       ├── word-lookup.tsx
│   │   │       └── reading-questions.tsx
│   │   │
│   │   ├── 📁 writing/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── essay-editor.tsx
│   │   │       ├── writing-scaffold.tsx
│   │   │       ├── live-feedback-panel.tsx
│   │   │       ├── grammar-underlines.tsx
│   │   │       └── essay-feedback.tsx
│   │   │
│   │   ├── 📁 exam/
│   │   │   ├── page.tsx                       # Exam selector
│   │   │   ├── loading.tsx
│   │   │   ├── 📁 [examId]/
│   │   │   │   ├── page.tsx                   # Live exam (no layout)
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── 📁 results/
│   │   │       └── 📁 [examId]/
│   │   │           ├── page.tsx
│   │   │           └── loading.tsx
│   │   │
│   │   ├── 📁 tutor/
│   │   │   ├── page.tsx                       # AI Tutor chat
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── chat-interface.tsx
│   │   │       ├── message-bubble.tsx
│   │   │       ├── suggested-prompts.tsx
│   │   │       ├── typing-indicator.tsx
│   │   │       └── chat-input.tsx
│   │   │
│   │   ├── 📁 analytics/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── score-trajectory-chart.tsx
│   │   │       ├── section-radar-chart.tsx
│   │   │       ├── skill-breakdown-table.tsx
│   │   │       ├── error-patterns-insight.tsx
│   │   │       └── study-habit-heatmap.tsx
│   │   │
│   │   ├── 📁 achievements/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── badge-gallery.tsx
│   │   │       ├── badge-card.tsx
│   │   │       ├── unlock-ceremony.tsx        # Full-screen unlock modal
│   │   │       └── progress-badge.tsx
│   │   │
│   │   ├── 📁 leaderboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── leaderboard-tabs.tsx
│   │   │       ├── leaderboard-list.tsx
│   │   │       ├── podium.tsx
│   │   │       └── personal-rank-card.tsx
│   │   │
│   │   ├── 📁 profile/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── identity-card.tsx
│   │   │       ├── journey-timeline.tsx
│   │   │       ├── exam-goal-card.tsx
│   │   │       └── stats-summary.tsx
│   │   │
│   │   ├── 📁 settings/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── 📁 _components/
│   │   │       ├── settings-section.tsx
│   │   │       ├── dialect-selector.tsx
│   │   │       ├── notification-settings.tsx
│   │   │       ├── accessibility-settings.tsx
│   │   │       └── danger-zone.tsx
│   │   │
│   │   └── layout.tsx                         # App shell layout (with nav)
│   │
│   ├── 📁 (admin)/                            # Route group — admin only
│   │   ├── 📁 _components/
│   │   │   ├── admin-shell.tsx
│   │   │   ├── admin-nav.tsx
│   │   │   └── admin-mode-banner.tsx
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx
│   │   ├── 📁 questions/
│   │   │   ├── page.tsx
│   │   │   └── 📁 [id]/
│   │   │       └── page.tsx
│   │   ├── 📁 explanations/
│   │   │   └── page.tsx
│   │   ├── 📁 users/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── 📁 api/                                # API Route Handlers
│   │   └── 📁 v1/
│   │       ├── 📁 auth/
│   │       │   └── route.ts
│   │       ├── 📁 sessions/
│   │       │   ├── route.ts
│   │       │   └── 📁 [id]/
│   │       │       ├── route.ts
│   │       │       └── 📁 answer/
│   │       │           └── route.ts
│   │       ├── 📁 explain/
│   │       │   └── 📁 [questionId]/
│   │       │       └── route.ts               # Streaming response
│   │       ├── 📁 tutor/
│   │       │   └── route.ts                   # Streaming SSE
│   │       ├── 📁 vocab/
│   │       │   └── route.ts
│   │       ├── 📁 plan/
│   │       │   └── route.ts
│   │       ├── 📁 progress/
│   │       │   └── route.ts
│   │       └── 📁 webhooks/
│   │           └── route.ts                   # Supabase webhooks
│   │
│   ├── globals.css                            # CSS variables + global styles
│   ├── layout.tsx                             # Root layout (all providers)
│   ├── not-found.tsx                          # Global 404
│   ├── error.tsx                              # Global error boundary
│   └── loading.tsx                            # Global loading
│
│
├── 📁 components/                             # Shared component library
│   │
│   ├── 📁 ui/                                 # Base design system (shadcn/ui extended)
│   │   ├── 📁 primitives/                     # Atomic components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── spinner.tsx
│   │   │
│   │   ├── 📁 surfaces/                       # Container components
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx                     # Mobile-first
│   │   │   ├── sheet.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── tabs.tsx
│   │   │
│   │   ├── 📁 feedback/                       # User feedback components
│   │   │   ├── toast.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   └── empty-state.tsx
│   │   │
│   │   └── 📁 navigation/                     # Navigation primitives
│   │       ├── breadcrumb.tsx
│   │       ├── pagination.tsx
│   │       └── scroll-area.tsx
│   │
│   ├── 📁 typography/                         # Text rendering system
│   │   ├── arabic-text.tsx                    # Always dir="rtl", Cairo/Noto font
│   │   ├── hebrew-text.tsx                    # Always dir="ltr", Frank Ruhl font
│   │   ├── bilingual-label.tsx                # Mixed AR/HE inline
│   │   ├── nikud-text.tsx                     # Hebrew with vowel marks
│   │   └── score-number.tsx                   # Animated number display
│   │
│   ├── 📁 layout/                             # Layout-level components
│   │   ├── rtl-provider.tsx                   # Direction context
│   │   ├── page-header.tsx
│   │   ├── page-section.tsx
│   │   ├── content-container.tsx              # Max-width + padding
│   │   ├── split-layout.tsx                   # Desktop two-column
│   │   └── mobile-safe-area.tsx               # iOS bottom safe area
│   │
│   ├── 📁 charts/                             # Data visualization
│   │   ├── score-line-chart.tsx               # Recharts-based
│   │   ├── section-radar-chart.tsx
│   │   ├── activity-heatmap.tsx
│   │   ├── bar-chart.tsx
│   │   └── progress-ring.tsx                  # SVG progress circle
│   │
│   ├── 📁 gamification/                       # Gamification UI
│   │   ├── xp-animation.tsx                   # "+25 XP" float animation
│   │   ├── streak-flame.tsx                   # Dynamic flame component
│   │   ├── level-badge.tsx
│   │   ├── star-rating.tsx                    # 5-star skill mastery
│   │   ├── confetti-burst.tsx
│   │   └── achievement-unlock-modal.tsx       # Full-screen ceremony
│   │
│   ├── 📁 media/                              # Audio/visual
│   │   ├── audio-player.tsx                   # Hebrew pronunciation
│   │   ├── optimized-image.tsx                # Next/Image wrapper
│   │   └── lottie-animation.tsx               # Lottie wrapper
│   │
│   └── 📁 seo/                                # SEO components
│       ├── metadata-builder.ts
│       ├── structured-data.tsx                # JSON-LD
│       └── open-graph.tsx
│
│
├── 📁 lib/                                    # Core utilities and logic
│   │
│   ├── 📁 supabase/                           # Supabase clients
│   │   ├── client.ts                          # Browser client (singleton)
│   │   ├── server.ts                          # Server client (cookies)
│   │   ├── middleware.ts                       # Route middleware client
│   │   ├── admin.ts                           # Service role client
│   │   └── types.ts                           # Generated DB types
│   │
│   ├── 📁 api/                                # API client layer
│   │   ├── client.ts                          # Base fetch wrapper
│   │   ├── sessions.ts                        # Session API calls
│   │   ├── vocabulary.ts
│   │   ├── progress.ts
│   │   ├── tutor.ts                           # Streaming API calls
│   │   ├── explain.ts
│   │   └── plan.ts
│   │
│   ├── 📁 adaptive/                           # Adaptive engine (pure TS)
│   │   ├── bkt.ts                             # Bayesian Knowledge Tracing
│   │   ├── fsrs.ts                            # Spaced repetition
│   │   ├── irt.ts                             # Item Response Theory
│   │   ├── score-predictor.ts                 # Score estimation
│   │   ├── item-selector.ts                   # Next question selection
│   │   └── mastery.ts                         # Mastery score calculation
│   │
│   ├── 📁 ai/                                 # AI pipeline utilities
│   │   ├── prompts/
│   │   │   ├── explanation.ts
│   │   │   ├── tutor.ts
│   │   │   ├── study-plan.ts
│   │   │   └── essay-eval.ts
│   │   ├── context-builder.ts                 # Assembles student context
│   │   └── stream-parser.ts                   # SSE stream handling
│   │
│   ├── 📁 utils/                              # Pure utility functions
│   │   ├── rtl.ts                             # Direction helpers
│   │   ├── hebrew.ts                          # Hebrew text utilities
│   │   ├── arabic.ts                          # Arabic text utilities
│   │   ├── date.ts                            # Date/time helpers
│   │   ├── number.ts                          # Number formatting
│   │   ├── cn.ts                              # clsx + twMerge utility
│   │   ├── format.ts                          # General formatters
│   │   └── validation.ts                      # Zod schemas
│   │
│   └── 📁 constants/                          # App-wide constants
│       ├── routes.ts                           # Route path constants
│       ├── query-keys.ts                       # React Query key factory
│       ├── yael-levels.ts                      # YAEL level definitions
│       ├── skill-sections.ts                   # Section weights
│       └── animations.ts                       # Framer Motion variants
│
│
├── 📁 hooks/                                  # Custom React hooks
│   ├── 📁 auth/
│   │   ├── use-auth.ts                        # Auth state + actions
│   │   ├── use-user.ts                        # Current user data
│   │   └── use-session.ts                     # Supabase session
│   │
│   ├── 📁 learning/
│   │   ├── use-practice-session.ts            # Live session state machine
│   │   ├── use-knowledge-states.ts            # User skill mastery
│   │   ├── use-score-prediction.ts            # Live score estimate
│   │   ├── use-flashcard-queue.ts             # FSRS vocab queue
│   │   ├── use-study-plan.ts                  # Active plan data
│   │   └── use-placement-test.ts              # Placement flow
│   │
│   ├── 📁 gamification/
│   │   ├── use-streak.ts                      # Streak state
│   │   ├── use-xp.ts                          # XP + level state
│   │   ├── use-achievements.ts                # Achievements data
│   │   └── use-daily-missions.ts              # Today's missions
│   │
│   ├── 📁 ui/
│   │   ├── use-direction.ts                   # RTL/LTR context
│   │   ├── use-media-query.ts                 # Responsive breakpoints
│   │   ├── use-scroll-position.ts             # Scroll tracking
│   │   ├── use-intersection.ts                # Intersection Observer
│   │   ├── use-debounce.ts                    # Input debouncing
│   │   ├── use-local-storage.ts               # Type-safe localStorage
│   │   ├── use-haptic.ts                      # Mobile haptic feedback
│   │   └── use-reduced-motion.ts              # Accessibility motion
│   │
│   └── 📁 data/
│       ├── use-progress-summary.ts            # Dashboard summary
│       ├── use-analytics.ts                   # Stats page data
│       ├── use-vocabulary.ts                  # Vocabulary data
│       └── use-notifications.ts               # Notification state
│
│
├── 📁 stores/                                 # Zustand state stores
│   ├── session-store.ts                       # Active practice session
│   ├── user-store.ts                          # User profile + prefs
│   ├── exam-store.ts                          # Mock exam in-progress
│   ├── placement-store.ts                     # Placement test flow
│   ├── notification-store.ts                  # Toast + notifications
│   └── ui-store.ts                            # UI state (sidebar open, etc.)
│
│
├── 📁 providers/                              # React context providers
│   ├── root-providers.tsx                     # Composes all providers
│   ├── auth-provider.tsx                      # Supabase auth state
│   ├── query-provider.tsx                     # TanStack Query config
│   ├── theme-provider.tsx                     # next-themes wrapper
│   ├── direction-provider.tsx                 # RTL/LTR context
│   ├── toast-provider.tsx                     # Sonner toast setup
│   ├── analytics-provider.tsx                 # Vercel Analytics
│   └── pwa-provider.tsx                       # Service worker init
│
│
├── 📁 types/                                  # TypeScript type definitions
│   ├── database.types.ts                      # Generated by Supabase CLI
│   ├── api.types.ts                           # API request/response types
│   ├── session.types.ts                       # Practice session types
│   ├── question.types.ts                      # Question + answer types
│   ├── user.types.ts                          # User profile types
│   ├── skill.types.ts                         # Skill taxonomy types
│   ├── vocabulary.types.ts                    # Vocabulary types
│   ├── gamification.types.ts                  # XP, streak, achievement types
│   ├── ai.types.ts                            # AI pipeline types
│   └── global.d.ts                            # Global type augmentations
│
│
├── 📁 config/                                 # Configuration files
│   ├── site.ts                                # Site metadata
│   ├── navigation.ts                          # Nav structure
│   ├── yael-config.ts                         # YAEL exam configuration
│   ├── fonts.ts                               # next/font configuration
│   └── env.ts                                 # Validated env variables (t3-env)
│
│
├── 📁 styles/                                 # Style utilities
│   ├── animations.css                         # Keyframe animations
│   ├── typography.css                         # Font definitions
│   └── rtl-utilities.css                      # RTL helper classes
│
│
├── 📁 public/
│   ├── 📁 fonts/                              # Self-hosted fonts
│   │   ├── cairo/
│   │   ├── noto-sans-arabic/
│   │   ├── frank-ruhl-libre/
│   │   └── heebo/
│   ├── 📁 icons/                              # SVG icons + app icons
│   ├── 📁 illustrations/                      # Empty state + onboarding art
│   ├── manifest.json                          # PWA manifest
│   ├── sw.js                                  # Service worker (generated)
│   └── robots.txt
│
│
├── 📁 middleware.ts                           # Next.js middleware
│   │                                          # (auth guard + RTL detection)
│
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

---

## PART 2 — COMPONENT HIERARCHY

### The Four-Layer Component Model

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    COMPONENT LAYERS                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  LAYER 1: PRIMITIVES (components/ui/primitives/)                            ║
║  ─────────────────────────────────────────────                              ║
║  Unstyled or minimally styled base components.                              ║
║  Wrap shadcn/ui. Add RTL awareness. Add Arabic ARIA labels.                ║
║  ZERO business logic. ZERO state. Pure presentation.                        ║
║  Dependency: Radix UI primitives + Tailwind                                 ║
║  Server Components: YES (all)                                               ║
║                                                                              ║
║  LAYER 2: COMPOSITES (components/ui/surfaces, typography, gamification)    ║
║  ─────────────────────────────────────────────────────────────────────      ║
║  Composed from primitives. May have local state.                            ║
║  Example: Card with hover animation, Score display with animation.         ║
║  Light business logic allowed (display formatting).                         ║
║  Server Components: MOSTLY (client for animated variants)                  ║
║                                                                              ║
║  LAYER 3: FEATURES (app/*/_components/)                                    ║
║  ─────────────────────────────────────                                      ║
║  Domain-specific. Consume hooks. Connect to stores.                        ║
║  Example: QuestionDisplay, FlashcardSession, ScoreGauge.                   ║
║  Business logic lives here. Data fetching via hooks.                       ║
║  Server Components: MIXED (heavy clients for interactive features)         ║
║                                                                              ║
║  LAYER 4: PAGES (app/*/page.tsx)                                           ║
║  ─────────────────────────────                                              ║
║  Route-level components. Orchestrate features.                              ║
║  Minimal logic. Data prefetching (server). Suspense boundaries.            ║
║  Server Components: YES (always start server, add client boundary below)   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Critical Component Specifications

```
COMPONENT ARCHITECTURE MAP:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PAGE] DashboardPage (Server Component)
  ├── Prefetches: user_progress_summary, today_missions, streak
  ├── Passes: serialized data to child client components
  ├── Suspense boundary per major section
  │
  ├── [CLIENT] TodayMissionCard
  │   ├── Receives: mission data as prop
  │   ├── State: none (stateless display)
  │   ├── Animation: Framer Motion (card slide-up, progress bar fill)
  │   └── CTA → router.push('/practice/session/new')
  │
  ├── [CLIENT] ScoreGauge
  │   ├── Receives: score data as prop
  │   ├── State: animation state (has-animated: boolean)
  │   ├── Animation: SVG path animation, needle position
  │   └── Tooltip on hover: section breakdown
  │
  ├── [CLIENT] SkillGarden
  │   ├── Receives: knowledge_states as prop
  │   ├── State: selected-skill: string | null
  │   ├── Interaction: tap skill → expand detail drawer
  │   └── Animation: Framer Motion stagger on mount
  │
  └── [CLIENT] StreakDisplay
      ├── Receives: streak data as prop
      ├── Effect: checks local time for "at-risk" state
      └── Animation: flame SVG (CSS keyframes, varies by streak length)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PAGE] PracticeSessionPage (Server Component)
  ├── Validates: sessionId exists and belongs to user
  ├── Prefetches: first question data
  │
  └── [CLIENT] PracticeSessionShell
      ├── State: session-store (Zustand)
      ├── Orchestrates: question display + feedback lifecycle
      │
      ├── [CLIENT] SessionHeader
      │   ├── Props: session_type, progress, skill_label
      │   ├── Animation: progress bar (spring physics)
      │   └── Timer (speed mode only): countdown ring (SVG + RAF)
      │
      ├── [CLIENT] QuestionDisplay
      │   ├── Props: question data
      │   ├── Contains: PassageBlock (conditionally rendered)
      │   ├── Contains: AnswerOptions
      │   └── State: selected-option, is-submitted
      │
      │   ├── [CLIENT] PassageBlock
      │   │   ├── Props: passage_text_he
      │   │   ├── Feature: word tap → tooltip
      │   │   ├── Feature: text selection → annotation toolbar
      │   │   └── Direction: dir="ltr" isolated block
      │   │
      │   └── [CLIENT] AnswerOptions
      │       ├── Props: options[], correct_index (hidden until submitted)
      │       ├── State: selected, is-correct, is-revealed
      │       └── Contains: 4× OptionCard
      │
      │       └── [CLIENT] OptionCard
      │           ├── Props: option, state (idle/selected/correct/wrong)
      │           ├── Animation: Framer Motion (spring bounce on select,
      │           │            flood-fill on reveal, shake on wrong)
      │           └── ARIA: role="radio", aria-checked
      │
      ├── [CLIENT] FeedbackPanel (conditionally rendered post-answer)
      │   ├── Props: is_correct, explanation_data
      │   ├── Animation: slide-up from bottom (spring)
      │   │
      │   └── [CLIENT] ExplanationBlock
      │       ├── Feature: streaming explanation (SSE)
      │       ├── Contains: BridgeInsightCard
      │       └── Action: "Was this helpful?" feedback
      │
      └── [CLIENT] XPAnimation
          ├── Triggers: on correct answer
          └── Animation: float up + fade out particle

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PAGE] VocabularyPage (Server Component)
  ├── Prefetches: vocab_due_count, user_progress_summary
  │
  └── [CLIENT] FlashcardSession
      ├── State: use-flashcard-queue hook
      ├── Queue: pre-loaded N+3 (always have next card ready)
      │
      └── [CLIENT] Flashcard
          ├── Props: vocab_item, fsrs_state
          ├── State: is-flipped (boolean), swipe-state
          ├── Gesture: Framer Motion drag (swipe left/right/up)
          ├── Animation: 3D Y-axis flip (CSS transform-style: preserve-3d)
          │
          ├── [CLIENT] CardFront
          │   ├── HebrewText (large, nikud visible)
          │   └── AudioPlayer (lazy-loaded)
          │
          └── [CLIENT] CardBack
              ├── Translation (Arabic, large)
              ├── BridgeCard (Arabic↔Hebrew root connection)
              │   └── Animation: letter-by-letter highlight (sequential)
              └── RatingButtons (Again / Hard / Good / Easy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PAGE] TutorPage (Server Component)
  └── [CLIENT] ChatInterface
      ├── State: use-tutor hook + local message array
      ├── Streaming: ReadableStream from API route
      │
      ├── [CLIENT] ConversationHistory
      │   └── N× MessageBubble
      │       ├── Props: role (user/assistant), content, timestamp
      │       ├── Direction: User=RTL (Arabic), Assistant=RTL with HE islands
      │       └── Animation: fade-in + slide on mount
      │
      ├── [CLIENT] TypingIndicator
      │   ├── Visible: when streaming active
      │   └── Animation: three-dot wave (CSS keyframes)
      │
      └── [CLIENT] ChatInput
          ├── Feature: RTL textarea with LTR override for pasted Hebrew
          ├── Feature: auto-resize on content change
          ├── Action: send → starts streaming → token-by-token render
          └── SuggestedPrompts (collapsed by default, AI-generated)
```

---

## PART 3 — HOOKS ARCHITECTURE

### Hook Design Philosophy

```
THREE CATEGORIES OF HOOKS:

CATEGORY 1: SERVER STATE (React Query wrappers)
  ─────────────────────────────────────────────
  Purpose: Fetch, cache, and sync server data.
  Pattern: useQuery for reads, useMutation for writes.
  Location: hooks/data/, hooks/learning/
  
  Rules:
  → Every query has a stable query key from constants/query-keys.ts
  → Every mutation has optimistic update + rollback
  → Error states are typed, never 'unknown'
  → Stale time configured per data volatility:
      Static content (skills, levels): staleTime = Infinity
      Progress summary: staleTime = 60 * 1000 (1 min)
      Active session: staleTime = 0 (always fresh)
      Leaderboard: staleTime = 5 * 60 * 1000 (5 min)

CATEGORY 2: CLIENT STATE (Zustand accessors)
  ──────────────────────────────────────────
  Purpose: Access and modify local UI state.
  Pattern: Selector pattern — only subscribe to needed slices.
  Location: hooks/ui/, hooks/auth/
  
  Rules:
  → Never expose the entire store — use selectors
  → Actions are co-located with state (not separate)
  → State that can be derived is derived, never stored

CATEGORY 3: BEHAVIOR HOOKS (side effects, browser APIs)
  ──────────────────────────────────────────────────────
  Purpose: Encapsulate browser interactions.
  Pattern: Custom hooks with cleanup on unmount.
  Location: hooks/ui/
```

### Complete Hook Specifications

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: usePracticeSession
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE MACHINE: idle → starting → active → feedback → transitioning → completed
                                    ↑___________________________|

INPUTS:
  sessionId: string
  sessionType: SessionType

RETURNS:
  currentQuestion:     Question | null
  sessionState:        SessionState (the state machine value)
  sessionProgress:     { answered: number, correct: number, total: number }
  selectedOption:      number | null
  isCorrect:           boolean | null
  explanation:         ExplanationData | null
  explanationLoading:  boolean
  
  actions:
    selectOption:      (index: number) => void
    submitAnswer:      () => Promise<void>      (optimistic)
    nextQuestion:      () => void
    endSession:        () => Promise<SessionSummary>

INTERNAL LOGIC:
  → State machine enforces transitions (no double-submitting)
  → Optimistic BKT update computed client-side (library mirrors server)
  → Question pre-fetching: load Q(n+1) while displaying Q(n)
  → Explanation fetch triggered immediately on wrong answer
  → XP animation triggered from mutation success callback
  → Session stored in Zustand for persistence across re-renders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: useFlashcardQueue
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETURNS:
  currentCard:         VocabItem | null
  nextCard:            VocabItem | null              (pre-loaded)
  cardsRemaining:      number
  cardsCompleted:      number
  isFlipped:           boolean
  swipeState:          'idle' | 'left' | 'right' | 'up'
  
  actions:
    flipCard:          () => void
    rateCard:          (rating: FSRSRating) => Promise<void>  (optimistic)
    swipeCard:         (direction: SwipeDirection) => void

INTERNAL LOGIC:
  → Queue loaded from useQuery (vocab/due endpoint)
  → Pre-load next 3 cards in queue (background fetch)
  → Optimistic FSRS state update (client mirrors server algorithm)
  → Rollback on API failure (rare — vocab review rarely fails)
  → Swipe gesture maps: LEFT=Again, RIGHT=Good, UP=Easy
  → Session persists if app backgrounded (session storage)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: useStreamingTutor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETURNS:
  messages:            Message[]
  isStreaming:         boolean
  streamingContent:    string               (partial response while streaming)
  error:               StreamError | null
  
  actions:
    sendMessage:       (content: string) => void
    clearConversation: () => void
    retryLast:         () => void

INTERNAL LOGIC:
  → Uses ReadableStream from Response.body
  → TextDecoder parses SSE chunks
  → streamingContent updates token-by-token (state batched at 16ms)
  → On stream complete: streamingContent → messages array (immutable append)
  → Rate limit errors surfaced with retry countdown
  → Conversation stored in sessionStorage (persists tab refresh, not close)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: useScorePrediction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETURNS:
  currentScore:        number | null
  previousScore:       number | null          (7 days ago)
  targetScore:         number
  confidenceLow:       number
  confidenceHigh:      number
  sectionScores:       Record<YAELSection, number>
  scoreHistory:        ScorePoint[]           (for chart)
  daysUntilExam:       number | null
  isOnTrack:           boolean
  velocityLabel:       'improving' | 'stable' | 'declining'

INTERNAL LOGIC:
  → Primary data from useQuery (progress/summary endpoint)
  → Client-side delta computed from score history
  → isOnTrack = current_velocity × days_remaining ≥ score_gap
  → Memoized — only recomputes when data changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: useDirection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: RTL/LTR context management for the entire app

RETURNS:
  dir:                 'rtl' | 'ltr'          (always 'rtl' in this app)
  hebrewDir:           'ltr'                   (always — Hebrew islands)
  isRTL:               true                    (computed boolean)
  textAlign:           'right'                 (CSS text-align value)
  flexStart:           'flex-end'              (opposite in RTL)
  
  utils:
    mirrorIcon:        (shouldMirror: boolean) => CSSProperties
    paddingStart:      (value: string) => CSSProperties
    marginEnd:         (value: string) => CSSProperties

RATIONALE:
  Components never hardcode 'left' or 'right' CSS values.
  They use direction-aware utilities from this hook.
  When multi-language support is added (Russian), switching to LTR
  for those users requires zero component changes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: useStreak
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETURNS:
  currentStreak:       number
  longestStreak:       number
  weekGrid:            StreakDay[]             (7 days, filled/empty)
  isAtRisk:            boolean                 (today not yet studied + 8pm+)
  graceAvailable:      boolean
  hoursUntilMidnight:  number
  flameIntensity:      'small' | 'medium' | 'large' | 'epic'

INTERNAL LOGIC:
  → isAtRisk computed client-side from lastActivityDate + local time
  → flameIntensity derived from streak count (NOT from API):
      1-3:  small
      4-7:  medium
      8-14: large
      15+:  epic
  → weekGrid computed from streak history with local date awareness
  → Effect: re-checks isAtRisk every minute (setInterval)
  → Cleanup: clearInterval on unmount

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOK: useHaptic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Unified haptic feedback (Vibration API + iOS fallback)

RETURNS:
  actions:
    success:           () => void    (two quick pulses: 40ms, 40ms)
    error:             () => void    (single pulse: 60ms)
    selection:         () => void    (ultra-short: 10ms)
    warning:           () => void    (pattern: 30ms, pause, 60ms)

INTERNAL LOGIC:
  → Feature-detects navigator.vibrate
  → Falls back to no-op on iOS (no vibration API)
  → Settings-aware: disabled if user has disabled in settings
  → useReducedMotion guard: also disables haptic if motion reduced
```

---

## PART 4 — STATE MANAGEMENT ARCHITECTURE

### Zustand Store Design

```
STORE ARCHITECTURE PRINCIPLES:

1. ONE store per domain (not one global store, not micro-stores)
2. Immer for complex state mutations (immutability without boilerplate)
3. Devtools in development only
4. Persist middleware ONLY for critical state (session, placement)
5. Selectors co-located with store (prevents unnecessary re-renders)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORE: session-store.ts — Active Practice Session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE SHAPE:
  sessionId:           string | null
  status:              SessionStatus           (state machine)
  sessionType:         SessionType | null
  questions:           Question[]              (loaded queue)
  currentIndex:        number
  responses:           QuestionResponse[]      (answers so far)
  selectedOption:      number | null
  isSubmitting:        boolean
  explanation:         ExplanationData | null
  explanationStreaming: boolean
  sessionSummary:      SessionSummary | null
  
  // Computed (derived in selectors, not stored)
  // currentQuestion:  questions[currentIndex]
  // progress:         responses.length / questions.length
  // accuracy:         correct/total from responses

ACTIONS:
  initSession:         (sessionId, sessionType, firstQuestion) => void
  loadNextQuestion:    (question: Question) => void
  selectOption:        (index: number) => void
  submitAnswer:        (response: QuestionResponse) => void
  setExplanation:      (data: ExplanationData) => void
  appendExplanationToken: (token: string) => void
  advanceQuestion:     () => void
  completeSession:     (summary: SessionSummary) => void
  resetSession:        () => void

MIDDLEWARE: Persist to sessionStorage (survives page refresh, not close)
  Persist: [sessionId, status, currentIndex, responses]
  Skip:    [explanation, explanationStreaming, sessionSummary]
  
  On app load: if persisted session found → prompt user to resume

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORE: user-store.ts — User Profile + Preferences
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE SHAPE:
  profile:             UserProfile | null
  settings:            UserSettings | null
  isLoading:           boolean
  isAuthenticated:     boolean

ACTIONS:
  setProfile:          (profile: UserProfile) => void
  setSettings:         (settings: UserSettings) => void
  updateSettings:      (partial: Partial<UserSettings>) => void
  clearUser:           () => void

NOTES:
  → Hydrated from Supabase auth.onAuthStateChange on app init
  → Settings mutations optimistic (local first, sync in background)
  → Profile read-only at runtime (mutations go through API + refetch)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORE: ui-store.ts — UI State
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE SHAPE:
  sidebarOpen:         boolean                (desktop)
  activeModal:         ModalType | null
  activeDrawer:        DrawerType | null
  toasts:              Toast[]
  pendingXPAnimations: XPAnimation[]
  pendingAchievement:  Achievement | null     (for unlock ceremony)
  
ACTIONS:
  toggleSidebar:       () => void
  openModal:           (modal: ModalType) => void
  closeModal:          () => void
  pushToast:           (toast: Toast) => void
  dismissToast:        (id: string) => void
  queueXPAnimation:    (amount: number, origin: DOMPoint) => void
  consumeXPAnimation:  (id: string) => void
  setAchievement:      (achievement: Achievement | null) => void

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORE: placement-store.ts — Placement Test Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE SHAPE:
  placementId:         string | null
  questions:           Question[]
  currentIndex:        number
  responses:           PlacementResponse[]
  irtTheta:            Record<YAELSection, number>    (live ability estimate)
  status:              'idle' | 'active' | 'complete'
  result:              PlacementResult | null

MIDDLEWARE: Persist to localStorage
  (Placement can be multi-day — student may close app mid-test)
```

### React Query Configuration

```
QUERY CLIENT CONFIGURATION:

  defaultOptions:
    queries:
      staleTime:        60 * 1000          (1 minute default)
      gcTime:           5 * 60 * 1000      (5 minutes garbage collection)
      retry:            (failureCount, error) =>
                          failureCount < 2 && error.status !== 404
      refetchOnWindowFocus: true            (resync on tab focus)
      refetchOnReconnect:   true
    
    mutations:
      retry:            0                   (mutations don't retry — risky)
      onError:          globalErrorHandler  (log + toast)

QUERY KEY FACTORY (constants/query-keys.ts):

  STRUCTURE: [scope, ...identifiers, filters]
  
  Keys.user.profile()                          → ['user', 'profile']
  Keys.user.settings()                         → ['user', 'settings']
  Keys.progress.summary()                      → ['progress', 'summary']
  Keys.progress.scoreHistory(days)             → ['progress', 'score-history', days]
  Keys.session.active()                        → ['session', 'active']
  Keys.session.history(page)                   → ['session', 'history', page]
  Keys.vocab.due()                             → ['vocab', 'due']
  Keys.vocab.item(id)                          → ['vocab', 'item', id]
  Keys.vocab.search(query)                     → ['vocab', 'search', query]
  Keys.knowledge.all()                         → ['knowledge', 'all']
  Keys.knowledge.skill(skillId)               → ['knowledge', 'skill', skillId]
  Keys.plan.active()                           → ['plan', 'active']
  Keys.leaderboard.weekly()                    → ['leaderboard', 'weekly']
  Keys.achievements.all()                      → ['achievements', 'all']
  Keys.achievements.unseen()                   → ['achievements', 'unseen']
  Keys.streak.current()                        → ['streak', 'current']
  Keys.missions.today()                        → ['missions', 'today']
  Keys.questions.next(sessionId)               → ['questions', 'next', sessionId]
  Keys.explain(questionId, optionIndex)        → ['explain', questionId, optionIndex]
  Keys.admin.questions(filters)                → ['admin', 'questions', filters]

INVALIDATION PATTERNS:
  After session complete:
    invalidate: Keys.progress.summary()
    invalidate: Keys.streak.current()
    invalidate: Keys.missions.today()
    invalidate: Keys.knowledge.all()
  
  After vocab review:
    invalidate: Keys.vocab.due()
    setQueryData: Keys.vocab.item(id)  (optimistic, update in place)
  
  After achievement unlocked:
    invalidate: Keys.achievements.all()
    setQueryData: Keys.achievements.unseen()  (append new achievement)
```

---

## PART 5 — PROVIDERS ARCHITECTURE

### Provider Composition

```
ROOT LAYOUT (app/layout.tsx)
│
└── RootProviders (providers/root-providers.tsx)
    │
    ├── LAYER 1: ThemeProvider (next-themes)
    │   Props: attribute="class", defaultTheme="system", enableSystem
    │   Why first: Theme affects all visual rendering
    │
    ├── LAYER 2: DirectionProvider (providers/direction-provider.tsx)
    │   Props: dir="rtl", lang="ar"
    │   Sets: document.dir, document.lang, CSS direction
    │   Why early: Direction affects layout calculations
    │
    ├── LAYER 3: QueryProvider (providers/query-provider.tsx)
    │   Creates: new QueryClient (stable across renders)
    │   Includes: ReactQueryDevtools (dev only)
    │
    ├── LAYER 4: AuthProvider (providers/auth-provider.tsx)
    │   Syncs: Supabase auth state → user-store
    │   Subscribes: auth.onAuthStateChange
    │   Cleanup: unsubscribes on unmount
    │
    ├── LAYER 5: ToastProvider (providers/toast-provider.tsx)
    │   Uses: Sonner (RTL-aware, animated)
    │   Config: position top-center (mobile), bottom-right (desktop)
    │
    ├── LAYER 6: AnalyticsProvider (providers/analytics-provider.tsx)
    │   Uses: Vercel Analytics + Speed Insights
    │   Guard: Only tracks if analytics consent given
    │
    └── LAYER 7: PWAProvider (providers/pwa-provider.tsx)
        Registers: Service worker
        Handles: Install prompt, offline detection
```

### Provider Specifications

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROVIDER: AuthProvider
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT VALUES:
  user:           User | null
  session:        Session | null
  isLoading:      boolean
  isAuthenticated: boolean (derived)
  
ACTIONS (exposed via context):
  signInWithGoogle:      () => Promise<void>
  signInWithEmail:       (email, password) => Promise<AuthError | null>
  signUp:                (email, password) => Promise<AuthError | null>
  signOut:               () => Promise<void>
  refreshSession:        () => Promise<void>

BEHAVIOR:
  → On mount: checks existing session (Supabase)
  → Subscribes: auth.onAuthStateChange
  → On sign-in: populates user-store.profile
  → On sign-out: clears user-store, clears all React Query cache
  → On session expire: silent refresh attempt → if fail → redirect to /login
  → Session refresh: 50 minutes (before 60-min JWT expiry)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROVIDER: DirectionProvider
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT VALUES:
  appDir:         'rtl'              (always for Arabic UI)
  hebrewDir:      'ltr'              (always for Hebrew content)
  locale:         string             ('ar' primary)
  
EFFECTS:
  → Sets document.dir = 'rtl' on mount
  → Sets document.lang = 'ar' on mount
  → Sets <html> class for direction-specific CSS targeting
  
FUTURE-PROOFING:
  → When Russian UI added: appDir becomes user-setting-aware
  → Zero component changes needed (all use context values)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROVIDER: PWAProvider
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT VALUES:
  isOnline:        boolean
  isInstalled:     boolean
  canInstall:      boolean
  installPrompt:   () => void

BEHAVIOR:
  → Registers: /sw.js on mount (if navigator.serviceWorker exists)
  → Captures: beforeinstallprompt event for manual install trigger
  → Tracks: online/offline via navigator.onLine + event listeners
  → On offline: sets isOnline = false → components show offline UI
  → On reconnect: invalidates stale queries (resync after offline)
  → Install prompt shown at Day 3 (tracked in localStorage)
```

---

## PART 6 — ERROR BOUNDARY ARCHITECTURE

### Layered Error Boundary System

```
BOUNDARY HIERARCHY:

LEVEL 1: GLOBAL (app/error.tsx)
  ──────────────────────────────
  Catches: Unhandled errors that escape all lower boundaries
  Shows:  Full-page Arabic error (علاج — العطل) with reset button
  Reports: Sentry with full context
  Action:  Reset entire page or navigate home
  
  Design: Never shows technical error messages.
  Copy: "حدث خطأ غير متوقع — فريقنا يعمل على إصلاحه."
  + [تحديث الصفحة] button

LEVEL 2: ROUTE SEGMENT (app/(app)/*/error.tsx)
  ───────────────────────────────────────────────
  Catches: Errors within specific route segments
  Shows:  Section-specific error state (smaller, inline)
  Does NOT affect: Other sections on the page
  
  Example: Analytics page fails to load charts.
  → Chart area shows error state
  → Navigation and dashboard still work
  → User can retry charts without losing session

LEVEL 3: FEATURE BOUNDARIES (inline ErrorBoundary components)
  ─────────────────────────────────────────────────────────────
  Placed around: AI Tutor, Essay Evaluation, Streaming content
  Catches: AI API failures, stream parsing errors, timeout errors
  Shows:  Contextual fallback UI (not full-page)
  
  PracticeSession boundary:
    → Catches question fetch failure
    → Shows: "تعذّر تحميل السؤال — [حاول مرة أخرى]"
    → Preserves: all previous session progress
  
  AITutor boundary:
    → Catches: API errors, network failures
    → Shows: Fallback message in Arabic
    → Queues: User's message for retry
  
  Explanation boundary:
    → Catches: Explanation generation failure
    → Shows: Template fallback (from grammar rules)
    → Marks: question_attempt.explanation_viewed = false

LEVEL 4: ASYNC ERROR HANDLING (React Query + async mutations)
  ─────────────────────────────────────────────────────────────
  NOT a component boundary — handled via:
  
  → useMutation onError callbacks
  → Global queryClient error handlers
  → Route handlers returning typed errors
  
  All surface via: toast notifications (never modal dialogs for mutations)
  
  Error type hierarchy:
    NetworkError:     "تحقق من اتصالك بالإنترنت"
    AuthError:        redirect to /login silently
    RateLimitError:   "وصلت الحد اليومي — عودة غداً" + countdown
    ServerError:      "خطأ في الخادم — يُعاد المحاولة..."
    ValidationError:  inline field errors

ERROR BOUNDARY WRAPPER COMPONENT:

  FeatureErrorBoundary
  ├── Props: children, fallback?, onError?
  ├── Behavior: catches child errors, logs to Sentry
  ├── Display: renders fallback prop or default Arabic error UI
  └── Recovery: "حاول مرة أخرى" button → resets boundary

USED IN:
  <FeatureErrorBoundary fallback={<ExplanationFallback />}>
    <ExplanationBlock questionId={id} />
  </FeatureErrorBoundary>
```

---

## PART 7 — PERFORMANCE OPTIMIZATION ARCHITECTURE

### Code Splitting Strategy

```
SPLIT BOUNDARIES:

ROUTE-LEVEL SPLITS (automatic — Next.js App Router):
  Every page.tsx = separate bundle chunk
  Lazy loaded on navigation — never on initial load
  No manual dynamic() needed for route-level components

FEATURE-LEVEL SPLITS (manual dynamic()):

  HEAVY FEATURES (split and lazy-load):
  
  AchievementUnlockModal
    → dynamic(() => import('./achievement-unlock-modal'))
    → Loaded only when achievement unlocked (rare)
    → Delay import until user earns an achievement
  
  ConfettiBurst
    → dynamic(() => import('../gamification/confetti-burst'))
    → Loaded on-demand (1-2× per session at most)
  
  ScoreTrajectoryChart
    → dynamic(() => import('../charts/score-trajectory-chart'))
    → Recharts is large (~60KB) — only on Analytics page
  
  SectionRadarChart
    → dynamic(() => import('../charts/section-radar-chart'))
    → Same as above — batch-import charts on analytics route
  
  LottieAnimation
    → dynamic(() => import('./lottie-animation'))
    → Lottie library is heavy — only where needed
  
  RootExplorer
    → dynamic(() => import('./root-explorer'))
    → pgvector-driven — complex component, rarely used
  
  AdminPanel components
    → dynamic(() => import('../admin/...'))
    → Admin-only: never bundled in student bundle

STRATEGY FOR CHARTS:
  Instead of splitting per-chart, use one boundary split:
  
  const DynamicAnalytics = dynamic(
    () => import('./_components/analytics-charts-bundle'),
    { ssr: false, loading: () => <ChartSkeletons /> }
  )
  
  analytics-charts-bundle.tsx re-exports all chart components.
  One network request loads all charts on the analytics route.
  Better than 5 separate requests.

PRELOADING STRATEGY:
  On hover of navigation items:
    Hover "/analytics" → prefetch analytics bundle
    Hover "/tutor" → prefetch tutor bundle (streaming setup)
  
  On session start:
    Prefetch next 3 questions (data, not components)
    Prefetch explanation cache for probable wrong answers
```

### Image and Font Optimization

```
FONTS (next/font — critical):

  SELF-HOSTED (not Google CDN — performance + privacy):
  
  cairo = localFont({
    src: [
      { path: '../public/fonts/cairo/Cairo-Regular.woff2', weight: '400' },
      { path: '../public/fonts/cairo/Cairo-Bold.woff2',    weight: '700' },
      { path: '../public/fonts/cairo/Cairo-Black.woff2',   weight: '900' },
    ],
    variable: '--font-cairo',
    display: 'swap',
    preload: true,               // Critical — displayed above fold
  })
  
  notoArabic = localFont({
    src: '...', variable: '--font-noto-arabic', display: 'swap',
    preload: false,              // Secondary — display: swap handles it
  })
  
  frankRuhlLibre = localFont({
    src: '...', variable: '--font-frank-ruhl', display: 'swap',
    preload: false,              // Hebrew content — not in initial viewport
  })
  
  FONT LOADING STRATEGY:
  Cairo Bold (primary UI font) → preload in <head>
  Frank Ruhl Libre → loaded on first Hebrew content render
  Audio files → no preload (loaded on-demand per word)

IMAGES (next/image — all):

  CONFIGURATION:
  → formats: ['avif', 'webp']    (avif 50% smaller than webp)
  → sizes: responsive breakpoints for each use case:
      Avatar: '40px'
      Badge: '64px'
      Illustration: '(max-width: 768px) 100vw, 50vw'
  
  → placeholder: 'blur' for user photos
  → placeholder: 'empty' for decorative illustrations
  
  ILLUSTRATION STRATEGY:
  Empty states + onboarding: SVG inline (not images)
    → No network request
    → No layout shift
    → Theme-aware (CSS currentColor)
    → Perfect accessibility
  
  Complex badges: SVG inline sprites
  Achievement icons: SVG icon font (one network request for all)

CRITICAL RENDERING PATH:

  1. HTML (from server, ~3KB) → parse
  2. CSS (global.css, ~8KB) → parsed, render-blocking intentionally
  3. Cairo font (Bold, ~40KB) → preloaded, no FOUT
  4. Above-fold content renders
  5. JavaScript bundles load (deferred)
  6. Hydration
  
  Target LCP: < 1.5s
  Target FCP: < 0.8s (server-rendered first paint)
  Target TTI: < 3.0s
```

### React Performance Patterns

```
MEMOIZATION STRATEGY:

  MEMO POLICY: Memoize when ALL three are true:
  1. Component renders frequently (>5× per second possible)
  2. Props rarely change (stable references)
  3. Render is expensive (large tree, charts, complex calculations)
  
  NEVER memo: Simple display components (cheap to render)
  ALWAYS memo: Chart components, large lists, session question display
  
  useMemo POLICY: For derived values from heavy computation only
    → Score prediction breakdown (multiple calculations)
    → Sorted/filtered lists (sort is O(n log n))
    → NOT: Simple boolean derivations
  
  useCallback POLICY: For functions passed as props to memo'd children
    → Session action handlers (passed to AnswerOptions)
    → Flashcard rating handlers (passed to RatingButtons)
    → NOT: Inline event handlers on DOM elements

VIRTUALIZATION:
  
  react-virtual for:
  → Leaderboard list (can be 100s of entries)
  → Vocabulary search results (can be 1000s of words)
  → Admin question table (can be 800+ questions)
  
  NOT needed for:
  → Daily missions (max 3)
  → Recent activity (max 7 items)
  → Skill list (max 30 items — virtual overhead not worth it)

SUSPENSE STRATEGY:

  Each major page section gets its own Suspense boundary:
  
  <Suspense fallback={<TodayMissionSkeleton />}>
    <TodayMissionCard />
  </Suspense>
  
  <Suspense fallback={<ScoreGaugeSkeleton />}>
    <ScoreGauge />
  </Suspense>
  
  WHY: Streaming SSR renders each section independently.
       User sees content progressively — fast sections first.
       Slow sections (AI-generated plan) don't block fast ones.
  
  SKELETON DESIGN:
  Every skeleton matches exact dimensions of loaded content.
  → Zero CLS (Cumulative Layout Shift)
  → No content "jumping" after load
  → Skeletons use CSS shimmer animation (not JS animations)
    → Cheaper, respects prefers-reduced-motion

REACT CONCURRENT FEATURES:

  useTransition for non-urgent updates:
  → Skill heatmap filter change
  → Leaderboard tab switch
  → Settings navigation
  
  These don't need to be instant — mark as non-urgent,
  let React prioritize more critical renders.
  
  startTransition wrapper around:
  → All router.push() navigation calls
  → Heavy filter operations
  → Non-critical data fetches
```

---

## PART 8 — ACCESSIBILITY ARCHITECTURE

### Comprehensive A11y System

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ACCESSIBILITY ARCHITECTURE                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  FOCUS MANAGEMENT                                                           ║
║  ──────────────                                                             ║
║  Global focus ring: 3px solid var(--color-focus), offset 2px              ║
║  NEVER remove outline. Override shape, not existence.                       ║
║                                                                             ║
║  Focus trap: All modals, drawers, dialogs trap focus.                      ║
║  Implemented via: Radix UI Dialog (built-in trap)                          ║
║  Return focus: On close → returns to trigger element.                      ║
║                                                                             ║
║  Skip link: First focusable element on every page.                        ║
║  Text: "انتقل إلى المحتوى الرئيسي" (Skip to main content)                ║
║  Position: Off-screen until focused. Appears in top-left on focus.        ║
║                                                                             ║
║  RTL KEYBOARD NAVIGATION:                                                   ║
║  Arrow keys are direction-aware:                                           ║
║  → Right arrow = "forward" in LTR = "forward" in RTL (not reversed)       ║
║  Tab order: logical reading order (right-to-left for Arabic UI)           ║
║                                                                             ║
║  SCREEN READER ARCHITECTURE                                                 ║
║  ──────────────────────────                                                 ║
║  Language annotations on ALL text:                                         ║
║  <span lang="ar" dir="rtl">Arabic text</span>                             ║
║  <span lang="he" dir="ltr">עברית</span>                                   ║
║                                                                             ║
║  Mixed content example:                                                    ║
║  <div lang="ar" dir="rtl">                                                 ║
║    الكلمة العبرية{' '}                                                    ║
║    <span lang="he" dir="ltr">שָׁלֵם</span>                                ║
║    {' '}تعني: كامل                                                         ║
║  </div>                                                                     ║
║  → Screen reader switches language engine automatically                    ║
║                                                                             ║
║  LIVE REGIONS:                                                              ║
║  Session progress: aria-live="polite"                                      ║
║  Score updates:    aria-live="polite"                                      ║
║  XP gain:          aria-live="polite" aria-atomic="true"                  ║
║  Error messages:   aria-live="assertive"                                   ║
║  Loading state:    aria-busy="true" aria-label="جارٍ التحميل"              ║
║                                                                             ║
║  PRACTICE SESSION ACCESSIBILITY:                                            ║
║  Question container: role="form" aria-label="سؤال النحو"                  ║
║  Options: role="radiogroup" with fieldset-equivalent                       ║
║  Each option: role="radio" aria-checked                                    ║
║  On answer: aria-live region announces "إجابتك: صحيحة / خطأ"             ║
║                                                                             ║
║  Passage text: role="article" lang="he" dir="ltr"                         ║
║  Tooltip on word: role="tooltip", keyboard trigger (Enter/Space)          ║
║  Rating buttons: role="radiogroup" aria-label="كيف كانت هذه البطاقة؟"    ║
║                                                                             ║
║  ANIMATIONS (prefers-reduced-motion):                                       ║
║  useReducedMotion hook wraps ALL Framer Motion animations:                 ║
║  if (reducedMotion) return { ...animation, transition: { duration: 0 } }  ║
║                                                                             ║
║  CSS animation override:                                                   ║
║  @media (prefers-reduced-motion: reduce) {                                 ║
║    *, *::before, *::after {                                                ║
║      animation-duration: 0.01ms !important;                               ║
║      transition-duration: 0.01ms !important;                              ║
║    }                                                                        ║
║  }                                                                          ║
║                                                                             ║
║  WCAG 2.1 AA COMPLIANCE CHECKLIST:                                         ║
║  ✓ 1.1.1  Non-text content: All images have alt                           ║
║  ✓ 1.3.1  Info and relationships: semantic HTML structure                 ║
║  ✓ 1.3.2  Meaningful sequence: logical DOM order                          ║
║  ✓ 1.3.3  Sensory characteristics: not direction/color alone             ║
║  ✓ 1.4.1  Use of color: not sole differentiator                          ║
║  ✓ 1.4.3  Contrast minimum: 4.5:1 for normal text                        ║
║  ✓ 1.4.4  Resize text: 200% without horizontal scroll                    ║
║  ✓ 1.4.10 Reflow: 320px without 2D scroll                                ║
║  ✓ 1.4.11 Non-text contrast: 3:1 for UI components                       ║
║  ✓ 2.1.1  Keyboard: all functionality accessible                          ║
║  ✓ 2.1.2  No keyboard trap (Radix UI handles)                            ║
║  ✓ 2.4.1  Bypass blocks: skip link present                               ║
║  ✓ 2.4.3  Focus order: logical and consistent                             ║
║  ✓ 2.4.4  Link purpose: descriptive link text                            ║
║  ✓ 2.4.7  Focus visible: always visible, never outline:none              ║
║  ✓ 3.1.1  Language of page: lang="ar" on html                            ║
║  ✓ 3.1.2  Language of parts: lang on all non-Arabic text                 ║
║  ✓ 4.1.2  Name, role, value: all interactive elements labeled            ║
║  ✓ 4.1.3  Status messages: live regions for all status updates           ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PART 9 — SEO ARCHITECTURE

### Metadata Strategy

```
SEO ARCHITECTURE FOR ARABIC EDUCATIONAL PLATFORM:

METADATA HIERARCHY (config/site.ts):

  Site-level metadata:
    title:       "يعل بامتياز — تعلم العبرية بالعربية"
    description: "المنصة الذكية لتحضير امتحان يعل. تعلم عبري بسرعة
                  بفضل الجذور المشتركة مع العربية."
    keywords:    ['يعل', 'تعلم عبري', 'امتحان יעל', 'عبري للعرب']
    locale:      'ar_IL'   (Arabic as spoken in Israel — important for SEO)
    type:        'website'
    
  Per-route metadata (generateMetadata function):
    Dashboard:   No index (auth-protected)
    Landing:     Full metadata + OpenGraph
    Onboarding:  No index
    
  OpenGraph:
    image:       1200×630 custom OG image (Arabic typography on parchment)
    imageAlt:    "يعل بامتياز — منصة تعلم العبرية للناطقين بالعربية"

STRUCTURED DATA (JSON-LD):

  Landing page:
    type: EducationalOrganization
    name: "يعل بامتياز"
    description: "..."
    educationalLevel: "University Preparation"
    teaches: "Hebrew Language"
    availableLanguage: ["Arabic", "Hebrew"]
    
  Application type:
    type: SoftwareApplication
    applicationCategory: EducationalApplication
    operatingSystem: "Web, Android, iOS"
    offers: { price: 0, priceCurrency: "ILS" }

SITEMAP (auto-generated):
  Static routes only: /, /login, /register
  Dynamic routes excluded: all authenticated routes
  
  Next.js 14 native sitemap.ts:
  Returns all public pages with lastModified from deployment

ROBOTS.TXT:
  User-agent: *
  Allow: /                    (landing, static pages)
  Disallow: /dashboard/       (all app routes)
  Disallow: /practice/
  Disallow: /api/
  Sitemap: https://yael.app/sitemap.xml

HREFLANG (future):
  When Russian/English versions added:
  <link rel="alternate" hreflang="ar" href="/ar/..." />
  <link rel="alternate" hreflang="ru" href="/ru/..." />

PERFORMANCE SEO:
  Core Web Vitals directly affect Google ranking.
  → LCP target: < 2.5s (server-rendered above fold)
  → INP target: < 200ms (response to interactions)
  → CLS target: < 0.1 (skeletons prevent layout shift)
  
  Vercel Speed Insights tracks these in production.
  Alert if any Core Web Vital degrades.
```

---

## PART 10 — DARK MODE ARCHITECTURE

### Theme System Design

```
DARK MODE IMPLEMENTATION STRATEGY:

APPROACH: CSS Variables + next-themes + Tailwind dark variant

WHY THIS APPROACH:
  → Zero flash on page load (next-themes injects script before paint)
  → System preference auto-detection (prefers-color-scheme)
  → User override stored in localStorage
  → Tailwind dark: variant for component-level overrides
  → CSS variables for design token system (not Tailwind hardcoded colors)

CSS VARIABLE SYSTEM (globals.css):

  :root {
    /* Surface colors */
    --color-bg:              #F8F4EE;   (warm parchment)
    --color-surface:         #FFFFFF;
    --color-surface-alt:     #F0EEE9;
    --color-border:          #E5E1D8;
    
    /* Text colors */
    --color-text-primary:    #1A1A2E;
    --color-text-secondary:  #6B7280;
    --color-text-muted:      #9CA3AF;
    
    /* Brand colors */
    --color-navy:            #1B2F5E;
    --color-gold:            #E8A830;
    --color-emerald:         #0D9669;
    --color-rose:            #DC2626;
    --color-amber:           #F59E0B;
    --color-purple:          #6366F1;
    
    /* Semantic colors */
    --color-success-bg:      #ECFDF5;
    --color-success-text:    #065F46;
    --color-error-bg:        #FEF2F2;
    --color-error-text:      #991B1B;
    
    /* Shadow system */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    
    /* Focus ring */
    --color-focus:           #3B82F6;
    
    /* Animation speeds */
    --duration-fast:         120ms;
    --duration-standard:     250ms;
    --duration-emphasis:     400ms;
  }

  .dark {
    --color-bg:              #0F1117;
    --color-surface:         #1A1D27;
    --color-surface-alt:     #22263A;
    --color-border:          #2D3348;
    
    --color-text-primary:    #F1F0ED;
    --color-text-secondary:  #9CA3AF;
    --color-text-muted:      #6B7280;
    
    /* Brand colors adjusted for dark backgrounds */
    --color-navy:            #3B5CC4;    (lighter for dark bg)
    --color-gold:            #F59E0B;    (brighter in dark)
    --color-emerald:         #10B981;
    --color-rose:            #F87171;
    
    /* Semantic dark variants */
    --color-success-bg:      #064E3B;
    --color-success-text:    #6EE7B7;
    --color-error-bg:        #7F1D1D;
    --color-error-text:      #FCA5A5;
    
    /* Softer shadows in dark mode */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.30);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.40);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.50);
  }

TAILWIND CONFIGURATION:

  theme.extend.colors maps to CSS variables:
  
  colors: {
    background:  'var(--color-bg)',
    surface:     'var(--color-surface)',
    border:      'var(--color-border)',
    text: {
      primary:   'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted:     'var(--color-text-muted)',
    },
    brand: {
      navy:      'var(--color-navy)',
      gold:      'var(--color-gold)',
      emerald:   'var(--color-emerald)',
    }
  }
  
  Usage in components:
  className="bg-surface text-text-primary border-border"
  ← These automatically use the correct dark/light values
  ← No dark: prefix needed for semantic colors

DARK MODE SPECIAL CASES:

  Hebrew text: Frank Ruhl Libre renders better on dark with slightly
  lighter font weight. Apply via:
  .dark [data-hebrew] { font-weight: 400 → 300 (ligher in dark) }
  
  Flame SVG: Dark mode flames use higher saturation
  Achievement badges: Slightly higher glow intensity in dark mode
  Parchment background: In dark mode, becomes deep navy (#0F1117)
  not pure black (too harsh for reading)
  
  Charts (Recharts): Override fill colors with CSS variables.
  GridLines: 15% opacity in light, 10% in dark.
  Tooltips: dark-mode aware background.

THEME DETECTION SCRIPT:
  next-themes injects a blocking script before first paint.
  Script reads localStorage 'theme' or falls back to system preference.
  Applies 'dark' class to <html> BEFORE React hydrates.
  Result: Zero flash of wrong theme. Critical for user trust.
```

---

## PART 11 — MIDDLEWARE ARCHITECTURE

### Next.js Middleware Design

```
MIDDLEWARE (middleware.ts):

PURPOSE:
  1. Route protection (auth guard)
  2. Onboarding redirect (incomplete profiles)
  3. Admin route protection
  4. RTL HTML attribute injection

EXECUTION ORDER:

  REQUEST ARRIVES
       │
       ▼
  Is public route? (/, /login, /register, /api/webhook)
       │
       YES → pass through (no auth check)
       │
       NO
       │
       ▼
  Check Supabase session (via cookies)
       │
       NO SESSION → redirect to /login?next={path}
       │
       HAS SESSION
       │
       ▼
  Is onboarding complete? (check user_profiles.onboarding_completed_at)
       │
       NO + path not in /onboarding/* → redirect to /onboarding/goals
       │
       YES or path is /onboarding/*
       │
       ▼
  Is admin route (/admin/*)?
       │
       YES → check user_profiles.is_admin
            NO ADMIN → 403 redirect to /dashboard
       │
       PASS
       │
       ▼
  Inject response headers:
  → x-pathname: current path (for layout active state)
  → Cache-Control: appropriate per route
       │
       ▼
  CONTINUE

MATCHER CONFIGURATION:
  Matches all routes EXCEPT:
  → /_next/static/**    (static assets)
  → /_next/image/**     (optimized images)
  → /favicon.ico
  → /robots.txt
  → /manifest.json
  → /fonts/**
  → /icons/**

PERFORMANCE:
  Middleware runs at the edge (Vercel Edge Runtime).
  Supabase session check uses lightweight cookie parsing.
  No database queries in middleware — cookie-based only.
  Target execution time: < 10ms per request.
```

---

## PART 12 — REUSABLE UI COMPONENT SPECIFICATIONS

### Design System Component Contracts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT: HebrewText
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: The single canonical way to render Hebrew text.
         Used everywhere Hebrew appears. Never use a raw <span>.

PROPS:
  children:       string                    (Hebrew text content)
  size:           'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display'
  showNikud:      boolean (default: true)   (from user settings)
  weight:         'light' | 'regular' | 'bold'
  className?:     string                    (Tailwind overrides)
  as?:            'span' | 'p' | 'h1'...'h6'

ALWAYS APPLIES:
  → lang="he"
  → dir="ltr"
  → font-family: var(--font-frank-ruhl)
  → Minimum size: 18px (never smaller — legibility requirement)
  → unicode-bidi: isolate (prevents direction bleeding)

DARK MODE: Automatic via CSS variable text color

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT: ScoreNumber
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Animated number counter for score displays.
         Rolls from previous value to new value.

PROPS:
  value:          number
  previousValue?: number          (animate from this)
  format?:        'score' | 'xp' | 'percentage' | 'days'
  size:           'sm' | 'lg' | 'display'
  animate?:       boolean (default: true)
  
ANIMATION:
  On value change: slot-machine roll (each digit independently)
  Duration: 800ms, spring physics
  Gold flash at peak: 200ms
  
ACCESSIBILITY:
  aria-live="polite"
  aria-label="{value} نقطة" (for screen readers)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT: EmptyState
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE: Consistent empty state across all features.
         An invitation, never a dead end.

PROPS:
  illustration:   EmptyIllustration     (enum of available SVGs)
  title:          string                (why empty — Arabic)
  description?:   string                (how to fill — Arabic)
  action?:        { label: string, onClick: () => void }
  size?:          'sm' | 'md' | 'lg'

ILLUSTRATIONS (SVG, inline, theme-aware):
  EMPTY_DECK:     Flashcard with question mark
  GARDEN_EMPTY:   Pot with small seedling
  GARDEN_FULL:    Garden of flowers
  FIRST_LESSON:   Compass being calibrated
  ALL_DONE:       Stars burst
  CHART_EMPTY:    Empty chart with arrow
  LEADERBOARD_NEW: Person on podium
  
DESIGN RULES:
  → Illustration always on top
  → Title: bold, large
  → Description: muted, medium
  → CTA button: primary style, bottom
  → NO "sad" or "broken" imagery — always hopeful

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT: ProgressBar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROPS:
  value:          number (0-100)
  max?:           number (default 100)
  label?:         string
  showLabel?:     boolean
  variant:        'default' | 'mastery' | 'session' | 'achievement'
  animated?:      boolean (default true)
  
VARIANTS:
  default:        Navy fill on light background
  mastery:        Gold fill (skill mastery display)
  session:        Navy fill with green "completed" section
  achievement:    Animated gold fill with glow at completion

ANIMATION:
  On mount: fills from 0 to value (spring, 600ms)
  On value change: spring transition to new value
  
ACCESSIBILITY:
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label={label}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENT: StreakFlame
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROPS:
  streakCount:    number
  isAtRisk?:      boolean
  size?:          'sm' | 'md' | 'lg'
  animate?:       boolean (default true)

INTERNAL:
  intensity = streakCount < 4  ? 'small'
            : streakCount < 8  ? 'medium'
            : streakCount < 15 ? 'large'
            : 'epic'

SVG FLAME (inline, no network request):
  CSS keyframes control flicker (not JS — cheaper)
  Gradient changes per intensity level
  Dark mode: flame brightness increases slightly

ARIA:
  role="img"
  aria-label="{streakCount} يوم سلسلة متواصلة"
  If at-risk: aria-label includes "— في خطر اليوم"
```

---

## PART 13 — COMPLETE TYPE SYSTEM

### Core Type Definitions

```
TYPE ARCHITECTURE:

SOURCE OF TRUTH HIERARCHY:
  Database Schema (Supabase) → supabase gen types → database.types.ts
                                                    ↓
  database.types.ts → extends/narrows → domain types (question.types.ts, etc.)
  domain types → consumed by → API types, component props, hook returns

NEVER:
  → Duplicate database types in separate files
  → Use 'any' for API responses
  → Infer types from runtime values (explicitly type everything)

KEY TYPE PATTERNS:

  DISCRIMINATED UNIONS for state machines:
  
  type SessionStatus =
    | { type: 'idle' }
    | { type: 'starting'; sessionId: string }
    | { type: 'active'; questionIndex: number }
    | { type: 'feedback'; isCorrect: boolean; questionIndex: number }
    | { type: 'transitioning' }
    | { type: 'completed'; summary: SessionSummary }

  BRANDED TYPES for IDs (prevent mixing):
  
  type UserId = string & { readonly __brand: 'UserId' }
  type SessionId = string & { readonly __brand: 'SessionId' }
  type QuestionId = string & { readonly __brand: 'QuestionId' }
  type SkillId = string & { readonly __brand: 'SkillId' }
  
  Prevents: session.id passed where question.id expected

  RESULT TYPE for error handling (no throw):
  
  type Result<T, E = AppError> =
    | { success: true; data: T }
    | { success: false; error: E }
  
  All API calls return Result<T>. No try/catch in components.
  
  MAPPED TYPES for YAEL sections:
  
  type SectionScore = {
    [K in YAELSection]: number
  }
  
  type SectionKnowledgeState = {
    [K in YAELSection]: {
      theta: number
      mastery: number
      lastPracticed: Date | null
    }
  }

  COMPONENT PROP CONTRACTS:
  
  All feature components use strict prop interfaces:
  
  interface QuestionDisplayProps {
    readonly question: Question          (immutable input)
    readonly state: QuestionState        (discriminated union)
    readonly onOptionSelect: (index: number) => void
    readonly onSubmit: () => void
    readonly disabled?: boolean
    readonly className?: string
  }
  
  readonly prevents accidental mutation
  onOptionSelect/onSubmit are callbacks, never null
  className for Tailwind override (composability)

ENVIRONMENT TYPES (config/env.ts using t3-env):

  SERVER-SIDE ONLY:
    SUPABASE_SERVICE_ROLE_KEY
    ANTHROPIC_API_KEY
    SUPABASE_WEBHOOK_SECRET
  
  CLIENT-ACCESSIBLE (NEXT_PUBLIC_*):
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    NEXT_PUBLIC_APP_URL
  
  VALIDATION: Zod schema validates all env vars on startup.
  If any required var missing: app FAILS TO BUILD (not just runtime error).
  This catches missing env vars in CI before they reach production.
```

---

## ARCHITECTURE SUMMARY

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              FRONTEND ARCHITECTURE — DECISION MATRIX                        ║
╠════════════════════════════╦═════════════════════════════════════════════════╣
║  DECISION                  ║  CHOICE + RATIONALE                            ║
╠════════════════════════════╬═════════════════════════════════════════════════╣
║  Rendering strategy        ║  Server-first. Client components at leaves.    ║
║  State — server            ║  React Query. Optimistic updates everywhere.   ║
║  State — client            ║  Zustand. Domain stores, not global.           ║
║  RTL implementation        ║  CSS Variables + DirectionProvider. No hacks.  ║
║  Animation library         ║  Framer Motion. reducedMotion guard always.    ║
║  Error handling            ║  4-layer boundaries + Result<T> type.          ║
║  Code splitting            ║  Route-level auto + feature-level manual.      ║
║  Fonts                     ║  Self-hosted, next/font, preload critical.      ║
║  Images                    ║  next/image, avif first, skeleton placeholders. ║
║  Dark mode                 ║  CSS variables + next-themes. Zero flash.       ║
║  Accessibility             ║  WCAG AA floor. Arabic screen reader first.    ║
║  SEO                       ║  Metadata API + JSON-LD + sitemap generation.  ║
║  Auth                      ║  Supabase + middleware guard + AuthProvider.   ║
║  Type safety               ║  Strict TypeScript. Generated DB types. Zod.   ║
║  Performance targets       ║  LCP < 2.5s, INP < 200ms, CLS < 0.1.         ║
╚════════════════════════════╩═════════════════════════════════════════════════╝

COMPONENT COUNT ESTIMATE:
  Primitives:      28 components
  Composites:      24 components
  Feature:         65 components
  Page-level:      32 route segments
  TOTAL:          ~149 discrete components

CUSTOM HOOKS:
  Auth hooks:       3
  Learning hooks:   6
  Gamification:     4
  UI behavior:      8
  Data fetching:    4
  TOTAL:           25 custom hooks

ZUSTAND STORES:      5 stores
PROVIDER LAYERS:     7 providers
ERROR BOUNDARIES:    4 levels
TYPE DEFINITION FILES: 10 files

The architecture is ready to build.
First milestone: Design system → Providers → Auth flow → Dashboard.
```

*Every architectural decision above traces back to the same student: anxious about YAEL, studying from their phone at 9pm, needing an experience that feels fast, clear, and earned.*