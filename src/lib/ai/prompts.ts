export const SYSTEM_PROMPT = `
أنت معلم لغة عبرية خبير متخصص في تحضير الطلاب العرب لامتحان יע"ל (ياعيل).
يجب عليك الالتزام بالقواعد التالية دائماً:
1. أجب دائماً باللغة العربية الواضحة والفصحى لتسهيل الفهم على الطالب.
2. استخدم دائماً علامات <hebrew></hebrew> حول أي كلمة أو جملة باللغة العبرية (مثل: <hebrew>שלום</hebrew>).
3. اربط المفاهيم والقواعد العبرية بنظيراتها في اللغة العربية كلما أمكن ذلك لتسهيل الفهم.
4. كن مشجعاً وإيجابياً وداعماً في نبرتك.
5. كن مختصراً ومباشراً في إجاباتك، وتجنب الإطالة غير الضرورية.
6. اذكر القواعد النحوية (דקדוק) المناسبة بوضوح مع أمثلة عند شرح الأخطاء.
`;

export interface ExplanationContext {
  questionText: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string;
  section: string;
  skill: string;
  difficulty: number;
}

export const EXPLANATION_PROMPT = (context: ExplanationContext) => `
قم بتحليل إجابة الطالب على السؤال التالي:
القسم: ${context.section}
المهارة: ${context.skill}
الصعوبة: ${context.difficulty}

نص السؤال:
${context.questionText}

الخيارات:
${context.options.join(' | ')}

الإجابة الصحيحة: ${context.correctAnswer}
إجابة الطالب: ${context.studentAnswer}

يجب أن يكون الإخراج بتنسيق JSON صالح فقط، وبدون أي نص إضافي:
{
  "explanation": "شرح مفصل لسبب كون الإجابة صحيحة أو خاطئة",
  "tip": "نصيحة سريعة لتجنب هذا الخطأ مستقبلاً",
  "related_rule": "القاعدة النحوية أو اللغوية المتعلقة"
}
`;

export type HintTier = 1 | 2 | 3;

export interface HintContext {
  questionText: string;
  options: string[];
  studentAnswer?: string;
  correctAnswer: string;
}

export const HINT_PROMPT = (context: HintContext, tier: HintTier) => {
  let tierInstruction = "";
  if (tier === 1) {
    tierInstruction = "مستوى التلميح: 1 (توجيه عام). قدم تلميحاً غامضاً يوجه الطالب نحو الفكرة العامة للسؤال دون الكشف عن تفاصيل دقيقة.";
  } else if (tier === 2) {
    tierInstruction = "مستوى التلميح: 2 (إشارة واضحة). قدم تلميحاً يضيق الخيارات ويشير بوضوح للقاعدة اللغوية المطلوبة.";
  } else if (tier === 3) {
    tierInstruction = "مستوى التلميح: 3 (مساعدة قوية). قدم تلميحاً شبه مباشر يقود الطالب للإجابة الصحيحة مع شرح بسيط لسبب استبعاد الخيارات الأخرى.";
  }

  return `
قدم تلميحاً للطالب بناءً على المستوى المطلوب.

نص السؤال:
${context.questionText}
الإجابة الصحيحة: ${context.correctAnswer}
الخيارات: ${context.options.join(' | ')}

${tierInstruction}

يجب أن يكون الإخراج بتنسيق JSON صالح فقط:
{
  "hint": "نص التلميح هنا"
}
  `;
};

export interface WritingContext {
  topic: string;
  studentEssay: string;
}

export const WRITING_FEEDBACK_PROMPT = (context: WritingContext) => `
قم بتقييم النص العبري التالي الذي كتبه الطالب بناءً على الموضوع المعطى.

موضوع التعبير:
${context.topic}

نص الطالب:
<hebrew>${context.studentEssay}</hebrew>

استخدم معايير التقييم التالية:
- المحتوى (Content): 30%
- التنظيم والترابط (Organization): 25%
- القواعد النحوية (Grammar): 25%
- المفردات (Vocabulary): 20%

يجب أن يكون الإخراج بتنسيق JSON صالح فقط، وبدون أي نص إضافي:
{
  "scores": {
    "content": 0-30,
    "organization": 0-25,
    "grammar": 0-25,
    "vocabulary": 0-20
  },
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "improvements": ["نقطة تحسين 1", "نقطة تحسين 2"]
}
`;

export interface ChatContext {
  studentName?: string;
  studentLevel?: string;
  currentKc?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const CHAT_PROMPT = (context: ChatContext, history: ChatMessage[]) => `
أنت الآن في جلسة دردشة تعليمية مباشرة مع الطالب.
${context.studentName ? `اسم الطالب: ${context.studentName}` : ''}
${context.studentLevel ? `مستوى الطالب: ${context.studentLevel}` : ''}
${context.currentKc ? `الموضوع الحالي الذي يدرسه: ${context.currentKc}` : ''}

قم بالرد على رسالة الطالب الأخيرة بناءً على سياق المحادثة المرفق. حافظ على القواعد الأساسية (استخدم علامات <hebrew>، أجب بالعربية، كن مشجعاً).

سجل المحادثة:
${history.map(m => `${m.role === 'user' ? 'الطالب' : 'المعلم'}: ${m.content}`).join('\n')}

قدم ردك كرسالة نصية مباشرة.
`;

export const VOCAB_CONTEXT_PROMPT = (word: string) => `
قدم 3 جمل أمثلة توضيحية مختلفة ومتدرجة الصعوبة للكلمة العبرية التالية:
الكلمة: <hebrew>${word}</hebrew>

يجب أن توضح الجمل كيفية استخدام الكلمة في سياقات مختلفة.

يجب أن يكون الإخراج بتنسيق JSON صالح فقط، وبدون أي نص إضافي:
{
  "sentences": [
    {
      "hebrew": "الجملة بالعبرية",
      "arabic_translation": "الترجمة بالعربية"
    }
  ]
}
`;
