import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCheckoutSession, PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (plan !== 'basic' && plan !== 'premium') {
      return NextResponse.json(
        { error: '유효하지 않은 플랜입니다' },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig || !('priceId' in planConfig) || !planConfig.priceId) {
      return NextResponse.json(
        { error: '플랜 설정이 올바르지 않습니다' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await createCheckoutSession(
      session.userId,
      planConfig.priceId,
      `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/pricing?canceled=true`
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: '결제 세션 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
