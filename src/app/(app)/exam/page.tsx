import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Clock, CheckCircle2, AlertCircle, Play, History } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';

export const metadata: Metadata = {
  title: 'الامتحان التجريبي — يَعَل',
  description: 'محاكاة حقيقية لاختبار ياعيل لتقييم مستواك الفعلي والاستعداد للامتحان النهائي.',
  openGraph: {
    title: 'الامتحان التجريبي — يَعَل',
    description: 'محاكاة حقيقية لاختبار ياعيل لتقييم مستواك الفعلي والاستعداد للامتحان النهائي.',
  },
};

export default async function ExamIntroPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch recent exam history
  const { data: history } = await supabase
    .from('mock_exams')
    .select('id, started_at, completed_at, score_total')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(5);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary-500">الامتحان التجريبي</h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          محاكاة حقيقية لاختبار ياعيل لتقييم مستواك الفعلي والاستعداد للامتحان النهائي.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center space-y-3 bg-bg-secondary border border-border-subtle hover:border-primary-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">الوقت المحدد</h3>
          <p className="text-text-secondary text-sm">90 دقيقة إجمالاً، يتم حسابها التنازلي دون توقف تماماً كالامتحان الحقيقي.</p>
        </Card>

        <Card className="p-6 text-center space-y-3 bg-bg-secondary border border-border-subtle hover:border-primary-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">شامل للأقسام</h3>
          <p className="text-text-secondary text-sm">يغطي القراءة، المفردات، الكتابة، والإملاء بنسب تحاكي الاختبار الفعلي.</p>
        </Card>

        <Card className="p-6 text-center space-y-3 bg-bg-secondary border border-border-subtle hover:border-primary-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">نظام التأشير</h3>
          <p className="text-text-secondary text-sm">إمكانية وضع علامة على الأسئلة الصعبة للعودة إليها لاحقاً قبل التسليم.</p>
        </Card>
      </div>

      <div className="flex justify-center">
        {/* We use a hardcoded route '/exam/new' for the sake of starting, 
            which can then redirect to an actual ID, or just pass 'new' as ID to trigger creation on client. */}
        <Link href={'/exam/new' as Route}>
          <Button size="xl" className="shadow-glow-primary rounded-2xl px-12" leftIcon={<Play className="w-6 h-6 rtl-flip" />}>
            ابدأ الامتحان التجريبي
          </Button>
        </Link>
      </div>

      {history && history.length > 0 && (
        <div className="pt-8 border-t border-border-subtle">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <History className="w-6 h-6 text-primary-500" />
            سجل الامتحانات السابقة
          </h2>
          <div className="grid gap-4">
            {history.map((exam) => (
              <Card key={exam.id} className="p-5 flex items-center justify-between hover:border-primary-500/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold">امتحان تجريبي</p>
                  <p className="text-sm text-text-tertiary" dir="ltr">
                    {new Date(exam.completed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-end">
                    <p className="text-sm text-text-secondary">النتيجة</p>
                    <p className="font-bold text-xl text-primary-500">{exam.score_total}%</p>
                  </div>
                  <Link href={`/exam/${exam.id}/results` as Route}>
                    <Button variant="secondary" size="sm">التفاصيل</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
