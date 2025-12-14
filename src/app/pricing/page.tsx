'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');
  const selectedPlan = searchParams.get('plan');

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubscribe = async (plan: string) => {
    if (!isLoggedIn) {
      router.push(`/register?plan=${plan}`);
      return;
    }

    setIsLoading(plan);
    setError('');

    try {
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '결제 세션 생성에 실패했습니다');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🧬</span>
            <span className="text-xl font-bold text-white">바이젠셀 투자 마스터</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">요금제 선택</h1>
          <p className="text-gray-400">
            나에게 맞는 플랜을 선택하세요
          </p>
        </div>

        {canceled && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8 text-center">
            <p className="text-yellow-400">결제가 취소되었습니다. 다시 시도해주세요.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* 무료 플랜 */}
          <div className="game-card p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">무료</h3>
              <div className="text-4xl font-bold text-white mb-2">₩0</div>
              <div className="text-gray-400">영원히 무료</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 데모 게임 1회
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 기본 튜토리얼
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 업적 5개
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <span>✗</span> 저장 기능
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <span>✗</span> 리더보드
              </li>
            </ul>
            <Link
              href={isLoggedIn ? '/game/demo' : '/register'}
              className="block btn-secondary text-center py-3 w-full"
            >
              {isLoggedIn ? '데모 플레이' : '무료로 시작'}
            </Link>
          </div>

          {/* 베이직 플랜 */}
          <div className={`game-card p-6 relative ${selectedPlan === 'basic' ? 'border-blue-500' : 'border-blue-500/50'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm py-1 px-4 rounded-full">
              인기
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">베이직</h3>
              <div className="text-4xl font-bold text-white mb-2">₩9,900</div>
              <div className="text-gray-400">월간 구독</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 무제한 게임
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 저장 슬롯 3개
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 전체 업적 (8개)
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 월간 리더보드
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <span>✗</span> 프리미엄 시나리오
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('basic')}
              disabled={isLoading === 'basic'}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading === 'basic' ? '처리 중...' : '구독하기'}
            </button>
          </div>

          {/* 프리미엄 플랜 */}
          <div className={`game-card p-6 ${selectedPlan === 'premium' ? 'border-purple-500' : 'border-purple-500/50'}`}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">프리미엄</h3>
              <div className="text-4xl font-bold text-white mb-2">₩79,000</div>
              <div className="text-gray-400">연간 구독 <span className="text-green-400">(33% 할인)</span></div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 베이직 전체 기능
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 프리미엄 시나리오
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 다른 종목 시나리오
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 상세 통계 분석
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span> 우선 지원
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('premium')}
              disabled={isLoading === 'premium'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading === 'premium' ? '처리 중...' : '연간 구독'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>모든 결제는 Stripe를 통해 안전하게 처리됩니다.</p>
          <p className="mt-2">구독은 언제든지 취소할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
