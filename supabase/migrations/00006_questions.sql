CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('reading','vocabulary','writing','spelling')),
  kc_id UUID NOT NULL REFERENCES public.knowledge_components(id),
  text_hebrew TEXT NOT NULL, passage_hebrew TEXT,
  option_a_hebrew TEXT NOT NULL, option_b_hebrew TEXT NOT NULL,
  option_c_hebrew TEXT NOT NULL, option_d_hebrew TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation_arabic TEXT,
  difficulty NUMERIC(5,3) NOT NULL DEFAULT 0.000,
  discrimination NUMERIC(5,3) NOT NULL DEFAULT 1.000,
  guessing NUMERIC(5,3) NOT NULL DEFAULT 0.200,
  times_shown INTEGER NOT NULL DEFAULT 0, times_correct INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}', is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth view active questions" ON public.questions FOR SELECT TO authenticated USING (is_active = true);
CREATE INDEX idx_questions_section ON public.questions(section);
CREATE INDEX idx_questions_kc ON public.questions(kc_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
