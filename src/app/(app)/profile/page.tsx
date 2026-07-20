import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsOverview } from '@/components/profile/StatsOverview';
import { BadgeShowcase, Badge } from '@/components/profile/BadgeShowcase';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';

export const metadata: Metadata = {
  title: 'الملف الشخصي — يَعَل',
  description: 'ملفك الشخصي في منصة ياعيل — الإنجازات والأوسمة وسجل النشاط.',
  openGraph: {
    title: 'الملف الشخصي — يَعَل',
    description: 'ملفك الشخصي في منصة ياعيل — الإنجازات والأوسمة وسجل النشاط.',
  },
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Fetch Profile Data (Mocking missing fields that would be in a full auth.users table profile extension)
  const userProfile = {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || 'طالب ياعيل',
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
  };

  // 2. Fetch Progress (user_progress table)
  const { data: progressRow } = await supabase
    .from('user_progress')
    .select('level, total_xp, predicted_score, current_streak, daily_xp_history')
    .eq('user_id', user.id)
    .single();

  const currentLevel = progressRow?.level || 1;
  const currentXp = progressRow?.total_xp || 0;
  // XP formula: next level is level * 1000
  const nextLevelXp = currentLevel * 1000;
  const xpInCurrentLevel = currentXp % 1000;

  const progressData = {
    level: currentLevel,
    total_xp: currentXp, // Showing raw total for the header text, or xpInCurrentLevel if you want progress relative to current tier. We'll pass total and calculate.
    next_level_xp: nextLevelXp,
    title: currentLevel > 15 ? 'خبير' : currentLevel > 5 ? 'متوسط' : 'مبتدئ',
  };
  
  // We should pass the relative XP for the bar calculation to the header
  const headerProgressData = {
    ...progressData,
    total_xp: xpInCurrentLevel, // So the bar fills from 0 to 1000 per level
    next_level_xp: 1000, 
  };

  // 3. Stats calculation
  const { count: totalQuestions } = await supabase
    .from('user_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: correctAnswers } = await supabase
    .from('user_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_correct', true);

  const accuracy = totalQuestions && totalQuestions > 0 
    ? Math.round((correctAnswers || 0) / totalQuestions * 100) 
    : 0;

  // Mocking study hours (could be calculated from practice sessions total minutes)
  const studyHours = Math.round(currentXp / 500) + 1;

  const stats = {
    totalQuestions: totalQuestions || 0,
    accuracy,
    studyHours,
    streakDays: progressRow?.current_streak || 0,
    predictedScore: progressRow?.predicted_score || 0,
  };

  // 4. Badges (Mock data representing user_badges table)
  // In a real DB: SELECT b.*, ub.earned_at, ub.progress FROM badges b LEFT JOIN user_badges ub ON ...
  const badges: Badge[] = [
    { id: '1', name: 'أولمبياد ياعيل', description: 'أجب على 100 سؤال بشكل صحيح', icon: '🎯', earned_at: '2023-11-15T10:00:00Z', progress: 100 },
    { id: '2', name: 'شعلة النشاط', description: 'ادرس لـ 7 أيام متتالية', icon: '🔥', earned_at: '2023-12-01T10:00:00Z', progress: 100 },
    { id: '3', name: 'ملك المفردات', description: 'أتقن 500 كلمة جديدة', icon: '👑', earned_at: null, progress: 65 },
    { id: '4', name: 'كاتب مبدع', description: 'احصل على تقييم عالي في 10 مهام كتابة', icon: '✍️', earned_at: null, progress: 30 },
    { id: '5', name: 'سرعة البرق', description: 'أنهِ امتحان تجريبي قبل الوقت بـ 15 دقيقة', icon: '⚡', earned_at: null, progress: 0 },
    { id: '6', name: 'لا يُقهر', description: 'دقة 100% في قسم الاستيعاب', icon: '🛡️', earned_at: null, progress: 80 },
  ];

  // 5. Activity Heatmap History
  const historyRaw = progressRow?.daily_xp_history as Record<string, number> | null;
  const history = historyRaw || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">الملف الشخصي</h1>
      
      <ProfileHeader user={userProfile} progress={headerProgressData} />
      
      <StatsOverview stats={stats} />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActivityHeatmap history={history} />
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 h-full shadow-sm">
            <BadgeShowcase badges={badges} />
          </div>
        </div>
      </div>
    </div>
  );
}
