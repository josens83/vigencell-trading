import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiter 설정
 * - 메모리 기반 (프로덕션에서는 Redis 권장)
 * - 엔드포인트별 다른 제한 적용
 */

// 일반 API 요청용 - 분당 60회
const generalLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
  blockDuration: 60,
});

// 인증 관련 - 분당 10회 (브루트포스 방지)
const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 300, // 5분 차단
});

// 결제 관련 - 분당 5회
const paymentLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
  blockDuration: 300,
});

// 회원가입 - 시간당 5회
const registerLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  blockDuration: 3600,
});

type LimiterType = 'general' | 'auth' | 'payment' | 'register';

const limiters: Record<LimiterType, RateLimiterMemory> = {
  general: generalLimiter,
  auth: authLimiter,
  payment: paymentLimiter,
  register: registerLimiter,
};

/**
 * 클라이언트 IP 추출
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return '127.0.0.1';
}

/**
 * Rate Limit 응답 생성
 */
function createRateLimitResponse(rateLimiterRes: RateLimiterRes): NextResponse {
  const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);

  return NextResponse.json(
    {
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(rateLimiterRes.remainingPoints + rateLimiterRes.consumedPoints),
        'X-RateLimit-Remaining': String(rateLimiterRes.remainingPoints),
        'X-RateLimit-Reset': String(Date.now() + rateLimiterRes.msBeforeNext),
      },
    }
  );
}

/**
 * Rate Limit 체크 함수
 * @returns null if allowed, NextResponse if rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  type: LimiterType = 'general'
): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const limiter = limiters[type];

  try {
    await limiter.consume(ip);
    return null; // 허용
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      return createRateLimitResponse(error);
    }
    // 예상치 못한 에러는 허용 (fail-open)
    console.error('Rate limiter error:', error);
    return null;
  }
}

/**
 * Rate Limit 미들웨어 (HOF)
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: LimiterType = 'general'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await checkRateLimit(request, type);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(request);
  };
}
