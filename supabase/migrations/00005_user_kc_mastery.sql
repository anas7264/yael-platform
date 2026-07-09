CREATE TABLE public.user_kc_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kc_id UUID NOT NULL REFERENCES public.knowledge_components(id) ON DELETE CASCADE,
  p_learned NUMERIC(6,5) NOT NULL DEFAULT 0.30000,
  p_transit NUMERIC(6,5) NOT NULL DEFAULT 0.09000,
  p_slip NUMERIC(6,5) NOT NULL DEFAULT 0.10000,
  p_guess NUMERIC(6,5) NOT NULL DEFAULT 0.25000,
  irt_ability NUMERIC(6,3) NOT NULL DEFAULT 0.000,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  mastery_level TEXT NOT NULL DEFAULT 'novice' CHECK (mastery_level IN ('novice','learning','practiced','mastered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, kc_id)
);
CREATE TRIGGER set_user_kc_mastery_updated_at BEFORE UPDATE ON public.user_kc_mastery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.user_kc_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mastery" ON public.user_kc_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mastery" ON public.user_kc_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mastery" ON public.user_kc_mastery FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_user_kc_mastery_user ON public.user_kc_mastery(user_id);
CREATE INDEX idx_user_kc_mastery_kc ON public.user_kc_mastery(kc_id);
