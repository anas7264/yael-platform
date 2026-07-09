-- Vocabulary words with vector embeddings
CREATE TABLE public.vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hebrew_word TEXT NOT NULL,
  hebrew_nikud TEXT,
  arabic_meaning TEXT NOT NULL,
  transliteration TEXT,
  part_of_speech TEXT NOT NULL CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection')),
  root_hebrew TEXT,
  root_arabic TEXT,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  example_sentences JSONB NOT NULL DEFAULT '[]',
  embedding vector(384),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_vocab_words_updated_at BEFORE UPDATE ON public.vocabulary_words FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- User FSRS Vocabulary State
CREATE TABLE public.user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  fsrs_stability NUMERIC(6,4) NOT NULL DEFAULT 0.4,
  fsrs_difficulty NUMERIC(6,4) NOT NULL DEFAULT 0.3,
  fsrs_elapsed_days INTEGER NOT NULL DEFAULT 0,
  fsrs_scheduled_days INTEGER NOT NULL DEFAULT 0,
  fsrs_reps INTEGER NOT NULL DEFAULT 0,
  fsrs_lapses INTEGER NOT NULL DEFAULT 0,
  fsrs_state TEXT NOT NULL DEFAULT 'new' CHECK (fsrs_state IN ('new', 'learning', 'review', 'relearning')),
  last_review_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);
CREATE TRIGGER set_user_vocab_updated_at BEFORE UPDATE ON public.user_vocabulary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Vocab Reviews Log
CREATE TABLE public.vocab_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vocab_id UUID NOT NULL REFERENCES public.user_vocabulary(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
  response_time_ms INTEGER NOT NULL,
  stability_before NUMERIC(6,4) NOT NULL,
  stability_after NUMERIC(6,4) NOT NULL,
  difficulty_before NUMERIC(6,4) NOT NULL,
  difficulty_after NUMERIC(6,4) NOT NULL,
  interval_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active vocabulary words are viewable by everyone" ON public.vocabulary_words FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage their own vocabulary state" ON public.user_vocabulary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own reviews" ON public.vocab_reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_vocabulary uv WHERE uv.id = user_vocab_id AND uv.user_id = auth.uid())
);
CREATE POLICY "Users can insert own reviews" ON public.vocab_reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_vocabulary uv WHERE uv.id = user_vocab_id AND uv.user_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_vw_embedding ON public.vocabulary_words USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_uv_user_word ON public.user_vocabulary(user_id, word_id);
CREATE INDEX idx_uv_next_review ON public.user_vocabulary(next_review_at);

-- Semantic Search Function
CREATE OR REPLACE FUNCTION public.search_vocabulary(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  hebrew_word TEXT,
  arabic_meaning TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vw.id,
    vw.hebrew_word,
    vw.arabic_meaning,
    1 - (vw.embedding <=> query_embedding) AS similarity
  FROM public.vocabulary_words vw
  WHERE vw.is_active = true
    AND 1 - (vw.embedding <=> query_embedding) > match_threshold
  ORDER BY vw.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Get Due Vocabulary Function
CREATE OR REPLACE FUNCTION public.get_due_vocabulary(
  p_user_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  word_id UUID,
  hebrew_word TEXT,
  hebrew_nikud TEXT,
  arabic_meaning TEXT,
  transliteration TEXT,
  part_of_speech TEXT,
  example_sentences JSONB,
  fsrs_state TEXT,
  next_review_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vw.id AS word_id,
    vw.hebrew_word,
    vw.hebrew_nikud,
    vw.arabic_meaning,
    vw.transliteration,
    vw.part_of_speech,
    vw.example_sentences,
    COALESCE(uv.fsrs_state, 'new') AS fsrs_state,
    uv.next_review_at
  FROM public.vocabulary_words vw
  LEFT JOIN public.user_vocabulary uv ON vw.id = uv.word_id AND uv.user_id = p_user_id
  WHERE vw.is_active = true
    AND (uv.id IS NULL OR uv.next_review_at <= now())
  ORDER BY 
    CASE WHEN uv.id IS NULL THEN 1 ELSE 0 END, -- Prioritize due reviews over new words
    uv.next_review_at ASC NULLS LAST
  LIMIT p_limit;
END;
$$;
