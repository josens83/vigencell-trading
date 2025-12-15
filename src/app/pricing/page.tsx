'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: '구독을 취소하면 어떻게 되나요?',
    answer:
      '구독을 취소해도 현재 결제 기간이 끝날 때까지 모든 기능을 이용할 수 있습니다. 이후에는 무료 플랜으로 전환됩니다. 저장된 게임 데이터는 30일간 보관됩니다.',
  },
  {
    question: '환불이 가능한가요?',
    answer:
      '첫 결제 후 7일 이내에 요청하시면 전액 환불해 드립니다. 환불 요청은 고객센터를 통해 진행할 수 있습니다.',
  },
  {
    question: '플랜을 변경할 수 있나요?',
    answer:
      '언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 업그레이드 시 차액만 결제되며, 다운그레이드는 다음 결제일부터 적용됩니다.',
  },
  {
    question: '결제 정보는 안전한가요?',
    answer:
      '모든 결제는 Stripe를 통해 처리되며, 당사는 카드 정보를 직접 저장하지 않습니다. Stripe는 PCI DSS Level 1 인증을 받은 가장 안전한 결제 시스템입니다.',
  },
  {
    question: '여러 기기에서 사용할 수 있나요?',
    answer:
      '네, 하나의 계정으로 여러 기기에서 로그인하여 사용할 수 있습니다. 게임 진행 상황은 자동으로 동기화됩니다.',
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-white text-center mb-8">자주 묻는 질문</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="game-card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-white">{item.question}</span>
              <span
                className={`text-gray-400 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'max-h-40' : 'max-h-0'
              }`}
            >
              <p className="px-6 pb-4 text-gray-400">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureComparisonTable() {
  const features = [
    { name: '게임 플레이', free: '1회', basic: '무제한', premium: '무제한' },
    { name: '저장 슬롯', free: '없음', basic: '3개', premium: '3개' },
    { name: '업적', free: '5개', basic: '8개', premium: '14개' },
    { name: '리더보드', free: '없음', basic: '월간', premium: '월간 + 주간' },
    { name: '시나리오', free: '기본', basic: '기본', premium: '프리미엄 포함' },
    { name: '종목', free: '바이젠셀', basic: '바이젠셀', premium: '다양한 종목' },
    { name: '통계 분석', free: '기본', basic: '기본', premium: '상세 분석' },
    { name: '고객 지원', free: '커뮤니티', basic: '이메일', premium: '우선 지원' },
  ];

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-white text-center mb-8">기능 비교</h2>
      <div className="overflow-x-auto">
        <table className="w-full max-w-4xl mx-auto">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-4 px-4 text-gray-400 font-medium">기능</th>
              <th className="text-center py-4 px-4 text-gray-400 font-medium">무료</th>
              <th className="text-center py-4 px-4 text-blue-400 font-medium">베이직</th>
              <th className="text-center py-4 px-4 text-purple-400 font-medium">프리미엄</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                className="border-b border-slate-700/50 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4 text-white">{feature.name}</td>
                <td className="text-center py-4 px-4 text-gray-400">{feature.free}</td>
                <td className="text-center py-4 px-4 text-gray-300">{feature.basic}</td>
                <td className="text-center py-4 px-4 text-gray-300">{feature.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

        {/* 기능 비교표 */}
        <FeatureComparisonTable />

        {/* FAQ 섹션 */}
        <FAQSection />

        {/* 하단 안내 */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>모든 결제는 Stripe를 통해 안전하게 처리됩니다.</p>
          <p className="mt-2">구독은 언제든지 취소할 수 있습니다.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-gray-400 transition-colors">
              이용약관
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
              개인정보처리방침
            </Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">
              문의하기
            </Link>
          </div>
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
