import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { predictYAELScore } from '@/lib/adaptive/score-prediction';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabaseAdmin = createAdminClient();

  const { data: progress } = await supabaseAdmin
    .from('user_progress')
    .select('level, reading_mastery, vocabulary_mastery, writing_mastery, spelling_mastery')
    .eq('user_id', user.id)
    .single();

  if (!progress) return NextResponse.json({ error: 'Progress not found' }, { status: 404 });

  const studentTheta = (progress.level || 1) / 10;

  const score = predictYAELScore({
    studentTheta,
    mastery: {
      reading: (progress.reading_mastery || 0) / 100,
      vocabulary: (progress.vocabulary_mastery || 0) / 100,
      writing: (progress.writing_mastery || 0) / 100,
      spelling: (progress.spelling_mastery || 0) / 100,
    }
  });

  await supabaseAdmin
    .from('user_progress')
    .update({ predicted_score: score })
    .eq('user_id', user.id);

  return NextResponse.json({
    predictedScore: score,
    theta: studentTheta,
    mastery: {
      reading: progress.reading_mastery,
      vocabulary: progress.vocabulary_mastery,
      writing: progress.writing_mastery,
      spelling: progress.spelling_mastery,
    }
  });
}
