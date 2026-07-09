export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type YAELSection = 'reading' | 'vocabulary' | 'writing' | 'spelling';
export type MasteryLevel = 'novice' | 'learning' | 'practiced' | 'mastered';
export type SessionType = 'practice' | 'diagnostic' | 'exam';
export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'SKIP';
export type FSRSState = 'new' | 'learning' | 'review' | 'relearning';
export type FSRSRating = 1 | 2 | 3 | 4;
export type Theme = 'dark' | 'light';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'alltime';
export type BadgeCategory = 'milestone' | 'streak' | 'mastery' | 'accuracy' | 'special';
export type ChatRole = 'user' | 'assistant';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'interjection';

export type Insert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type Update<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  experience_level: ExperienceLevel;
  target_score: number;
  daily_study_minutes: number;
  onboarding_completed: boolean;
  theme: Theme;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>; // id is required from auth
export type ProfileUpdate = Partial<ProfileInsert>;

export interface UserProgress {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  streak_last_date: string | null;
  streak_freeze_available: boolean;
  total_questions_answered: number;
  total_correct_answers: number;
  total_study_time_minutes: number;
  predicted_score: number | null;
  reading_mastery: number;
  vocabulary_mastery: number;
  writing_mastery: number;
  spelling_mastery: number;
  created_at: string;
  updated_at: string;
}
export type UserProgressInsert = Insert<UserProgress>;
export type UserProgressUpdate = Update<UserProgress>;

export interface KnowledgeComponent {
  id: string;
  name_arabic: string;
  name_hebrew: string | null;
  section: YAELSection;
  parent_id: string | null;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}
export type KnowledgeComponentInsert = Omit<KnowledgeComponent, 'id' | 'created_at'>;
export type KnowledgeComponentUpdate = Partial<KnowledgeComponentInsert>;

export interface UserKCMastery {
  id: string;
  user_id: string;
  kc_id: string;
  p_learned: number;
  p_transit: number;
  p_slip: number;
  p_guess: number;
  irt_ability: number;
  total_attempts: number;
  correct_attempts: number;
  last_practiced_at: string | null;
  mastery_level: MasteryLevel;
  created_at: string;
  updated_at: string;
}
export type UserKCMasteryInsert = Insert<UserKCMastery>;
export type UserKCMasteryUpdate = Update<UserKCMastery>;

