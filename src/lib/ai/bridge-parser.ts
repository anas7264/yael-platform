export type TextSegment =
  | { type: 'arabic'; content: string }
  | { type: 'hebrew'; content: string };

/**
 * Parses an AI response string containing <hebrew>...</hebrew> markers
 * into an ordered array of typed text segments.
 */
export function parseAIResponse(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const hebrewRegex = /<hebrew>([\s\S]*?)<\/hebrew>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = hebrewRegex.exec(text)) !== null) {
    // Arabic text before this Hebrew segment
    if (match.index > lastIndex) {
      const arabicContent = text.slice(lastIndex, match.index);
      if (arabicContent) {
        segments.push({ type: 'arabic', content: arabicContent });
      }
    }

    // The Hebrew content inside the tags
    const hebrewContent = match[1];
    if (hebrewContent) {
      segments.push({ type: 'hebrew', content: hebrewContent });
    }

    lastIndex = hebrewRegex.lastIndex;
  }

  // Remaining Arabic text after the last match
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      segments.push({ type: 'arabic', content: remaining });
    }
  }

  // If no markers found at all, treat entire text as Arabic
  if (segments.length === 0 && text) {
    segments.push({ type: 'arabic', content: text });
  }

  return segments;
}
