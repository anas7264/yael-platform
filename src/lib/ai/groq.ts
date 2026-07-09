import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const MODELS = {
  complex: 'llama-3.1-70b-versatile',
  simple: 'llama-3.1-8b-instant',
  fallback: 'mixtral-8x7b-32768',
} as const;

export const TASK_CONFIGS = {
  explanation: { model: MODELS.complex, temperature: 0.3, maxTokens: 1024 },
  hint: { model: MODELS.simple, temperature: 0.5, maxTokens: 256 },
  feedback: { model: MODELS.complex, temperature: 0.4, maxTokens: 2048 },
  chat: { model: MODELS.complex, temperature: 0.7, maxTokens: 1024 },
  translation: { model: MODELS.simple, temperature: 0.1, maxTokens: 512 },
  vocab_context: { model: MODELS.simple, temperature: 0.3, maxTokens: 512 },
} as const;

export type TaskType = keyof typeof TASK_CONFIGS;

export async function callGroq(messages: Groq.Chat.ChatCompletionMessageParam[], taskType: TaskType): Promise<string> {
  const config = TASK_CONFIGS[taskType];
  try {
    const response = await groq.chat.completions.create({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });
    return response.choices[0]?.message?.content ?? '';
  } catch (error) {
    console.warn('Groq API primary model failed, falling back to mixtral...', error);
    // Fallback to secondary model
    const response = await groq.chat.completions.create({
      model: MODELS.fallback,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });
    return response.choices[0]?.message?.content ?? '';
  }
}

export { groq };
