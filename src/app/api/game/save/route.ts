import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

// 게임 상태 스키마
const gameStateSchema = z.object({
  currentDay: z.number().min(0),
  currentEventIndex: z.number().min(0),
  cash: z.number().min(0),
  shares: z.number().min(0),
  averageCost: z.number().min(0),
  mentalState: z.number().min(0).max(100),
  totalTrades: z.number().min(0),
  wins: z.number().min(0),
  losses: z.number().min(0),
  maxProfit: z.number(),
  maxLoss: z.number(),
  currentStreak: z.number(),
  achievements: z.array(z.string()),
  gameLog: z.array(z.object({
    day: z.number(),
    action: z.string(),
    price: z.number(),
    amount: z.number().optional(),
    result: z.string().optional(),
  })),
});

const saveRequestSchema = z.object({
  slotNumber: z.number().min(1).max(3),
  saveName: z.string().max(50).optional(),
  gameState: gameStateSchema,
});

// POST: 게임 저장
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip, 'general');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 인증 확인
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const validationResult = saveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { slotNumber, saveName, gameState } = validationResult.data;

    // 포트폴리오 가치 계산 (현재 가격 기준)
    const currentPrice = calculateCurrentPrice(gameState.currentDay);
    const portfolioValue = gameState.cash + (gameState.shares * currentPrice);
    const initialCash = 10000000; // 1천만원
    const totalReturn = ((portfolioValue - initialCash) / initialCash) * 100;

    // 게임 저장 (upsert)
    const save = await db.gameSave.upsert({
      where: {
        userId_slotNumber: {
          userId: session.userId,
          slotNumber,
        },
      },
      update: {
        saveName: saveName || `저장 ${slotNumber}`,
        gameState: gameState as object,
        currentDate: new Date(),
        portfolioValue,
        totalReturn,
        daysPlayed: gameState.currentDay,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        slotNumber,
        saveName: saveName || `저장 ${slotNumber}`,
        gameState: gameState as object,
        currentDate: new Date(),
        portfolioValue,
        totalReturn,
        daysPlayed: gameState.currentDay,
      },
    });

    return NextResponse.json({
      success: true,
      message: '게임이 저장되었습니다.',
      save: {
        id: save.id,
        slotNumber: save.slotNumber,
        saveName: save.saveName,
        portfolioValue: save.portfolioValue,
        totalReturn: save.totalReturn,
        daysPlayed: save.daysPlayed,
        updatedAt: save.updatedAt,
      },
    });
  } catch (error) {
    console.error('Game save error:', error);
    return NextResponse.json(
      { error: '게임 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 저장 목록 조회
export async function GET() {
  try {
    // 인증 확인
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자의 모든 저장 데이터 조회
    const saves = await db.gameSave.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        slotNumber: true,
        saveName: true,
        portfolioValue: true,
        totalReturn: true,
        daysPlayed: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { slotNumber: 'asc' },
    });

    // 빈 슬롯 포함하여 3개 슬롯 정보 반환
    const slots = [1, 2, 3].map((slotNumber) => {
      const save = saves.find((s) => s.slotNumber === slotNumber);
      return save || { slotNumber, empty: true };
    });

    return NextResponse.json({
      success: true,
      saves: slots,
    });
  } catch (error) {
    console.error('Game saves list error:', error);
    return NextResponse.json(
      { error: '저장 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 현재 가격 계산 (게임 로직에서 가져옴)
function calculateCurrentPrice(day: number): number {
  // 바이젠셀 실제 주가 데이터 기반 가격 계산
  // 간단화된 버전 - 실제로는 게임 로직과 동기화 필요
  const basePrice = 52700; // IPO 가격
  const events = [
    { day: 0, price: 52700 },
    { day: 30, price: 45000 },
    { day: 100, price: 25000 },
    { day: 200, price: 10000 },
    { day: 300, price: 5000 },
    { day: 400, price: 2305 },
    { day: 500, price: 8000 },
    { day: 600, price: 17360 },
  ];

  // 현재 날짜에 해당하는 이벤트 찾기
  for (let i = events.length - 1; i >= 0; i--) {
    if (day >= events[i].day) {
      if (i === events.length - 1) return events[i].price;

      // 선형 보간
      const current = events[i];
      const next = events[i + 1];
      const progress = (day - current.day) / (next.day - current.day);
      return Math.round(current.price + (next.price - current.price) * progress);
    }
  }

  return basePrice;
}
