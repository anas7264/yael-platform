import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const CompleteSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { sessionId } = parsed.data;
  const supabaseAdmin = createAdminClient();

  const { data: session } = await supabaseAdmin.from('practice_sessions').select('*').eq('id', sessionId).single();
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const { data: answers } = await supabaseAdmin.from('practice_answers').select('is_correct, response_time_ms').eq('session_id', sessionId);
  const totalAnswered = answers?.length || 0;
  const correctCount = answers?.filter((a: { is_correct: boolean }) => a.is_correct).length || 0;
  
  const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
  const isPerfect = totalAnswered > 0 && correctCount === totalAnswered;
  const bonusXp = isPerfect ? 25 : 0;
  const totalXp = session.xp_earned + bonusXp;

  const durationMs = answers?.reduce((acc: number, curr: { response_time_ms: number | null }) => acc + (curr.response_time_ms || 0), 0) || 0;

  await supabaseAdmin.from('practice_sessions').update({
    is_completed: true,
    accuracy,
    xp_earned: totalXp,
    duration_seconds: Math.round(durationMs / 1000),
    completed_at: new Date().toISOString(),
  }).eq('id', sessionId);

  if (bonusXp > 0) {
    const { data: progress } = await supabaseAdmin.from('user_progress').select('xp').eq('user_id', user.id).single();
    if (progress) {
      await supabaseAdmin.from('user_progress').update({ xp: progress.xp + bonusXp }).eq('user_id', user.id);
    }
  }

  await supabaseAdmin.rpc('update_user_streak', { p_user_id: user.id });
  
  const { data: kcs } = await supabaseAdmin.from('knowledge_components').select('id').eq('section', session.section);
  if (kcs && kcs.length > 0) {
    const kcIds = kcs.map((k: { id: string }) => k.id);
    const { data: masteries } = await supabaseAdmin.from('user_kc_mastery').select('p_learned').eq('user_id', user.id).in('kc_id', kcIds);
    if (masteries && masteries.length > 0) {
      const sum = masteries.reduce((acc: number, m: { p_learned: number }) => acc + m.p_learned, 0);
      const avg = sum / kcs.length; 
      
      const updatePayload: Record<string, number> = {};
      if (session.section === 'reading') updatePayload.reading_mastery = avg * 100;
      else if (session.section === 'vocabulary') updatePayload.vocabulary_mastery = avg * 100;
      else if (session.section === 'writing') updatePayload.writing_mastery = avg * 100;
      else if (session.section === 'spelling') updatePayload.spelling_mastery = avg * 100;

      await supabaseAdmin.from('user_progress').update(updatePayload).eq('user_id', user.id);
    }
  }

  return NextResponse.json({
    accuracy,
    isPerfect,
    bonusXp,
    totalXp,
    durationSeconds: Math.round(durationMs / 1000),
  });
}
