/**
 * 모니터링 및 에러 트래킹 유틸리티
 *
 * 프로덕션에서는 Sentry 또는 유사 서비스로 대체 권장
 */

// 에러 타입 정의
export interface ErrorLog {
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  url?: string;
  userAgent?: string;
}

// 성능 메트릭 타입
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 's' | 'bytes' | 'count';
  timestamp: Date;
  tags?: Record<string, string>;
}

// 사용자 행동 이벤트
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

/**
 * 에러 로깅
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  const errorLog: ErrorLog = {
    timestamp: new Date(),
    type: 'error',
    message: error.message,
    stack: error.stack,
    context,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // 콘솔 출력 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', errorLog);
  }

  // 프로덕션에서는 외부 서비스로 전송
  // sendToErrorTracking(errorLog);
}

/**
 * 경고 로깅
 */
export function logWarning(message: string, context?: Record<string, unknown>): void {
  const warningLog: ErrorLog = {
    timestamp: new Date(),
    type: 'warning',
    message,
    context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.warn('[WARNING]', warningLog);
  }
}

/**
 * 성능 메트릭 기록
 */
export function recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
  const fullMetric: PerformanceMetric = {
    ...metric,
    timestamp: new Date(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[METRIC]', fullMetric);
  }

  // 프로덕션에서는 분석 서비스로 전송
  // sendToAnalytics(fullMetric);
}

/**
 * 사용자 행동 이벤트 기록
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  const analyticsEvent: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date(),
    sessionId: getSessionId(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[EVENT]', analyticsEvent);
  }

  // 프로덕션에서는 분석 서비스로 전송
  // sendToAnalytics(analyticsEvent);
}

/**
 * 페이지 뷰 기록
 */
export function trackPageView(path: string): void {
  trackEvent('page_view', {
    path,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  });
}

/**
 * 세션 ID 생성/가져오기
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

/**
 * Web Vitals 측정
 */
export function measureWebVitals(): void {
  if (typeof window === 'undefined') return;

  // LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    recordMetric({
      name: 'LCP',
      value: lastEntry.startTime,
      unit: 'ms',
    });
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // 지원하지 않는 브라우저
  }

  // FID (First Input Delay)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if ('processingStart' in entry) {
        const fidEntry = entry as PerformanceEventTiming;
        recordMetric({
          name: 'FID',
          value: fidEntry.processingStart - fidEntry.startTime,
          unit: 'ms',
        });
      }
    });
  });

  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // 지원하지 않는 브라우저
  }

  // CLS (Cumulative Layout Shift)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if ('hadRecentInput' in entry && !entry.hadRecentInput) {
        const clsEntry = entry as LayoutShift;
        clsValue += clsEntry.value;
      }
    });
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 페이지 언로드 시 CLS 기록
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        recordMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'count',
        });
      }
    });
  } catch {
    // 지원하지 않는 브라우저
  }
}

/**
 * API 요청 시간 측정
 */
export function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  return apiCall()
    .then((result) => {
      recordMetric({
        name: `api_${name}`,
        value: performance.now() - startTime,
        unit: 'ms',
        tags: { status: 'success' },
      });
      return result;
    })
    .catch((error) => {
      recordMetric({
        name: `api_${name}`,
        value: performance.now() - startTime,
        unit: 'ms',
        tags: { status: 'error' },
      });
      throw error;
    });
}

/**
 * 게임 이벤트 트래킹
 */
export const GameEvents = {
  gameStarted: (difficulty: string) =>
    trackEvent('game_started', { difficulty }),

  gameEnded: (stats: {
    totalReturn: number;
    daysPlayed: number;
    totalTrades: number;
  }) => trackEvent('game_ended', stats),

  tradeMade: (trade: {
    type: 'BUY' | 'SELL';
    amount: number;
    price: number;
  }) => trackEvent('trade_made', trade),

  achievementUnlocked: (achievementId: string) =>
    trackEvent('achievement_unlocked', { achievementId }),

  eventEncountered: (eventType: string) =>
    trackEvent('event_encountered', { eventType }),
};

// LayoutShift 타입 정의 (TS에 없음)
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}
