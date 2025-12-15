import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET: 특정 슬롯의 게임 불러오기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slot: string }> }
) {
  try {
    // 인증 확인
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { slot } = await params;
    const slotNumber = parseInt(slot, 10);

    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 3) {
      return NextResponse.json(
        { error: '유효하지 않은 슬롯 번호입니다.' },
        { status: 400 }
      );
    }

    // 저장 데이터 조회
    const save = await db.gameSave.findUnique({
      where: {
        userId_slotNumber: {
          userId: session.userId,
          slotNumber,
        },
      },
    });

    if (!save) {
      return NextResponse.json(
        { error: '저장된 게임이 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      save: {
        id: save.id,
        slotNumber: save.slotNumber,
        saveName: save.saveName,
        gameState: save.gameState,
        portfolioValue: save.portfolioValue,
        totalReturn: save.totalReturn,
        daysPlayed: save.daysPlayed,
        createdAt: save.createdAt,
        updatedAt: save.updatedAt,
      },
    });
  } catch (error) {
    console.error('Game load error:', error);
    return NextResponse.json(
      { error: '게임 불러오기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 특정 슬롯의 게임 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slot: string }> }
) {
  try {
    // 인증 확인
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { slot } = await params;
    const slotNumber = parseInt(slot, 10);

    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > 3) {
      return NextResponse.json(
        { error: '유효하지 않은 슬롯 번호입니다.' },
        { status: 400 }
      );
    }

    // 저장 데이터 삭제
    const deleted = await db.gameSave.delete({
      where: {
        userId_slotNumber: {
          userId: session.userId,
          slotNumber,
        },
      },
    }).catch(() => null);

    if (!deleted) {
      return NextResponse.json(
        { error: '삭제할 저장 데이터가 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '게임이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Game delete error:', error);
    return NextResponse.json(
      { error: '게임 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
