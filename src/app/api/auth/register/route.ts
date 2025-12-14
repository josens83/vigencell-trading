import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { registerSchema, formatZodError } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders, logSecurityEvent, checkPasswordStrength } from '@/lib/security';

/**
 * @api {post} /api/auth/register 회원가입
 * @apiDescription 새로운 사용자를 등록합니다
 *
 * @apiBody {string} email 이메일 주소
 * @apiBody {string} password 비밀번호 (최소 8자, 대소문자+숫자 포함)
 * @apiBody {string} [name] 이름 (선택)
 *
 * @apiSuccess {boolean} success 성공 여부
 * @apiSuccess {object} user 사용자 정보
 *
 * @apiError {string} error 오류 메시지
 */
export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // 1. Rate Limiting 체크
    const rateLimitResponse = await checkRateLimit(request, 'register');
    if (rateLimitResponse) {
      logSecurityEvent({
        timestamp: new Date(),
        event: 'REGISTER_RATE_LIMITED',
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
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: formatZodError(validationResult.error) },
          { status: 400 }
        )
      );
    }

    const { email, password, name } = validationResult.data;

    // 4. 비밀번호 강도 검사
    const passwordStrength = checkPasswordStrength(password);
    if (passwordStrength.score < 4) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            error: '비밀번호가 너무 약합니다',
            feedback: passwordStrength.feedback,
          },
          { status: 400 }
        )
      );
    }

    // 5. 이메일 중복 확인
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logSecurityEvent({
        timestamp: new Date(),
        event: 'REGISTER_DUPLICATE_EMAIL',
        ip: clientIP,
        details: { email },
      });

      return addSecurityHeaders(
        NextResponse.json(
          { error: '이미 가입된 이메일입니다' },
          { status: 409 }
        )
      );
    }

    // 6. 비밀번호 해시
    const hashedPassword = await hashPassword(password);

    // 7. 사용자 생성
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        subscription: {
          create: {
            status: 'ACTIVE',
            plan: 'FREE',
          },
        },
      },
    });

    // 8. 토큰 생성 및 쿠키 설정
    const token = createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    // 9. 보안 로그
    logSecurityEvent({
      timestamp: new Date(),
      event: 'USER_REGISTERED',
      ip: clientIP,
      userId: user.id,
    });

    // 10. 응답 반환
    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      })
    );
  } catch (error) {
    console.error('Registration error:', error);

    logSecurityEvent({
      timestamp: new Date(),
      event: 'REGISTER_ERROR',
      ip: clientIP,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return addSecurityHeaders(
      NextResponse.json({ error: '회원가입 중 오류가 발생했습니다' }, { status: 500 })
    );
  }
}
