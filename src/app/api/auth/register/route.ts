import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다' },
        { status: 409 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        subscription: {
          create: {
            status: 'ACTIVE',
            plan: 'FREE',
          },
        },
      },
    });

    // 토큰 생성 및 쿠키 설정
    const token = createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
