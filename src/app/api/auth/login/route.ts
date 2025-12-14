import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema, formatZodError } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders, logSecurityEvent } from '@/lib/security';

/**
 * @api {post} /api/auth/login 로그인
 * @apiDescription 기존 사용자 로그인
 *
 * @apiBody {string} email 이메일 주소
 * @apiBody {string} password 비밀번호
 *
 * @apiSuccess {boolean} success 성공 여부
 * @apiSuccess {object} user 사용자 정보
 *
 * @apiError {string} error 오류 메시지
 */
export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // 1. Rate Limiting 체크 (브루트포스 방지)
    const rateLimitResponse = await checkRateLimit(request, 'auth');
    if (rateLimitResponse) {
      logSecurityEvent({
        timestamp: new Date(),
        event: 'LOGIN_RATE_LIMITED',
        ip: clientIP,
      });
      return rateLimitResponse;
    }

    // 2. 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch {
      return addSecurityHeaders(
        NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
      );
    }

    // 3. 입력 검증
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: formatZodError(validationResult.error) },
          { status: 400 }
        )
      );
    }

    const { email, password } = validationResult.data;

    // 4. 사용자 조회
    const user = await db.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    // 5. 타이밍 공격 방지를 위해 사용자가 없어도 해시 비교 수행
    const dummyHash = '$2a$12$dummyhashfordummyhashfordummyha';
    const passwordToVerify = user?.password || dummyHash;
    const isValid = await verifyPassword(password, passwordToVerify);

    if (!user || !isValid) {
      logSecurityEvent({
        timestamp: new Date(),
        event: 'LOGIN_FAILED',
        ip: clientIP,
        details: { email, reason: !user ? 'USER_NOT_FOUND' : 'INVALID_PASSWORD' },
      });

      return addSecurityHeaders(
        NextResponse.json(
          { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
          { status: 401 }
        )
      );
    }

    // 6. 토큰 생성 및 쿠키 설정
    const token = createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    // 7. 성공 로그
    logSecurityEvent({
      timestamp: new Date(),
      event: 'LOGIN_SUCCESS',
      ip: clientIP,
      userId: user.id,
    });

    // 8. 응답 반환 (민감한 정보 제외)
    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: user.subscription
            ? {
                status: user.subscription.status,
                plan: user.subscription.plan,
              }
            : null,
        },
      })
    );
  } catch (error) {
    console.error('Login error:', error);

    logSecurityEvent({
      timestamp: new Date(),
      event: 'LOGIN_ERROR',
      ip: clientIP,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return addSecurityHeaders(
      NextResponse.json({ error: '로그인 중 오류가 발생했습니다' }, { status: 500 })
    );
  }
}
