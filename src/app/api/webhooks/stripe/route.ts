import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe 구독 상태를 DB 상태로 변환
function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' {
  const statusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING'> = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'INACTIVE',
    incomplete: 'INACTIVE',
    incomplete_expired: 'INACTIVE',
    paused: 'INACTIVE',
  };
  return statusMap[stripeStatus] || 'INACTIVE';
}

// 가격 ID로 플랜 결정
function getPlanFromPriceId(priceId: string): 'FREE' | 'BASIC' | 'PREMIUM' {
  const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID;
  const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;

  if (priceId === premiumPriceId) return 'PREMIUM';
  if (priceId === basicPriceId) return 'BASIC';
  return 'FREE';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Stripe 서명이 없습니다.' },
        { status: 400 }
      );
    }

    // 웹훅 검증
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: '웹훅 서명 검증 실패' },
        { status: 400 }
      );
    }

    // 이벤트 처리
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: '웹훅 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 체크아웃 완료 처리
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // 구독 정보 조회
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  // DB 업데이트
  await db.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: mapSubscriptionStatus(subscription.status),
      plan: getPlanFromPriceId(priceId),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: mapSubscriptionStatus(subscription.status),
      plan: getPlanFromPriceId(priceId),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Checkout complete for user ${userId}, subscription ${subscriptionId}`);
}

// 구독 업데이트 처리
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // 고객 ID로 구독 찾기
  const existingSubscription = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.log(`No subscription found for customer ${customerId}`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;

  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: mapSubscriptionStatus(subscription.status),
      plan: getPlanFromPriceId(priceId),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated: ${subscription.id}`);
}

// 구독 취소 처리
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const existingSubscription = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.log(`No subscription found for customer ${customerId}`);
    return;
  }

  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'CANCELED',
      plan: 'FREE',
    },
  });

  console.log(`Subscription canceled: ${subscription.id}`);
}

// 결제 성공 처리
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`Payment succeeded for customer ${customerId}, amount: ${invoice.amount_paid}`);

  // 추가 로직: 영수증 발송, 알림 등
}

// 결제 실패 처리
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const existingSubscription = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (existingSubscription) {
    await db.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: 'PAST_DUE',
      },
    });
  }

  console.log(`Payment failed for customer ${customerId}`);

  // 추가 로직: 사용자에게 알림 발송
}
