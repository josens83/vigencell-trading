import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json(
        { error: '인증되지 않았습니다' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        subscription: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
        gameSaves: {
          select: {
            slotNumber: true,
            saveName: true,
            portfolioValue: true,
            totalReturn: true,
            daysPlayed: true,
            updatedAt: true,
          },
          orderBy: { slotNumber: 'asc' },
        },
        leaderboardEntries: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        subscription: user.subscription || {
          plan: 'FREE',
          status: 'ACTIVE',
        },
        achievements: user.achievements,
        gameSaves: user.gameSaves,
        latestLeaderboard: user.leaderboardEntries[0] || null,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: '인증 확인 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
