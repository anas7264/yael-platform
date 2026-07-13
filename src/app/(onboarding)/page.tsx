'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<ExperienceLevel | null>(null);
  const [targetScore, setTargetScore] = useState(120);
  const [dailyMinutes, setDailyMinutes] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            experience_level: level || 'beginner',
            target_score: targetScore,
            daily_study_minutes: dailyMinutes || 15,
            onboarding_completed: true,
          })
          .eq('id', user.id);
      }
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  // RTL-aware variants (Enter from right, exit to left in physical space)
  const variants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-8 bg-indigo-600'
                : i < step
                ? 'w-2 bg-indigo-600/50'
                : 'w-2 bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center space-y-6 h-full mt-10"
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">!مرحباً بك في يَعَل</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
                المنصة الأذكى للتحضير لامتحان ياعيل. دعنا نخصص تجربتك التعليمية.
              </p>
              <Button size="lg" className="mt-8 px-12" onClick={handleNext}>
                يلا نبدأ!
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-center mb-8">ما هو مستواك الحالي؟</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      level === l
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="text-xl font-semibold">
                      {l === 'beginner' ? 'مبتدئ' : l === 'intermediate' ? 'متوسط' : 'متقدم'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-16 flex justify-between">
                <Button variant="secondary" onClick={handlePrev}>السابق</Button>
                <Button onClick={handleNext} disabled={!level}>التالي</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-center mb-8">ما هي درجتك المستهدفة؟</h2>
              <div className="flex flex-col items-center justify-center space-y-8 flex-1 mt-8">
                <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">{targetScore}</div>
                <input
                  type="range"
                  min="80"
                  max="150"
                  step="5"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full max-w-md accent-indigo-600"
                />
                <div className="flex justify-between w-full max-w-md text-gray-500 font-mono text-sm">
                  <span>80</span>
                  <span>150</span>
                </div>
              </div>
              <div className="mt-auto pt-16 flex justify-between">
                <Button variant="secondary" onClick={handlePrev}>السابق</Button>
                <Button onClick={handleNext}>التالي</Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-center mb-8">كم وقت يمكنك تخصيصه يومياً؟</h2>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDailyMinutes(mins)}
                    className={`px-8 py-4 rounded-full border-2 transition-all text-lg ${
                      dailyMinutes === mins
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                    }`}
                  >
                    {mins} دقيقة
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-16 flex justify-between">
                <Button variant="secondary" onClick={handlePrev}>السابق</Button>
                <Button onClick={handleNext} disabled={!dailyMinutes}>التالي</Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full items-center justify-center text-center mt-10"
            >
              <h2 className="text-2xl font-bold mb-4">التقييم التشخيصي</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                سيتم تحديد مستواك الدقيق عبر 10-15 سؤال تفاعلي. يمكنك إجراء هذا التقييم لاحقاً من لوحة التحكم إذا كنت تفضل ذلك.
              </p>
              
              <div className="flex gap-4">
                <Button variant="secondary" onClick={handleComplete} disabled={isSubmitting}>
                  تخطي الآن
                </Button>
                <Button onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting ? 'جاري الحفظ...' : 'ابدأ التقييم'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
