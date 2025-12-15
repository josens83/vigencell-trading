'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/monitoring';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    logError(error, {
      digest: error.digest,
      boundary: 'app-error',
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full game-card p-8 text-center">
        <div className="text-6xl mb-4" role="img" aria-label="에러">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          문제가 발생했습니다
        </h1>
        <p className="text-gray-400 mb-6">
          페이지를 로드하는 중 오류가 발생했습니다.
          <br />
          다시 시도해 주세요.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
              에러 상세 정보
            </summary>
            <div className="mt-2 p-4 bg-slate-800 rounded-lg overflow-auto max-h-48">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors inline-block"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}
