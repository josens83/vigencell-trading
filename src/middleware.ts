import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 미들웨어 - 보안 헤더 및 인증 처리
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 보안 헤더 추가
  const securityHeaders: Record<string, string> = {
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // HSTS (프로덕션에서만)
  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains; preload';
  }

  // 헤더 설정
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 보호된 경로 체크
  const { pathname } = request.nextUrl;
  const protectedPaths = ['/game', '/dashboard', '/settings'];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 리다이렉트
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(pathname);

  if (isAuthPath) {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      return NextResponse.redirect(new URL('/game', request.url));
    }
  }

  return response;
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 적용:
     * - api routes (API 라우트는 자체 보안 처리)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico, robots.txt, etc
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|sw.js|icons/).*)',
  ],
};
