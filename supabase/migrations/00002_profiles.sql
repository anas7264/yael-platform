-- Profiles table: extends auth.users with app-specific data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  experience_level TEXT NOT NULL DEFAULT 'beginner'
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  target_score INTEGER NOT NULL DEFAULT 120
    CHECK (target_score >= 80 AND target_score <= 150),
  daily_study_minutes INTEGER NOT NULL DEFAULT 30,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'dark'
    CHECK (theme IN ('dark', 'light')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Index
CREATE INDEX idx_profiles_email ON public.profiles(email);
