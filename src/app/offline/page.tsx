'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 text-center" dir="rtl">
      <div className="space-y-6 max-w-md animate-fade-in">
        <div className="mx-auto w-24 h-24 rounded-full bg-border-strong flex items-center justify-center text-5xl">
          📡
        </div>
        <h1 className="text-3xl font-bold text-text-primary">أنت غير متصل بالإنترنت</h1>
        <p className="text-text-secondary leading-relaxed">
          يبدو أنك فقدت الاتصال بالإنترنت. يرجى التحقق من الشبكة والمحاولة مرة أخرى.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block mt-4 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
