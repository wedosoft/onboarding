import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 대시보드 페이지로 이동
    await page.goto('http://localhost:3002/dashboard');

    // 페이지 로드 대기
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Primary 색상 체크
    const colorInfo = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const primary = styles.getPropertyValue('--primary').trim();

      // 다크모드 체크
      const isDark = root.classList.contains('dark');

      return { primary, isDark };
    });

    console.log('======================================');
    console.log('CSS Variable Check');
    console.log('======================================');
    console.log('Dark Mode:', colorInfo.isDark ? 'YES' : 'NO');
    console.log('--primary:', colorInfo.primary);
    console.log('Expected: 210 70% 51% (Wedosoft Blue #3284D6)');
    console.log('');

    if (colorInfo.primary === '210 70% 51%') {
      console.log('✅ PRIMARY COLOR IS CORRECT!');
    } else {
      console.log('❌ PRIMARY COLOR IS WRONG!');
      console.log(`   Expected: "210 70% 51%"`);
      console.log(`   Got: "${colorInfo.primary}"`);
    }
    console.log('======================================');

    // 스크린샷 저장
    await page.screenshot({ path: 'color-verification.png', fullPage: true });
    console.log('\n📸 Screenshot saved: color-verification.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
