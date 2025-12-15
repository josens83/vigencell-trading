import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// 리더보드 제출 스키마
const submitSchema = z.object({
  finalPortfolio: z.number().min(0),
  totalReturn: z.number(),
  totalTrades: z.number().min(0),
  winRate: z.number().min(0).max(100),
  achievementCount: z.number().min(0),
});

// GET: 리더보드 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || getCurrentPeriod();
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 현재 사용자 (로그인된 경우)
    const session = await getCurrentUser();

    // 리더보드 데이터 조회
    const entries = await db.leaderboardEntry.findMany({
      where: { period },
      orderBy: { totalReturn: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // 총 참가자 수
    const totalCount = await db.leaderboardEntry.count({
      where: { period },
    });

    // 현재 사용자의 랭킹 (로그인된 경우)
    let userRank = null;
    let userEntry = null;

    if (session) {
      userEntry = await db.leaderboardEntry.findUnique({
        where: {
          userId_period: {
            userId: session.userId,
            period,
          },
        },
      });

      if (userEntry) {
        // 현재 사용자보다 높은 점수를 가진 사람 수 + 1 = 랭킹
        const higherCount = await db.leaderboardEntry.count({
          where: {
            period,
            totalReturn: { gt: userEntry.totalReturn },
          },
        });
        userRank = higherCount + 1;
      }
    }

    // 랭킹 계산하여 반환
    const leaderboard = entries.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.userId,
      userName: entry.user.name || '익명',
      finalPortfolio: entry.finalPortfolio,
      totalReturn: entry.totalReturn,
      totalTrades: entry.totalTrades,
      winRate: entry.winRate,
      achievementCount: entry.achievementCount,
      createdAt: entry.createdAt,
      isCurrentUser: session?.userId === entry.userId,
    }));

    return NextResponse.json({
      success: true,
      period,
      totalCount,
      leaderboard,
      userRank,
      userEntry: userEntry
        ? {
            rank: userRank,
            finalPortfolio: userEntry.finalPortfolio,
            totalReturn: userEntry.totalReturn,
            totalTrades: userEntry.totalTrades,
            winRate: userEntry.winRate,
            achievementCount: userEntry.achievementCount,
          }
        : null,
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: '리더보드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 리더보드에 기록 제출
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = submitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { finalPortfolio, totalReturn, totalTrades, winRate, achievementCount } =
      validationResult.data;

    const period = getCurrentPeriod();

    // 기존 기록 확인
    const existingEntry = await db.leaderboardEntry.findUnique({
      where: {
        userId_period: {
          userId: session.userId,
          period,
        },
      },
    });

    // 기존 기록보다 나은 경우에만 업데이트
    if (existingEntry && existingEntry.totalReturn >= totalReturn) {
      return NextResponse.json({
        success: true,
        message: '이전 기록이 더 좋습니다.',
        updated: false,
        entry: existingEntry,
      });
    }

    // 리더보드 기록 저장/업데이트
    const entry = await db.leaderboardEntry.upsert({
      where: {
        userId_period: {
          userId: session.userId,
          period,
        },
      },
      update: {
        finalPortfolio,
        totalReturn,
        totalTrades,
        winRate,
        achievementCount,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        period,
        finalPortfolio,
        totalReturn,
        totalTrades,
        winRate,
        achievementCount,
      },
    });

    // 새 랭킹 계산
    const higherCount = await db.leaderboardEntry.count({
      where: {
        period,
        totalReturn: { gt: totalReturn },
      },
    });
    const newRank = higherCount + 1;

    return NextResponse.json({
      success: true,
      message: '기록이 제출되었습니다.',
      updated: true,
      entry: {
        ...entry,
        rank: newRank,
      },
    });
  } catch (error) {
    console.error('Leaderboard submit error:', error);
    return NextResponse.json(
      { error: '기록 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 현재 기간 계산 (월별)
function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
