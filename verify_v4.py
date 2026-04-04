import { test, expect } from '@playwright/test';

test('Verify Gacha and Collection with schema fix', async ({ page }) => {
  // Go to home page
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for loading

  // Take screenshot of home
  await page.screenshot({ path: '/home/jules/verification/screenshots/home_v4.png' });

  // Click Pull 1 button
  const pullButton = page.getByRole('button', { name: /Pull 1/i });
  await expect(pullButton).toBeVisible();
  await pullButton.click();

  // Wait for modal
  const modal = page.locator('div:has-text("NEW UNLOCKED!")').first();
  await page.waitForTimeout(1000); // Animation time

  // Check if image is loaded (not broken)
  const modalImage = modal.locator('img');
  const imageSrc = await modalImage.getAttribute('src');
  console.log('Modal image src:', imageSrc);

  await page.screenshot({ path: '/home/jules/verification/screenshots/pulled_card_v4.png' });

  // Confirm and go to collection
  await page.getByRole('button', { name: 'CONFIRM' }).click();
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
