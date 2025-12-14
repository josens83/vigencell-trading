import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const PLANS = {
  free: {
    name: '무료',
    price: 0,
    features: ['데모 게임 1회', '기본 튜토리얼', '업적 5개'],
  },
  basic: {
    name: '베이직',
    price: 9900,
    priceId: process.env.STRIPE_PRICE_MONTHLY,
    features: ['무제한 게임', '저장 슬롯 3개', '전체 업적', '월간 리더보드'],
  },
  premium: {
    name: '프리미엄',
    price: 79000,
    priceId: process.env.STRIPE_PRICE_YEARLY,
    features: ['베이직 전체 기능', '프리미엄 시나리오', '다른 종목 시나리오', '상세 통계', '우선 지원'],
  },
};

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
