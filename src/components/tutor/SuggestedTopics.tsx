'use client';

interface SuggestedTopicsProps {
  onSelect: (topic: string) => void;
}

const TOPICS = [
  'قواعد النحو',
  'استراتيجيات الامتحان',
  'المفردات الصعبة',
  'تمارين الكتابة',
  'الأخطاء الشائعة',
  'نصائح للإملاء',
];

export function SuggestedTopics({ onSelect }: SuggestedTopicsProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mb-6 shadow-glow-primary">
        <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">مرحباً! أنا المعلم الذكي</h2>
      <p className="text-text-secondary mb-10 max-w-md">
        مساعدك الشخصي لتعلم العبرية. يمكنني مساعدتك في قواعد النحو، واستراتيجيات الامتحان، والمفردات.
      </p>

      <div className="flex flex-wrap gap-3 justify-center max-w-lg">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            className="px-5 py-2.5 rounded-full bg-bg-secondary border border-border-subtle text-sm font-medium hover:border-primary-500 hover:bg-primary-500/5 hover:text-primary-600 transition-all"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
