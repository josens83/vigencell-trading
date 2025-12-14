import {
  Keys,
  handleKeyboardClick,
  getContrastRatio,
  meetsContrastRequirement,
  generateAriaLabel,
  formatNumberForScreenReader,
  generateGameStateDescription,
  generateTradeResultDescription,
} from '@/lib/accessibility';

describe('Accessibility Utils', () => {
  // 키보드 네비게이션 테스트
  describe('Keys', () => {
    it('올바른 키 코드를 정의해야 함', () => {
      expect(Keys.ENTER).toBe('Enter');
      expect(Keys.SPACE).toBe(' ');
      expect(Keys.ESCAPE).toBe('Escape');
      expect(Keys.TAB).toBe('Tab');
      expect(Keys.ARROW_UP).toBe('ArrowUp');
      expect(Keys.ARROW_DOWN).toBe('ArrowDown');
    });
  });

  describe('handleKeyboardClick', () => {
    it('Enter 키에서 콜백을 호출해야 함', () => {
      const callback = jest.fn();
      const handler = handleKeyboardClick(callback);

      const enterEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent;

      handler(enterEvent);
      expect(callback).toHaveBeenCalled();
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });

    it('Space 키에서 콜백을 호출해야 함', () => {
      const callback = jest.fn();
      const handler = handleKeyboardClick(callback);

      const spaceEvent = {
        key: ' ',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent;

      handler(spaceEvent);
      expect(callback).toHaveBeenCalled();
    });

    it('다른 키에서는 콜백을 호출하지 않아야 함', () => {
      const callback = jest.fn();
      const handler = handleKeyboardClick(callback);

      const otherEvent = {
        key: 'a',
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent;

      handler(otherEvent);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // 색상 대비 테스트
  describe('getContrastRatio', () => {
    it('흑백 대비를 올바르게 계산해야 함', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('동일 색상은 1:1 대비여야 함', () => {
      const ratio = getContrastRatio('#808080', '#808080');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('회색과 흰색 대비를 계산해야 함', () => {
      const ratio = getContrastRatio('#767676', '#FFFFFF');
      expect(ratio).toBeGreaterThan(4.5);
    });
  });

  describe('meetsContrastRequirement', () => {
    it('충분한 대비에 true를 반환해야 함', () => {
      expect(meetsContrastRequirement('#000000', '#FFFFFF')).toBe(true);
    });

    it('불충분한 대비에 false를 반환해야 함', () => {
      expect(meetsContrastRequirement('#CCCCCC', '#FFFFFF')).toBe(false);
    });

    it('큰 텍스트는 3:1 기준을 적용해야 함', () => {
      // #949494와 #FFFFFF의 대비는 약 3.5:1
      expect(meetsContrastRequirement('#949494', '#FFFFFF', true)).toBe(true);
      expect(meetsContrastRequirement('#949494', '#FFFFFF', false)).toBe(false);
    });
  });

  // ARIA 레이블 테스트
  describe('generateAriaLabel', () => {
    it('기본 레이블을 생성해야 함', () => {
      const label = generateAriaLabel('클릭', '버튼');
      expect(label).toBe('클릭 버튼');
    });

    it('추가 정보를 포함한 레이블을 생성해야 함', () => {
      const label = generateAriaLabel('매수', '주식', '10주');
      expect(label).toBe('매수 주식, 10주');
    });
  });

  // 숫자 포맷팅 테스트
  describe('formatNumberForScreenReader', () => {
    it('일반 숫자를 포맷해야 함', () => {
      expect(formatNumberForScreenReader(1234567)).toBe('1,234,567');
    });

    it('통화로 포맷해야 함', () => {
      expect(formatNumberForScreenReader(10000, { currency: true })).toBe(
        '10,000원'
      );
    });

    it('퍼센트로 포맷해야 함', () => {
      expect(
        formatNumberForScreenReader(75.5, { percentage: true, decimals: 1 })
      ).toBe('75.5퍼센트');
    });
  });

  // 게임 상태 설명 테스트
  describe('generateGameStateDescription', () => {
    it('게임 상태를 설명하는 문자열을 생성해야 함', () => {
      const description = generateGameStateDescription({
        day: 50,
        totalDays: 200,
        cash: 500000,
        shares: 100,
        price: 5000,
        mentalState: 75,
      });

      expect(description).toContain('25%');
      expect(description).toContain('50일차');
      expect(description).toContain('500,000원');
      expect(description).toContain('100주');
      expect(description).toContain('5,000원');
      expect(description).toContain('좋음');
    });

    it('다양한 멘탈 상태를 올바르게 설명해야 함', () => {
      const highMental = generateGameStateDescription({
        day: 1,
        totalDays: 100,
        cash: 1000000,
        shares: 0,
        price: 10000,
        mentalState: 90,
      });
      expect(highMental).toContain('매우 좋음');

      const lowMental = generateGameStateDescription({
        day: 1,
        totalDays: 100,
        cash: 1000000,
        shares: 0,
        price: 10000,
        mentalState: 15,
      });
      expect(lowMental).toContain('매우 나쁨');
    });
  });

  // 거래 결과 설명 테스트
  describe('generateTradeResultDescription', () => {
    it('매수 결과를 설명해야 함', () => {
      const description = generateTradeResultDescription({
        type: 'BUY',
        shares: 10,
        price: 5000,
        totalCost: 50000,
        remainingCash: 950000,
      });

      expect(description).toContain('매수 완료');
      expect(description).toContain('10주');
      expect(description).toContain('5,000원');
      expect(description).toContain('50,000원');
      expect(description).toContain('950,000원');
    });

    it('수익이 있는 매도 결과를 설명해야 함', () => {
      const description = generateTradeResultDescription({
        type: 'SELL',
        shares: 10,
        price: 6000,
        totalCost: 60000,
        profit: 10000,
      });

      expect(description).toContain('매도 완료');
      expect(description).toContain('수익');
      expect(description).toContain('10,000원');
    });

    it('손실이 있는 매도 결과를 설명해야 함', () => {
      const description = generateTradeResultDescription({
        type: 'SELL',
        shares: 10,
        price: 4000,
        totalCost: 40000,
        profit: -10000,
      });

      expect(description).toContain('매도 완료');
      expect(description).toContain('손실');
    });
  });
});
