import {
  generateCSRFToken,
  verifyCSRFToken,
  escapeHtml,
  checkPasswordStrength,
  isValidIP,
} from '@/lib/security';

describe('Security Utils', () => {
  // CSRF 토큰 테스트
  describe('generateCSRFToken', () => {
    it('64자 16진수 문자열을 생성해야 함', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('매번 다른 토큰을 생성해야 함', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyCSRFToken', () => {
    it('동일한 토큰을 검증해야 함', () => {
      const token = generateCSRFToken();
      expect(verifyCSRFToken(token, token)).toBe(true);
    });

    it('다른 토큰을 거부해야 함', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(verifyCSRFToken(token1, token2)).toBe(false);
    });

    it('빈 토큰을 거부해야 함', () => {
      expect(verifyCSRFToken('', '')).toBe(false);
      expect(verifyCSRFToken('token', '')).toBe(false);
      expect(verifyCSRFToken('', 'token')).toBe(false);
    });

    it('길이가 다른 토큰도 안전하게 처리해야 함', () => {
      expect(verifyCSRFToken('short', 'muchlongertoken')).toBe(false);
    });
  });

  // HTML 이스케이프 테스트
  describe('escapeHtml', () => {
    it('특수 문자를 이스케이프해야 함', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeHtml("'single'")).toBe('&#x27;single&#x27;');
      expect(escapeHtml('&ampersand')).toBe('&amp;ampersand');
      expect(escapeHtml('/slash')).toBe('&#x2F;slash');
    });

    it('일반 텍스트는 변경하지 않아야 함', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('한글 텍스트')).toBe('한글 텍스트');
    });

    it('XSS 공격 패턴을 무력화해야 함', () => {
      const xssPayload = '<script>alert("xss")</script>';
      const escaped = escapeHtml(xssPayload);
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
    });
  });

  // 비밀번호 강도 테스트
  describe('checkPasswordStrength', () => {
    it('강한 비밀번호에 높은 점수를 부여해야 함', () => {
      const result = checkPasswordStrength('MyStr0ng!Pass');
      expect(result.score).toBeGreaterThanOrEqual(5);
      expect(result.feedback.length).toBe(0);
    });

    it('약한 비밀번호에 낮은 점수와 피드백을 제공해야 함', () => {
      const result = checkPasswordStrength('weak');
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('흔한 패턴에 페널티를 부여해야 함', () => {
      const result1 = checkPasswordStrength('12345678');
      const result2 = checkPasswordStrength('password1A');

      expect(result1.feedback).toContain('너무 흔한 비밀번호 패턴입니다');
      expect(result2.feedback).toContain('너무 흔한 비밀번호 패턴입니다');
    });

    it('각 요구사항에 대한 피드백을 제공해야 함', () => {
      const result = checkPasswordStrength('aaaa');

      expect(result.feedback).toContain('비밀번호는 8자 이상이어야 합니다');
      expect(result.feedback).toContain('대문자를 포함하세요');
      expect(result.feedback).toContain('숫자를 포함하세요');
    });

    it('12자 이상 비밀번호에 추가 점수를 부여해야 함', () => {
      const shortPassword = checkPasswordStrength('Test1234');
      const longPassword = checkPasswordStrength('Test12345678');

      expect(longPassword.score).toBeGreaterThan(shortPassword.score);
    });
  });

  // IP 검증 테스트
  describe('isValidIP', () => {
    it('유효한 IPv4 주소를 통과시켜야 함', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
      expect(isValidIP('0.0.0.0')).toBe(true);
    });

    it('유효한 IPv6 주소를 통과시켜야 함', () => {
      expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    });

    it('유효하지 않은 IP를 거부해야 함', () => {
      expect(isValidIP('256.1.1.1')).toBe(false); // 범위 초과
      expect(isValidIP('192.168.1')).toBe(false); // 불완전
      expect(isValidIP('not.an.ip.address')).toBe(false);
      expect(isValidIP('')).toBe(false);
    });
  });
});
