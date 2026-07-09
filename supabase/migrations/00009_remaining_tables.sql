-- 1. Mock Exams
CREATE TABLE public.mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2),
  reading_score NUMERIC(5,2),
  vocabulary_score NUMERIC(5,2),
  writing_score NUMERIC(5,2),
  spelling_score NUMERIC(5,2),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_mock_exams_updated_at BEFORE UPDATE ON public.mock_exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mock exams" ON public.mock_exams FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_mock_exams_user ON public.mock_exams(user_id);

-- 2. Mock Exam Answers
CREATE TABLE public.mock_exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  selected_option TEXT,
  is_correct BOOLEAN NOT NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_exam_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mock exam answers" ON public.mock_exam_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.mock_exams e WHERE e.id = exam_id AND e.user_id = auth.uid())
);
CREATE INDEX idx_mock_answers_exam ON public.mock_exam_answers(exam_id);

-- 3. AI Response Cache
CREATE TABLE public.ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  task_type TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  hit_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only for AI cache" ON public.ai_response_cache FOR ALL USING (false);

-- 4. Chat Conversations
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'محادثة جديدة',
  topic TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_chat_convos_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chats" ON public.chat_conversations FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_chat_convos_user ON public.chat_conversations(user_id);

-- 5. Chat Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON public.chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE INDEX idx_chat_msg_convo ON public.chat_messages(conversation_id);

-- 6. Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_arabic TEXT NOT NULL,
  description_arabic TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'streak', 'mastery', 'accuracy', 'special')),
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);

-- 7. User Badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

-- 8. Daily Activity
CREATE TABLE public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  study_time_minutes INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  vocab_reviewed INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);
CREATE TRIGGER set_daily_activity_updated_at BEFORE UPDATE ON public.daily_activity FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own daily activity" ON public.daily_activity FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_daily_activity_user ON public.daily_activity(user_id);

-- 9. Upsert Daily Activity Function
CREATE OR REPLACE FUNCTION public.upsert_daily_activity(
  p_user_id UUID,
  p_date DATE,
  p_study_time INT DEFAULT 0,
  p_questions INT DEFAULT 0,
  p_correct INT DEFAULT 0,
  p_xp INT DEFAULT 0,
  p_vocab INT DEFAULT 0,
  p_sessions INT DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.daily_activity (
    user_id, activity_date, study_time_minutes, questions_answered, 
    correct_answers, xp_earned, vocab_reviewed, sessions_completed
  )
  VALUES (
    p_user_id, p_date, p_study_time, p_questions, p_correct, p_xp, p_vocab, p_sessions
  )
  ON CONFLICT (user_id, activity_date) DO UPDATE
  SET 
    study_time_minutes = public.daily_activity.study_time_minutes + EXCLUDED.study_time_minutes,
    questions_answered = public.daily_activity.questions_answered + EXCLUDED.questions_answered,
    correct_answers = public.daily_activity.correct_answers + EXCLUDED.correct_answers,
    xp_earned = public.daily_activity.xp_earned + EXCLUDED.xp_earned,
    vocab_reviewed = public.daily_activity.vocab_reviewed + EXCLUDED.vocab_reviewed,
    sessions_completed = public.daily_activity.sessions_completed + EXCLUDED.sessions_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Leaderboard Entries
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('daily','weekly','alltime')),
  period_start TIMESTAMPTZ NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period, period_start)
);
CREATE TRIGGER set_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views leaderboard" ON public.leaderboard_entries FOR SELECT USING (true);
CREATE INDEX idx_leaderboard_period ON public.leaderboard_entries(period, period_start);

-- 11. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title_arabic TEXT NOT NULL,
  body_arabic TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
