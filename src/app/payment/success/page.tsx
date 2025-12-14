'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // 결제 성공 후 추가 처리가 필요한 경우 여기서 수행
    console.log('Payment successful, session:', sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-green-500/30 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-4">결제 완료!</h1>
        <p className="text-gray-400 mb-8">
          구독이 성공적으로 활성화되었습니다.<br />
          이제 모든 기능을 이용하실 수 있습니다.
        </p>

        <div className="space-y-3">
          <Link href="/game" className="block w-full btn-primary py-3">
            🎮 게임 시작하기
          </Link>
          <Link href="/" className="block w-full btn-secondary py-3">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
