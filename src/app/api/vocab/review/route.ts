import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { scheduleCard, type FSRSCard, type FSRSRating } from '@/lib/adaptive/fsrs';

const ReviewSchema = z.object({
  userVocabId: z.string().uuid(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  responseTimeMs: z.number().min(0),
});

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { userVocabId, rating, responseTimeMs } = parsed.data;
  const supabaseAdmin = createAdminClient();

  // Fetch current user_vocabulary
  const { data: vocabState } = await supabaseAdmin
    .from('user_vocabulary')
    .select('*')
    .eq('id', userVocabId)
    .eq('user_id', user.id)
    .single();

  if (!vocabState) return NextResponse.json({ error: 'Vocabulary card not found' }, { status: 404 });

  const card: FSRSCard = {
    due: new Date(vocabState.next_review_at || Date.now()),
    stability: vocabState.fsrs_stability,
    difficulty: vocabState.fsrs_difficulty,
    elapsed_days: vocabState.fsrs_elapsed_days,
    scheduled_days: vocabState.fsrs_scheduled_days,
    reps: vocabState.fsrs_reps,
    lapses: vocabState.fsrs_lapses,
    state: vocabState.fsrs_state as 'New' | 'Learning' | 'Review' | 'Relearning',
    last_review: vocabState.last_review_at ? new Date(vocabState.last_review_at) : undefined,
  };

  const now = new Date();
  const nextCard = scheduleCard(card, rating as FSRSRating, now);

  // Save review history
  await supabaseAdmin.from('vocab_reviews').insert({
    user_vocab_id: userVocabId,
    rating: rating,
    response_time_ms: responseTimeMs,
    stability_before: card.stability,
    stability_after: nextCard.stability,
    difficulty_before: card.difficulty,
    difficulty_after: nextCard.difficulty,
    interval_days: nextCard.scheduled_days,
  });

  // Update user_vocabulary
  await supabaseAdmin.from('user_vocabulary').update({
    fsrs_stability: nextCard.stability,
    fsrs_difficulty: nextCard.difficulty,
    fsrs_elapsed_days: nextCard.elapsed_days,
    fsrs_scheduled_days: nextCard.scheduled_days,
    fsrs_reps: nextCard.reps,
    fsrs_lapses: nextCard.lapses,
    fsrs_state: nextCard.state,
    last_review_at: nextCard.last_review?.toISOString() || now.toISOString(),
    next_review_at: nextCard.due.toISOString(),
    total_reviews: vocabState.total_reviews + 1,
  }).eq('id', userVocabId);

  // Update daily activity
  await supabaseAdmin.rpc('upsert_daily_activity', { 
    p_user_id: user.id,
    p_study_time_minutes: responseTimeMs / 60000,
    p_questions_answered: 0,
    p_correct_answers: 0,
    p_xp_earned: rating > 1 ? 2 : 0, // small xp for vocab
  });

  // Update user_progress xp for vocab
  if (rating > 1) {
    const { data: progress } = await supabaseAdmin.from('user_progress').select('xp').eq('user_id', user.id).single();
    if (progress) {
      await supabaseAdmin.from('user_progress').update({ xp: progress.xp + 2 }).eq('user_id', user.id);
    }
  }

  return NextResponse.json({
    nextReviewDate: nextCard.due.toISOString(),
    intervalDays: nextCard.scheduled_days,
    newState: nextCard.state,
  });
}
