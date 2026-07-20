import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6" dir="rtl">
      <div className="text-center space-y-8 max-w-md animate-fade-in">
        {/* Big graphic */}
        <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
          <span className="text-9xl">🔭</span>
          <div className="absolute inset-0 rounded-full bg-primary-500/5 animate-ping duration-[3s]" />
        </div>

        {/* 404 heading */}
        <div>
          <p className="text-8xl font-bold text-primary-500/20 font-mono select-none">404</p>
          <h1 className="text-3xl font-bold text-text-primary mt-2">الصفحة غير موجودة</h1>
          <p className="text-text-secondary mt-3 leading-relaxed">
            يبدو أنك وصلت إلى مكان لا وجود له. ربما تم نقل الصفحة أو حذفها.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-500/20"
          >
            العودة للصفحة الرئيسية
          </Link>
          <Link
            href="/practice"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-secondary hover:bg-bg-tertiary text-text-primary font-bold rounded-xl transition-colors border border-border-subtle"
          >
            ابدأ التدريب
          </Link>
        </div>
      </div>
    </div>
  );
}
