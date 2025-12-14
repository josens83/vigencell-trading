import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * 보안 헤더 설정
 * OWASP 권장 사항 기반
 */
export const securityHeaders = {
  // XSS 공격 방지
  'X-XSS-Protection': '1; mode=block',

  // 클릭재킹 방지
  'X-Frame-Options': 'DENY',

  // MIME 타입 스니핑 방지
  'X-Content-Type-Options': 'nosniff',

  // 리퍼러 정책
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 권한 정책
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // HSTS (프로덕션에서만)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

/**
 * CSP (Content Security Policy) 생성
 */
export function generateCSP(): string {
  const nonce = crypto.randomBytes(16).toString('base64');

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://cdn.jsdelivr.net",
    "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join('; ');
}

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }

  // 타이밍 공격 방지를 위한 상수 시간 비교
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );
  } catch {
    return false;
  }
}

/**
 * 응답에 보안 헤더 추가
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CSP 추가
  response.headers.set('Content-Security-Policy', generateCSP());

  return response;
}

/**
 * HTML 이스케이프 (XSS 방지)
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * SQL 인젝션 방지를 위한 기본 검증
 * (Prisma 사용 시 이미 파라미터화되어 있지만 추가 방어층)
 */
export function sanitizeForDB(input: string): string {
  // 기본적인 SQL 키워드 검사
  const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b)/gi;

  if (sqlKeywords.test(input)) {
    throw new Error('잠재적으로 위험한 입력이 감지되었습니다');
  }

  return input.trim();
}

/**
 * 보안 로그 기록 (감사 추적용)
 */
export interface SecurityLog {
  timestamp: Date;
  event: string;
  ip: string;
  userId?: string;
  details?: Record<string, unknown>;
}

export function logSecurityEvent(log: SecurityLog): void {
  // 프로덕션에서는 외부 로깅 서비스 사용 권장
  console.warn('[SECURITY]', JSON.stringify({
    ...log,
    timestamp: log.timestamp.toISOString(),
  }));
}

/**
 * 비밀번호 강도 검사
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (password.length < 8) feedback.push('비밀번호는 8자 이상이어야 합니다');
  if (!/[a-z]/.test(password)) feedback.push('소문자를 포함하세요');
  if (!/[A-Z]/.test(password)) feedback.push('대문자를 포함하세요');
  if (!/[0-9]/.test(password)) feedback.push('숫자를 포함하세요');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('특수문자를 포함하면 더 안전합니다');

  // 일반적인 비밀번호 패턴 검사
  const commonPatterns = [
    /^12345/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('너무 흔한 비밀번호 패턴입니다');
  }

  return { score, feedback };
}

/**
 * IP 주소 검증
 */
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
