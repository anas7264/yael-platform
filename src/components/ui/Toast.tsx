'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, ToastType } from '@/stores/useToastStore';
import { cn } from '@/lib/utils/cn';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors: Record<ToastType, string> = {
  success: 'border-accent-emerald text-accent-emerald',
  error: 'border-accent-rose text-accent-rose',
  info: 'border-primary-500 text-primary-500',
  warning: 'border-accent-gold text-accent-gold',
};

export function Toast() {
  const { toasts, removeToast } = useToastStore();
  const visibleToasts = toasts.slice(-3); // max 3 visible

  return (
    /* aria-live="assertive" ensures screen readers announce toast immediately */
    <div
      className="fixed top-4 inset-x-0 flex flex-col items-center gap-3 z-[100] pointer-events-none px-4"
      aria-live="assertive"
      aria-atomic="false"
    >
      <AnimatePresence>
        {visibleToasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              role="alert"
              aria-live="assertive"
              className={cn(
                'pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-full bg-bg-secondary border shadow-lg w-full max-w-sm',
                colors[toast.type]
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-text-primary">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-tertiary hover:text-text-primary transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full p-1"
                aria-label="إغلاق الإشعار"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
