# 📐 YAEL AI Platform — Complete Product Design Specification

*Senior EdTech Product Designer · RTL-First · Arabic-Primary · Mobile-First*

---

## DESIGN SYSTEM FOUNDATION

*Established before any screen — every decision flows from here.*

### Typography

```
ARABIC (Primary UI Language)
  Display:    Cairo — bold, geometric, high legibility at all sizes
  Body:       Noto Sans Arabic — neutral, readable, excellent Unicode coverage
  Sizes:      xs(12) · sm(14) · base(16) · lg(18) · xl(20) · 2xl(24) · 3xl(30) · 4xl(36)

HEBREW (Content Language — displayed in LTR islands)
  Display:    Frank Ruhl Libre — elegant, literary, exam-authentic register
  Body:       Heebo — modern, clean, high legibility for learning contexts
  Nikud:      Noto Sans Hebrew with full diacritics support
  Minimum size for Hebrew: 18px (readability requirement)

RULE: Never mix Arabic and Hebrew in the same text node.
      Hebrew always wrapped in <span dir="ltr">. Never smaller than 18px.
```

### Color System

```
PRIMARY PALETTE
  Deep Blue       #1B3A6B   Trust · Stability · Academic authority
  Sky Blue        #3B82F6   Interaction · Focus · Progress
  Warm Gold       #E8A830   Achievement · Warmth · Cultural resonance
  Emerald         #10B981   Correct answers · Mastery · Growth
  Rose            #EF4444   Wrong answers · Alerts · Urgency (used sparingly)

NEUTRAL PALETTE
  Background      #F7F5F0   Warm parchment — evokes books, not apps
  Surface         #FFFFFF   Cards, modals
  Surface-Alt     #F0EEE9   Subtle differentiation
  Border          #E5E1D8   Gentle separation
  Text-Primary    #1A1A2E   Near-black — not harsh pure black
  Text-Secondary  #6B7280   Supporting text
  Text-Muted      #9CA3AF   Captions, metadata
  Text-Disabled   #D1D5DB

SEMANTIC COLORS
  Success-bg      #ECFDF5   · Success-text #065F46
  Error-bg        #FEF2F2   · Error-text   #991B1B
  Warning-bg      #FFFBEB   · Warning-text #92400E
  Info-bg         #EFF6FF   · Info-text    #1E40AF

DARK MODE (auto-detect, user overrideable)
  Background      #0F1117
  Surface         #1A1D27
  Surface-Alt     #22263A
  Text-Primary    #F1F0ED
  (All semantic colors adjusted for dark mode contrast)
```

### Spacing, Motion, Shadows

```
SPACING SCALE (4px base)
  4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96

BORDER RADIUS
  sm: 6px (inputs, chips)
  md: 12px (cards, buttons)
  lg: 20px (panels, modals)
  full: 9999px (badges, avatars, pills)

SHADOWS
  sm:   0 1px 3px rgba(0,0,0,0.08)         (subtle lift)
  md:   0 4px 16px rgba(0,0,0,0.10)        (cards)
  lg:   0 8px 32px rgba(0,0,0,0.12)        (modals, drawers)
  glow: 0 0 24px rgba(59,130,246,0.25)     (active focus)

MOTION
  Micro (hover, tap):     120ms ease-out
  Standard (panel open):  250ms cubic-bezier(0.4, 0, 0.2, 1)
  Emphasis (celebration): 400ms cubic-bezier(0.34, 1.56, 0.64, 1) — spring
  RULE: Respect prefers-reduced-motion. All animations optional.

ANIMATION PRINCIPLES
  Correct answer:   Card flips green, gentle scale 1.02 → 1.0, checkmark draws
  Wrong answer:     Card shakes 4px × 3 (haptic metaphor), turns rose-bg
  Score increase:   Number rolls up (slot machine — reward feel)
  XP gain:          Floating "+25 XP" rises and fades from answer card
  Level up:         Full-screen confetti burst (3 seconds, dismissible)
```

---

## SCREEN 01 — LANDING PAGE

### Identity Statement
```
الصفحة الأولى هي الوعد.
"The first page is the promise."
This page has one job: convert a skeptical, anxious student
into a believer in 90 seconds.
```

### Goal
Transform a first-time Arabic-speaking visitor — likely anxious about YAEL, possibly burned by expensive courses that didn't work — into a registered user within 90 seconds, without any friction, payment pressure, or language barrier.

### User Emotions on Arrival
```
PRIMARY:    Skepticism ("בטח עוד קורס שלא עוזר")
SECONDARY:  Anxiety (exam is real, stakes are high — university access)
TERTIARY:   Hope (maybe this is different)
UNDERLYING: Shame (some feel their Hebrew level is an identity statement)

DESIGN RESPONSE:
  → Lead with outcome, not features ("120+ students achieved in 8 weeks")
  → Normalize the struggle (everyone finds YAEL hard)
  → Show Arabic-speaker advantage immediately (you have a head start)
  → Remove all signup friction until they're believers
```

### Main CTA
**"ابدأ مجاناً — بدون بطاقة ائتمان"** *(Start Free — No Credit Card)*
- Button: Full-width on mobile / 320px on desktop
- Color: Warm Gold #E8A830 on Deep Blue text
- Size: 18px bold
- Position: Above fold, repeated at bottom
- Behavior: Leads directly to a sample question, not a signup form

### Secondary CTA
**"شاهد كيف يعمل النظام"** *(Watch how the system works)*
- Ghost button below primary
- Opens a 90-second in-page video demo (no YouTube, no external link)
- Auto-plays muted, captions in Arabic

### Desktop Layout (1440px reference)

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAV BAR                                                             │
│  Logo (HE+AR)        [يعل بامتياز]    [تسجيل الدخول] [ابدأ مجاناً] │
│  dir="rtl"                                                           │
├─────────────────────────────────────────────────────────────────────┤
│  HERO SECTION (100vh, warm parchment background)                    │
│                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
│  │   HEADLINE (right column)    │  │   LIVE DEMO QUESTION         │ │
│  │                              │  │   (left column — interactive)│ │
│  │  "من العربية إلى العبرية     │  │                              │ │
│  │   في 8 أسابيع"              │  │  ┌────────────────────────┐  │ │
│  │                              │  │  │ אוצר מילים · YAEL 3   │  │ │
│  │  Subhead:                    │  │  │                        │  │ │
│  │  "المنصة الوحيدة التي        │  │  │ מה פירוש המילה "שלם"? │  │ │
│  │  تستخدم جذور العربية         │  │  │                        │  │ │
│  │  لتعلم العبرية بسرعة"        │  │  │  ○ שלום               │  │ │
│  │                              │  │  │  ○ שלם                │  │ │
│  │  Social proof counter:       │  │  │  ○ תשלום              │  │ │
│  │  ┌──────────────────────┐    │  │  │  ○ שלמות              │  │ │
│  │  │ 🏆 3,241 طالب        │    │  │  └────────────────────────┘  │ │
│  │  │    حققوا 120+ هذا    │    │  │                              │ │
│  │  │    العام             │    │  │  [Try it — جرب الآن]         │ │
│  │  └──────────────────────┘    │  │  No signup needed            │ │
│  │                              │  └──────────────────────────────┘ │
│  │  [ابدأ مجاناً ←]            │                                    │
│  │  [شاهد كيف يعمل]            │                                    │
│  └──────────────────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────┤
│  TRUST STRIP (thin, 80px)                                           │
│  "بدون إعلانات · بدون رسوم · بدون بطاقة ائتمان · 100% مجاني"      │
├─────────────────────────────────────────────────────────────────────┤
│  THE INSIGHT SECTION ("Why Arabic Speakers Have an Advantage")      │
│                                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ AR: كتب │→ │ HE: כתב │  │ AR: سلم │→ │ HE: שלם │              │
│  │  write  │  │  write  │  │  peace  │  │  peace  │              │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘              │
│                                                                      │
│  "اللغتان تشتركان في أكثر من 1,200 جذر مشترك.                     │
│   أنت لا تبدأ من الصفر — أنت تبدأ من الأمام."                     │
├─────────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS (3 steps, illustrated)                                │
│                                                                      │
│  [1] اختبار تحديد المستوى    [2] خطة ذكية شخصية   [3] تدرب حتى 120│
│  20 سؤالاً · 8 دقائق        AI تولّد خطتك         بالعربية + بالعبرية│
├─────────────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF — STUDENT STORIES (carousel, real photos if possible) │
│                                                                      │
│  "كنت في 78 · بعد 6 أسابيع وصلت 127"                              │
│  — أحمد, طالب هندسة في تل أبيب                                    │
├─────────────────────────────────────────────────────────────────────┤
│  YAEL SECTION COVERAGE                                              │
│  Visual: 5 columns (sections) × skill breakdown                     │
│  Shows comprehensiveness without overwhelming                        │
├─────────────────────────────────────────────────────────────────────┤
│  FAQ (accordion, 8 questions)                                       │
│  + Final CTA block                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                             │
│  Arabic | Privacy | Contact | GitHub (open source commitment)       │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (390px reference)

```
┌──────────────────────────┐
│ NAV                      │
│ Logo        [ابدأ مجاناً]│
├──────────────────────────┤
│ HERO                     │
│                          │
│ "من العربية              │
│  إلى العبرية"            │
│  في 8 أسابيع            │
│                          │
│ ┌──────────────────────┐ │
│ │ 🏆 3,241 طالب        │ │
│ │    حققوا 120+        │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │[ابدأ مجاناً — مجاناً]│ │
│ └──────────────────────┘ │
│ [شاهد كيف يعمل]         │
├──────────────────────────┤
│ SAMPLE QUESTION          │
│ (collapsible — "جرب الآن")│
├──────────────────────────┤
│ TRUST STRIP (horizontal  │
│ scroll)                  │
├──────────────────────────┤
│ ... (sections stack)     │
└──────────────────────────┘
```

### Empty States
```
Not applicable — landing page is always populated.
Edge case: Video fails to load → Show static screenshot with play icon
           that opens YouTube as fallback.
```

### Error States
```
NETWORK DOWN:  Minimal HTML fallback page loads from service worker.
               Shows: Name, CTA, phone number for support.
               No broken images, no broken fonts.

SLOW 3G:       Skeleton loaders for testimonials carousel.
               Text content loads first (prioritized).
               Images lazy-load with blur placeholder.
```

