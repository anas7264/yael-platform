import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Text search on hebrew_word and arabic_meaning (ILIKE %q%)
  const { data: words, error } = await supabase
    .from('vocabulary_words')
    .select('id, hebrew_word, arabic_meaning, part_of_speech')
    .or(`hebrew_word.ilike.%${query}%,arabic_meaning.ilike.%${query}%`)
    .limit(10);

  if (error) return NextResponse.json({ error: 'Search failed' }, { status: 500 });

  return NextResponse.json({ results: words });
}
