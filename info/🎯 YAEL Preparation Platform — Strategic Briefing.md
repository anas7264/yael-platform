# 🎯 YAEL Preparation Platform — Strategic Briefing

Understood. The team is assembled. Before writing a single line of code or designing a single screen, let's align on what "world's best" actually means here — then ask you where you want to begin.

---

## What is YAEL, and Why Does This Matter?

**YAEL (יע"ל)** is Israel's standardized Hebrew proficiency exam for non-native speakers, administered by RAMA (הרשות הארצית למדידה והערכה). It gates access to Israeli universities and colleges for hundreds of thousands of new immigrants, international students, and olim. The existing preparation resources are:

- Fragmented, paid, or low quality
- Not adaptive or data-driven
- Not accessible or mobile-first
- Not available in multiple interface languages
- Not rooted in actual YAEL psychometrics

This is a real gap with real human impact.

---

## Platform Vision — Pillars of Excellence

| Pillar | What it means for YAEL |
|---|---|
| **Authentic Assessment** | Questions mirror real YAEL structure, difficulty, and Hebrew register |
| **Adaptive Learning** | The system learns each student's weak zones and targets them |
| **Spaced Repetition** | Vocabulary built to last, not crammed |
| **Full RTL/Hebrew UX** | Not an afterthought — the primary design axis |
| **Multi-language UI** | Russian, Arabic, English, French, Amharic — who actually takes YAEL? |
| **Zero Cost, No Paywalls** | Truly free, sustainable via open source or sponsorship |
| **Privacy First** | No selling data, GDPR + Israeli privacy law compliant |
| **Offline Capable** | Not everyone has stable internet in absorption centers |
| **Accessibility** | WCAG 2.1 AA minimum, screen reader support in Hebrew |

---

## Proposed System Architecture (Bird's Eye)

```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
│         Web (Next.js / RTL)  ·  PWA (Offline)          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  APPLICATION LAYER                      │
│   Auth · Session Engine · Adaptive Engine · Analytics   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     DATA LAYER                          │
│   Question Bank · User Progress · Vocab · Explanations  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  AI/INTELLIGENCE LAYER                  │
│       Explanation Generation · Difficulty Calibration   │
└─────────────────────────────────────────────────────────┘
```

**Stack recommendation (cost-optimized, scalable):**
- **Frontend:** Next.js 14+ with full RTL (dir="rtl"), Tailwind
- **Backend:** Next.js API routes → Supabase (Postgres + Auth + Realtime)
- **AI:** Claude API (explanations, adaptive hints)
- **Hosting:** Vercel (free tier → scales cleanly)
- **CDN:** Vercel Edge Network
- **Monitoring:** Vercel Analytics + Sentry (free tiers)

---

## YAEL Exam Structure We Must Cover

| Section | Hebrew | Notes |
|---|---|---|
| Reading Comprehension | הבנת הנקרא | Multiple passage types, registers |
| Vocabulary | אוצר מילים | Root system, context, synonyms |
| Grammar | דקדוק | Binyanim, tenses, agreement |
| Sentence Completion | השלמת משפטים | Syntax + logic |
| Text Reconstruction | שחזור טקסט | YAEL 4-5 only |

Levels: **YAEL 1 → YAEL 5**, each with different passing thresholds per institution.

---

## Before We Build Anything — I Need From You:

**1. Where do you want to start?**
- [ ] Product spec & user stories
- [ ] Database schema design
- [ ] UI/UX wireframes (RTL-first)
- [ ] Question bank structure & first questions
- [ ] Authentication & user flow
- [ ] Full MVP build (code)
- [ ] Adaptive learning engine design
- [ ] Something else entirely

**2. What already exists?**
- Do you have any question content, or are we building from scratch?
- Any existing designs, codebases, or constraints?

**3. Who is the primary user we're optimizing for first?**
- New oleh (עולה) preparing for university?
- International student?
- Someone retaking to improve their score?

---

The team is ready. What's the first move?