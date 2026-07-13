import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BookOpen, Edit3, Type, Headphones, Play } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';

const SECTIONS = [
  { id: 'reading', name: 'الاستيعاب المقروء', icon: <BookOpen className="w-8 h-8" />, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'vocabulary', name: 'المفردات', icon: <Type className="w-8 h-8" />, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'writing', name: 'التعبير الكتابي', icon: <Edit3 className="w-8 h-8" />, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'spelling', name: 'الإملاء', icon: <Headphones className="w-8 h-8" />, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

export default async function PracticeSelectionPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();

  const masteries = {
    reading: progress?.reading_mastery || 0,
    vocabulary: progress?.vocabulary_mastery || 0,
    writing: progress?.writing_mastery || 0,
    spelling: progress?.spelling_mastery || 0,
  };

  // Find weakest section for recommendation
  const weakest = Object.entries(masteries).sort((a, b) => a[1] - b[1])[0]?.[0] || 'reading';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">اختر قسم للتدريب</h1>
        <p className="text-text-secondary">حدد المهارة التي ترغب في تطويرها اليوم.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECTIONS.map((section) => {
          const mastery = masteries[section.id as keyof typeof masteries];
          const isRecommended = section.id === weakest;

          return (
            <Card 
              key={section.id} 
              className={`p-6 transition-all hover:shadow-md ${isRecommended ? 'border-primary-500 shadow-glow-primary' : ''}`}
            >
              {isRecommended && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  موصى به لك
                </div>
              )}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${section.bg} ${section.color} ${section.border} border`}>
                  {section.icon}
                </div>
                <div className="text-left">
                  <span className="text-sm text-text-tertiary">مستوى الإتقان</span>
                  <p className="text-2xl font-bold">{Math.round(mastery)}%</p>
                </div>
              </div>
              
              <h2 className="text-xl font-bold mb-4">{section.name}</h2>
              <ProgressBar value={mastery} variant="primary" className="mb-6" />
              
              <Link href={`/practice/${section.id}` as Route}>
                <Button className="w-full" rightIcon={<Play className="w-4 h-4" />}>
                  ابدأ تمرين
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
