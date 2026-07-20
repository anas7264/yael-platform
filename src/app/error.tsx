'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service
    console.error('[App Error]', error);
  }, [error]);

  // Sanitise: only expose the message string, never the stack or digest
  const safeMessage =
    error.message && error.message.length < 200
      ? error.message
      : 'حدث خطأ غير متوقع في التطبيق.';

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6" dir="rtl">
      <div className="text-center space-y-8 max-w-md animate-fade-in">
        <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-5xl">
          ⚠️
        </div>

        <div>
          <h1 className="text-3xl font-bold text-text-primary">حدث خطأ ما</h1>
          <p className="text-text-secondary mt-3 leading-relaxed">{safeMessage}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary text-text-primary font-bold rounded-xl transition-colors border border-border-subtle"
          >
            العودة
          </Link>
        </div>
      </div>
    </div>
  );
}
