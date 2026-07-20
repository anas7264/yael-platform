'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Brain from 'lucide-react/dist/esm/icons/brain';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Target from 'lucide-react/dist/esm/icons/target';
import Bookmark from 'lucide-react/dist/esm/icons/bookmark';
import Link from 'next/link';
import type { Route } from 'next';

export default function ExamResultsPage() {
  // Mock results for now
  const score = 85; // %
  const targetScore = 90; // User target
  
  const sections = [
    { name: 'القراءة (Reading)', score: 90, color: 'bg-blue-500' },
    { name: 'المفردات (Vocab)', score: 85, color: 'bg-emerald-500' },
    { name: 'الكتابة (Writing)', score: 75, color: 'bg-amber-500' },
    { name: 'الإملاء (Spelling)', score: 95, color: 'bg-purple-500' },
  ];

  const recommendations = [
    "مستواك في الإملاء ممتاز جداً، لا تحتاج للتركيز عليه في الفترة الحالية.",
    "رصيدك من المفردات جيد، لكن قسم الكتابة يحتاج إلى مراجعة بعض القواعد النحوية الأساسية مثل تركيب الجملة.",
    "حاول حل المزيد من أسئلة القطع الطويلة في القراءة لتحسين سرعتك.",
  ];

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-fade-in space-y-12">
      <div className="text-center space-y-6">
        <div className="inline-block relative">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-bg-tertiary" />
            <circle 
              cx="96" cy="96" r="88" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={88 * 2 * Math.PI} 
              strokeDashoffset={(88 * 2 * Math.PI) - ((score / 100) * (88 * 2 * Math.PI))} 
              className="text-primary-500 transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-primary-500">{score}%</span>
            <span className="text-sm text-text-tertiary">النتيجة النهائية</span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">ممتاز، لقد أكملت الامتحان!</h1>
          <p className="text-text-secondary text-lg">
            نتيجتك قريبة جداً من هدفك (<span className="text-primary-500 font-bold">{targetScore}%</span>). استمر في التدريب.
          </p>
        </div>
      </div>

      {/* Sections Breakdown */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          تحليل الأقسام
        </h2>
        <Card className="p-6 md:p-8 space-y-6">
          {sections.map((sec, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>{sec.name}</span>
                <span>{sec.score}%</span>
              </div>
              <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${sec.color} transition-all duration-1000 ease-out`} 
                  style={{ width: `${sec.score}%` }} 
                />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* AI Recommendations */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-500" />
          توصيات الذكاء الاصطناعي
        </h2>
        <div className="grid gap-4">
          {recommendations.map((rec, i) => (
            <Card key={i} className="p-5 flex gap-4 items-start bg-primary-500/5 border-primary-500/20">
              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 text-primary-500" />
              </div>
              <p className="text-text-secondary leading-relaxed">{rec}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Flagged Review Section */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-500" />
          أسئلة للتركيز والمراجعة
        </h2>
        <Card className="p-8 text-center bg-bg-secondary border border-border-subtle">
          <p className="text-text-secondary mb-4">يوجد 3 أسئلة قمت بوضع إشارة عليها أو أخطأت فيها. ننصح بمراجعتها فوراً.</p>
          <Button variant="secondary" className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
            مراجعة الأسئلة الصعبة
          </Button>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border-subtle">
        <Link href={'/exam' as Route} className="flex-1">
          <Button variant="secondary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
            العودة للامتحانات
          </Button>
        </Link>
        <Link href={'/exam/new' as Route} className="flex-1">
          <Button variant="primary" className="w-full shadow-glow-primary" leftIcon={<RotateCcw className="w-4 h-4" />}>
            إعادة امتحان جديد
          </Button>
        </Link>
      </div>
    </div>
  );
}
