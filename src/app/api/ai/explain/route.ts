import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callGroq } from '@/lib/ai/groq';
import { generateCacheKey, getCachedResponse, setCachedResponse } from '@/lib/ai/cache';
import { EXPLANATION_PROMPT } from '@/lib/ai/prompts';

const ExplainSchema = z.object({
  questionId: z.string().uuid(),
  selectedAnswer: z.string(),
  section: z.string(),
  skillName: z.string(),
});

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate input
  const body = await req.json();
  const parsed = ExplainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { questionId, selectedAnswer, section, skillName } = parsed.data;

  // Generate deterministic cache key from (questionId, selectedAnswer)
  const cacheKey = await generateCacheKey({ questionId, selectedAnswer });

  const supabaseAdmin = createAdminClient();

  // Check cache first
  const cached = await getCachedResponse(cacheKey, supabaseAdmin);
  if (cached) {
    const parsed = JSON.parse(cached) as { explanation: string; tip: string; related_rule: string };
    return NextResponse.json(parsed);
  }

  // Fetch question from DB
  const { data: question, error: qError } = await supabaseAdmin
    .from('questions')
    .select('question_text, options, correct_answer, difficulty_irt_b')
    .eq('id', questionId)
    .single();

  if (qError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // Build prompt context and call Groq
  const context = {
    questionText: question.question_text as string,
    options: (question.options as string[]) ?? [],
    correctAnswer: question.correct_answer as string,
    studentAnswer: selectedAnswer,
    section,
    skill: skillName,
    difficulty: question.difficulty_irt_b as number ?? 0,
  };

  const messages = [
    { role: 'user' as const, content: EXPLANATION_PROMPT(context) },
  ];

  const rawResponse = await callGroq(messages, 'explanation');

  // Parse and validate JSON response structure
  let result: { explanation: string; tip: string; related_rule: string };
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) throw new Error('No JSON found');
    result = JSON.parse(jsonMatch[0]) as { explanation: string; tip: string; related_rule: string };
    if (!result.explanation || !result.tip || !result.related_rule) throw new Error('Missing fields');
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
  }

  // Cache the valid response
  await setCachedResponse(
    {
      key: cacheKey,
      taskType: 'explanation',
      prompt: EXPLANATION_PROMPT(context),
      responseText: JSON.stringify(result),
      modelUsed: 'llama-3.1-70b-versatile',
    },
    supabaseAdmin
  );

  return NextResponse.json(result);
}
