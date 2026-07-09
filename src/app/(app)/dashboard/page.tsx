import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import Link from 'next/link';
import type { Route } from 'next';
import { Play, Trophy, Flame, Target, Clock, Star } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();
  
  const { data: recentSessions } = await supabase
    .from('practice_sessions')
    .select('*, knowledge_components(title_ar)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recommendedKCs } = await supabase
    .from('knowledge_components')
    .select('*')
    .limit(3);

  const levelProgress = (progress?.xp || 0) % 1000 / 10; // Mock calculation: 1000 XP per level

  return (
    <div className="space-y-8">
      {/* Welcome & Stats Row */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            مرحباً بك، <span className="text-primary-500">{profile?.full_name?.split(' ')[0] || 'يا صديقي'}</span>! 👋
          </h1>
          <p className="text-text-secondary">مستعد لمواصلة رحلة تعلمك اليوم؟</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Card className="flex items-center gap-4 py-3 px-5 border-border-subtle/50 shadow-sm bg-bg-secondary/50 backdrop-blur">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-white shadow-glow-gold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">مجموع النقاط</p>
              <p className="font-bold text-lg">{progress?.xp || 0} XP</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 py-3 px-5 border-border-subtle/50 shadow-sm bg-bg-secondary/50 backdrop-blur">
            <div className="w-10 h-10 rounded-full bg-accent-rose/10 flex items-center justify-center text-accent-rose">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-tertiary">أيام متتالية</p>
              <p className="font-bold text-lg">{progress?.streak_days || 0} أيام</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Resume Learning Hero */}
      <Card variant="highlighted" className="relative overflow-hidden border-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <Badge variant="info" className="mb-3">الهدف اليومي</Badge>
            <h2 className="text-2xl font-bold text-white mb-2">استئناف التعلم</h2>
            <p className="text-text-secondary mb-6 max-w-md">
              أكمل تدريبك اليومي للحفاظ على سلسلة أيامك المتتالية وزيادة مستواك في قواعد اللغة العبرية.
            </p>
            <div className="flex flex-col gap-2 max-w-sm mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">التقدم للمستوى التالي</span>
                <span className="text-primary-500 font-medium">{Math.round(levelProgress)}%</span>
              </div>
              <ProgressBar value={levelProgress} variant="primary" size="md" />
            </div>
            <Link href={"/practice" as Route}>
              <Button size="lg" className="w-full md:w-auto shadow-glow-primary" rightIcon={<Play className="w-5 h-5" />}>
                ابدأ التدريب الآن
              </Button>
            </Link>
          </div>
          <div className="hidden md:flex w-48 h-48 rounded-full bg-gradient-primary opacity-10 blur-3xl absolute left-10" />
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Topics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary-500" />
            <h3 className="text-xl font-bold">مواضيع مقترحة لك</h3>
          </div>
          <div className="grid gap-3">
            {recommendedKCs?.map((kc) => (
              <Card key={kc.id} variant="interactive" className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-text-primary mb-1">{kc.title_ar}</h4>
                  <p className="text-xs text-text-tertiary">مستوى: {kc.level}</p>
                </div>
                <Link href={`/practice?kc=${kc.id}` as Route}>
                  <Button variant="ghost" size="sm" leftIcon={<Play className="w-4 h-4 rtl-flip" />}>
                    تدرب
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-accent-sky" />
            <h3 className="text-xl font-bold">النشاط الأخير</h3>
          </div>
          <Card className="p-0 overflow-hidden border-border-subtle bg-bg-secondary/50">
            <div className="divide-y divide-border-subtle">
              {recentSessions && recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-bg-tertiary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-text-primary">
                          {session.knowledge_components?.title_ar || 'جلسة تدريب'}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(session.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-accent-emerald">+{session.xp_earned} XP</p>
                      <p className="text-xs text-text-tertiary">دقة {session.accuracy}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-text-tertiary">
                  <p>لا يوجد نشاط أخير بعد.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
