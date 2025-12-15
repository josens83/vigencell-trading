'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (모니터링 모듈을 사용할 수 없을 수 있으므로 콘솔에 출력)
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(71, 85, 105, 0.5)',
            }}
          >
            <div
              style={{ fontSize: '4rem', marginBottom: '1rem' }}
              role="img"
              aria-label="심각한 에러"
            >
              🚨
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '0.5rem',
              }}
            >
              심각한 오류가 발생했습니다
            </h1>
            <p
              style={{
                color: '#94a3b8',
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              애플리케이션에 문제가 발생했습니다.
              <br />
              페이지를 새로고침하거나 나중에 다시 시도해 주세요.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                새로고침
              </button>
            </div>

            {error.digest && (
              <p
                style={{
                  marginTop: '1.5rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
