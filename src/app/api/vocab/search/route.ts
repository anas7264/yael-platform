import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withAuth, withRateLimit } from '@/lib/api/middleware';

async function handler(req: NextRequest, user: User): Promise<NextResponse> {
  void user; // authenticated via withAuth — user identity not needed for this search
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createServerSupabaseClient();
  const { data: words, error } = await supabase
    .from('vocabulary_words')
    .select('id, hebrew_word, arabic_meaning, part_of_speech')
    .or(`hebrew_word.ilike.%${query}%,arabic_meaning.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return NextResponse.json({ results: words });
}

export const GET = withAuth(withRateLimit(handler, 'general'));
