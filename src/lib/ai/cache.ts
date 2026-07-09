import type { SupabaseClient } from '@supabase/supabase-js';
import type { TaskType } from './groq';

// TTL in days: 0 means no cache
export const CACHE_TTLS: Record<TaskType, number> = {
  explanation: 7,
  hint: 7,
  vocab_context: 30,
  feedback: 0,
  chat: 0,
  translation: 7,
};

/**
 * Generates a deterministic SHA256 cache key from the provided params object.
 * Uses the Web Crypto API (available in Node.js 18+ and browsers).
 */
export async function generateCacheKey(params: object): Promise<string> {
  const data = JSON.stringify(params);
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieves a cached AI response by key. Increments hit_count if found.
 * Returns null on miss or expiry.
 */
export async function getCachedResponse(
  key: string,
  supabaseAdmin: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('ai_response_cache')
    .select('id, response_text, expires_at')
    .eq('cache_key', key)
    .single();

  if (error || !data) return null;

  // Check if expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  // Increment hit_count asynchronously (fire-and-forget)
  supabaseAdmin
    .from('ai_response_cache')
    .update({ hit_count: supabaseAdmin.rpc('increment', { x: 1 }) })
    .eq('id', data.id)
    .then(() => {});

  return data.response_text as string;
}

export interface SetCacheParams {
  key: string;
  taskType: TaskType;
  prompt: string;
  responseText: string;
  modelUsed: string;
}

/**
 * Stores a Groq API response in the cache with the correct TTL expiry.
 * Skips insertion for task types with TTL = 0.
 */
export async function setCachedResponse(
  params: SetCacheParams,
  supabaseAdmin: SupabaseClient
): Promise<void> {
  const ttlDays = CACHE_TTLS[params.taskType];

  // Do not cache task types with TTL = 0
  if (ttlDays === 0) return;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  await supabaseAdmin.from('ai_response_cache').insert({
    cache_key: params.key,
    task_type: params.taskType,
    prompt_hash: params.prompt,
    response_text: params.responseText,
    model_used: params.modelUsed,
    hit_count: 0,
    expires_at: expiresAt.toISOString(),
  });
}
