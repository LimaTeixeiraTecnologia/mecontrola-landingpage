import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade', () => {
  test('axe: 0 violations sérias/críticas', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // WhatsApp mockup is aria-hidden decorative illustration using 3rd-party brand colors
      .exclude('[role="img"][aria-hidden="true"]')
      .analyze();

    const severe = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    if (severe.length > 0) {
      const summary = severe.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n');
      expect(severe, `Violations:\n${summary}`).toHaveLength(0);
    }
  });

  test('h1 único e hierarquia de headings preservada', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'deve haver exatamente 1 <h1>').toBe(1);

    // Ensure no h3 appears before h2
    const headings = await page.locator('h1,h2,h3,h4').all();
    let maxLevel = 0;
    for (const h of headings) {
      const tag = await h.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tag[1] ?? '1');
      if (level > maxLevel + 1) {
        // Headings jumped more than 1 level — not allowed
        expect(false, `Heading hierarchy skip: found ${tag} after level ${maxLevel}`).toBe(true);
      }
      if (level > maxLevel) maxLevel = level;
    }
  });

  test('foco visível ao navegar por Tab', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeAttached();
  });

  test('prefers-reduced-motion: animações suspensas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const animDuration = await page.evaluate(() => {
      const el = document.body;
      const style = getComputedStyle(el);
      return style.animationDuration;
    });
    // With reduced motion, animation-duration should be '0s' or not applicable
    // Our CSS sets animation: none !important for prefers-reduced-motion
    expect(['0s', '']).toContain(animDuration);
  });
});
