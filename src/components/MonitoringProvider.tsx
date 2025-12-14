'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { measureWebVitals, trackPageView, logError } from '@/lib/monitoring';

/**
 * 모니터링 프로바이더 컴포넌트
 *
 * 앱 전체에서 모니터링 기능을 제공합니다.
 * - Web Vitals 측정
 * - 페이지 뷰 트래킹
 * - 전역 에러 핸들링
 */
export default function MonitoringProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Web Vitals 측정 초기화
  useEffect(() => {
    measureWebVitals();
  }, []);

  // 페이지 뷰 트래킹
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // 전역 에러 핸들링
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        { type: 'unhandledRejection' }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
