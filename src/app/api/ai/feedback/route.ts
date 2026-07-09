import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { callGroq } from '@/lib/ai/groq';
import { WRITING_FEEDBACK_PROMPT } from '@/lib/ai/prompts';

const FeedbackSchema = z.object({
  essayText: z.string().min(10),
  topicHebrew: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { essayText, topicHebrew } = parsed.data;

  const context = {
    topic: topicHebrew,
    studentEssay: essayText,
  };

  const messages = [
    { role: 'user' as const, content: WRITING_FEEDBACK_PROMPT(context) },
  ];

  // NO caching. Use 'feedback' task config (complex model, temp 0.4, maxTokens 2048)
  const rawResponse = await callGroq(messages, 'feedback');

  let result;
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) throw new Error('No JSON found');
    
    const parsedJson = JSON.parse(jsonMatch[0]);
    
    const content = parsedJson.scores?.content || 0;
    const org = parsedJson.scores?.organization || 0;
    const grammar = parsedJson.scores?.grammar || 0;
    const vocab = parsedJson.scores?.vocabulary || 0;
    
    const overall_score = content + org + grammar + vocab;

    result = {
      overall_score,
      content_score: content,
      organization_score: org,
      grammar_score: grammar,
      vocabulary_score: vocab,
      strengths: parsedJson.strengths || [],
      improvements: parsedJson.improvements || [],
      general_feedback: parsedJson.general_feedback || 'تم الانتهاء من التقييم.',
    };
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
  }

  return NextResponse.json(result);
}
