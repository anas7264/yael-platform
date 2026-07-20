'use client';

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, isDisabled = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled && value.trim()) {
        onSend();
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-end gap-3 p-4 border-t border-border-subtle bg-bg-secondary shrink-0">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
          disabled={isDisabled}
          rows={1}
          className="w-full resize-none bg-bg-tertiary border border-border-subtle rounded-xl py-3 px-4 text-sm leading-relaxed focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ maxHeight: '160px' }}
        />
      </div>
      <button
        onClick={() => !isDisabled && value.trim() && onSend()}
        disabled={isDisabled || !value.trim()}
        className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-glow-primary shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
        aria-label="إرسال"
      >
        <ArrowUp className="w-5 h-5 rtl-flip" />
      </button>
    </div>
  );
}
