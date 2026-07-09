import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callGroq } from '@/lib/ai/groq';
import { generateCacheKey, getCachedResponse, setCachedResponse } from '@/lib/ai/cache';
import { HINT_PROMPT, type HintTier } from '@/lib/ai/prompts';

const HintSchema = z.object({
  questionId: z.string().uuid(),
  hintTier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  previousHints: z.array(z.string()).optional().default([]),
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
  const parsed = HintSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { questionId, hintTier, previousHints } = parsed.data;

  // Cache key includes hintTier for tier-specific caching
  const cacheKey = await generateCacheKey({ questionId, hintTier });

  const supabaseAdmin = createAdminClient();

  // Check cache
  const cached = await getCachedResponse(cacheKey, supabaseAdmin);
  if (cached) {
    const cachedResult = JSON.parse(cached) as { hint: string };
    return NextResponse.json({ hint: cachedResult.hint, tier: hintTier });
  }

  // Fetch question from DB
  const { data: question, error: qError } = await supabaseAdmin
    .from('questions')
    .select('question_text, options, correct_answer')
    .eq('id', questionId)
    .single();

  if (qError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const hintContext = {
    questionText: question.question_text as string,
    options: (question.options as string[]) ?? [],
    correctAnswer: question.correct_answer as string,
    studentAnswer: previousHints.length > 0 ? previousHints[previousHints.length - 1] : undefined,
  };

  const messages = [
    { role: 'user' as const, content: HINT_PROMPT(hintContext, hintTier as HintTier) },
  ];

  // Use 'hint' task (simple/fast model)
  const rawResponse = await callGroq(messages, 'hint');

  let hint: string;
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch || !jsonMatch[0]) throw new Error('No JSON found');
    const result = JSON.parse(jsonMatch[0]) as { hint: string };
    if (!result.hint) throw new Error('Missing hint field');
    hint = result.hint;
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 });
  }

  // Cache the hint response (7-day TTL)
  await setCachedResponse(
    {
      key: cacheKey,
      taskType: 'hint',
      prompt: HINT_PROMPT(hintContext, hintTier as HintTier),
      responseText: JSON.stringify({ hint }),
      modelUsed: 'llama-3.1-8b-instant',
    },
    supabaseAdmin
  );

  return NextResponse.json({ hint, tier: hintTier });
}
