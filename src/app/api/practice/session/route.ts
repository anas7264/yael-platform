import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { planSession } from '@/lib/adaptive/session-planner';
import { selectNextQuestion, type QuestionCandidate } from '@/lib/adaptive/question-selector';
import type { YAELSection } from '@/types/database';

const SessionSchema = z.object({
  section: z.string(),
  questionsCount: z.number().min(1).max(50).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = SessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { section, questionsCount } = parsed.data;
  const supabaseAdmin = createAdminClient();

  // Profile
  const { data: profile } = await supabaseAdmin.from('profiles').select('daily_study_minutes').eq('id', user.id).single();
  const dailyStudyMinutes = profile?.daily_study_minutes || 15;

  // KC Mastery
  const { data: masteries } = await supabaseAdmin
    .from('user_kc_mastery')
    .select('kc_id, p_learned')
    .eq('user_id', user.id);

  const { data: questionsRaw } = await supabaseAdmin
    .from('questions')
    .select('id, kc_id, discrimination, difficulty, guessing, text_hebrew, option_a_hebrew, option_b_hebrew, option_c_hebrew, option_d_hebrew, correct_option')
    .eq('section', section)
    .eq('is_active', true);

  if (!questionsRaw || questionsRaw.length === 0) {
    return NextResponse.json({ error: 'No active questions found for this section' }, { status: 404 });
  }

  const kcs = (masteries || []).map((m: { kc_id: string; p_learned: number }) => ({ id: m.kc_id, pLearned: m.p_learned }));
  const sessionPlan = planSession({
    dailyStudyMinutes: questionsCount ? questionsCount * 1.5 : dailyStudyMinutes,
    kcs
  });
  
  if (questionsCount) {
    sessionPlan.totalQuestions = questionsCount;
  }

  // Create session
  const { data: sessionData, error: sessionError } = await supabaseAdmin
    .from('practice_sessions')
    .insert({
      user_id: user.id,
      section: section as YAELSection,
      session_type: 'practice',
      total_questions: sessionPlan.totalQuestions,
      correct_answers: 0,
      xp_earned: 0,
      is_completed: false,
    })
    .select('id')
    .single();

  if (sessionError || !sessionData) return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });

  const { data: progress } = await supabaseAdmin.from('user_progress').select('level').eq('user_id', user.id).single();
  const studentTheta = (progress?.level || 1) / 10; 

  const candidates: QuestionCandidate[] = questionsRaw.map((q: { id: string; kc_id: string; discrimination: number; difficulty: number; guessing: number }) => ({
    id: q.id,
    kcId: q.kc_id,
    a: q.discrimination,
    b: q.difficulty,
    c: q.guessing
  }));

  const firstQuestion = selectNextQuestion({
    studentTheta,
    answeredQuestionIds: new Set(),
    kcs,
    questions: candidates
  });

  const fullFirstQuestion = questionsRaw.find((q: { id: string }) => q.id === firstQuestion?.id);

  return NextResponse.json({
    sessionId: sessionData.id,
    firstQuestion: fullFirstQuestion,
    sessionPlan,
  });
}
