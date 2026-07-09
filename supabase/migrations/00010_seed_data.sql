-- Seed Knowledge Components (22 total across 4 sections)
INSERT INTO public.knowledge_components (name_arabic, name_hebrew, section, order_index) VALUES
-- Reading
('تحديد الفكرة الرئيسية', 'זיהוי הרעיון המרכזי', 'reading', 1),
('استخراج التفاصيل', 'שליפת פרטים', 'reading', 2),
('الاستنتاج والتضمين', 'הסקה והשתמעות', 'reading', 3),
('المفردات في السياق', 'אוצר מילים בהקשר', 'reading', 4),
('غرض الكاتب', 'מטרת הכותב', 'reading', 5),
('بنية النص', 'מבנה הטקסט', 'reading', 6),

-- Vocabulary
('المرادفات', 'מילים נרדפות', 'vocabulary', 1),
('الأضداد', 'הפכים', 'vocabulary', 2),
('الجذور والاشتقاق', 'שורשים וגזירה', 'vocabulary', 3),
('المعنى السياقي', 'משמעות הקשרית', 'vocabulary', 4),
('المتلازمات', 'צירופי כבול', 'vocabulary', 5),
('التعابير والمصطلحات', 'ניבים וביטויים', 'vocabulary', 6),

-- Writing
('بنية المقال', 'מבנה חיבור', 'writing', 1),
('تماسك الفقرة', 'לכידות הפסקה', 'writing', 2),
('الدقة النحوية', 'דיוק דקדוקי', 'writing', 3),
('ثراء المفردات', 'עושר לשוני', 'writing', 4),
('الحجاج', 'טיעון', 'writing', 5),

-- Spelling
('أنماط الحركات', 'תבניות ניקוד', 'spelling', 1),
('التجمعات الساكنة', 'צרור עיצורים', 'spelling', 2),
('الإملاء الشاذ', 'כתיב חריג', 'spelling', 3),
('مطابقة الجنس', 'התאמת מין', 'spelling', 4),
('تصريف الأفعال', 'נטיית פעלים', 'spelling', 5);

-- Seed Badges (11 total)
INSERT INTO public.badges (name_arabic, description_arabic, icon, category, criteria_type, criteria_value, xp_reward) VALUES
('أول خطوة', 'أكملت أول درس لك بنجاح', '👶', 'milestone', 'lessons_completed', 1, 50),
('قارئ ماهر', 'أجبت عن 50 سؤالاً في قسم القراءة بشكل صحيح', '📖', 'mastery', 'reading_correct', 50, 100),
('خبير المفردات', 'حفظت 100 كلمة جديدة', '🧠', 'mastery', 'vocabulary_learned', 100, 150),
('كاتب موهوب', 'كتبت 10 مقالات نموذجية', '✍️', 'mastery', 'essays_written', 10, 100),
('إملائي دقيق', 'حققت دقة 90% في قسم الإملاء', '🎯', 'accuracy', 'spelling_accuracy', 90, 100),
('مثابر', 'أكملت سلسلة دراسة لمدة 7 أيام متتالية', '🔥', 'streak', 'streak_days', 7, 200),
('ملتزم', 'أكملت سلسلة دراسة لمدة 30 يوماً متتالية', '📅', 'streak', 'streak_days', 30, 500),
('محارب', 'درست لمدة 50 ساعة إجمالية', '⚔️', 'milestone', 'study_hours', 50, 500),
('امتحان كامل', 'أنهيت أول امتحان تجريبي لك', '📝', 'special', 'exams_completed', 1, 250),
('هدف 120', 'وصلت للدرجة المتوقعة 120', '🏆', 'milestone', 'predicted_score', 120, 1000),
('عبقري', 'حققت مستوى الأسطورة', '🌟', 'milestone', 'level_reached', 31, 5000);
