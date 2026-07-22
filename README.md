# YAEL AI Platform

منصة متقدمة لتعليم اللغة العبرية بالاعتماد على الذكاء الاصطناعي وتقنيات التعلم التكيفي.
An advanced AI-powered platform for learning Hebrew using adaptive learning techniques.

## Features (الميزات)
- **Adaptive Learning Engine**: Item Response Theory (IRT) and Bayesian Knowledge Tracing (BKT) to model student knowledge.
- **Spaced Repetition (FSRS)**: Optimal flashcard scheduling for vocabulary retention.
- **AI-Powered Chat**: Real-time contextual tutor for grammar and vocabulary.
- **Gamification**: Streaks, XP, levels, and badges.
- **Full RTL Support**: Optimized for Arabic speaking learners.

## Tech Stack (التقنيات المستخدمة)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Database / Auth**: Supabase
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **AI Models**: Groq (Llama 3 / Mixtral)

## Setup Instructions (تعليمات التثبيت)

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and configure your environment variables.
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables (متغيرات البيئة)
Create a `.env.local` file with the following:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for cron/admin tasks)
- `GROQ_API_KEY`: API key for Groq AI
- `NEXT_PUBLIC_APP_URL`: The URL of your application (e.g., http://localhost:3000)
- `NEXT_PUBLIC_APP_ENV`: Environment ('development', 'staging', 'production')
- `CRON_SECRET`: Optional secret for Vercel Cron authentication

## Deployment Guide (دليل النشر)
This project is optimized for deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. Add all environment variables from your `.env.local` into the Vercel dashboard.
3. Deploy! Vercel will automatically read `vercel.json` to setup the cron jobs.
