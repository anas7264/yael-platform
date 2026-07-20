import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, type RouteType } from './rate-limiter';
import { AppError, handleApiError } from './errors';

// ─── Type Helpers ────────────────────────────────────────────────────────────

type AuthedHandler = (req: NextRequest, user: User) => Promise<NextResponse>;
type PlainHandler  = (req: NextRequest) => Promise<NextResponse>;

// ─── withAuth ─────────────────────────────────────────────────────────────────

/**
 * HOF: verifies Supabase session, then calls handler with the resolved User.
 * Returns 401 if unauthenticated.
 */
export function withAuth(handler: AuthedHandler): PlainHandler {
  return async (req: NextRequest) => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new AppError('UNAUTHORIZED');
      return await handler(req, user);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

// ─── withRateLimit ────────────────────────────────────────────────────────────

/**
 * HOF: applies per-user token-bucket rate limiting before calling handler.
 * Returns 429 with Retry-After header and Arabic error message when exceeded.
 */
export function withRateLimit(handler: AuthedHandler, routeType: RouteType): AuthedHandler {
  return async (req: NextRequest, user: User) => {
    try {
      const result = checkRateLimit(user.id, routeType);
      if (!result.allowed) {
        const appError = new AppError('RATE_LIMITED');
        return NextResponse.json(
          { error: appError.message, code: appError.code, message_ar: appError.messageArabic },
          {
            status: 429,
            headers: { 'Retry-After': String(result.retryAfterSeconds) },
          }
        );
      }
      return await handler(req, user);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

// ─── withValidation ───────────────────────────────────────────────────────────

type ValidatedHandler<T> = (req: NextRequest, user: User, body: T) => Promise<NextResponse>;

/**
 * HOF: parses and validates the request body with a Zod schema.
 * Returns 422 with validation errors if the body is invalid.
 */
export function withValidation<T>(
  schema: z.ZodType<T>,
  handler: ValidatedHandler<T>
): AuthedHandler {
  return async (req: NextRequest, user: User) => {
    try {
      const rawBody = await req.json();
      const parsed = schema.safeParse(rawBody);
      if (!parsed.success) {
        const appError = new AppError('VALIDATION_ERROR');
        return NextResponse.json(
          {
            error: appError.message,
            code: appError.code,
            message_ar: appError.messageArabic,
            details: parsed.error.flatten(),
          },
          { status: 422 }
        );
      }
      return await handler(req, user, parsed.data);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

// ─── Composable Utility ───────────────────────────────────────────────────────

/**
 * Convenience: composes withAuth + withRateLimit + withValidation in one call.
 *
 * Usage:
 *   export const POST = withAuthRateLimitValidation(MySchema, 'ai', handler);
 */
export function withAuthRateLimitValidation<T>(
  schema: z.ZodType<T>,
  routeType: RouteType,
  handler: ValidatedHandler<T>
): PlainHandler {
  return withAuth(
    withRateLimit(
      withValidation(schema, handler),
      routeType
    )
  );
}
