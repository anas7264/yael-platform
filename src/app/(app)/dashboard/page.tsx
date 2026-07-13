import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { SectionMasteryGrid } from '@/components/dashboard/SectionMasteryGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, progressRes, sessionsRes, activityRes, vocabRes] = await Promise.all([
    supabase.from('profiles').select('full_name, target_score').eq('id', user.id).single(),
    supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
    supabase
      .from('practice_sessions')
      .select('id, section, accuracy, xp_earned, created_at')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('daily_activity')
      .select('activity_date, xp_earned')
      .eq('user_id', user.id)
      .gte('activity_date', (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0]; })())
      .order('activity_date', { ascending: true }),
    supabase
      .from('user_vocabulary')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('next_review_at', new Date().toISOString()),
  ]);

  const profile = profileRes.data;
  const progress = progressRes.data;
  const sessions = sessionsRes.data || [];
  const activity = activityRes.data || [];
  const dueVocabCount = vocabRes.count || 0;

  return (
    <div className="space-y-8">
      <HeroSection
        name={profile?.full_name?.split(' ')[0] || 'يا صديقي'}
        predictedScore={progress?.predicted_score || 80}
        targetScore={profile?.target_score || 120}
      />

      <StatsGrid
        level={progress?.level || 1}
        xp={progress?.xp || 0}
        streakDays={progress?.streak_days || 0}
        longestStreak={progress?.longest_streak || 0}
        totalCorrect={progress?.total_correct_answers || 0}
        totalAnswered={progress?.total_questions_answered || 0}
      />

      <SectionMasteryGrid
        reading={progress?.reading_mastery || 0}
        vocabulary={progress?.vocabulary_mastery || 0}
        writing={progress?.writing_mastery || 0}
        spelling={progress?.spelling_mastery || 0}
      />

      <QuickActions dueVocabCount={dueVocabCount} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity sessions={sessions} />
        <StreakCalendar activity={activity} />
      </div>
    </div>
  );
}
