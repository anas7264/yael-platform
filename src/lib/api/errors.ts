import { NextResponse } from 'next/server';

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

const STATUS_MAP: Record<ErrorCode, number> = {
  UNAUTHORIZED:     401,
  FORBIDDEN:        403,
  NOT_FOUND:        404,
  RATE_LIMITED:     429,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR:   500,
};

const ARABIC_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED:     'يجب تسجيل الدخول للوصول إلى هذه الخدمة.',
  FORBIDDEN:        'ليس لديك صلاحية للوصول إلى هذا المورد.',
  NOT_FOUND:        'المورد المطلوب غير موجود.',
  RATE_LIMITED:     'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قبل المحاولة مرة أخرى.',
  VALIDATION_ERROR: 'البيانات المُرسلة غير صحيحة. يرجى مراجعة المدخلات.',
  INTERNAL_ERROR:   'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.',
};

/**
 * Structured application error with Arabic message and HTTP status.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly messageArabic: string;

  constructor(
    code: ErrorCode,
    /** Optional English override for logging — Arabic message served to client */
    messageOverride?: string,
  ) {
    super(messageOverride ?? ARABIC_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = STATUS_MAP[code];
    this.messageArabic = ARABIC_MESSAGES[code];
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface ApiErrorBody {
  error: string;
  code: ErrorCode;
  message_ar: string;
}

/**
 * Catches AppError and unknown errors and returns a standardised NextResponse JSON.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code, message_ar: error.messageArabic },
      { status: error.statusCode }
    );
  }

  console.error('[Unhandled API Error]', error);

  const fallback = new AppError('INTERNAL_ERROR');
  return NextResponse.json(
    { error: fallback.message, code: fallback.code, message_ar: fallback.messageArabic },
    { status: fallback.statusCode }
  );
}