export interface Question {
  id: string;
  section: YAELSection;
  kc_id: string;
  text_hebrew: string;
  passage_hebrew: string | null;
  option_a_hebrew: string;
  option_b_hebrew: string;
  option_c_hebrew: string;
  option_d_hebrew: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation_arabic: string | null;
  difficulty: number;
  discrimination: number;
  guessing: number;
  times_shown: number;
  times_correct: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type QuestionInsert = Insert<Question>;
export type QuestionUpdate = Update<Question>;

export interface PracticeSession {
  id: string;
  user_id: string;
  section: YAELSection;
  session_type: SessionType;
  total_questions: number;
  correct_answers: number;
  accuracy: number | null;
  xp_earned: number;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
export type PracticeSessionInsert = Omit<PracticeSession, 'id' | 'created_at' | 'updated_at' | 'started_at'>;
export type PracticeSessionUpdate = Update<PracticeSession>;

export interface PracticeAnswer {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  selected_option: AnswerOption;
  is_correct: boolean;
  response_time_ms: number | null;
  hints_used: number;
  explanation_viewed: boolean;
  created_at: string;
}
export type PracticeAnswerInsert = Omit<PracticeAnswer, 'id' | 'created_at'>;
export type PracticeAnswerUpdate = Partial<PracticeAnswerInsert>;

export interface VocabularyWord {
  id: string;
  hebrew_word: string;
  hebrew_nikud: string | null;
  arabic_meaning: string;
  transliteration: string | null;
  part_of_speech: PartOfSpeech;
  root_hebrew: string | null;
  root_arabic: string | null;
  difficulty_level: number;
  example_sentences: Json;
  embedding: number[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type VocabularyWordInsert = Insert<VocabularyWord>;
export type VocabularyWordUpdate = Update<VocabularyWord>;

export interface UserVocabulary {
  id: string;
  user_id: string;
  word_id: string;
  fsrs_stability: number;
  fsrs_difficulty: number;
  fsrs_elapsed_days: number;
  fsrs_scheduled_days: number;
  fsrs_reps: number;
  fsrs_lapses: number;
  fsrs_state: FSRSState;
  last_review_at: string | null;
  next_review_at: string | null;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}
export type UserVocabularyInsert = Insert<UserVocabulary>;
export type UserVocabularyUpdate = Update<UserVocabulary>;

export interface VocabReview {
  id: string;
  user_vocab_id: string;
  rating: FSRSRating;
  response_time_ms: number;
  stability_before: number;
  stability_after: number;
  difficulty_before: number;
  difficulty_after: number;
  interval_days: number;
  created_at: string;
}
export type VocabReviewInsert = Omit<VocabReview, 'id' | 'created_at'>;
export type VocabReviewUpdate = Partial<VocabReviewInsert>;

export interface MockExam {
  id: string;
  user_id: string;
  total_score: number | null;
  reading_score: number | null;
  vocabulary_score: number | null;
  writing_score: number | null;
  spelling_score: number | null;
  total_questions: number;
  correct_answers: number;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  ai_recommendations: Json | null;
  created_at: string;
  updated_at: string;
}
export type MockExamInsert = Omit<MockExam, 'id' | 'created_at' | 'updated_at' | 'started_at'>;
export type MockExamUpdate = Update<MockExam>;

export interface MockExamAnswer {
  id: string;
  exam_id: string;
  question_id: string;
  selected_option: AnswerOption | null;
  is_correct: boolean;
  is_flagged: boolean;
  response_time_ms: number | null;
  created_at: string;
}
export type MockExamAnswerInsert = Omit<MockExamAnswer, 'id' | 'created_at'>;
export type MockExamAnswerUpdate = Partial<MockExamAnswerInsert>;

export interface AIResponseCache {
  id: string;
  cache_key: string;
  task_type: string;
  model: string;
  prompt_hash: string;
  response: Json;
  tokens_used: number;
  hit_count: number;
  expires_at: string | null;
  created_at: string;
}
export type AIResponseCacheInsert = Omit<AIResponseCache, 'id' | 'created_at'>;
export type AIResponseCacheUpdate = Partial<AIResponseCacheInsert>;

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  topic: string | null;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ChatConversationInsert = Insert<ChatConversation>;
export type ChatConversationUpdate = Update<ChatConversation>;

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  tokens_used: number | null;
  model: string | null;
  created_at: string;
}
export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at'>;
export type ChatMessageUpdate = Partial<ChatMessageInsert>;

export interface Badge {
  id: string;
  name_arabic: string;
  description_arabic: string;
  icon: string;
  category: BadgeCategory;
  criteria_type: string;
  criteria_value: number;
  xp_reward: number;
  created_at: string;
}
export type BadgeInsert = Omit<Badge, 'id' | 'created_at'>;
export type BadgeUpdate = Partial<BadgeInsert>;

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}
export type UserBadgeInsert = Omit<UserBadge, 'id' | 'earned_at'>;

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  study_time_minutes: number;
  questions_answered: number;
  correct_answers: number;
  xp_earned: number;
  vocab_reviewed: number;
  sessions_completed: number;
  created_at: string;
  updated_at: string;
}
export type DailyActivityInsert = Insert<DailyActivity>;
export type DailyActivityUpdate = Update<DailyActivity>;

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period: LeaderboardPeriod;
  period_start: string;
  xp: number;
  rank: number | null;
  created_at: string;
  updated_at: string;
}
export type LeaderboardEntryInsert = Insert<LeaderboardEntry>;
export type LeaderboardEntryUpdate = Update<LeaderboardEntry>;

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title_arabic: string;
  body_arabic: string;
  data: Json | null;
  is_read: boolean;
  created_at: string;
}
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
export type NotificationUpdate = Partial<NotificationInsert>;
