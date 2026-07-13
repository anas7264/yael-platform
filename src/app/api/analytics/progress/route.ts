import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // user_progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // user_kc_mastery
  const { data: kcs } = await supabase
    .from('user_kc_mastery')
    .select('kc_id, p_learned, mastery_level, correct_attempts, total_attempts')
    .eq('user_id', user.id);

  // practice_sessions (last 10)
  const { data: sessions } = await supabase
    .from('practice_sessions')
    .select('id, section, accuracy, xp_earned, created_at')
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // daily_activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: activity } = await supabase
    .from('daily_activity')
    .select('activity_date, xp_earned, study_time_minutes, questions_answered')
    .eq('user_id', user.id)
    .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0] as string)
    .order('activity_date', { ascending: true });

  return NextResponse.json({
    progress,
    mastery: kcs || [],
    recentSessions: sessions || [],
    dailyActivity: activity || [],
  });
}