### Loading States
```
Initial page load:   Font preload → Layout painted → Content streams in
                     No CLS (Cumulative Layout Shift) — heights reserved
                     
Video thumbnail:     Blurred placeholder → Sharp image on load
```

### Accessibility
```
□ Arabic screen reader announcement: "يعل بامتياز — منصة تعليم عبري"
□ Skip-to-main link (first focusable element)
□ All CTAs: minimum 44×44px touch target
□ Color contrast: all text passes WCAG AA (4.5:1 minimum)
□ Sample question: fully keyboard navigable
□ Animations: controlled by prefers-reduced-motion
□ Video: captions on, described for screen readers
□ No autoplay audio ever
□ Focus ring: 3px Sky Blue, always visible
```

### Psychological Triggers
```
SOCIAL PROOF:      Live counter of students who achieved 120+ (FOMO)
AUTHORITY:         YAEL official logo + RAMA reference (legitimacy)
SPECIFICITY:       "3,241 students" not "thousands" (specificity = trust)
LINGUISTIC BRIDGE: Showing Arabic=Hebrew roots (unique insight = value)
ZERO RISK:         "No credit card" repeated twice (loss aversion removed)
PROGRESS PREVIEW:  Sample question gives dopamine hit before commitment
IDENTITY:          "Arabic speakers have a head start" (pride, not shame)
SCARCITY (soft):   "تسجيل مجاني · عدد الأماكن المميزة محدود" on study groups
```

### Gamification Elements
```
NONE intentionally on landing — gamification requires buy-in.
Exception: Sample question gives instant correct/wrong feedback
           with a mini-explanation → shows the QUALITY of the platform
           without overwhelming.
```

---

## SCREEN 02 — DASHBOARD

### Goal
Give every returning student one clear answer within 3 seconds of arriving: *"What should I do right now, and am I getting closer to 120?"* The dashboard is the student's mission control — it must motivate, orient, and launch them into practice without cognitive load.

### User Emotions
```
MORNING:     Groggy motivation — needs a gentle "push"
AFTERNOON:   Focused but time-constrained — needs "quick win" path
EVENING:     Reflective — wants to see progress, feels proud or anxious
AFTER MISS:  Shame spiral risk — dashboard must not punish

DESIGN RESPONSE:
  → Lead with encouragement, not deficiency
  → Show TODAY'S mission first, not what's missing
  → Score gauge shows trajectory (direction), not just current number
  → Streak shows consistency, not guilt
  → On 0-day streak: "يوم جديد، بداية جديدة" — not "You broke your streak"
```

