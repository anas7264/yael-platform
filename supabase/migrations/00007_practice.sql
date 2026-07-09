CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('reading','vocabulary','writing','spelling')),
  session_type TEXT NOT NULL DEFAULT 'practice' CHECK (session_type IN ('practice','diagnostic','exam')),
  total_questions INTEGER NOT NULL DEFAULT 0, correct_answers INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,4) DEFAULT 0.0, xp_earned INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER, started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ, is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_sessions_updated_at BEFORE UPDATE ON public.practice_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TABLE public.practice_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A','B','C','D','SKIP')),
  is_correct BOOLEAN NOT NULL, response_time_ms INTEGER,
  hints_used INTEGER NOT NULL DEFAULT 0, explanation_viewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.practice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own answers" ON public.practice_answers FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_sessions_user ON public.practice_sessions(user_id);
CREATE INDEX idx_answers_session ON public.practice_answers(session_id);
