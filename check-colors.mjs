import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

try {
  // 대시보드 페이지로 이동
  await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Primary 색상 체크
  const primaryColor = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--primary').trim();
    return primary;
  });

  console.log('✅ CSS Variable --primary:', primaryColor);

  // 실제 primary 색상이 적용된 요소 찾기 (여러 시도)
  const colors = await page.evaluate(() => {
    const results = {};

    // 아이콘 배경
    const iconBg = document.querySelector('[class*="bg-primary"]');
    if (iconBg) {
      results.iconBackground = getComputedStyle(iconBg).backgroundColor;
    }

    // 텍스트
    const primaryText = document.querySelector('[class*="text-primary"]');
    if (primaryText) {
      results.primaryText = getComputedStyle(primaryText).color;
    }

    // Border
    const primaryBorder = document.querySelector('[class*="border-primary"]');
    if (primaryBorder) {
      results.primaryBorder = getComputedStyle(primaryBorder).borderColor;
    }

    return results;
  });

  console.log('✅ Primary color usage:', colors);

  // 스크린샷 저장
  await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
  console.log('✅ Screenshot saved: dashboard-screenshot.png');

  await page.waitForTimeout(2000);
} finally {
  await browser.close();
}
