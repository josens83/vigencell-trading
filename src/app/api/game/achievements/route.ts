import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// 업적 해금 스키마
const unlockSchema = z.object({
  achievementCode: z.string().min(1),
});

// 기본 업적 목록 (DB에 없을 경우 사용)
const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'first_trade',
    name: '첫 거래',
    description: '첫 번째 매매를 완료하세요',
    icon: '🎯',
    points: 10,
  },
  {
    code: 'diamond_hands',
    name: '다이아몬드 핸드',
    description: '30일 연속 홀딩하세요',
    icon: '💎',
    points: 30,
  },
  {
    code: 'bottom_fisher',
    name: '바텀 피셔',
    description: '최저가 근처에서 매수하세요',
    icon: '🎣',
    points: 50,
  },
  {
    code: 'profit_10',
    name: '10% 수익',
    description: '총 자산 10% 이상 수익 달성',
    icon: '📈',
    points: 20,
  },
  {
    code: 'profit_50',
    name: '50% 수익',
    description: '총 자산 50% 이상 수익 달성',
    icon: '🚀',
    points: 50,
  },
  {
    code: 'profit_100',
    name: '100% 수익',
    description: '총 자산 100% 이상 수익 달성',
    icon: '🌟',
    points: 100,
  },
  {
    code: 'survivor',
    name: '생존자',
    description: '멘탈 20 이하에서 회복하세요',
    icon: '🛡️',
    points: 30,
  },
  {
    code: 'mental_master',
    name: '멘탈 마스터',
    description: '멘탈 80 이상 유지하며 게임 완료',
    icon: '🧘',
    points: 40,
  },
  {
    code: 'win_streak_5',
    name: '연승왕',
    description: '5연승 달성',
    icon: '🔥',
    points: 30,
  },
  {
    code: 'win_streak_10',
    name: '전설의 투자자',
    description: '10연승 달성',
    icon: '👑',
    points: 100,
  },
  {
    code: 'all_in',
    name: '올인',
    description: '전 재산으로 한 번에 매수',
    icon: '🎰',
    points: 20,
  },
  {
    code: 'patient_investor',
    name: '인내의 투자자',
    description: '100일 이상 플레이',
    icon: '⏰',
    points: 25,
  },
  {
    code: 'game_complete',
    name: '게임 완료',
    description: '게임을 끝까지 플레이하세요',
    icon: '🏆',
    points: 50,
  },
  {
    code: 'happy_ending',
    name: '해피 엔딩',
    description: '좋은 결말로 게임을 완료하세요',
    icon: '🌈',
    points: 100,
  },
];

// GET: 업적 목록 조회
export async function GET() {
  try {
    const session = await getCurrentUser();

    // 모든 업적 조회 (없으면 기본 업적 사용)
    let achievements = await db.achievement.findMany({
      orderBy: { points: 'asc' },
    });

    // DB에 업적이 없으면 기본 업적 반환
    if (achievements.length === 0) {
      return NextResponse.json({
        success: true,
        achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({
          ...a,
          unlocked: false,
          unlockedAt: null,
        })),
        totalPoints: 0,
        unlockedCount: 0,
      });
    }

    // 로그인한 경우 해금된 업적 조회
    let userAchievements: { achievementId: string; unlockedAt: Date }[] = [];
    if (session) {
      userAchievements = await db.userAchievement.findMany({
        where: { userId: session.userId },
        select: { achievementId: true, unlockedAt: true },
      });
    }

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    // 업적 데이터 구성
    const achievementsWithStatus = achievements.map((a) => ({
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      points: a.points,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: unlockedMap.get(a.id) || null,
    }));

    // 총 포인트 및 해금 수 계산
    const unlockedCount = userAchievements.length;
    const totalPoints = achievements
      .filter((a) => unlockedIds.has(a.id))
      .reduce((sum, a) => sum + a.points, 0);

    return NextResponse.json({
      success: true,
      achievements: achievementsWithStatus,
      totalPoints,
      unlockedCount,
      totalAchievements: achievements.length,
    });
  } catch (error) {
    console.error('Achievements fetch error:', error);
    return NextResponse.json(
      { error: '업적 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 업적 해금
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
    const validationResult = unlockSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 데이터입니다.' },
        { status: 400 }
      );
    }

    const { achievementCode } = validationResult.data;

    // 업적 조회
    let achievement = await db.achievement.findUnique({
      where: { code: achievementCode },
    });

    // 업적이 없으면 기본 업적에서 생성
    if (!achievement) {
      const defaultAchievement = DEFAULT_ACHIEVEMENTS.find(
        (a) => a.code === achievementCode
      );

      if (!defaultAchievement) {
        return NextResponse.json(
          { error: '존재하지 않는 업적입니다.' },
          { status: 404 }
        );
      }

      // 업적 생성
      achievement = await db.achievement.create({
        data: defaultAchievement,
      });
    }

    // 이미 해금되었는지 확인
    const existing = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.userId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: '이미 해금된 업적입니다.',
        alreadyUnlocked: true,
        achievement: {
          code: achievement.code,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          unlockedAt: existing.unlockedAt,
        },
      });
    }

    // 업적 해금
    const userAchievement = await db.userAchievement.create({
      data: {
        userId: session.userId,
        achievementId: achievement.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: '업적이 해금되었습니다!',
      alreadyUnlocked: false,
      achievement: {
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
        unlockedAt: userAchievement.unlockedAt,
      },
    });
  } catch (error) {
    console.error('Achievement unlock error:', error);
    return NextResponse.json(
      { error: '업적 해금 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
