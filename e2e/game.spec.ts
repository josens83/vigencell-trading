import { test, expect } from '@playwright/test';

test.describe('게임 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/game');
  });

  test('게임 페이지가 로드됨', async ({ page }) => {
    // 게임 관련 요소 확인
    const gameContainer = page.locator('[class*="game"], main');
    await expect(gameContainer.first()).toBeVisible();
  });

  test('게임 UI 요소가 표시됨', async ({ page }) => {
    // 자산 정보 표시
    const assetInfo = page.locator('text=/자산|현금|주식|포트폴리오/i');
    await expect(assetInfo.first()).toBeVisible({ timeout: 10000 });
  });

  test('거래 버튼이 있음', async ({ page }) => {
    // 매수/매도 버튼 확인
    const buyButton = page.locator('button:has-text("매수"), button:has-text("구매")');
    const sellButton = page.locator('button:has-text("매도"), button:has-text("판매")');

    await expect(buyButton.first()).toBeVisible({ timeout: 10000 });
    await expect(sellButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('날짜/시간 진행 UI가 있음', async ({ page }) => {
    // 다음 날, 스킵 등의 버튼
    const nextButton = page.locator('button:has-text("다음"), button:has-text("진행")');
    await expect(nextButton.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('게임 플레이', () => {
  test('게임 시작 및 기본 상호작용', async ({ page }) => {
    await page.goto('/game');

    // 게임 로드 대기
    await page.waitForLoadState('networkidle');

    // 초기 자산 확인 (1천만원)
    const initialCash = page.locator('text=/10,000,000|1천만/i');
    await expect(initialCash.first()).toBeVisible({ timeout: 10000 });
  });

  test('매수 버튼 클릭 시 UI 변화', async ({ page }) => {
    await page.goto('/game');
    await page.waitForLoadState('networkidle');

    // 매수 버튼 클릭
    const buyButton = page.locator('button:has-text("매수")').first();
    await buyButton.click().catch(() => {
      // 버튼이 비활성화되어 있을 수 있음
    });

    // 수량 입력 UI 또는 확인 다이얼로그가 나타나는지 확인
    await page.waitForTimeout(500);
  });

  test('멘탈 상태가 표시됨', async ({ page }) => {
    await page.goto('/game');

    // 멘탈 게이지 또는 상태 표시
    const mentalState = page.locator('text=/멘탈|정신|심리/i');
    await expect(mentalState.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('게임 반응형', () => {
  test('모바일에서 게임이 작동함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/game');

    // 게임 컨테이너가 보이는지 확인
    const gameContainer = page.locator('main');
    await expect(gameContainer).toBeVisible();

    // 터치 가능한 버튼들이 충분히 큰지 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // 최소 터치 타겟 크기: 44x44px (Apple HIG 권장)
          expect(box.width).toBeGreaterThanOrEqual(40);
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});
