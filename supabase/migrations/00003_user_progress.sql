-- User progress: gamification and mastery tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  streak_last_date DATE,
  streak_freeze_available BOOLEAN NOT NULL DEFAULT true,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_study_time_minutes INTEGER NOT NULL DEFAULT 0,
  predicted_score NUMERIC(5,2),
  reading_mastery NUMERIC(5,4) NOT NULL DEFAULT 0.3,
  vocabulary_mastery NUMERIC(5,4) NOT NULL DEFAULT 0.3,
  writing_mastery NUMERIC(5,4) NOT NULL DEFAULT 0.3,
  spelling_mastery NUMERIC(5,4) NOT NULL DEFAULT 0.3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger
CREATE TRIGGER set_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE UNIQUE INDEX idx_user_progress_user ON public.user_progress(user_id);

-- Function: Calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN xp_amount < 500 THEN GREATEST(1, xp_amount / 100 + 1)
    WHEN xp_amount < 1500 THEN 6 + (xp_amount - 500) / 200
    WHEN xp_amount < 3500 THEN 11 + (xp_amount - 1500) / 400
    WHEN xp_amount < 7000 THEN 16 + (xp_amount - 3500) / 700
    WHEN xp_amount < 12000 THEN 21 + (xp_amount - 7000) / 1000
    WHEN xp_amount < 20000 THEN 26 + (xp_amount - 12000) / 1600
    ELSE 31 + (xp_amount - 20000) / 2000
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
  v_streak INTEGER;
  v_freeze BOOLEAN;
BEGIN
  SELECT streak_last_date, streak_days, streak_freeze_available
    INTO v_last_date, v_streak, v_freeze
  FROM public.user_progress WHERE user_id = p_user_id;

  IF v_last_date = v_today THEN
    RETURN; -- Already counted today
  ELSIF v_last_date = v_today - 1 THEN
    v_streak := v_streak + 1; -- Consecutive day
  ELSIF v_last_date = v_today - 2 AND v_freeze THEN
    v_streak := v_streak + 1; -- Streak freeze used
    UPDATE public.user_progress SET streak_freeze_available = false WHERE user_id = p_user_id;
  ELSIF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    v_streak := 1; -- Reset streak
  END IF;

  UPDATE public.user_progress
  SET streak_days = v_streak,
      streak_last_date = v_today,
      longest_streak = GREATEST(longest_streak, v_streak)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth trigger: auto-create profile + progress on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد')
  );

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
