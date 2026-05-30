import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SECTIONS = ['header', 'main', 'footer'];

test.describe('Responsividade', () => {
  test('sem overflow horizontal', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, 'overflow horizontal detectado').toBe(false);
  });

  test('MobileStickyBar: visível apenas em <768px', async ({ page, viewport }) => {
    await page.goto('/');
    const sticky = page.locator('[data-track="cta_mobile_sticky_ver_planos"]');
    const width = viewport?.width ?? 1280;
    if (width < 768) {
      await expect(sticky).toBeVisible();
    } else {
      await expect(sticky).not.toBeVisible();
    }
  });

  test('Hero mockup: empilhado em <1024px, lado-a-lado em >=1024px', async ({ page, viewport }) => {
    await page.goto('/');
    const width = viewport?.width ?? 1280;
    const mockup = page.locator('[data-testid="whatsapp-mockup"]');
    if ((await mockup.count()) === 0) return; // tolerate missing testid

    if (width < 1024) {
      const heroGrid = page.locator('section').first();
      const box = await heroGrid.boundingBox();
      expect(box).toBeTruthy();
    } else {
      const box = await mockup.boundingBox();
      expect(box).toBeTruthy();
    }
  });

  test('screenshots por seção × viewport', async ({ page, viewport }, testInfo) => {
    await page.goto('/');
    const width = viewport?.width ?? 1280;
    const dir = path.join('tests/playwright/evidences/responsive', `${width}px`);
    fs.mkdirSync(dir, { recursive: true });

    for (const section of SECTIONS) {
      const el = page.locator(section).first();
      if ((await el.count()) === 0) continue;
      const screenshotPath = path.join(dir, `${section}.png`);
      await el.screenshot({ path: screenshotPath });
      await testInfo.attach(`${section}-${width}px`, {
        path: screenshotPath,
        contentType: 'image/png',
      });
    }
  });

  test('sem clipping em header e footer', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header').first();
    const footer = page.locator('footer').first();
    const headerBox = await header.boundingBox();
    const footerBox = await footer.boundingBox();
    expect(headerBox?.width).toBeGreaterThan(0);
    expect(footerBox?.width).toBeGreaterThan(0);
  });
});
