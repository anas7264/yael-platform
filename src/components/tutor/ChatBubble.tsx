'use client';

import { AIResponse } from '@/components/shared/AIResponse';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-[85%] gap-3 items-end">
        <div className="w-8 h-8 rounded-full shrink-0 bg-primary-500/20 text-primary-500 flex items-center justify-center mb-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
        <div className="p-4 rounded-2xl rounded-bl-sm bg-bg-tertiary text-text-primary flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ChatBubble({ role, content, timestamp, isStreaming = false }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mb-1 text-xs font-bold
          ${isUser ? 'bg-bg-tertiary text-text-secondary' : 'bg-primary-500/20 text-primary-500'}`}
        >
          {isUser ? 'أ' : 'AI'}
        </div>

        <div>
          <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed
            ${isUser
              ? 'bg-primary-500 text-white rounded-br-sm'
              : 'bg-bg-tertiary text-text-primary rounded-bl-sm'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <AIResponse text={content} />
            )}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-current opacity-80 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
          <p className={`text-xs text-text-tertiary mt-1 ${isUser ? 'text-end' : 'text-start'}`} dir="ltr">
            {timestamp.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
