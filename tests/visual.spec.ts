import { test, expect } from '@playwright/test';

test('visual verification', async ({ page }) => {
  // Go to homepage
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'verification/screenshots/home.png', fullPage: true });

  // Go to Gacha page
  await page.goto('http://localhost:3000/gacha');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'verification/screenshots/gacha.png', fullPage: true });

  // Perform a 10-pull (assuming enough currency)
  // We might need to wait for data to load
  await page.waitForSelector('button:has-text("Ten Pull")');
  await page.click('button:has-text("Ten Pull")');

  // Wait for pull animation and results
  await page.waitForTimeout(5000); // 10 pulls * 0.8s + buffer
  await page.screenshot({ path: 'verification/screenshots/pull_results.png', fullPage: false });

  // Confirm results
  const confirmBtn = page.locator('button:has-text("CONFIRM")');
  if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
  }

  // Go to Collection page
  await page.goto('http://localhost:3000/collection');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'verification/screenshots/collection.png', fullPage: true });
});
