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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
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
              className={cn(
                'pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-full bg-bg-secondary border shadow-lg',
                colors[toast.type]
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium text-text-primary">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-tertiary hover:text-text-primary transition-colors shrink-0"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
