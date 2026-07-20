import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateBKT, getMasteryLevel, BKT_DEFAULTS } from '@/lib/adaptive/bkt';
import { selectNextQuestion, type QuestionCandidate } from '@/lib/adaptive/question-selector';
import { withAuthRateLimitValidation } from '@/lib/api/middleware';
import { AppError } from '@/lib/api/errors';

const SubmitSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedOption: z.string(),
  responseTimeMs: z.number().optional(),
});

type SubmitBody = z.infer<typeof SubmitSchema>;

async function submitHandler(_req: NextRequest, user: User, body: SubmitBody): Promise<NextResponse> {
  const { sessionId, questionId, selectedOption, responseTimeMs } = body;
  const supabaseAdmin = createAdminClient();

  const { data: question } = await supabaseAdmin.from('questions').select('*').eq('id', questionId).single();
  if (!question) throw new AppError('NOT_FOUND', 'Question not found');

  const isCorrect = question.correct_option === selectedOption;

  await supabaseAdmin.from('practice_answers').insert({
    session_id: sessionId,
    question_id: questionId,
    user_id: user.id,
    selected_option: selectedOption as 'A' | 'B' | 'C' | 'D' | 'SKIP',
    is_correct: isCorrect,
    response_time_ms: responseTimeMs || null,
    hints_used: 0,
    explanation_viewed: false,
  });

  const { data: kcMastery } = await supabaseAdmin
    .from('user_kc_mastery')
    .select('*')
    .eq('user_id', user.id)
    .eq('kc_id', question.kc_id)
    .single();

  const bktParams = {
    pLearned: kcMastery?.p_learned ?? BKT_DEFAULTS.pLearned,
    pTransit: kcMastery?.p_transit ?? BKT_DEFAULTS.pTransit,
    pSlip:    kcMastery?.p_slip    ?? BKT_DEFAULTS.pSlip,
    pGuess:   kcMastery?.p_guess   ?? BKT_DEFAULTS.pGuess,
  };

  const bktResult = updateBKT(bktParams, isCorrect);
  const newMasteryLevel = getMasteryLevel(bktResult.pLearned_new);

  if (kcMastery) {
    await supabaseAdmin.from('user_kc_mastery').update({
      p_learned:        bktResult.pLearned_new,
      mastery_level:    newMasteryLevel,
      total_attempts:   kcMastery.total_attempts + 1,
      correct_attempts: kcMastery.correct_attempts + (isCorrect ? 1 : 0),
      last_practiced_at: new Date().toISOString(),
    }).eq('id', kcMastery.id);
  } else {
    await supabaseAdmin.from('user_kc_mastery').insert({
      user_id:          user.id,
      kc_id:            question.kc_id,
      p_learned:        bktResult.pLearned_new,
      p_transit:        bktParams.pTransit,
      p_slip:           bktParams.pSlip,
      p_guess:          bktParams.pGuess,
      irt_ability:      0,
      total_attempts:   1,
      correct_attempts: isCorrect ? 1 : 0,
      mastery_level:    newMasteryLevel,
      last_practiced_at: new Date().toISOString(),
    });
  }

  let xpEarned = 0;
  if (isCorrect) {
    if (question.difficulty < -0.5) xpEarned = 5;
    else if (question.difficulty > 1.0) xpEarned = 15;
    else xpEarned = 10;
  }

  const { data: progress } = await supabaseAdmin.from('user_progress').select('*').eq('user_id', user.id).single();
  if (progress) {
    await supabaseAdmin.from('user_progress').update({
      xp:                       progress.xp + xpEarned,
      total_questions_answered: progress.total_questions_answered + 1,
      total_correct_answers:    progress.total_correct_answers + (isCorrect ? 1 : 0),
    }).eq('id', progress.id);
  }

  await supabaseAdmin.rpc('calculate_level', { p_user_id: user.id });
  await supabaseAdmin.rpc('upsert_daily_activity', {
    p_user_id:           user.id,
    p_study_time_minutes: (responseTimeMs || 0) / 60000,
    p_questions_answered: 1,
    p_correct_answers:    isCorrect ? 1 : 0,
    p_xp_earned:          xpEarned,
  });

  await supabaseAdmin.from('questions').update({
    times_shown:   (question.times_shown || 0) + 1,
    times_correct: (question.times_correct || 0) + (isCorrect ? 1 : 0),
  }).eq('id', question.id);

  const { data: session } = await supabaseAdmin.from('practice_sessions').select('*').eq('id', sessionId).single();
  if (session) {
    await supabaseAdmin.from('practice_sessions').update({
      correct_answers: session.correct_answers + (isCorrect ? 1 : 0),
      xp_earned:       session.xp_earned + xpEarned,
    }).eq('id', sessionId);
  }

  const { data: answers } = await supabaseAdmin.from('practice_answers').select('question_id').eq('session_id', sessionId);
  const answeredQuestionIds = new Set(answers?.map((a: { question_id: string }) => a.question_id) || []);

  const { data: masteries } = await supabaseAdmin.from('user_kc_mastery').select('kc_id, p_learned').eq('user_id', user.id);
  const kcs = (masteries || []).map((m: { kc_id: string; p_learned: number }) => ({ id: m.kc_id, pLearned: m.p_learned }));

  const { data: questionsRaw } = await supabaseAdmin
    .from('questions')
    .select('id, kc_id, discrimination, difficulty, guessing, text_hebrew, option_a_hebrew, option_b_hebrew, option_c_hebrew, option_d_hebrew, correct_option')
    .eq('section', session?.section || question.section)
    .eq('is_active', true);

  const candidates: QuestionCandidate[] = (questionsRaw || []).map((q: { id: string; kc_id: string; discrimination: number; difficulty: number; guessing: number }) => ({
    id: q.id,
    kcId: q.kc_id,
    a: q.discrimination,
    b: q.difficulty,
    c: q.guessing,
  }));

  const studentTheta = (progress?.level || 1) / 10;
  const nextQ = selectNextQuestion({ studentTheta, answeredQuestionIds, kcs, questions: candidates });
  const fullNextQuestion = questionsRaw?.find((q: { id: string }) => q.id === nextQ?.id);

  return NextResponse.json({
    isCorrect,
    correctOption: question.correct_option,
    xpEarned,
    masteryUpdate: { newLevel: newMasteryLevel, pLearned: bktResult.pLearned_new },
    nextQuestion: fullNextQuestion || null,
  });
}

export const POST = withAuthRateLimitValidation(SubmitSchema, 'practice', submitHandler);
