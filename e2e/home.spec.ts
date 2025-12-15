import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지가 올바르게 로드됨', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/바이젠셀 투자 마스터/);

    // 메인 헤딩 확인
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('게임 시작 버튼이 있음', async ({ page }) => {
    const startButton = page.getByRole('link', { name: /게임 시작|무료로 시작/i });
    await expect(startButton).toBeVisible();
  });

  test('가격 정보가 표시됨', async ({ page }) => {
    // 가격 플랜 섹션 확인
    const pricingSection = page.locator('text=/무료|베이직|프리미엄/i').first();
    await expect(pricingSection).toBeVisible();
  });

  test('네비게이션 링크가 작동함', async ({ page }) => {
    // 로그인 링크
    const loginLink = page.getByRole('link', { name: /로그인/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('반응형 레이아웃 - 모바일', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 콘텐츠가 여전히 보이는지 확인
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('접근성', () => {
  test('스킵 링크가 작동함', async ({ page }) => {
    await page.goto('/');

    // Tab 키로 포커스
    await page.keyboard.press('Tab');

    // 스킵 링크가 보이는지 확인
    const skipLink = page.getByText('메인 콘텐츠로 건너뛰기');
    await expect(skipLink).toBeFocused();
  });

  test('키보드 네비게이션이 가능함', async ({ page }) => {
    await page.goto('/');

    // 여러 번 Tab 키를 눌러 네비게이션
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // 어떤 요소에 포커스가 있는지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
