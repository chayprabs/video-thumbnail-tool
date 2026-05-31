import { test, expect } from '@playwright/test';
import path from 'node:path';

const samplePath = path.join(__dirname, '../fixtures/sample.mp4');

test.describe('ClipTools playground', () => {
  test('homepage loads with product UI', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await expect(page.getByText('Sample videos')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });

  test('privacy and terms pages', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Terms/i })).toBeVisible();
  });

  test('SEO routes load', async ({ page }) => {
    for (const route of [
      '/video-trim-online',
      '/video-thumbnail-generator',
      '/video-sprite-sheet',
      '/scene-detect-online',
      '/video-contact-sheet',
    ]) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
    }
  });

  test('sample video loads and probe shows duration', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Talking head' }).click();
    await expect(page.getByText(/Media probe/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Duration:/)).toBeVisible();
  });

  test('trim produces downloadable result', async ({ page, request }) => {
    const health = await request.get('http://localhost:8787/health');
    test.skip(!health.ok(), 'Worker not running on :8787');

    await page.goto('/');
    await page.locator('#file-input').setInputFiles(samplePath);
    await expect(page.getByText(/Media probe/i)).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Run' }).click();
    await expect(page.getByText(/Download trimmed.mp4/i)).toBeVisible({ timeout: 60_000 });
  });
});
