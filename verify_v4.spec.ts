import { test, expect } from '@playwright/test';

test.use({
  baseURL: 'http://localhost:3000',
});

test('Verify Gacha and Collection with schema fix', async ({ page }) => {
  // Go to home page
  await page.goto('/');
  await page.waitForTimeout(3000); // Wait for loading

  // Take screenshot of home
  await page.screenshot({ path: '/home/jules/verification/screenshots/home_v4.png' });

  // Click Pull button
  const pullButton = page.getByRole('button', { name: /PULL/i }).first();
  await expect(pullButton).toBeVisible();
  await pullButton.click();

  // Wait for modal
  await page.waitForTimeout(2000); // Animation + Delay

  // Check if image is loaded (not broken)
  const modal = page.locator('div:has-text("UNLOCKED")').first();
  const modalImage = page.locator('div:has-text("UNLOCKED") img').first();

  // Wait for modal to be visible
  await expect(page.getByText(/UNLOCKED|OBTAINED/i)).toBeVisible();

  await page.screenshot({ path: '/home/jules/verification/screenshots/pulled_card_v4.png' });

  // Confirm and go to collection
  const confirmButton = page.getByRole('button', { name: 'CONFIRM' });
  await confirmButton.click();

  await page.getByRole('link', { name: 'COLLECTION' }).click();
  await page.waitForTimeout(1000);

  // Take screenshot of collection
  await page.screenshot({ path: '/home/jules/verification/screenshots/collection_v4.png' });

  // Verify that there is at least one card in collection
  const cards = page.locator('.grid > div');
  const count = await cards.count();
  console.log('Cards in collection:', count);
  expect(count).toBeGreaterThan(0);
});
