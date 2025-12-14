import {
  getMentalState,
  calculatePortfolioValue,
  calculateUnrealizedProfit,
  calculateUnrealizedProfitPercent,
  calculateNewAvgCost,
  processBuy,
  processSell,
  simulatePrice,
  calculateMentalChange,
  calculateTotalReturn,
  determineEnding,
  calculateWinRate,
  calculateMarketCap,
  formatDate,
  formatCurrency,
  Portfolio,
  Stats,
} from '@/lib/game-utils';

describe('Game Utils', () => {
  // 멘탈 상태 테스트
  describe('getMentalState', () => {
    it('100에서 80 사이는 "철벽 멘탈"을 반환해야 함', () => {
      expect(getMentalState(100).text).toBe('철벽 멘탈');
      expect(getMentalState(85).text).toBe('철벽 멘탈');
      expect(getMentalState(80).text).toBe('철벽 멘탈');
    });

    it('79에서 60 사이는 "안정적"을 반환해야 함', () => {
      expect(getMentalState(79).text).toBe('안정적');
      expect(getMentalState(60).text).toBe('안정적');
    });

    it('59에서 40 사이는 "보통"을 반환해야 함', () => {
      expect(getMentalState(59).text).toBe('보통');
      expect(getMentalState(40).text).toBe('보통');
    });

    it('39에서 20 사이는 "불안함"을 반환해야 함', () => {
      expect(getMentalState(39).text).toBe('불안함');
      expect(getMentalState(20).text).toBe('불안함');
    });

    it('19에서 1 사이는 "패닉"을 반환해야 함', () => {
      expect(getMentalState(19).text).toBe('패닉');
      expect(getMentalState(1).text).toBe('패닉');
    });

    it('0은 "멘탈 붕괴"를 반환해야 함', () => {
      expect(getMentalState(0).text).toBe('멘탈 붕괴');
    });
  });

  // 포트폴리오 가치 계산 테스트
  describe('calculatePortfolioValue', () => {
    it('현금과 주식 가치의 합을 반환해야 함', () => {
      const portfolio: Portfolio = {
        cash: 10000000,
        shares: 100,
        avgCost: 50000,
        totalInvested: 5000000,
        realizedProfit: 0,
      };
      expect(calculatePortfolioValue(portfolio, 60000)).toBe(16000000);
    });

    it('주식이 없으면 현금만 반환해야 함', () => {
      const portfolio: Portfolio = {
        cash: 50000000,
        shares: 0,
        avgCost: 0,
        totalInvested: 0,
        realizedProfit: 0,
      };
      expect(calculatePortfolioValue(portfolio, 10000)).toBe(50000000);
    });
  });

  // 미실현 손익 테스트
  describe('calculateUnrealizedProfit', () => {
    it('수익 시 양수를 반환해야 함', () => {
      expect(calculateUnrealizedProfit(100, 10000, 15000)).toBe(500000);
    });

    it('손실 시 음수를 반환해야 함', () => {
      expect(calculateUnrealizedProfit(100, 10000, 8000)).toBe(-200000);
    });

    it('주식이 없으면 0을 반환해야 함', () => {
      expect(calculateUnrealizedProfit(0, 10000, 15000)).toBe(0);
    });
  });

  // 미실현 수익률 테스트
  describe('calculateUnrealizedProfitPercent', () => {
    it('50% 상승 시 50을 반환해야 함', () => {
      expect(calculateUnrealizedProfitPercent(10000, 15000)).toBe(50);
    });

    it('20% 하락 시 -20을 반환해야 함', () => {
      expect(calculateUnrealizedProfitPercent(10000, 8000)).toBe(-20);
    });

    it('평균단가가 0이면 0을 반환해야 함', () => {
      expect(calculateUnrealizedProfitPercent(0, 10000)).toBe(0);
    });
  });

  // 평균단가 계산 테스트
  describe('calculateNewAvgCost', () => {
    it('첫 매수 시 매수 가격이 평균단가가 됨', () => {
      expect(calculateNewAvgCost(0, 0, 100, 10000)).toBe(10000);
    });

    it('추가 매수 시 가중 평균을 계산해야 함', () => {
      // 100주 @ 10000원 + 100주 @ 12000원 = 200주, 평균 11000원
      expect(calculateNewAvgCost(100, 10000, 100, 12000)).toBe(11000);
    });

    it('분할 매수 시 평균단가 낮춤을 확인', () => {
      // 100주 @ 10000원 + 200주 @ 5000원 = 300주, 평균 6666.67원
      const result = calculateNewAvgCost(100, 10000, 200, 5000);
      expect(Math.round(result)).toBe(6667);
    });
  });

  // 매수 처리 테스트
  describe('processBuy', () => {
    const initialPortfolio: Portfolio = {
      cash: 50000000,
      shares: 0,
      avgCost: 0,
      totalInvested: 0,
      realizedProfit: 0,
    };

    it('성공적인 매수를 처리해야 함', () => {
      const result = processBuy(initialPortfolio, 100, 10000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.portfolio.cash).toBe(49000000);
        expect(result.portfolio.shares).toBe(100);
        expect(result.portfolio.avgCost).toBe(10000);
        expect(result.portfolio.totalInvested).toBe(1000000);
      }
    });

    it('현금 부족 시 실패해야 함', () => {
      const result = processBuy(initialPortfolio, 10000, 10000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('현금이 부족합니다');
      }
    });

    it('매수 수량이 0 이하면 실패해야 함', () => {
      const result = processBuy(initialPortfolio, 0, 10000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('매수 수량은 0보다 커야 합니다');
      }
    });
  });

  // 매도 처리 테스트
  describe('processSell', () => {
    const portfolioWithShares: Portfolio = {
      cash: 40000000,
      shares: 100,
      avgCost: 10000,
      totalInvested: 1000000,
      realizedProfit: 0,
    };

    it('이익이 발생하는 매도를 처리해야 함', () => {
      const result = processSell(portfolioWithShares, 50, 15000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.profit).toBe(250000); // (15000 - 10000) * 50
        expect(result.portfolio.cash).toBe(40750000);
        expect(result.portfolio.shares).toBe(50);
        expect(result.portfolio.realizedProfit).toBe(250000);
      }
    });

    it('손실이 발생하는 매도를 처리해야 함', () => {
      const result = processSell(portfolioWithShares, 50, 8000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.profit).toBe(-100000); // (8000 - 10000) * 50
        expect(result.portfolio.realizedProfit).toBe(-100000);
      }
    });

    it('보유 주식보다 많이 매도하면 실패해야 함', () => {
      const result = processSell(portfolioWithShares, 200, 10000);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('보유 주식이 부족합니다');
      }
    });

    it('전량 매도 시 평균단가가 0이 되어야 함', () => {
      const result = processSell(portfolioWithShares, 100, 12000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.portfolio.shares).toBe(0);
        expect(result.portfolio.avgCost).toBe(0);
      }
    });
  });

  // 주가 시뮬레이션 테스트
  describe('simulatePrice', () => {
    it('최소 가격 1000원을 보장해야 함', () => {
      const price = simulatePrice(500, 0.5, 'negative', -1);
      expect(price).toBeGreaterThanOrEqual(1000);
    });

    it('정수 가격을 반환해야 함', () => {
      const price = simulatePrice(10000, 0.1, 'neutral', 0.5);
      expect(Number.isInteger(price)).toBe(true);
    });

    it('변동성이 0이면 추세만 반영해야 함', () => {
      const price = simulatePrice(10000, 0, 'positive', 0);
      expect(price).toBe(10020); // 10000 * (1 + 0.002)
    });
  });

  // 멘탈 변화 테스트
  describe('calculateMentalChange', () => {
    it('포지션이 없으면 멘탈이 변하지 않아야 함', () => {
      expect(calculateMentalChange(100, -10, false)).toBe(100);
    });

    it('-5% 이상 하락 시 멘탈이 5 감소해야 함', () => {
      expect(calculateMentalChange(100, -6, true)).toBe(95);
    });

    it('+5% 이상 상승 시 멘탈이 3 증가해야 함', () => {
      expect(calculateMentalChange(90, 6, true)).toBe(93);
    });

    it('멘탈은 0 아래로 떨어지지 않아야 함', () => {
      expect(calculateMentalChange(3, -10, true)).toBe(0);
    });

    it('멘탈은 100 위로 올라가지 않아야 함', () => {
      expect(calculateMentalChange(99, 10, true)).toBe(100);
    });
  });

  // 총 수익률 테스트
  describe('calculateTotalReturn', () => {
    it('100% 수익을 올바르게 계산해야 함', () => {
      expect(calculateTotalReturn(50000000, 100000000)).toBe(100);
    });

    it('50% 손실을 올바르게 계산해야 함', () => {
      expect(calculateTotalReturn(50000000, 25000000)).toBe(-50);
    });
  });

  // 엔딩 결정 테스트
  describe('determineEnding', () => {
    it('500% 이상은 전설의 투자자', () => {
      expect(determineEnding(500).title).toBe('전설의 투자자');
      expect(determineEnding(1000).emoji).toBe('👑');
    });

    it('-50% 미만은 파산 위기', () => {
      expect(determineEnding(-60).title).toBe('파산 위기');
      expect(determineEnding(-90).emoji).toBe('💸');
    });

    it('0-50% 사이는 수익 실현', () => {
      expect(determineEnding(30).title).toBe('수익 실현');
    });
  });

  // 승률 계산 테스트
  describe('calculateWinRate', () => {
    it('거래가 없으면 0%를 반환해야 함', () => {
      const stats: Stats = {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        maxProfit: 0,
        maxLoss: 0,
        daysPlayed: 0,
      };
      expect(calculateWinRate(stats)).toBe(0);
    });

    it('승률을 올바르게 계산해야 함', () => {
      const stats: Stats = {
        totalTrades: 10,
        winningTrades: 7,
        losingTrades: 3,
        maxProfit: 100000,
        maxLoss: -50000,
        daysPlayed: 100,
      };
      expect(calculateWinRate(stats)).toBe(70);
    });
  });

  // 시가총액 계산 테스트
  describe('calculateMarketCap', () => {
    it('시가총액을 억원 단위로 계산해야 함', () => {
      // 10000원 * 20,460,000주 = 204,600,000,000원 = 2046억원
      expect(calculateMarketCap(10000)).toBe(2046);
    });
  });

  // 포맷팅 테스트
  describe('formatDate', () => {
    it('YYYY-MM-DD 형식을 반환해야 함', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('formatCurrency', () => {
    it('천 단위 구분을 적용해야 함', () => {
      expect(formatCurrency(1234567)).toBe('1,234,567');
    });
  });
});
