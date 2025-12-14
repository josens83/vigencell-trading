import { z } from 'zod';

/**
 * 이메일 유효성 검사
 * - 표준 이메일 형식
 * - 최대 255자
 */
export const emailSchema = z
  .string()
  .email('유효한 이메일 주소를 입력해주세요')
  .max(255, '이메일은 255자를 초과할 수 없습니다')
  .transform((email) => email.toLowerCase().trim());

/**
 * 비밀번호 유효성 검사
 * - 최소 8자
 * - 최대 128자
 * - 최소 하나의 대문자, 소문자, 숫자 권장
 */
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(128, '비밀번호는 128자를 초과할 수 없습니다')
  .refine(
    (password) => /[a-z]/.test(password),
    '비밀번호에 소문자가 포함되어야 합니다'
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    '비밀번호에 대문자가 포함되어야 합니다'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    '비밀번호에 숫자가 포함되어야 합니다'
  );

/**
 * 이름 유효성 검사 (선택 필드)
 */
export const nameSchema = z
  .string()
  .max(100, '이름은 100자를 초과할 수 없습니다')
  .transform((name) => name.trim())
  .optional();

/**
 * 회원가입 요청 스키마
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

/**
 * 로그인 요청 스키마
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

/**
 * 결제 요청 스키마
 */
export const paymentSchema = z.object({
  plan: z.enum(['basic', 'premium'], {
    errorMap: () => ({ message: '유효한 플랜을 선택해주세요' }),
  }),
});

/**
 * 게임 저장 스키마
 */
export const gameSaveSchema = z.object({
  slotNumber: z.number().int().min(1).max(3),
  saveName: z.string().max(50).optional(),
  gameState: z.object({
    currentDate: z.string(),
    cash: z.number().nonnegative(),
    shares: z.number().int().nonnegative(),
    avgCost: z.number().nonnegative(),
    totalInvested: z.number().nonnegative(),
    realizedProfit: z.number(),
    mental: z.number().min(0).max(100),
    achievements: z.array(z.string()),
    trades: z.array(z.object({
      type: z.enum(['BUY', 'SELL']),
      date: z.string(),
      price: z.number().positive(),
      amount: z.number().int().positive(),
      total: z.number().positive(),
      profit: z.number().optional(),
    })),
    stats: z.object({
      totalTrades: z.number().int().nonnegative(),
      winningTrades: z.number().int().nonnegative(),
      losingTrades: z.number().int().nonnegative(),
      maxProfit: z.number(),
      maxLoss: z.number(),
      daysPlayed: z.number().int().nonnegative(),
    }),
  }),
});

/**
 * 검증 오류 포맷팅
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((err) => err.message).join(', ');
}

/**
 * 타입 추론을 위한 타입 내보내기
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type GameSaveInput = z.infer<typeof gameSaveSchema>;
