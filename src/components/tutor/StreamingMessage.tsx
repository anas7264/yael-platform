'use client';

import { useEffect, useState } from 'react';
import { AIResponse } from '@/components/shared/AIResponse';

interface StreamingMessageProps {
  userMessage: string;
  onComplete: (fullText: string) => void;
}

export function StreamingMessage({ userMessage, onComplete }: StreamingMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    let accumulated = '';

    async function stream() {
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!res.ok || !res.body) {
          const fallback = 'عذراً، حدث خطأ في الاتصال بالمعلم الذكي. يرجى المحاولة مرة أخرى.';
          if (mounted) {
            setDisplayedText(fallback);
            setIsDone(true);
            onComplete(fallback);
          }
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done || !mounted) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE lines: "data: <text>"
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                if (mounted) {
                  setIsDone(true);
                  onComplete(accumulated);
                }
                return;
              }
              try {
                const parsed = JSON.parse(data);
                const token: string = parsed.choices?.[0]?.delta?.content || '';
                if (token) {
                  accumulated += token;
                  if (mounted) setDisplayedText(accumulated);
                }
              } catch {
                // raw text chunk (non-JSON SSE)
                accumulated += data;
                if (mounted) setDisplayedText(accumulated);
              }
            }
          }
        }

        if (mounted) {
          setIsDone(true);
          onComplete(accumulated);
        }
      } catch {
        const fallback = 'عذراً، حدث خطأ. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
        if (mounted) {
          setDisplayedText(fallback);
          setIsDone(true);
          onComplete(fallback);
        }
      }
    }

    stream();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMessage]);

  return (
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-bg-tertiary text-text-primary text-sm md:text-base leading-relaxed">
      {displayedText ? (
        <>
          <AIResponse text={displayedText} />
          {!isDone && (
            <span className="inline-block w-0.5 h-4 bg-text-primary opacity-80 animate-pulse ml-0.5 align-middle" />
          )}
        </>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
