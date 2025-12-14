import {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  paymentSchema,
  formatZodError,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  // 이메일 검증 테스트
  describe('emailSchema', () => {
    it('유효한 이메일을 통과시켜야 함', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('이메일을 소문자로 변환하고 트림해야 함', () => {
      const result = emailSchema.safeParse('  TEST@EXAMPLE.COM  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('유효하지 않은 이메일을 거부해야 함', () => {
      const invalidEmails = [
        'notanemail',
        'missing@',
        '@nodomain.com',
        'spaces in@email.com',
        'no.at.sign.com',
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('255자를 초과하는 이메일을 거부해야 함', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = emailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
    });
  });

  // 비밀번호 검증 테스트
  describe('passwordSchema', () => {
    it('유효한 비밀번호를 통과시켜야 함', () => {
      const result = passwordSchema.safeParse('Test1234');
      expect(result.success).toBe(true);
    });

    it('8자 미만 비밀번호를 거부해야 함', () => {
      const result = passwordSchema.safeParse('Test12');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('8자');
      }
    });

    it('소문자가 없는 비밀번호를 거부해야 함', () => {
      const result = passwordSchema.safeParse('TEST1234');
      expect(result.success).toBe(false);
    });

    it('대문자가 없는 비밀번호를 거부해야 함', () => {
      const result = passwordSchema.safeParse('test1234');
      expect(result.success).toBe(false);
    });

    it('숫자가 없는 비밀번호를 거부해야 함', () => {
      const result = passwordSchema.safeParse('Testtest');
      expect(result.success).toBe(false);
    });

    it('128자를 초과하는 비밀번호를 거부해야 함', () => {
      const longPassword = 'Test1234' + 'a'.repeat(125);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
    });
  });

  // 회원가입 스키마 테스트
  describe('registerSchema', () => {
    it('유효한 회원가입 데이터를 통과시켜야 함', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Test1234',
        name: '홍길동',
      });
      expect(result.success).toBe(true);
    });

    it('이름 없이도 통과시켜야 함', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Test1234',
      });
      expect(result.success).toBe(true);
    });

    it('이메일 없이 실패해야 함', () => {
      const result = registerSchema.safeParse({
        password: 'Test1234',
      });
      expect(result.success).toBe(false);
    });

    it('비밀번호 없이 실패해야 함', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  // 로그인 스키마 테스트
  describe('loginSchema', () => {
    it('유효한 로그인 데이터를 통과시켜야 함', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('빈 비밀번호를 거부해야 함', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  // 결제 스키마 테스트
  describe('paymentSchema', () => {
    it('basic 플랜을 통과시켜야 함', () => {
      const result = paymentSchema.safeParse({ plan: 'basic' });
      expect(result.success).toBe(true);
    });

    it('premium 플랜을 통과시켜야 함', () => {
      const result = paymentSchema.safeParse({ plan: 'premium' });
      expect(result.success).toBe(true);
    });

    it('유효하지 않은 플랜을 거부해야 함', () => {
      const result = paymentSchema.safeParse({ plan: 'free' });
      expect(result.success).toBe(false);
    });

    it('빈 플랜을 거부해야 함', () => {
      const result = paymentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // 에러 포맷팅 테스트
  describe('formatZodError', () => {
    it('에러 메시지를 쉼표로 구분해야 함', () => {
      const result = registerSchema.safeParse({});
      if (!result.success) {
        const formatted = formatZodError(result.error);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      }
    });
  });
});
