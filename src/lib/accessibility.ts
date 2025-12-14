/**
 * 접근성(Accessibility) 유틸리티
 *
 * WCAG 2.1 AA 기준 준수를 위한 헬퍼 함수들
 */

/**
 * 스크린 리더 전용 텍스트 스타일
 * 시각적으로는 숨기지만 스크린 리더에서는 읽힘
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0',
};

/**
 * 키보드 네비게이션 키 코드
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * 키보드 이벤트 핸들러 생성
 */
export function handleKeyboardClick(
  callback: () => void
): (event: React.KeyboardEvent) => void {
  return (event: React.KeyboardEvent) => {
    if (event.key === Keys.ENTER || event.key === Keys.SPACE) {
      event.preventDefault();
      callback();
    }
  };
}

/**
 * 포커스 트랩 - 모달이나 다이얼로그에서 사용
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== Keys.TAB) return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  // 클린업 함수 반환
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 라이브 리전 알림 (스크린 리더용)
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  Object.assign(announcement.style, srOnlyStyles);

  announcement.textContent = message;
  document.body.appendChild(announcement);

  // 알림 후 요소 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * 색상 대비 체크 (WCAG AA 기준: 4.5:1)
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * WCAG AA 대비 기준 충족 여부
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  // 큰 텍스트: 3:1, 일반 텍스트: 4.5:1
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * 감소된 모션 선호 확인
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 고대비 모드 선호 확인
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * 다크 모드 선호 확인
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * ARIA 레이블 생성 헬퍼
 */
export function generateAriaLabel(
  action: string,
  target: string,
  additionalInfo?: string
): string {
  let label = `${action} ${target}`;
  if (additionalInfo) {
    label += `, ${additionalInfo}`;
  }
  return label;
}

/**
 * 숫자 포맷팅 (스크린 리더 친화적)
 */
export function formatNumberForScreenReader(
  value: number,
  options: {
    currency?: boolean;
    percentage?: boolean;
    decimals?: number;
  } = {}
): string {
  const { currency = false, percentage = false, decimals = 0 } = options;

  if (currency) {
    return `${value.toLocaleString('ko-KR')}원`;
  }

  if (percentage) {
    return `${value.toFixed(decimals)}퍼센트`;
  }

  return value.toLocaleString('ko-KR');
}

/**
 * 게임 상태 설명 생성 (스크린 리더용)
 */
export function generateGameStateDescription(state: {
  day: number;
  totalDays: number;
  cash: number;
  shares: number;
  price: number;
  mentalState: number;
}): string {
  const { day, totalDays, cash, shares, price, mentalState } = state;

  const totalValue = cash + shares * price;
  const progress = Math.round((day / totalDays) * 100);

  let mentalDescription: string;
  if (mentalState >= 80) mentalDescription = '매우 좋음';
  else if (mentalState >= 60) mentalDescription = '좋음';
  else if (mentalState >= 40) mentalDescription = '보통';
  else if (mentalState >= 20) mentalDescription = '나쁨';
  else mentalDescription = '매우 나쁨';

  return `게임 진행률 ${progress}%. 현재 ${day}일차. ` +
    `보유 현금 ${formatNumberForScreenReader(cash, { currency: true })}. ` +
    `주식 ${shares}주 보유, 현재가 ${formatNumberForScreenReader(price, { currency: true })}. ` +
    `총 자산 ${formatNumberForScreenReader(totalValue, { currency: true })}. ` +
    `멘탈 상태 ${mentalDescription}.`;
}

/**
 * 트레이드 결과 설명 생성 (스크린 리더용)
 */
export function generateTradeResultDescription(result: {
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  totalCost: number;
  remainingCash?: number;
  profit?: number;
}): string {
  const { type, shares, price, totalCost, remainingCash, profit } = result;

  if (type === 'BUY') {
    return `매수 완료. ${shares}주를 주당 ${formatNumberForScreenReader(price, { currency: true })}에 ` +
      `총 ${formatNumberForScreenReader(totalCost, { currency: true })}으로 매수했습니다. ` +
      `남은 현금 ${formatNumberForScreenReader(remainingCash || 0, { currency: true })}.`;
  } else {
    const profitText = profit !== undefined
      ? profit >= 0
        ? `수익 ${formatNumberForScreenReader(profit, { currency: true })}`
        : `손실 ${formatNumberForScreenReader(Math.abs(profit), { currency: true })}`
      : '';

    return `매도 완료. ${shares}주를 주당 ${formatNumberForScreenReader(price, { currency: true })}에 ` +
      `총 ${formatNumberForScreenReader(totalCost, { currency: true })}에 매도했습니다. ` +
      `${profitText}.`;
  }
}
