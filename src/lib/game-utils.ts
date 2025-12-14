/**
 * 바이젠셀 투자 마스터 - 게임 유틸리티 함수
 *
 * 이 모듈은 게임의 핵심 로직을 담당하며,
 * 순수 함수로 구현되어 테스트가 용이합니다.
 */

// 타입 정의
export interface Trade {
  type: 'BUY' | 'SELL';
  date: string;
  price: number;
  amount: number;
  total: number;
  profit?: number;
}

export interface Portfolio {
  cash: number;
  shares: number;
  avgCost: number;
  totalInvested: number;
  realizedProfit: number;
}

export interface Stats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxProfit: number;
  maxLoss: number;
  daysPlayed: number;
}

export interface MentalState {
  emoji: string;
  text: string;
  color: string;
}

// 상수
export const MENTAL_STATES: Record<number, MentalState> = {
  100: { emoji: '😎', text: '철벽 멘탈', color: '#22c55e' },
  80: { emoji: '😊', text: '안정적', color: '#84cc16' },
  60: { emoji: '😐', text: '보통', color: '#eab308' },
  40: { emoji: '😰', text: '불안함', color: '#f97316' },
  20: { emoji: '😱', text: '패닉', color: '#ef4444' },
  0: { emoji: '💀', text: '멘탈 붕괴', color: '#991b1b' },
};

export const INITIAL_CASH: Record<string, number> = {
  easy: 100000000,
  normal: 50000000,
  hard: 30000000,
};

/**
 * 멘탈 상태를 반환합니다
 * @param value 멘탈 수치 (0-100)
 * @returns 멘탈 상태 객체
 */
export function getMentalState(value: number): MentalState {
  if (value >= 80) return MENTAL_STATES[100];
  if (value >= 60) return MENTAL_STATES[80];
  if (value >= 40) return MENTAL_STATES[60];
  if (value >= 20) return MENTAL_STATES[40];
  if (value > 0) return MENTAL_STATES[20];
  return MENTAL_STATES[0];
}

/**
 * 포트폴리오 가치를 계산합니다
 * @param portfolio 포트폴리오 상태
 * @param currentPrice 현재 주가
 * @returns 총 포트폴리오 가치
 */
export function calculatePortfolioValue(
  portfolio: Portfolio,
  currentPrice: number
): number {
  return portfolio.cash + portfolio.shares * currentPrice;
}

/**
 * 미실현 손익을 계산합니다
 * @param shares 보유 주식 수
 * @param avgCost 평균 단가
 * @param currentPrice 현재 주가
 * @returns 미실현 손익
 */
export function calculateUnrealizedProfit(
  shares: number,
  avgCost: number,
  currentPrice: number
): number {
  if (shares <= 0) return 0;
  return (currentPrice - avgCost) * shares;
}

/**
 * 미실현 수익률을 계산합니다
 * @param avgCost 평균 단가
 * @param currentPrice 현재 주가
 * @returns 미실현 수익률 (%)
 */
export function calculateUnrealizedProfitPercent(
  avgCost: number,
  currentPrice: number
): number {
  if (avgCost <= 0) return 0;
  return ((currentPrice - avgCost) / avgCost) * 100;
}

/**
 * 매수 후 새로운 평균 단가를 계산합니다
 * @param currentShares 현재 보유 주식 수
 * @param currentAvgCost 현재 평균 단가
 * @param buyAmount 매수 수량
 * @param buyPrice 매수 가격
 * @returns 새로운 평균 단가
 */
export function calculateNewAvgCost(
  currentShares: number,
  currentAvgCost: number,
  buyAmount: number,
  buyPrice: number
): number {
  if (currentShares === 0) return buyPrice;
  const totalValue = currentAvgCost * currentShares + buyPrice * buyAmount;
  const totalShares = currentShares + buyAmount;
  return totalValue / totalShares;
}

/**
 * 매수 처리
 * @param portfolio 현재 포트폴리오
 * @param amount 매수 수량
 * @param price 매수 가격
 * @returns 업데이트된 포트폴리오 또는 에러 메시지
 */
export function processBuy(
  portfolio: Portfolio,
  amount: number,
  price: number
): { success: true; portfolio: Portfolio } | { success: false; error: string } {
  const cost = price * amount;

  if (cost > portfolio.cash) {
    return { success: false, error: '현금이 부족합니다' };
  }

  if (amount <= 0) {
    return { success: false, error: '매수 수량은 0보다 커야 합니다' };
  }

  const newAvgCost = calculateNewAvgCost(
    portfolio.shares,
    portfolio.avgCost,
    amount,
    price
  );

  return {
    success: true,
    portfolio: {
      cash: portfolio.cash - cost,
      shares: portfolio.shares + amount,
      avgCost: newAvgCost,
      totalInvested: portfolio.totalInvested + cost,
      realizedProfit: portfolio.realizedProfit,
    },
  };
}

