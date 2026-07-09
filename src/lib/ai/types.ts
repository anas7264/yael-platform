import type Groq from 'groq-sdk';

export interface ExplanationResponse {
  explanation: string;
  tip: string;
  related_rule: string;
}

export interface WritingFeedbackResponse {
  scores: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
  };
  strengths: string[];
  improvements: string[];
}

export interface AITutorContext {
  studentName?: string;
  studentLevel?: string;
  currentKc?: string;
}

export type ChatMessage = Groq.Chat.ChatCompletionMessageParam;
