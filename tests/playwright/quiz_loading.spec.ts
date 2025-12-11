import { test, expect } from '@playwright/test';

test('Quiz generation loads successfully for module without content', async ({ page }) => {
  // 1. Navigate to the specific module page
  // The URL pattern is /curriculum/:productId/:moduleId
  const moduleId = 'dce2d97e-bedf-47b7-91cc-8c6d96c21b44';
  await page.goto(`/curriculum/freshdesk_omni/${moduleId}`);

  // 2. Wait for the page to load
  // Check for various states to debug
  try {
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  } catch (e) {
    const isLoading = await page.getByText('AI 멘토가 분석 중입니다...').isVisible();
    const isError = await page.getByText('모듈을 찾을 수 없습니다').isVisible();
    console.log(`Debug: Loading=${isLoading}, Error=${isError}`);
    
    if (isLoading) {
      console.log('Still loading...');
    }
    if (isError) {
      console.log('Module not found error displayed');
    }
    throw e;
  }

  // 3. Click "자가 점검" to start the quiz phase
  // Use a more flexible selector
  const quizButton = page.getByRole('button', { name: '자가 점검' }).first();
  await expect(quizButton).toBeVisible();
  await quizButton.click();

  // 4. Verify loading state appears
  // "문제를 준비하고 있습니다" or "AI가 학습 내용을 바탕으로 문제를 생성 중입니다..."
  await expect(page.getByText('문제를 준비하고 있습니다')).toBeVisible();

  // 5. Wait for the quiz to load (this triggers the backend generation)
  // We expect "Question 1" to appear.
  // The generation might take a few seconds (Gemini API call).
  // Increasing timeout to 30s just in case.
  await expect(page.getByText('Question 1')).toBeVisible({ timeout: 30000 });

  // 6. Verify loading state is gone
  await expect(page.getByText('문제를 준비하고 있습니다')).not.toBeVisible();

  // 7. Verify at least one question text is visible
  // We can check for the question container or choices
  const choices = page.locator('button.w-full.text-left');
  await expect(choices).toHaveCount(4); // Expect 4 choices for the first question
});