/**
 * 매도 처리
 * @param portfolio 현재 포트폴리오
 * @param amount 매도 수량
 * @param price 매도 가격
 * @returns 업데이트된 포트폴리오 또는 에러 메시지
 */
export function processSell(
  portfolio: Portfolio,
  amount: number,
  price: number
): { success: true; portfolio: Portfolio; profit: number } | { success: false; error: string } {
  if (amount > portfolio.shares) {
    return { success: false, error: '보유 주식이 부족합니다' };
  }

  if (amount <= 0) {
    return { success: false, error: '매도 수량은 0보다 커야 합니다' };
  }

  const revenue = price * amount;
  const costBasis = portfolio.avgCost * amount;
  const profit = revenue - costBasis;

  const newShares = portfolio.shares - amount;
  const newAvgCost = newShares === 0 ? 0 : portfolio.avgCost;

  return {
    success: true,
    profit,
    portfolio: {
      cash: portfolio.cash + revenue,
      shares: newShares,
      avgCost: newAvgCost,
      totalInvested: portfolio.totalInvested,
      realizedProfit: portfolio.realizedProfit + profit,
    },
  };
}

/**
 * 주가 시뮬레이션
 * @param basePrice 기준 가격
 * @param volatility 변동성 (0-1)
 * @param trend 추세 ('positive' | 'negative' | 'neutral')
 * @returns 새로운 가격
 */
export function simulatePrice(
  basePrice: number,
  volatility: number,
  trend: 'positive' | 'negative' | 'neutral',
  randomFactor?: number
): number {
  const random = randomFactor ?? (Math.random() - 0.5) * 2;
  const randomChange = random * volatility;
  const trendFactor =
    trend === 'positive' ? 0.002 : trend === 'negative' ? -0.002 : 0;
  const newPrice = basePrice * (1 + randomChange + trendFactor);
  return Math.max(1000, Math.round(newPrice));
}

/**
 * 멘탈 변화 계산
 * @param currentMental 현재 멘탈
 * @param dailyChange 일일 변동률 (%)
 * @param hasPosition 포지션 보유 여부
 * @returns 새로운 멘탈 수치
 */
export function calculateMentalChange(
  currentMental: number,
  dailyChange: number,
  hasPosition: boolean
): number {
  if (!hasPosition) return currentMental;

  let change = 0;
  if (dailyChange < -5) change = -5;
  else if (dailyChange < -3) change = -2;
  else if (dailyChange > 5) change = 3;
  else if (dailyChange > 3) change = 1;

  return Math.max(0, Math.min(100, currentMental + change));
}

/**
 * 총 수익률 계산
 * @param initialCash 초기 자금
 * @param portfolioValue 현재 포트폴리오 가치
 * @returns 수익률 (%)
 */
export function calculateTotalReturn(
  initialCash: number,
  portfolioValue: number
): number {
  return ((portfolioValue - initialCash) / initialCash) * 100;
}

/**
 * 엔딩 결정
 * @param totalReturn 총 수익률 (%)
 * @returns 엔딩 정보
 */
export function determineEnding(totalReturn: number): {
  title: string;
  emoji: string;
} {
  if (totalReturn >= 500)
    return { title: '전설의 투자자', emoji: '👑' };
  if (totalReturn >= 200)
    return { title: '성공한 투자자', emoji: '🏆' };
  if (totalReturn >= 50)
    return { title: '수익 실현', emoji: '📈' };
  if (totalReturn >= 0)
    return { title: '본전 치기', emoji: '😅' };
  if (totalReturn >= -50)
    return { title: '손실 감수', emoji: '📉' };
  return { title: '파산 위기', emoji: '💸' };
}

/**
 * 승률 계산
 * @param stats 거래 통계
 * @returns 승률 (%)
 */
export function calculateWinRate(stats: Stats): number {
  if (stats.totalTrades === 0) return 0;
  return (stats.winningTrades / stats.totalTrades) * 100;
}

/**
 * 시가총액 계산 (바이젠셀 발행 주식 수 기준)
 * @param price 현재 주가
 * @returns 시가총액 (억원)
 */
export function calculateMarketCap(price: number): number {
  const outstandingShares = 20460000; // 바이젠셀 발행 주식 수
  return Math.round((price * outstandingShares) / 100000000);
}

/**
 * 날짜 포맷팅
 * @param date Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 한국어 날짜 포맷팅
 * @param date Date 객체
 * @returns 한국어 형식 날짜 문자열
 */
export function formatKoreanDate(date: Date): string {
  return date.toLocaleDateString('ko-KR');
}

/**
 * 금액 포맷팅
 * @param amount 금액
 * @returns 천 단위 구분 문자열
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR');
}
