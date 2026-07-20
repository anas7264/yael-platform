import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Brain, Play, Flame } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { VocabBrowser } from '@/components/vocabulary/VocabBrowser';

export const metadata: Metadata = {
  title: 'المفردات — يَعَل',
  description: 'نظام التكرار المتباعد الذكي (FSRS) لحفظ المفردات العبرية وتعزيز مهاراتك اللغوية.',
  openGraph: {
    title: 'المفردات — يَعَل',
    description: 'نظام التكرار المتباعد الذكي (FSRS) لحفظ المفردات العبرية وتعزيز مهاراتك اللغوية.',
  },
};

export default async function VocabularyPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch due cards count
  const { count: dueCount } = await supabase
    .from('user_vocabulary')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('next_review_at', new Date().toISOString());

  // Fetch total learned (state > 0)
  const { count: learnedCount } = await supabase
    .from('user_vocabulary')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gt('fsrs_state', 0);

  // Fetch all user vocab for the browser
  const { data: allVocab } = await supabase
    .from('user_vocabulary')
    .select('id, fsrs_state, difficulty_level, knowledge_components!inner(hebrew_word, arabic_meaning, part_of_speech)')
    .eq('user_id', user.id);

  // Format data for browser
  const formattedVocab = allVocab?.map(v => {
    const kc = (Array.isArray(v.knowledge_components) ? v.knowledge_components[0] : v.knowledge_components) as unknown as Record<string, string>;
    return {
      id: v.id,
      fsrs_state: v.fsrs_state,
      difficulty_level: v.difficulty_level,
      hebrew_word: kc?.hebrew_word || '',
      arabic_meaning: kc?.arabic_meaning || '',
      part_of_speech: kc?.part_of_speech || '',
    };
  }) || [];

  const due = dueCount || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">قاموس المفردات</h1>
          <p className="text-text-secondary">نظام التكرار المتباعد الذكي (FSRS) لحفظ الكلمات للأبد.</p>
        </div>
        <Link href={'/vocabulary/review' as Route}>
          <Button 
            size="lg" 
            className={`shadow-glow-primary ${due > 0 ? 'animate-pulse-glow' : ''}`}
            leftIcon={<Play className="w-5 h-5 rtl-flip" />}
          >
            {due > 0 ? `راجع ${due} كلمة مستحقة` : 'ابدأ مراجعة جديدة'}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-tertiary">مستحق للمراجعة</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{due}</p>
              {due > 0 && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping absolute top-6 right-6"></span>}
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-tertiary">تم تعلمه</p>
            <p className="text-2xl font-bold">{learnedCount || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-tertiary">سلسلة المراجعة</p>
            <p className="text-2xl font-bold">12 يوم</p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">تصفح المفردات</h2>
        <VocabBrowser words={formattedVocab} />
      </div>
    </div>
  );
}