### Main CTA
**"ابدأ جلسة اليوم"** *(Start Today's Session)*
- Fixed button, bottom of screen on mobile (always visible)
- Large card at top of desktop layout
- Color: Deep Blue background, white text, gold arrow icon
- Shows estimated duration: "20 دقيقة · 15 سؤالاً"

### Secondary CTA
**"مراجعة المفردات"** *(Vocabulary Review)*
- Only shows if vocab cards are due today
- Badge: red number showing overdue cards (urgency trigger)

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                            │
│  [≡ Menu]  يعل بامتياز    [🔥 14] [⭐ 2,840 XP] [👤 أحمد ▼]       │
│            ←── score mini gauge embeds here on desktop             │
├──────────────┬──────────────────────────────────────────────────────┤
│              │  MAIN CONTENT AREA                                   │
│  SIDE NAV    │                                                      │
│  (240px)     │  ┌────────────────────────────────────────────────┐ │
│              │  │  TODAY'S MISSION CARD (hero card)              │ │
│  🏠 لوحة     │  │                                                │ │
│  التحكم      │  │  الثلاثاء · ٣ يوليو                           │ │
│              │  │  مرحباً أحمد 👋                                │ │
│  📚 تدرب     │  │                                                │ │
│              │  │  "اليوم: تركيز على فهم المقروء"                │ │
│  📖 مفردات   │  │  المنظومة تقول: هذا يرفع درجتك +4 نقاط.      │ │
│              │  │                                                │ │
│  📝 اختبار   │  │  ┌──────────────────────────────────────────┐ │ │
│  محاكاة      │  │  │  [ابدأ جلسة اليوم ←] 20 دقيقة · 15 سؤال │ │ │
│              │  │  └──────────────────────────────────────────┘ │ │
│  🤖 مدرسي    │  └────────────────────────────────────────────────┘ │
│  الذكي       │                                                      │
│              │  ┌──────────────────┐  ┌───────────────────────────┐│
│  📊 إحصائيات │  │  SCORE GAUGE     │  │  SKILL HEATMAP            ││
│              │  │                  │  │                           ││
│  🗓️ خطتي    │  │    87            │  │  Reading  ████████░░  78% ││
│              │  │  ●───────●       │  │  Vocab    ██████░░░░  61% ││
│  ⚙️ إعدادات  │  │  الآن  الهدف    │  │  Grammar  ████░░░░░░  44% ││
│              │  │   87    120      │  │  Sentence █████████░  88% ││
│              │  │                  │  │  Reconst. ███░░░░░░░  32% ││
│              │  │  33 يوم للامتحان │  │                           ││
│              │  │  🟢 على الطريق   │  │  [تحسين النحو →]          ││
│              │  └──────────────────┘  └───────────────────────────┘│
│              │                                                      │
│              │  ┌────────────────┐  ┌─────────────────────────────┐│
│              │  │  STREAK        │  │  RECENT ACTIVITY            ││
│              │  │  🔥 14 يوم     │  │                             ││
│              │  │  متواصل        │  │  أمس: 12/15 صحيحة +8 نقاط ││
│              │  │                │  │  الأحد: مفردات · 20 بطاقة ││
│              │  │  الأسبوع:      │  │  السبت: اختبار محاكاة: 91  ││
│              │  │  ✓ ✓ ✓ ✓ ✓ ✓ □│  │                             ││
│              │  └────────────────┘  └─────────────────────────────┘│
│              │                                                      │
│              │  ┌───────────────────────────────────────────────┐  │
│              │  │  UPCOMING IN YOUR PLAN                        │  │
│              │  │  غداً: مراجعة النحو (25 د)                   │  │
│              │  │  بعد غد: اختبار محاكاة كامل                  │  │
│              │  └───────────────────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌──────────────────────────┐
│ TOP BAR                  │
│ [☰] [🔥14] [⭐2840] [👤] │
├──────────────────────────┤
│                          │
│  مرحباً أحمد 👋          │
│  الثلاثاء · ٣ يوليو     │
│                          │
├──────────────────────────┤
│  TODAY'S MISSION CARD    │
│  ┌──────────────────────┐│
│  │ "اليوم: فهم المقروء" ││
│  │ هذا يرفع درجتك +4   ││
│  │                      ││
│  │ [ابدأ جلسة اليوم ←]  ││
│  │  20 دقيقة · 15 سؤال  ││
│  └──────────────────────┘│
├──────────────────────────┤
│  SCORE GAUGE             │
│  ┌──────────────────────┐│
│  │   87 → 120           ││
│  │  ●────────────○      ││
│  │  الآن        الهدف   ││
│  │  33 يوم للامتحان     ││
│  │  🟢 على الطريق       ││
│  └──────────────────────┘│
├──────────────────────────┤
│  STREAK                  │
│  🔥 14 يوم · ✓✓✓✓✓✓□    │
├──────────────────────────┤
│  SKILL HEATMAP           │
│  (horizontal scroll)     │
│  [فهم][مفردات][نحو][جملة]│
│   78%   61%    44%  88%  │
├──────────────────────────┤
│  RECENT ACTIVITY         │
│  (compact 3-item list)   │
├──────────────────────────┤
│                          │
│  BOTTOM NAV (fixed)      │
│  🏠  📚  📖  📊  👤     │
└──────────────────────────┘
```

### Empty States
```
NEW USER (first login, no data yet):
  Score Gauge:  Placeholder with "أكمل اختبار التحديد لرؤية درجتك"
  Skill Heatmap: Greyed out with "ستظهر هنا بعد أول جلسة"
  Recent Activity: Illustration (student at desk) + "لا يوجد نشاط بعد"
  Streak: "ابدأ اليوم 🌱"

NO EXAM DATE SET:
  Score Gauge footer: "أضف تاريخ امتحانك لرؤية العداد التنازلي"
  Link to settings/profile
```

### Error States
```
DATA LOAD FAILURE:
  Show cached last-known data (stale but helpful)
  Subtle banner: "البيانات قد لا تكون محدثة — جارٍ إعادة الاتصال..."
  Retry silently every 30 seconds
  
SCORE CALCULATION PENDING:
  Gauge shows "يُحسب..." with shimmer animation
  
SESSION START FAILURE:
  Inline error in CTA button: "تعذّر البدء — اضغط للمحاولة مجدداً"
  Never full-screen error for this
```

### Loading States
```
INITIAL LOAD:
  Skeleton layout: exact shape of dashboard, animated shimmer
  Content loads in priority order:
    1. Greeting + date (immediate — static)
    2. Today's mission card
    3. Score gauge
    4. Skill heatmap
    5. Streak
    6. Recent activity

EACH CARD has its own loading state — no "everything or nothing"
```

### Accessibility
```
□ Dashboard heading: h1 "لوحة تحكم أحمد"
□ Score gauge: aria-label "درجتك الحالية 87 من أصل 120، 33 يوماً للامتحان"
□ Skill heatmap: table role with scope headers
□ Streak: aria-label "سلسلة 14 يوم متواصل"
□ CTA button: descriptive aria-label includes duration
□ Live region for score updates: aria-live="polite"
□ All icons paired with text or aria-label
```

### Psychological Triggers
```
PROGRESS MOMENTUM:    Score gauge shows distance traveled, not remaining
LOSS AVERSION:        Streak display makes missing today costly (not punishing)
SPECIFICITY:          "+4 نقاط" not "تحسين" — concrete expected gain
AUTONOMY:             "اليوم نركز على..." (AI choice) but CTA lets user choose
STATUS:               XP counter visible in top bar (social identity)
COMPLETION TENDENCY:  Week grid with today's box empty (Zeigarnik effect)
FRESH START EFFECT:   Date shown prominently — every day is a new start
```

### Gamification Elements
```
STREAK FIRE:      🔥 with count — real-time, emotionally salient
WEEKLY GRID:      7 boxes, colored by completion (missed = hollow, not red)
XP COUNTER:       Persistent in header (experience points accumulate)
SCORE TRAJECTORY: Animated gauge needle — shows direction, not just number
LEVEL BADGE:      Current YAEL level displayed as academic badge (1–5)
MISSION CARD:     Frames daily study as a mission, not a chore
"+4 POINTS":      Every session's predicted score impact is shown upfront
```

---

## SCREEN 03 — PLACEMENT TEST

### Goal
Accurately determine the student's current YAEL level across all 5 sections in 8 minutes, while feeling engaging, not threatening — so the AI has a precise starting point for personalization, and the student feels seen, not judged.

### User Emotions
```
ENTERING:     Nervous (what if I score very low?)
DURING:       Focused, occasionally confused
COMPLETING:   Relieved, curious about results
RESULTS:      Either validated or surprised (both need careful handling)

DESIGN RESPONSE:
  → Frame as "discovery", not "test": "اكتشف مستواك"
  → No progress indicator that reveals remaining difficulty
  → No score shown during test (avoids anxiety spiral)
  → Celebrate completion, not score: "أنهيت الاختبار! 🎉"
  → Score reveal: gradual, narrative, with context
```

### Main CTA
**"ابدأ اكتشاف مستواك"** *(Start discovering your level)*
- On intro screen: large, centered button
- During test: "التالي ←" (simple, minimal)

### Secondary CTA
**"تخطَّ سؤالاً"** *(Skip question)*
- Available but visually subdued — not encouraged
- No penalty messaging ("تخطي مسموح — ما في داعي تخمّن")

### Desktop Layout

```
INTRO SCREEN:
┌─────────────────────────────────────────────────────────────────────┐
│  (Minimal nav — just logo, no distractions)                         │
│                                                                      │
│                    ┌──────────────────────────┐                     │
│                    │  PLACEMENT TEST CARD      │                     │
│                    │                          │                     │
│                    │  اكتشف مستوى عبريتك      │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ ⏱️  ~8 دقائق       │  │                     │
│                    │  │ ❓  20 سؤال        │  │                     │
│                    │  │ 📊  5 مهارات       │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  كيف يعمل:               │                     │
│                    │  • الأسئلة تتكيف         │                     │
│                    │    مع مستواك تلقائياً    │                     │
│                    │  • لا توجد إجابات        │                     │
│                    │    خاطئة بشكل رسمي       │                     │
│                    │  • الهدف: نقطة بداية     │                     │
│                    │    دقيقة، ليس حكم        │                     │
│                    │                          │                     │
│                    │  [ابدأ اكتشاف مستواك ←]  │                     │
│                    │                          │                     │
│                    │  أو [تخطّى — أنا أعرف    │                     │
│                    │    مستواي]               │                     │
│                    └──────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘

QUESTION SCREEN:
┌─────────────────────────────────────────────────────────────────────┐
│  (Stripped interface — maximum focus)                               │
│                                                                      │
│  Progress:  ●●●●●●●○○○○○○○○○○○○○  (dots, not %)                   │
│  Section:   [أوצר מילים]                                            │
│                                                                      │
│             ┌──────────────────────────────────────────────────┐    │
│             │                                                  │    │
│             │  QUESTION TEXT (Hebrew, LTR island, 22px)       │    │
│             │  ┌────────────────────────────────────────────┐ │    │
│             │  │  בחר את המילה שמשמעותה "שמח" ב  dir=ltr   │ │    │
│             │  └────────────────────────────────────────────┘ │    │
│             │                                                  │    │
│             │  ANSWER OPTIONS:                                 │    │
│             │  ┌────────────────────────────────────────────┐ │    │
│             │  │  א   עצוב                                  │ │    │
│             │  └────────────────────────────────────────────┘ │    │
│             │  ┌────────────────────────────────────────────┐ │    │
│             │  │  ב   שמח       ← (SELECTED STATE)          │ │    │
│             │  └────────────────────────────────────────────┘ │    │
│             │  ┌────────────────────────────────────────────┐ │    │
│             │  │  ג   כועס                                  │ │    │
│             │  └────────────────────────────────────────────┘ │    │
│             │  ┌────────────────────────────────────────────┐ │    │
│             │  │  ד   עייף                                  │ │    │
│             │  └────────────────────────────────────────────┘ │    │
│             │                                                  │    │
│             │  [تخطَّ]                    [التالي ←]           │    │
│             │                                                  │    │
│             └──────────────────────────────────────────────────┘    │
│                                                                      │
│  IMPORTANT: NO feedback shown (correct/wrong) during placement.     │
│  Answers are recorded silently. No score. Just flow.               │
└─────────────────────────────────────────────────────────────────────┘

RESULTS SCREEN:
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  🎉  أنهيت اختبار التحديد!                                  │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │  درجتك التقديرية الآن                              │    │   │
│  │  │                                                     │    │   │
│  │  │           87   ← ANIMATED COUNTER ROLLS UP          │    │   │
│  │  │                                                     │    │   │
│  │  │  من أصل 150 · الهدف: 120                           │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │  نقاط قوتك:          نقاط التطوير:                          │   │
│  │  ✅ فهم المقروء      🎯 النحو (دقدوق)                      │   │
│  │  ✅ إكمال الجمل       🎯 المفردات المتقدمة                  │   │
│  │                                                              │   │
│  │  ما يميزك كناطق بالعربية:                                   │   │
│  │  "أنت تتعرف على جذور عبرية 40% أسرع من متعلمي اللغات      │   │
│  │   الأخرى. هذه ميزة حقيقية."                                 │   │
│  │                                                              │   │
│  │  [شاهد خطتك الشخصية ←]                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
QUESTION SCREEN (mobile):
┌──────────────────────────┐
│ Progress dots (top)      │
│ ●●●●●○○○○○○○○○○○○○○○    │
├──────────────────────────┤
│ Section label            │
│ [אוצר מילים]             │
├──────────────────────────┤
│ Question (Hebrew, large) │
│ ┌──────────────────────┐ │
│ │ בחר את המילה        │ │
│ │ שמשמעותה "שמח"      │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ Answer options           │
│ ┌──────────────────────┐ │
│ │ א   עצוב             │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ב   שמח   ✓ SELECTED │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ג   כועס             │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ד   עייף             │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ [تخطَّ]     [التالي ←]   │
└──────────────────────────┘
```

### Empty States
```
If student navigates away mid-test:
  Prompt: "أنت في منتصف الاختبار — هل تريد الاستمرار أو البدء من جديد؟"
  Options: [استمر] [ابدأ من جديد]
  (Progress saved in session storage)
```

### Error States
```
NETWORK LOST mid-test:
  Subtle banner (non-blocking): "اتصالك ضعيف — إجاباتك محفوظة محلياً"
  Questions served from local cache if available
  
QUESTION LOAD FAILURE:
  "تعذّر تحميل السؤال — [حاول مرة أخرى]"
  Option to skip this question and continue
```

### Loading States
```
Between questions:     Question card fades out → next fades in (200ms)
                       No spinner — instantaneous feel
                       
Result calculation:    "يحلل AI مستواك..." with subtle progress bar
                       Takes 2-3 seconds → feels thoughtful, not lazy
                       
Plan generation:       Animated graphic showing plan being "built"
                       Arabic copy: "نبني خطتك الشخصية..."
```

### Accessibility
```
□ Placement test announced: "اختبار التحديد، 20 سؤالاً، يمكنك التخطي"
□ Answer options: radio button group with fieldset/legend
□ Hebrew question text: lang="he" attribute
□ Progress: aria-valuenow, aria-valuemax, aria-label
□ Selected state: aria-checked + visual blue border
□ No time pressure (no timer during placement)
□ Question number announced on change: aria-live
```

### Psychological Triggers
```
REFRAMING:        "اكتشف مستواك" not "اختبار تحديد" (curiosity vs. threat)
AUTONOMY:         Skip option always visible (reduces pressure → better data)
SURPRISE REMOVAL: "الهدف: نقطة بداية، ليس حكم" — pre-empts judgment fear
NO FEEDBACK:      Removing right/wrong feedback during placement removes
                  emotional volatility (pure data collection)
INVESTMENT:       8 minutes invested → personalized plan → sunk cost makes
                  them more likely to start actual studying
POSITIVE FRAMING: Results always lead with strengths before gaps
UNIQUENESS:       Arabic advantage mentioned in results (identity pride)
```

### Gamification Elements
```
PROGRESS DOTS:     Non-numeric progress (avoids countdown anxiety)
COMPLETION REWARD: 🎉 animation on completion, XP awarded
DISCOVERY FRAME:   Score "revealed" with animated counter (slot machine feel)
BADGE UNLOCK:      "مستوى يعل 3" badge appears after results
```

---

## SCREEN 04 — VOCABULARY (מילון חכם)

### Goal
Build a sustainable, anxiety-free Hebrew vocabulary habit that compounds over weeks, leveraging Arabic root knowledge as an accelerator — with spaced repetition ensuring words are remembered for the exam, not just the next day.

### User Emotions
```
ENTERING:     Determined but sometimes dreading the "memory work"
DURING GOOD SESSION: Flow state — cards feel manageable, Arabic bridges feel clever
DURING HARD SESSION: Frustration (seeing same card again)
AFTER SESSION: Satisfied — "كمّلت مراجعتي اليومية"

DESIGN RESPONSE:
  → Celebrate completion, not performance
  → Arabic bridge moment should feel like an "aha" every time
  → Hard cards shown with empathy: "هذه الكلمة صعبة على الجميع"
  → Short daily sessions (10-15 min) over marathon cramming
```

### Main CTA
**"ابدأ مراجعة اليوم"** *(Start today's review)*
- Number badge: "23 بطاقة موعودة اليوم" (due cards)

### Secondary CTAs
- **"استكشف الجذور"** *(Explore roots)*
- **"بحث في المفردات"** *(Search vocabulary)*
- **"أضف كلمة"** *(Add word — user-saved words)*

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← ←] لوحة المفردات       [🔍 بحث] [+ أضف كلمة]                 │
├──────────────────┬──────────────────────────────────────────────────┤
│  LEFT PANEL      │  RIGHT PANEL — FLASHCARD                        │
│  (240px)         │                                                  │
│                  │  ┌────────────────────────────────────────────┐ │
│  📊 الإحصاء      │  │  FLASHCARD (full center focus)            │ │
│  ─────────       │  │                                            │ │
│  مستحق اليوم: 23 │  │  ┌──────────────────────────────────────┐ │ │
│  متقن: 340       │  │  │  CARD FRONT (unflipped)              │ │ │
│  قيد التعلم: 87  │  │  │                                      │ │ │
│                  │  │  │       שָׁלֵם                           │ │ │
│  📚 القوائم      │  │  │   (with nikud — vowelized)            │ │ │
│  ─────────       │  │  │                                      │ │ │
│  الكل            │  │  │  🔊 [استمع]                          │ │ │
│  YAEL 1          │  │  │                                      │ │ │
│  YAEL 2          │  │  │  [اضغط لرؤية المعنى]                 │ │ │
│  YAEL 3          │  │  └──────────────────────────────────────┘ │ │
│  YAEL 4          │  │                                            │ │
│  YAEL 5          │  │  — — — — FLIPPED STATE — — — —            │ │
│  المحفوظة        │  │                                            │ │
│  الصعبة          │  │  ┌──────────────────────────────────────┐ │ │
│                  │  │  │  CARD BACK (flipped)                 │ │ │
│  🌿 استكشاف      │  │  │                                      │ │ │
│  الجذور          │  │  │  שָׁלֵם = كامل، تام                   │ │ │
│  ─────────       │  │  │                                      │ │ │
│  جذر: ש-ל-מ     │  │  │  الجذر: ש-ל-מ                       │ │ │
│  [ابحث]          │  │  │                                      │ │ │
│                  │  │  │  🌉 جسر عربي-عبري:                   │ │ │
│                  │  │  │  ┌────────────────────────────────┐  │ │ │
│                  │  │  │  │  عربي: س-ل-م (سلام، سلامة)   │  │ │ │
│                  │  │  │  │  عبري: ש-ל-מ (שלם، שלום)      │  │ │ │
│                  │  │  │  │  نفس الجذر السامي! 🤯            │  │ │ │
│                  │  │  │  └────────────────────────────────┘  │ │ │
│                  │  │  │                                      │ │ │
│                  │  │  │  مثال: "הוא שָׁלַם אֶת הַחֶשְׁבּוֹן"    │ │ │
│                  │  │  │  (هو دفع الفاتورة)                   │ │ │
│                  │  │  │                                      │ │ │
│                  │  │  │  التقييم:                            │ │ │
│                  │  │  │  [نسيت] [صعب] [ممتاز] [سهل]        │ │ │
│                  │  │  │   Again    Hard   Good    Easy       │ │ │
│                  │  │  │                                      │ │ │
│                  │  │  │  التالي: في 1د / 3أيام / 7أيام      │ │ │
│                  │  │  └──────────────────────────────────────┘ │ │
│                  │  └────────────────────────────────────────────┘ │
│                  │                                                  │
│                  │  Progress: بطاقة 7 من 23                       │
│                  │  ████████░░░░░░░░░░░░░░░░░░  30%               │
└──────────────────┴──────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌──────────────────────────┐
│ [← ←] مفردات            │
│ ● 23 بطاقة مستحقة       │
├──────────────────────────┤
│                          │
│  FLASHCARD               │
│  ┌──────────────────────┐│
│  │                      ││
│  │    שָׁלֵם              ││
│  │   (FRONT STATE)      ││
│  │                      ││
│  │  🔊 [استمع]          ││
│  │                      ││
│  │  [اضغط للقلب]        ││
│  │       ↕              ││
│  └──────────────────────┘│
│  (Swipe up to flip)      │
│                          │
│  — AFTER FLIP —          │
│                          │
│  ┌──────────────────────┐│
│  │  שָׁלֵם = كامل، تام   ││
│  │                      ││
│  │  🌉 س-ل-م = ש-ל-מ    ││
│  │  نفس الجذر السامي!   ││
│  │                      ││
│  │ [نسيت][صعب][جيد][سهل]││
│  └──────────────────────┘│
├──────────────────────────┤
│ Progress: 7/23  ████░░░  │
├──────────────────────────┤
│ BOTTOM NAV               │
└──────────────────────────┘
```

### Root Explorer (Sub-screen)

```
┌─────────────────────────────────────────────────────────────────────┐
│  استكشاف الجذور العبرية-العربية                                     │
│                                                                      │
│  [ادخل جذراً عبرياً أو عربياً...]  [🔍 بحث]                       │
│                                                                      │
│  مثال: ادخل "ك-ت-ب" أو "כ-ת-ב"                                    │
│                                                                      │
│  ══════════════════════════════════════════════════════════         │
│  الجذر: ك-ت-ب (عربي)  ↔  כ-ת-ב (عبري)                            │
│  ══════════════════════════════════════════════════════════         │
│                                                                      │
│  في العربية:           في العبرية:                                  │
│  كتب، يكتب، كتابة     כָּתַב، כּוֹתֵב، כְּתִיבָה                      │
│  مكتبة، مكاتب         סְפָרִיָּה (مستعار)، כְּתָב יָד               │
│                                                                      │
│  شجرة الكلمات العبرية:                                              │
│  כ-ת-ב → [כָּתַב] [כְּתִיבָה] [מִכְתָּב] [כָּתוּב] [כֹּתֶרֶת]           │
│           كتب      كتابة     رسالة     مكتوب    عنوان              │
│                                                                      │
│  [+ أضف كل هذه الكلمات لبطاقاتي]                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Empty States
```
ALL CARDS DONE FOR TODAY:
  🌟 Illustration: stars and completion
  "أنهيت كل بطاقات اليوم!"
  "رصيدك: +45 XP · عدد الكلمات المتقنة: 340"
  [ادرس مبكراً للغد] (greyed — 12 cards available)
  [ارجع للوحة التحكم]

NO CARDS ADDED YET:
  Illustration of empty bookshelf
  "لم تضف كلمات بعد"
  [ابدأ بقائمة YAEL الأساسية — 200 كلمة]

SEARCH RETURNS NOTHING:
  "لم أجد '{query}' — هل تقصد...?"
  Suggestions based on phonetic similarity
```

### Error States
```
AUDIO FAILS:    Audio button shows error state, grayed
                Tooltip: "الصوت غير متاح حالياً"
                
SYNC FAILS:     "لم تُحفظ مراجعتك — إعادة المحاولة..."
                Local storage backup — never lose a review
```

### Loading States
```
Card load:        Shimmer card → real card (instant for cached)
Audio load:       Spinner in audio button (< 500ms)
Root explorer:    "يبحث في قاعدة الجذور..." (max 1 second)
Session start:    Cards pre-loaded — no loading between cards
```

### Accessibility
```
□ Flashcard: role="button", aria-pressed for flip state
□ Audio: role="button", aria-label="استمع لنطق שָׁלֵם"
□ Rating buttons: radio group with labels
□ Hebrew text: lang="he" dir="ltr" on all card content
□ Card flip: keyboard trigger (Space/Enter)
□ Rating: keyboard 1/2/3/4 shortcuts
□ Announcement on flip: "الوجه الخلفي: كامل، تام"
□ Progress: aria-label="7 بطاقة من 23"
```

### Psychological Triggers
```
ARABIC BRIDGE:    "نفس الجذر السامي! 🤯" — surprise moment per card
STREAK:           Vocab streak separate from general streak
COMPLETION:       Clear finish line (23 cards) with counter
MASTERY FEEL:     "340 كلمة متقنة" grows visibly — identity ("أنا شخص يعرف عبري")
SMART SCHEDULING: "هذه الكلمة ستعود بعد 7 أيام" — trust in system
EFFORT AWARENESS: Hard card: "هذه الكلمة صعبة على 78% من الطلاب"
```

### Gamification Elements
```
XP PER CARD:      Easy=5 · Good=10 · Hard=8 · Again=3 (rewarding trying)
STREAK FIRE:      Vocab-specific streak
MASTERY BADGE:    "أتقنت 100 كلمة" badge unlocked
LEVEL NAMES:      طالب → متعلم → ماهر → متقدم → محترف
ROOT EXPLORER:    Discovery mode — exploration feels like a game
```

---

## SCREEN 05 — GRAMMAR (דקדוק / نحو)

### Goal
Demystify Hebrew grammar for Arabic speakers by teaching it through the comparative Semitic lens — making verb patterns (binyanim) feel familiar, not foreign, using Arabic awzan as the intuitive bridge.

### User Emotions
```
ENTERING:     Often the most dreaded section ("النحو العبري صعب")
DURING:       Confusion when pattern not recognized, satisfaction when it clicks
AFTER:        Relief + genuine surprise at Arabic-Hebrew parallels

DESIGN RESPONSE:
  → Normalize: "النحو العبري أسهل مما تتوقع لناطقي العربية"
  → Side-by-side comparison as default mode (not optional)
  → Pattern recognition over rule memorization
  → Concrete, minimal examples before abstract rules
```

### Main CTA
**"تدرب على النحو اليوم"** *(Practice today's grammar)*
- AI-selected grammar skill based on weakest area

### Secondary CTAs
- **"مرجع البنيانيم"** *(Binyanim reference)*
- **"اختر مهارة"** *(Choose a skill manually)*

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Grammar Hub                                                        │
├──────────────────┬──────────────────────────────────────────────────┤
│  SKILL TREE      │  CONTENT AREA                                   │
│  (240px, sticky) │                                                  │
│                  │  ┌────────────────────────────────────────────┐ │
│  البنيانيم:      │  │  CURRENT SKILL CARD:                      │ │
│  ● פעל   93%    │  │  "بנייניים — قالب פִּיעֵל"                   │ │
│  ● פִּיעֵל 41% 🎯 │  │                                            │ │
│  ○ הִפְעִיל 20%  │  │  ┌──────────────────────────────────────┐ │ │
│  ○ הִתְפַּעֵל 8% │  │  │  CONCEPT EXPLANATION                │ │ │
│                  │  │  │                                      │ │ │
│  הטיות:          │  │  │  פִּיעֵל في العبرية                   │ │ │
│  ○ זכר/נקבה     │  │  │  = فَعَّلَ في العربية                  │ │ │
│  ○ רבים/יחיד    │  │  │                                      │ │ │
│  ○ זמן עתיד     │  │  │  كلاهما يعبّران عن:                   │ │ │
│                  │  │  │  • الفعل المكثّف                    │ │ │
│  תחביר:          │  │  │  • الجعل والتحويل                    │ │ │
│  ○ סדר המשפט    │  │  │  • التعدية                           │ │ │
│  ○ שאלות        │  │  │                                      │ │ │
│                  │  │  │  ┌────────────────────────────────┐  │ │ │
│  [+ كل المهارات] │  │  │  │ عربي: صوَّر (جعله يصوِّر)      │  │ │ │
│                  │  │  │  │ عبري: צִילֵם (צ-ל-מ)           │  │ │ │
│                  │  │  │  └────────────────────────────────┘  │ │ │
│                  │  │  └──────────────────────────────────────┘ │ │
│                  │  │                                            │ │
│                  │  │  PRACTICE QUESTIONS:                      │ │
│                  │  │                                            │ │
│                  │  │  ┌──────────────────────────────────────┐ │ │
│                  │  │  │ Q1: בחר את הצורה הנכונה             │ │ │
│                  │  │  │ "הוא ___ את הסרט" (צ-ל-מ, פִּיעֵל)  │ │ │
│                  │  │  │                                      │ │ │
│                  │  │  │ ○ צָלַם   ○ צִילֵם   ○ צָלוּם       │ │ │
│                  │  │  └──────────────────────────────────────┘ │ │
│                  │  └────────────────────────────────────────────┘ │
├──────────────────┴──────────────────────────────────────────────────┤
│  BINYANIM REFERENCE TABLE (collapsible, always available)           │
│  פעל   פִּיעֵל   הִפְעִיל   הִתְפַּעֵל   נִפְעַל   פֻּעַל   הוּפְעַל   │
│  فعل   فعّل     أفعل      تفاعل     انفعل   فُعل    أُفعل    │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│ [← ←] نحو عبري           │
│ مهارتك اليوم: פִּיעֵל     │
├──────────────────────────┤
│ CONCEPT CARD             │
│ ┌──────────────────────┐ │
│ │  פִּיעֵל = فَعَّلَ       │ │
│ │  التكثيف والتعدية    │ │
│ │  [مثال] [أمثلة أكثر] │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ QUESTIONS (one at time)  │
│ ┌──────────────────────┐ │
│ │ سؤال 1 من 10         │ │
│ │ "הוא ___ את הסרט"   │ │
│ │                      │ │
│ │ [צָלַם] [צִילֵם]      │ │
│ │ [צָלוּם] [יְצַלֵּם]   │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ [مرجع البنيانيم] (sheet) │
├──────────────────────────┤
│ BOTTOM NAV               │
└──────────────────────────┘
```

### Binyanim Reference Sheet (Modal/Drawer)

```
┌─────────────────────────────────────────────────────────────────────┐
│  جدول البنيانيم السبعة — المرجع السريع                              │
├──────────┬──────────────┬──────────────────────────────────────────┤
│ البنيان  │ الوزن العربي │ المعنى والاستخدام                        │
├──────────┼──────────────┼──────────────────────────────────────────┤
│ פָּעַל    │    فَعَلَ    │ الفعل الأساسي البسيط                    │
│ פִּיעֵל   │   فَعَّلَ    │ التكثيف، التعدية                        │
│ הִפְעִיל │    أَفْعَلَ   │ الجعل (causative)                       │
│ הִתְפַּעֵל│   تَفَاعَلَ  │ الانعكاسي، التبادلي                     │
│ נִפְעַל   │   انْفَعَلَ  │ المجهول والانعكاسي                      │
│ פֻּעַל    │    فُعِّلَ   │ مجهول פִּיעֵל                           │
│ הוּפְעַל  │   أُفْعِلَ   │ مجهول הִפְעִיל                         │
└──────────┴──────────────┴──────────────────────────────────────────┘
[حفظ كصورة]  [فتح في تبويب جديد]
```

### Empty States, Error States, Loading States
*(Same patterns as Vocabulary screen — skeleton shimmer, inline errors, cached data on disconnect)*

### Accessibility
```
□ Binyanim table: proper table markup with headers
□ Arabic-Hebrew comparisons: both lang attributes
□ Question answers: radio group with legend
□ Reference sheet: dismissible dialog with focus trap
□ Color not sole differentiator for correct/wrong
```

### Psychological Triggers
```
COMPARATIVE INSIGHT:   Arabic = Hebrew shown side by side (pride not shame)
PATTERN RECOGNITION:   "أنت تعرف هذا الوزن بالفعل" reduces resistance
SKILL TREE PROGRESS:   Visual completion (93% on פעל) feels achievable
TARGETED AI:           "AI اختار هذه المهارة لأنها ترفع درجتك أكثر"
PRACTICAL FRAMING:     Examples always from YAEL exam contexts
```

### Gamification Elements
```
SKILL TREE:     Visual tree with unlock progression
MASTERY %:      Per-skill mastery displayed on skill tree
COMBO BONUS:    5 correct in a row = "سلسلة نحو! +50 XP إضافية"
BINYAN BADGES:  Badge per mastered binyan (7 total to collect)
```

---

## SCREEN 06 — READING COMPREHENSION (הבנת הנקרא)

### Goal
Build the ability to comprehend formal Modern Hebrew academic and literary texts at YAEL exam speed — the highest-weighted section — transforming it from the student's biggest fear into their strongest section.

### User Emotions
```
ENTERING:     Long passages feel overwhelming ("الكثير من الكلمات")
DURING:       Confusion → partial understanding → gradual clarity
AFTER:        If understood well: "شعرت بنفسي كقارئ عبري"
              If poor: needs encouragement, analysis of what failed

DESIGN RESPONSE:
  → Break passages into manageable chunks
  → Annotation tools reduce cognitive load
  → Passage vocabulary pre-taught before reading
  → Never show a passage without preparation
```

### Main CTA
**"اقرأ نص اليوم"** *(Read today's passage)*
- AI selects passage by type, difficulty, skill gap

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  فهم المقروء                                                        │
├────────────────┬────────────────────────────────────────────────────┤
│  PASSAGE       │  QUESTIONS + TOOLS                                │
│  PANEL (55%)   │  PANEL (45%)                                     │
│                │                                                    │
│  نوع النص:     │  الأسئلة:                                        │
│  [أكاديمي]     │                                                    │
│  الصعوبة: ●●●○○│  Q1/5 ────────────────────────────────           │
│  الوقت: ~6د    │                                                    │
│                │  ┌────────────────────────────────────────────┐   │
│  ─────────     │  │  (Hebrew question text, dir=ltr)          │   │
│                │  │  "מה עיקר הטענה שמציג הכותב בפסקה ב'?"   │   │
│  PASSAGE:      │  │                                            │   │
│                │  │  ○ א. הכלכלה הישראלית בצמיחה             │   │
│  [Hebrew text  │  │  ○ ב. יש בעיה בפערים החברתיים            │   │
│   in LTR       │  │  ○ ג. חינוך הוא המפתח לפתרון            │   │
│   island,      │  │  ○ ד. הממשלה לא מסייעת מספיק            │   │
│   selectable   │  │                                            │   │
│   text]        │  │  [تحقق من الإجابة ←]                      │   │
│                │  └────────────────────────────────────────────┘   │
│  [ANNOTATION   │                                                    │
│   TOOLBAR:     │  TOOLS:                                           │
│   🖊 ظلّل      │  ┌─────────────────────────────────────────────┐  │
│   📌 ملاحظة   │  │  [مفردات النص]     [مساعدة الفهم]          │  │
│   ❓ لا أعرف  │  │  Passage vocab     AI explain passage       │  │
│   المعنى]      │  └─────────────────────────────────────────────┘  │
│                │                                                    │
│  WORD TOOLTIP: │  ON CLICK (word selected in passage):            │
│  (click any    │  ────────────────────────────────────────────     │
│   word →       │  בעיה = مشكلة                                   │
│   instant      │  من جذر: ב-ע-ה                                  │
│   definition)  │  في العربية: لا يوجد جذر مشابه                │
│                │  [+ أضف لبطاقاتي]                               │
└────────────────┴────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│ [← ←] فهم المقروء        │
│ Q 1 من 5 · أكاديمي       │
├──────────────────────────┤
│ TAB BAR: [النص] [الأسئلة]│
├──────────────────────────┤
│ (TAB 1: TEXT)            │
│                          │
│ ┌──────────────────────┐ │
│ │ PASSAGE (Hebrew,     │ │
│ │ scrollable, large    │ │
│ │ 18px minimum)        │ │
│ │                      │ │
│ │ Tap word → tooltip   │ │
│ └──────────────────────┘ │
│ [Annotation tools strip] │
│ 🖊 📌 ❓                  │
├──────────────────────────┤
│ (TAB 2: QUESTIONS)       │
│                          │
│ Q1: "מה עיקר הטענה..."  │
│ [Option A] [Option B]    │
│ [Option C] [Option D]    │
│ [تحقق ←]                 │
├──────────────────────────┤
│ BOTTOM NAV               │
└──────────────────────────┘
```

### Pre-Reading Screen (Vocabulary Primer)
```
Before every passage, a 60-second vocabulary primer screen:

"قبل أن تقرأ — 5 كلمات مهمة في هذا النص"

שׁוֹנוּת = تنوع          מִימוּן = تمويل
פַּעֲרִים = فجوات          קוֹבֵעַ = يحدد
אִי-שׁוֹוְיוֹן = عدم مساواة

[جاهز للقراءة ←]
```

### Post-Reading Analysis Screen
```
After all questions answered:

"تحليل أداءك في هذا النص"

صحيح: 3/5
الوقت: 7:23

ما الذي أبطأك:
• سؤال 2: استغرق 2:45 (المتوسط 1:20)

ماذا يعني ذلك:
• قراءة النص المرة الأولى كانت كافية
• السؤال 2 كان عن الاستنتاج الضمني — مهارة تحتاج تدريباً

[شرح سؤال 2 بالعربية] [تدرب على الاستنتاج الضمني]
```

### Accessibility
```
□ Passage text: minimum 18px, line-height 1.8
□ Highlighting: keyboard accessible (select + H to highlight)
□ Word tooltip: triggered by click AND keyboard enter
□ Tab order: passage → tools → questions → submit
□ Questions: radio groups with visible focus ring
□ Time pressure: if timer exists, can be disabled in accessibility settings
```

### Psychological Triggers
```
PREPARATION:    Vocabulary primer removes "fear of unknown" before reading
ANNOTATION:     Highlighting gives sense of control and active engagement
WORD CLICK:     Instant tooltip removes frustration — no dictionary switching
ANALYSIS:       Post-reading analysis frames errors as data, not failure
TIME TRACKING:  Shown AFTER completion only (no anxiety during reading)
```

### Gamification Elements
```
SPEED READER BADGE:   Completed passage under target time
PERFECT READER BADGE: 5/5 on passage
PASSAGE TYPES:        Different badge per genre (academic/literary/journalistic)
STREAK:               Reading streak separate ("قرأت 7 نصوص هذا الأسبوع")
```

---

## SCREEN 07 — ESSAY / WRITING (כתיבה / كتابة)

### Goal
*[Note: YAEL as standardized test is MCQ-only. This screen serves students preparing for university writing requirements post-YAEL, or extended platform version for academic Hebrew writing preparation.]*

Help students write coherent, grammatically correct academic Hebrew paragraphs with AI feedback — building the written Hebrew skill that YAEL and university both demand.

### Main CTA
**"اكتب رداً على هذا الموضوع"** *(Write a response to this topic)*

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  كتابة أكاديمية بالعبرية                                           │
├──────────────────────────────────────────────────────────────────────┤
│  PROMPT CARD:                                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  الموضوع: "כתב/י פסקה על החשיבות של חינוך"               │    │
│  │  (اكتب فقرة عن أهمية التعليم)                             │    │
│  │  الهدف: فقرة واحدة · 80-120 كلمة · المستوى: YAEL 3       │    │
│  └─────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────┬───────────────────────────────┤
│  WRITING AREA                       │  AI FEEDBACK PANEL           │
│                                     │  (updates as you write)      │
│  ┌─────────────────────────────┐    │                              │
│  │  [Hebrew text input area]  │    │  النحو:        ████████  90%│
│  │  (dir=rtl input, Hebrew    │    │  المفردات:     ██████░░  72%│
│  │  keyboard prompt)          │    │  البنية:       █████░░░  65%│
│  │                            │    │                              │
│  │  Inline underlines:        │    │  ملاحظات:                   │
│  │  🔴 = grammar error        │    │  ✅ استخدام מכיוון שׁ صحيح  │
│  │  🟡 = better word exists   │    │  🔵 פועל → השכלה (أوضح)   │
│  │  🔵 = style suggestion     │    │  🔴 הילד/ים — خطأ جنس      │
│  │                            │    │                              │
│  │  Word count: 67/100        │    │  مستوى الكتابة:              │
│  └─────────────────────────────┘    │  YAEL 3 (الهدف ✅)          │
│                                     │                              │
│  [أدوات الكتابة]:                   │  [تحليل كامل ←]             │
│  [البنيانيم] [الربط] [مفردات أكاديمية]                           │
└─────────────────────────────────────┴───────────────────────────────┘
```

### AI Feedback Detail Screen
```
After submission, full AI analysis:

"تحليل كتابتك — AI"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 نصك الأصلي (مع التصحيحات):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Original text with corrections underlined]
[Strikethrough = removed] [Green = added]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ما فعلته جيداً:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• استخدام מכיוון שׁ (لأن) بشكل صحيح
• بنية الفقرة واضحة (موضوع → حجة → خلاصة)
• المفردات في مستوى YAEL 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 تحسينات مقترحة:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ילד (مذكر) → ילדה (مؤنث) — جنس الاسم
2. هناك كلمة أقوى من פועל هنا: השכלה
3. جملتك الأخيرة طويلة — قسّمها

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 تقدير الدرجة: 81/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[حاول مرة أخرى] [موضوع جديد] [احفظ هذه الكتابة]
```

---

## SCREEN 08 — PROFILE (פרופיל / ملف شخصي)

### Goal
Give students a meaningful, motivating record of their journey — not a settings page, but a **learning identity** that builds pride, tracks commitment, and surfaces the full arc of their progress.

### User Emotions
```
VISITING:     Reflective, measuring growth
AFTER MILESTONE: Pride ("أنا وصلت 100 كلمة متقنة")
AFTER SETBACK:  Checking if it's really that bad (reassurance needed)

DESIGN RESPONSE:
  → Lead with achievements and identity, not settings
  → Settings accessible but not the hero
  → Learning journey shown as a narrative story
```

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ملفي الشخصي                                                        │
├──────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  IDENTITY HEADER                                              │  │
│  │  ┌──────┐                                                     │  │
│  │  │ 👤   │  أحمد حسن                                          │  │
│  │  │ (pic)│  طالب في مرحلة YAEL 3                             │  │
│  │  └──────┘  عضو منذ: مارس 2025                               │  │
│  │                                                               │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │  │
│  │  │ 🔥   │ │ ⭐   │ │ 📚   │ │ 🏆   │                       │  │
│  │  │ 14   │ │ 2,840│ │ 340  │ │  8   │                       │  │
│  │  │يوم  │ │  XP  │ │كلمة │ │وسام │                       │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  JOURNEY TIMELINE:                                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  رحلتك حتى الآن                                              │  │
│  │                                                               │  │
│  │  📍 مارس 2025 — بدأت بدرجة 72                               │  │
│  │  ↓                                                            │  │
│  │  📈 أبريل — أتقنت البنيانيم الأساسية                       │  │
│  │  ↓                                                            │  │
│  │  🏆 مايو — تجاوزت 100 كلمة متقنة                           │  │
│  │  ↓                                                            │  │
│  │  📍 الآن — درجتك 87 · أنت تتقدم بسرعة                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  EXAM GOAL CARD:                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  هدف الامتحان                                                │  │
│  │  تاريخ الامتحان: 15 سبتمبر 2025                            │  │
│  │  الهدف: 120+  ·  الدرجة الحالية: 87                        │  │
│  │  التقدم المطلوب: 33 نقطة في 33 يوماً ✅ ممكن              │  │
│  │  [تعديل الهدف]                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  SETTINGS ACCESS (below — not hero):                                │
│  [⚙️ إعدادات الحساب] [🔔 الإشعارات] [📤 تصدير بياناتي]           │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│ [← ←] ملفي الشخصي        │
├──────────────────────────┤
│ IDENTITY CARD            │
│ 👤 أحمد حسن             │
│ YAEL 3 · منذ مارس 2025   │
│                          │
│ [🔥14] [⭐2840] [📚340]  │
│ [🏆 8 أوسمة]            │
├──────────────────────────┤
│ EXAM GOAL                │
│ ┌──────────────────────┐ │
│ │ 15 سبتمبر 2025       │ │
│ │ 87 → 120 (+33)       │ │
│ │ [تعديل]              │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ JOURNEY (simplified)     │
│ • بدأت: 72              │
│ • الآن: 87              │
│ • المسافة: +15 ✅        │
├──────────────────────────┤
│ SETTINGS                 │
│ [⚙️] [🔔] [📤] [🚪خروج] │
├──────────────────────────┤
│ BOTTOM NAV               │
└──────────────────────────┘
```

### Gamification Elements
```
LEVEL BADGE:     Displayed prominently as identity marker
XP TOTAL:        Cumulative — never resets (sense of investment)
STREAK:          Longest streak ever shown (not just current)
JOURNEY:         Narrative timeline frames progress as story
ACHIEVEMENT TEASER: "3 أوسمة قريبة" with progress bars
```

---

## SCREEN 09 — LEADERBOARD (לוח מובילים / لوحة المتصدرين)

### Goal
Create healthy social motivation through community comparison — without triggering shame in lower-ranked students — by offering multiple leaderboards where every student can see themselves near the top in *some* dimension.

### Design Philosophy for Leaderboards
```
CRITICAL RISK: Leaderboards damage motivation for students ranked low.
SOLUTION:      Multiple leaderboard types so every student has a "home" board.

TYPES:
1. السلسلة (Streak) — most consistent, not most capable
2. هذا الأسبوع (This Week) — resets, gives everyone a chance
3. المجموعة (Study Group) — small groups of 10–20 (opt-in)
4. منطقتي (My Region) — city/country based
5. مستواي (My Level) — YAEL level peer comparison
```

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  لوحة المتصدرين                                                     │
├──────────────────────────────────────────────────────────────────────┤
│  LEADERBOARD TYPE SELECTOR:                                          │
│  [السلسلة] [هذا الأسبوع ✓] [مجموعتي] [مستواي] [منطقتي]           │
├──────────────────────────────────────────────────────────────────────┤
│  HEADER: "هذا الأسبوع · يتجدد الإثنين"                             │
│                                                                      │
│  YOUR POSITION CARD (always visible, non-scrollable):               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  أنت في المرتبة #23 هذا الأسبوع  ⬆️ +5 من الأسبوع الماضي │    │
│  │  هذا الأسبوع: 840 XP             المحتاج للمرتبة #20: 120 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  PODIUM (top 3):                                                     │
│          🥇                                                          │
│      🥈      🥉                                                     │
│  سارة    مريم    يوسف                                               │
│  2,840   2,710   2,580                                               │
│  XP       XP      XP                                                │
│                                                                      │
│  LIST (4–50):                                                        │
│  ─────────────────────────────────────────────────────────────       │
│  #4   👤 حسن عبد الله        1,920 XP   🔥 12 يوم  ↑ 2           │
│  #5   👤 فاطمة الزهراء       1,840 XP   🔥 8 يوم   →             │
│  ...                                                                 │
│  ─────── [أنت هنا] ───────                                          │
│  #23  👤 أحمد حسن           840 XP    🔥 14 يوم   ↑ 5           │
│  ─────────────────────────────────────────────────────────────       │
│  ...                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Empty States
```
NEW USER (first week):
  "أنت جديد هنا — عودة بعد أسبوع لترى ترتيبك"
  [ابدأ الدراسة لكسب XP]

NO STUDY GROUP:
  "لم تنضم لأي مجموعة بعد"
  [ابحث عن مجموعة] [أنشئ مجموعة]
```

### Psychological Triggers
```
PEER PROXIMITY:   "المحتاج للمرتبة #20: 120 XP" — specific, achievable gap
RANK MOVEMENT:    ↑↓ arrows — movement matters more than absolute position
MULTIPLE BOARDS:  Every student finds a board where they're competitive
PRIVATE RANK:     User sees their own position always — not buried
WEEKLY RESET:     "يتجدد الإثنين" — fresh start every week removes ceiling
STREAK COLUMN:    Consistency shown alongside XP — different achievement type
```

### Gamification Elements
```
PODIUM ANIMATION: Top 3 animate in on load (spring animation)
RANK MOVEMENT:    ↑↑ = gold arrow, ↓↓ = subtle grey (not shaming)
WEEKLY TROPHY:    End of week: top 3 get animated trophy notification
GROUP CHALLENGE:  Group leaderboards have shared missions
```

---

## SCREEN 10 — ACHIEVEMENTS (הישגים / الإنجازات)

### Goal
Make progress visible, shareable, and personally meaningful — creating a collection of milestones that tells the student's Hebrew learning story and motivates continued effort through completion psychology.

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  إنجازاتي — 8 من أصل 52 وسام                                       │
├──────────────────────────────────────────────────────────────────────┤
│  FILTER: [الكل] [مفتوح ✓] [قيد التقدم] [مقفل]                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  UNLOCKED (8 badges — full color, celebratory):                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │  🌱     │ │  🔥     │ │  📚     │ │  ⚡     │                  │
│  │ المبتدئ │ │  7 أيام │ │  كتّب  │ │ سريع   │                  │
│  │ "اتممت  │ │ "سلسلة  │ │"100 كلمة│ │"<1دق/سؤ"│                  │
│  │  اختبار │ │ 7 أيام" │ │ مُتقنة" │ │         │                  │
│  │ التحديد"│ │         │ │         │ │         │                  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                  │
│  [+ 4 أخرى]                                                         │
│                                                                      │
│  IN PROGRESS (greyed, with progress bars):                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  🏆 "محترف المفردات" — أتقن 500 كلمة                      │    │
│  │  ████████████████░░░░░░░░░░░░░░  340/500                   │    │
│  │  "أنت على بعد 160 كلمة من هذا الوسام!"                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  📅 "المثابر" — سلسلة 30 يوم                               │    │
│  │  ██████████████░░░░░░░░░░░░░░░░  14/30                     │    │
│  │  "16 يوم متبقية — اكمل كل يوم!"                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  LOCKED (fully greyed, teaser only):                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                               │
│  │  🔒     │ │  🔒     │ │  🔒     │                               │
│  │  ???    │ │  ???    │ │  ???    │                               │
│  │  اقرأ  │ │  أكمل  │ │  ???   │                               │
│  │  30 نصاً│ │  YAEL4 │ │  ???   │                               │
│  └─────────┘ └─────────┘ └─────────┘                               │
│                                                                      │
│  [شارك إنجازاتي] → generates shareable card image                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Achievement Unlock Screen (Full-Screen Moment)
```
TRIGGERED: When any achievement is unlocked

Full screen overlay:
━━━━━━━━━━━━━━━━━━━━━━━━
     🎉 إنجاز جديد! 🎉
━━━━━━━━━━━━━━━━━━━━━━━━

     📚
  محترف المفردات

  "أتقنت 100 كلمة عبرية"

  +500 XP مكتسب
  المستوى الجديد: ماهر ⬆️

[شارك هذا الإنجاز] [متابعة]

(Confetti animation, 3 seconds)
```

### Psychological Triggers
```
COLLECTION:      52 badges total creates collection drive
NEAR-MISS:       Progress bars on "in progress" badges (endowment effect)
MYSTERY:         Locked badges with partial hints (curiosity gap)
SHAREABILITY:    One-tap shareable image (social identity reinforcement)
CELEBRATION:     Full-screen unlock moment (investment in the reward)
IDENTITY:        Badge names become identity: "أنا محترف المفردات"
```

---

## SCREEN 11 — STATISTICS (סטטיסטיקות / إحصائيات)

### Goal
Give analytically-minded students the depth they crave, and all students a clear picture of their real progress — making the abstract ("am I improving?") concrete and motivating.

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  إحصائياتي                                                          │
│  [أسبوع] [شهر ✓] [كل الوقت]                                        │
├──────────────────────────────────────────────────────────────────────┤
│  ROW 1: KEY METRICS                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 87       │ │ +15      │ │ 14 يوم   │ │ 34 ساعة │              │
│  │ درجتي    │ │ تقدمت    │ │ أطول سلسلة│ │ إجمالي  │              │
│  │          │ │ هذا الشهر│ │          │ │ وقت الدراسة│            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
├──────────────────────────────────────────────────────────────────────┤
│  SCORE TRAJECTORY (line chart):                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  درجة يعل المتوقعة - الشهر الأخير                            │  │
│  │                                                               │  │
│  │  120 ─── ─── ─── ─── ─── ─── ─── ─── [هدف]                 │  │
│  │                                                               │  │
│  │  100 ─── ─── ─── ─── ─── ─── ─── ──●                        │  │
│  │                                  ●                           │  │
│  │   80 ─── ─── ─── ─── ─── ──●                                │  │
│  │                         ●                                    │  │
│  │   72 ●                                                       │  │
│  │      ↑                                     ↑                │  │
│  │    بدأت                                  الآن              │  │
│  └───────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│  SECTION RADAR CHART:      │  ERROR PATTERN ANALYSIS:              │
│  ┌─────────────────┐       │  ┌──────────────────────────────────┐ │
│  │   فهم           │       │  │  أكثر أخطائك هذا الشهر:         │ │
│  │  المقروء        │       │  │                                  │ │
│  │                 │       │  │  1. جنس الاسم (ז/נ)    28%      │ │
│  │ إكمال   مفردات │       │  │  2. زمن المستقبل       22%      │ │
│  │ الجمل          │       │  │  3. مفردات أكاديمية    19%      │ │
│  │     النحو      │       │  │  4. استنتاج ضمني       16%      │ │
│  └─────────────────┘       │  └──────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│  STUDY HABIT HEATMAP (GitHub-style — 52 weeks):                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ يناير ── فبراير ── مارس ── أبريل ── مايو ── يونيو ──          │  │
│  │ □□□□□□ □□■□□□ □■■■□□ □■■■■■ ■■■■■□ ■■■■■□               │  │
│  │ (lighter = less study, darker = more study)                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  TIME ANALYSIS:                                                      │
│  متى تدرس عادةً؟  الأكثر إنتاجية: 8-9م (أخطاء أقل 18%)           │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
Scrollable card stack:
Card 1: Key metrics (4 numbers)
Card 2: Score trajectory chart
Card 3: Section radar
Card 4: Error patterns
Card 5: Study habit heatmap (scrollable horizontally)
Card 6: Time analysis
```

### Psychological Triggers
```
PROGRESS ANCHOR:   "بدأت بـ 72" always shown — reinforces how far they've come
SPECIFICITY:       "أخطاء جنس الاسم 28%" → actionable, not vague
OPTIMAL TIME:      "أنت أكثر إنتاجاً في 8م" → smart scheduling insight
MOMENTUM:          Trajectory chart always shows upward arc (if studying)
PATTERN INSIGHT:   Error analysis converts shame to strategy
```

---

## SCREEN 12 — SETTINGS (הגדרות / الإعدادات)

### Goal
Give users control over their experience without overwhelming them with options — settings should feel like personalization, not configuration.

### Layout (unified, single-page with sections)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← ←] الإعدادات                                                   │
├──────────────────────────────────────────────────────────────────────┤
│  SECTION: هدف الامتحان                                              │
│  ─────────────────────────────────────────────────────────────────  │
│  تاريخ امتحان يعل        [15 سبتمبر 2025 ✎]                       │
│  الدرجة المستهدفة        [120 ⌄]                                   │
│  مستوى يعل               [3 ⌄]                                     │
│                                                                      │
│  SECTION: جلسات الدراسة                                             │
│  ─────────────────────────────────────────────────────────────────  │
│  وقت الدراسة اليومي      [30 دقيقة ⌄]                              │
│  تذكيرات الدراسة         [⚫ مفعّل 8:00م ✎]                        │
│  يوم الراحة الأسبوعي     [الجمعة ⌄]                                │
│                                                                      │
│  SECTION: تجربة التعلم                                              │
│  ─────────────────────────────────────────────────────────────────  │
│  اللهجة العربية المفضلة  [عامية مصرية ⌄]                           │
│  عرض حركات النقود (ניקוד) [⚫ مفعّل]                              │
│  صوت عبري للمفردات       [⚫ مفعّل]                                │
│  الوضع الليلي            [○ معطّل]                                 │
│  حجم الخط                [ A  A⁺ A⁺⁺ ]                            │
│  تقليل الحركات           [○ معطّل] (accessibility)                 │
│                                                                      │
│  SECTION: الحساب والخصوصية                                          │
│  ─────────────────────────────────────────────────────────────────  │
│  البريد الإلكتروني       ahmed@example.com [تعديل]                 │
│  كلمة المرور             [تغيير]                                   │
│  تصدير بياناتي           [⤓ تحميل JSON]                            │
│  حذف حسابي               [⛔ حذف] (destructive — requires confirm)  │
│                                                                      │
│  SECTION: عن المنصة                                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  الإصدار: 1.4.2                                                     │
│  [سياسة الخصوصية] [شروط الاستخدام] [تواصل معنا]                    │
│  [GitHub — المصدر المفتوح] ← reinforces trust                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Destructive Action (Delete Account) Confirmation
```
MODAL:
"حذف حسابك نهائياً"

⚠️ هذا الإجراء لا يمكن التراجع عنه.

ستفقد:
• كل تقدمك وإحصائياتك
• 340 كلمة متقنة
• 8 أوسمة مكتسبة
• 14 يوم سلسلة

اكتب "حذف" للتأكيد:
[____________]

[إلغاء — احتفظ بحسابي]    [حذف نهائي ⛔]
(cancel is blue, delete is red, delete disabled until text matches)
```

---

## SCREEN 13 — ADMIN PANEL (לוח ניהול / لوحة الإدارة)

### Goal
Give platform administrators a comprehensive, data-driven control center to manage content quality, monitor platform health, and improve the AI system — without needing engineering access for routine tasks.

### Who Uses This
```
CONTENT ADMIN:    Manages question bank, reviews AI explanations
PLATFORM ADMIN:   Monitors usage, health, moderation
AI QUALITY LEAD:  Reviews and rates AI-generated explanations
```

### Desktop Layout (Multi-Section)

```
┌─────────────────────────────────────────────────────────────────────┐
│  لوحة الإدارة                                    🔴 ADMIN MODE    │
├──────────────────────────────────────────────────────────────────────┤
│  [📊 الرئيسية] [❓ الأسئلة] [🤖 شرح AI] [👤 المستخدمون] [⚕ الصحة]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TAB 1: DASHBOARD (PLATFORM HEALTH)                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  المستخدمون النشطون اليوم: 1,240                                    │
│  جلسات هذا الأسبوع: 8,420                                           │
│  معدل الإكمال: 73%                                                  │
│  تكلفة AI اليوم: $1.24 (2,480 طلب · 94% من الكاش)                 │
│  [تنبيه: معدل الأخطاء في AI Explanation ارتفع 2%]                  │
│                                                                      │
│  SCORE DISTRIBUTION CHART:                                           │
│  كيف يتوزع المتعلمون على المستويات                                  │
│  50-69: ████ 18%                                                    │
│  70-89: ████████████ 52%                                            │
│  90-109: ████████ 24%                                                │
│  110+:   ██ 6%                                                       │
│                                                                      │
│  TAB 2: QUESTION BANK                                                │
│  ─────────────────────────────────────────────────────────────────  │
│  إجمالي الأسئلة: 840 | نشط: 803 | معلّق: 37 | مُعلَّم: 12         │
│                                                                      │
│  FILTER: [القسم ⌄] [المستوى ⌄] [الصعوبة ⌄] [المُعلَّمة] [بحث]     │
│                                                                      │
│  QUESTION TABLE:                                                     │
│  ID    │ نص السؤال     │ القسم    │ الصعوبة │ صحيح% │ الحالة │فعل  │
│  Q0042 │ "בחר משמעות" │ מילון    │ 0.65    │ 71%   │ ✅نشط  │[✎][🗑]│
│  Q0043 │ "מה פירוש..." │ מילון    │ 0.82    │ 44%   │ ⚠️صعب │[✎][🗑]│
│  (12 rows per page, pagination)                                     │
│                                                                      │
│  [+ إضافة سؤال جديد]  [📤 استيراد CSV]  [📥 تصدير]                │
│                                                                      │
│  TAB 3: AI EXPLANATION REVIEW QUEUE                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  في الانتظار: 47 شرح جديد بحاجة مراجعة                             │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  السؤال: "מה פירוש המילה שלם?"                               │  │
│  │  الإجابة الخاطئة التي اختارها: "שלום"                        │  │
│  │                                                               │  │
│  │  شرح AI (عربي):                                              │  │
│  │  "كلمة שלם تعني 'كامل' أو 'تام'، وليس שלום..."              │  │
│  │                                                               │  │
│  │  جسر عربي-عبري:                                              │  │
│  │  "في العربية: سَلِمَ = كان سالماً · العبرية: שָׁלֵם = كامل"    │  │
│  │                                                               │  │
│  │  التقييم: [⭐ ممتاز] [👍 جيد] [✏️ يحتاج تعديل] [🗑 رفض]    │  │
│  │  ملاحظة:  [_______________________________]                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  TAB 4: USERS (Anonymized)                                           │
│  ─────────────────────────────────────────────────────────────────  │
│  FILTER: [مستوى يعل ⌄] [الدولة ⌄] [آخر نشاط ⌄]                   │
│  Stats visible: Score distribution, Study time, Section performance │
│  NO PII visible: No names, no emails in main table                  │
│                                                                      │
│  TAB 5: PLATFORM HEALTH                                              │
│  ─────────────────────────────────────────────────────────────────  │
│  API Response Times: p50=82ms · p95=340ms · p99=820ms              │
│  Error Rate: 0.12%                                                   │
│  AI Cache Hit Rate: 94.2% (target: >85%)                            │
│  Daily AI Cost: $1.24 (target: <$5.00)                              │
│  Active Sessions Right Now: 42                                       │
│  [Supabase Dashboard →] [Vercel Dashboard →] [Sentry →]             │
└─────────────────────────────────────────────────────────────────────┘
```

### Add/Edit Question Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  إضافة سؤال جديد                                            [✕]    │
├──────────────────────────────────────────────────────────────────────┤
│  SECTION     [مفردات ⌄]    YAEL LEVEL [3 ⌄]    SKILL [אוצר מילים ⌄]│
│                                                                      │
│  نص السؤال (عبري):                                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ בחר את המשמעות הנכונה של המילה "שָׁלֵם"                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  النص المقطعي (اختياري، لأسئلة الفهم):                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ [فارغ]                                                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  خيارات الإجابة:    ✓ = الصحيحة                                    │
│  [א] __________________ [✓]                                         │
│  [ב] __________________                                             │
│  [ג] __________________                                             │
│  [ד] __________________                                             │
│                                                                      │
│  صعوبة IRT (b-parameter): [0.65] ←──── slider                      │
│  جذر كلمة (إن وجد):       [ש-ל-מ]                                  │
│  تاغات: [YAEL3] [مفردات] [+ إضافة]                                 │
│                                                                      │
│  معاينة تلقائية لشرح AI:  [توليد شرح تجريبي]                       │
│                                                                      │
│  [إلغاء]                              [حفظ السؤال]                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Admin Access Control
```
SECURITY INDICATORS:
  → Red "ADMIN MODE" banner always visible (prevents accidental actions)
  → All destructive actions require typed confirmation
  → Audit log of all admin actions
  → Admin session: 4-hour timeout (re-authentication required)
  → No admin actions possible from mobile (intentional friction)
```

---

## UNIVERSAL STATES & PATTERNS

### Global Loading Skeleton Template
```
All loading states use shimmer skeletons:
  Background: #E5E1D8 (warm, not cold grey)
  Shimmer direction: right-to-left (RTL consistency)
  Duration: 1.5s loop
  No spinners in primary content areas
  Spinners only in buttons and small inline loads
```

### Global Error Toast System
```
POSITION:     Top-center on desktop, top on mobile (RTL aware)
TYPES:
  SUCCESS:    Green left border, checkmark icon, 3s auto-dismiss
  ERROR:      Rose left border, 🔴, stays until dismissed
  WARNING:    Amber left border, ⚠️, 5s auto-dismiss
  INFO:       Blue left border, ℹ️, 4s auto-dismiss

FORMAT:       [Icon] [Arabic message] [Action link if applicable] [✕]
MAX ON SCREEN: 3 at once (oldest dismissed first)
```

### Global Empty State Design Language
```
ILLUSTRATION:  Custom illustrations, warm palette, abstract (not cartoonish)
               Shows concept, not failure
HEADLINE:      Positive framing ("لا يوجد بعد" not "لا يوجد شيء")
ACTION:        Always one clear next step
TONE:          Encouraging, not apologetic
```

### Offline State (PWA)
```
GLOBAL BANNER (subtle, dismissible):
"أنت غير متصل بالإنترنت — تعمل ببيانات محفوظة"

WHAT WORKS OFFLINE:
✅ Cached practice questions (last 100)
✅ Vocabulary flashcards (all downloaded cards)
✅ Grammar reference
✅ Reading passages (cached)

WHAT DOESN'T WORK:
❌ AI explanations (cached explanations still work)
❌ Leaderboard
❌ Score sync (queued, syncs on reconnect)
❌ AI tutor
```

### RTL / Bidirectional Text Rules (Universal)
```
RULE 1: All navigation flows right → left (back arrow points right ←)
RULE 2: Hebrew text always in dir="ltr" islands
RULE 3: Numbers: always LTR (even in RTL sentences)
RULE 4: Icons: mirrored where semantic (arrows, chevrons, progress bars)
         NOT mirrored: checkmarks, warning icons, avatars
RULE 5: Lists flow right-to-left (bullets on right)
RULE 6: Form inputs: RTL by default, LTR override for emails/passwords
RULE 7: Charts: Y-axis on right, X-axis reads right-to-left
RULE 8: Swipe gestures: swipe left = forward (mirrors reading direction)
```

### Micro-Interaction Library
```
CORRECT ANSWER:
  1. Option card background → emerald (120ms)
  2. Checkmark icon draws (180ms)
  3. Card scales 1.0 → 1.02 → 1.0 (spring, 200ms)
  4. "+10 XP" floats up from card, fades (400ms)
  5. Haptic feedback (mobile): success pattern

WRONG ANSWER:
  1. Option card background → rose-bg (120ms)
  2. X icon appears (100ms)
  3. Card shakes horizontally ±4px × 3 (200ms total)
  4. Correct answer highlights emerald simultaneously
  5. Haptic: error pattern (single pulse, not aggressive)

STREAK CONTINUATION:
  Fire icon pulses and grows briefly when streak maintained

LEVEL UP:
  Full-screen confetti (3 seconds, respects prefers-reduced-motion)
  Sound optional (opt-in, muted by default)

BADGE UNLOCK:
  Full-screen overlay with spring-in badge animation
  Badge "stamps" into position (rotation + scale)
```

---

## DESIGN PRINCIPLES SUMMARY

```
╔═══════════════════════════════════════════════════════════════════╗
║           THE 10 COMMANDMENTS OF YAEL PLATFORM UX               ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  I.    Arabic is not a translation — it's the primary language.  ║
║                                                                   ║
║  II.   Reduce anxiety first, then teach.                         ║
║                                                                   ║
║  III.  Every screen answers: "What should I do right now?"       ║
║                                                                   ║
║  IV.   Show distance traveled, not distance remaining.           ║
║                                                                   ║
║  V.    The Arabic-Hebrew bridge is always one click away.        ║
║                                                                   ║
║  VI.   Wrong answers are data, not failures.                     ║
║                                                                   ║
║  VII.  The platform celebrates consistency over performance.     ║
║                                                                   ║
║  VIII. Every empty state is an invitation, not a dead end.       ║
║                                                                   ║
║  IX.   Gamification serves learning. Never the reverse.          ║
║                                                                   ║
║  X.    If it needs explaining, it needs redesigning.             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

*This specification is the contract between product vision and engineering execution. Every pixel decision above traces back to one mission: maximizing each student's probability of achieving 120+ on the YAEL exam.*