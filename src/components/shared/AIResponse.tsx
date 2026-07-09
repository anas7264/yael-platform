'use client';

import { parseAIResponse } from '@/lib/ai/bridge-parser';
import { HebrewIsland } from '@/components/ui/HebrewIsland';

interface AIResponseProps {
  text: string;
  inline?: boolean;
  className?: string;
}

export function AIResponse({ text, inline = false, className }: AIResponseProps) {
  const segments = parseAIResponse(text);

  const content = segments.map((segment, index) => {
    if (segment.type === 'hebrew') {
      return (
        <HebrewIsland key={index} inline={inline}>
          {segment.content}
        </HebrewIsland>
      );
    }
    // Arabic text: render in a semantically correct span/div
    if (inline) {
      return <span key={index}>{segment.content}</span>;
    }
    return <span key={index}>{segment.content}</span>;
  });

  if (inline) {
    return <span className={className}>{content}</span>;
  }

  return <div className={className}>{content}</div>;
}
