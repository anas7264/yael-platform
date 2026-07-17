'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamStore, ExamQuestion } from '@/store/exam';
import { ExamNavigator } from '@/components/exam/ExamNavigator';
import { HebrewIsland } from '@/components/ui/HebrewIsland';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Bookmark, Clock, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import type { Route } from 'next';

export default function ExamSessionPage({ params }: { params: { examId: string } }) {
  const router = useRouter();
  const {
    questions,
    answers,
    flagged,
    currentIndex,
    timeRemaining,
    isSubmitted,
    initExam,
    setAnswer,
    toggleFlag,
    setCurrentIndex,
    tickTimer,
    submitExam,
    reset
  } = useExamStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Mock fetching for new exam
  useEffect(() => {
    let mounted = true;
    
    async function loadExam() {
      // In reality, if params.examId === 'new', we POST /api/exam to create one, then fetch its questions.
      // For this step, we'll mock the questions since we don't have the real endpoint fully fleshed out with DB insertions yet.
      // We simulate an API delay.
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!mounted) return;

      const mockQuestions: ExamQuestion[] = Array.from({ length: 20 }).map((_, i) => ({
        id: `mock-q-${i}`,
        section: i < 5 ? 'reading' : i < 10 ? 'vocabulary' : i < 15 ? 'writing' : 'spelling',
        text_hebrew: `שאלה לבדיקה ${i + 1}`,
        option_a_hebrew: 'תשובה א',
        option_b_hebrew: 'תשובה ב',
        option_c_hebrew: 'תשובה ג',
        option_d_hebrew: 'תשובה ד',
      }));

      initExam(mockQuestions, 90 * 60);
      setIsLoading(false);
    }

    reset();
    loadExam();
    return () => { mounted = false; };
  }, [params.examId, initExam, reset]);

  // Timer interval
  useEffect(() => {
    if (isLoading || isSubmitted || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLoading, isSubmitted, timeRemaining, tickTimer]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timeRemaining <= 0 && !isSubmitted && !isLoading) {
      handleFinalSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isSubmitted, isLoading]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinalSubmit = async () => {
    submitExam();
    // In reality, POST to /api/exam/submit
    // router.push(`/exam/${params.examId === 'new' ? 'mock-id' : params.examId}/results` as Route);
    router.push(`/exam/mock-id/results` as Route);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const isCurrentFlagged = !!flagged[currentQ.id];
  const selectedOption = answers[currentQ.id];
  const options = ['A', 'B', 'C', 'D'];
  const hebrewOptions: Record<string, string> = {
    A: currentQ.option_a_hebrew,
    B: currentQ.option_b_hebrew,
    C: currentQ.option_c_hebrew,
    D: currentQ.option_d_hebrew,
  };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-4 gap-8 pb-32">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
        <div className="bg-bg-secondary p-4 rounded-xl border border-border-subtle flex flex-col items-center justify-center text-center shadow-sm">
          <Clock className={`w-8 h-8 mb-2 ${timeRemaining < 300 ? 'text-rose-500 animate-pulse' : 'text-primary-500'}`} />
          <span className={`text-2xl font-mono font-bold ${timeRemaining < 300 ? 'text-rose-500' : ''}`} dir="ltr">
            {formatTime(timeRemaining)}
          </span>
          <span className="text-sm text-text-tertiary mt-1">متبقي</span>
        </div>

        <ExamNavigator 
          total={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          questions={questions.map(q => ({ id: q.id }))}
          onNavigate={setCurrentIndex}
        />

        <Button 
          variant="primary" 
          className="w-full shadow-glow-primary" 
          onClick={() => setShowSubmitModal(true)}
          leftIcon={<Send className="w-4 h-4 rtl-flip" />}
        >
          تسليم الامتحان
        </Button>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 order-1 lg:order-2">
        <div className="bg-bg-secondary rounded-2xl p-6 md:p-10 shadow-lg border border-border-subtle relative min-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <span className="bg-primary-500/10 text-primary-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {currentQ.section}
              </span>
              <span className="text-sm font-medium text-text-secondary">
                السؤال {currentIndex + 1} من {questions.length}
              </span>
            </div>

            <button 
              onClick={() => toggleFlag(currentQ.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                isCurrentFlagged 
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900' 
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isCurrentFlagged ? 'fill-current' : ''}`} />
              {isCurrentFlagged ? 'تم التأشير' : 'تأشير للمراجعة'}
            </button>
          </div>

          {/* Question Body */}
          <div className="flex-1">
            {currentQ.passage_text_hebrew && (
              <div className="mb-8 p-6 bg-bg-tertiary rounded-xl max-h-64 overflow-y-auto border border-border-subtle">
                <HebrewIsland className="text-lg leading-loose">{currentQ.passage_text_hebrew}</HebrewIsland>
              </div>
            )}

            <div className="mb-10 text-2xl font-bold">
              <HebrewIsland>{currentQ.text_hebrew}</HebrewIsland>
            </div>

            <div className="space-y-4">
              {options.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswer(currentQ.id, opt)}
                    className={`w-full text-start p-5 rounded-xl border-2 transition-all flex items-center gap-6 ${
                      isSelected 
                        ? 'bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-400 shadow-sm' 
                        : 'bg-bg-tertiary border-border-subtle hover:border-primary-300'
                    }`}
                    dir="ltr"
                  >
                    <span className="font-bold font-mono opacity-50 text-lg w-6 shrink-0">{opt}</span>
                    <span className="flex-1 text-right text-lg">
                      <HebrewIsland inline>{hebrewOptions[opt]}</HebrewIsland>
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex shrink-0 items-center justify-center ${isSelected ? 'border-primary-500' : 'border-text-tertiary'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-12 pt-6 border-t border-border-subtle flex items-center justify-between">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentIndex(currentIndex - 1)} 
              disabled={currentIndex === 0}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              السابق
            </Button>
            
            {currentIndex < questions.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={() => setCurrentIndex(currentIndex + 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                التالي
              </Button>
            ) : (
              <Button 
                variant="primary" 
                className="bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald"
                onClick={() => setShowSubmitModal(true)}
                leftIcon={<Send className="w-4 h-4 rtl-flip" />}
              >
                إنهاء وتسليم
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-secondary p-8 rounded-2xl shadow-xl border border-border-subtle max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto text-primary-500 mb-6">
              <Send className="w-8 h-8 rtl-flip" />
            </div>
            <h2 className="text-2xl font-bold mb-4">هل أنت متأكد من التسليم؟</h2>
            <p className="text-text-secondary mb-8">
              {Object.keys(answers).length < questions.length 
                ? `هناك ${questions.length - Object.keys(answers).length} أسئلة غير مجابة. يمكنك العودة وإكمالها.` 
                : 'لقد أجبت على جميع الأسئلة. لن تتمكن من تعديل إجاباتك بعد التسليم.'}
            </p>
            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowSubmitModal(false)}>
                متابعة الامتحان
              </Button>
              <Button variant="primary" className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald border-none" onClick={handleFinalSubmit}>
                تأكيد التسليم
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
