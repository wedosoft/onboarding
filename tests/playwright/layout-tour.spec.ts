import { expect, test, Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_PROJECT_REF = 'iusmdodvhtvmyuziuuhp';
const SUPABASE_AUTH_BASE = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1`;
const SESSION_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

const mockUser = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  email: 'playwright@wedosoft.net',
  role: 'authenticated',
  app_metadata: {
    provider: 'google',
  },
  user_metadata: {
    full_name: 'Playwright Bot',
    avatar_url: 'https://ui-avatars.com/api/?name=PB',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  user: mockUser,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};
const mockProduct = {
  id: 'freshservice',
  name: 'Freshservice',
  name_ko: '프레시서비스',
  description: 'ITSM platform',
  description_ko: '서울 오피스 ITSM 플랫폼',
  icon: 'fas fa-server',
  color: '#2563eb',
};

test.beforeEach(async ({ context }) => {
  await context.addInitScript(({ storageKey, session }) => {
    const payload = {
      currentSession: session,
      currentUser: session.user,
      expiresAt: session.expires_at,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, { storageKey: SESSION_STORAGE_KEY, session: mockSession });

  await context.route('**/auth/v1/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    });
  });

  await context.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession),
    });
  });

  await context.route('**/auth/v1/logout', async (route) => {
    await route.fulfill({ status: 200, body: '{}' });
  });

  await context.route('**/onboarding/products/freshservice', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProduct),
    });
  });
});

const tourStops = [
  { path: '/', name: 'dashboard' },
  { path: '/curriculum', name: 'curriculum-selection' },
  { path: '/documents', name: 'documents' },
  { path: '/knowledge', name: 'mentor-chat' },
  { path: '/assessment/products/freshservice', name: 'product-detail' },
  { path: '/assessment/products/freshservice/chat', name: 'product-chat' },
];

async function collectLayoutMetrics(pagePath: string, pageName: string, pageObj: Page) {
  const metrics = await pageObj.evaluate(() => {
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');
    const footerInput =
      document.querySelector('[data-testid="mentor-chat-input"]') ||
      document.querySelector('[data-testid="product-chat-input"]') ||
      document.querySelector('form input[type="text"]');

    const navBox = nav?.getBoundingClientRect();
    const mainBox = main?.getBoundingClientRect();

    const headerGap = navBox && mainBox ? Math.max(0, mainBox.top - navBox.bottom) : null;
    const viewportHeight = window.innerHeight;
    const inputRect = footerInput?.getBoundingClientRect();
    const inputHidden = inputRect ? inputRect.bottom > viewportHeight : null;

    return {
      url: window.location.href,
      headerHeight: navBox ? navBox.height : null,
      mainTop: mainBox ? mainBox.top : null,
      headerGap,
      viewportHeight,
      inputHidden,
    };
  });

  const outputDir = path.join(process.cwd(), 'tests', 'playwright', 'artifacts');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `${pageName}.json`),
    JSON.stringify(metrics, null, 2),
    'utf-8'
  );

  return metrics;
}

for (const stop of tourStops) {
  test(`레이아웃 투어: ${stop.name}`, async ({ page, baseURL }, testInfo) => {
    const targetUrl = `${baseURL}${stop.path}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await expect(page.locator('nav')).toBeVisible();
    if (stop.path.includes('/knowledge')) {
      await expect(page.locator('[data-testid="mentor-chat-input"]')).toBeVisible();
    }
    if (stop.path.endsWith('/chat')) {
      await expect(page.locator('[data-testid="product-chat-input"]')).toBeVisible();
    }

    const metrics = await collectLayoutMetrics(stop.path, stop.name, page);

    await testInfo.attach('layout-metrics', {
      body: JSON.stringify(metrics, null, 2),
      contentType: 'application/json',
    });

    const screenshotPath = testInfo.outputPath(`${stop.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('screenshot', {
      path: screenshotPath,
      contentType: 'image/png',
    });
  });
}

const compactStops = [
  { path: '/knowledge', name: 'mentor-chat-compact' },
  { path: '/assessment/products/freshservice/chat', name: 'product-chat-compact' },
];

for (const stop of compactStops) {
  test(`Compact View: ${stop.name}`, async ({ page, baseURL }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    const targetUrl = `${baseURL}${stop.path}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await expect(page.locator('nav')).toBeVisible();
    if (stop.path.includes('/knowledge')) {
      await expect(page.locator('[data-testid="mentor-chat-input"]')).toBeVisible();
    }
    if (stop.path.endsWith('/chat')) {
      await expect(page.locator('[data-testid="product-chat-input"]')).toBeVisible();
    }

    const metrics = await collectLayoutMetrics(stop.path, stop.name, page);
    await testInfo.attach('layout-metrics', {
      body: JSON.stringify(metrics, null, 2),
      contentType: 'application/json',
    });

    const screenshotPath = testInfo.outputPath(`${stop.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('screenshot', {
      path: screenshotPath,
      contentType: 'image/png',
    });
  });
}
