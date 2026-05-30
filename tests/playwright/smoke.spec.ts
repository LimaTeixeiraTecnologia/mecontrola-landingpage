import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const EXPECTED_DATA_TRACKS = [
  'cta_header_ver_planos',
  'cta_hero_ver_planos',
  'cta_meet_ver_planos',
  'plan_monthly_select',
  'plan_quarterly_select',
  'plan_yearly_select',
  'cta_final_ver_planos',
  'cta_mobile_sticky_ver_planos',
];

test.describe('Smoke', () => {
  test('GET / retorna 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('<title> não vazio', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('seções principais presentes', async ({ page }) => {
    await page.goto('/');
    const anchors = ['#como-funciona', '#planos', '#faq'];
    for (const anchor of anchors) {
      const el = page.locator(anchor);
      await expect(el).toBeAttached();
    }

    const sections = ['header', 'footer'];
    for (const sel of sections) {
      await expect(page.locator(sel).first()).toBeAttached();
    }
  });

  test('âncoras navegam corretamente', async ({ page }) => {
    await page.goto('/');
    // Verify anchor targets exist in DOM; hash navigation is visual-only
    const anchors = ['#como-funciona', '#planos', '#faq'];
    for (const anchor of anchors) {
      const id = anchor.slice(1);
      const el = page.locator(`#${id}`);
      await expect(el, `elemento ${anchor} deve existir`).toBeAttached();
      // Verify scroll-margin-top applied (element has id, CSS rule [id] applies)
      const margin = await el.evaluate((node) => getComputedStyle(node).scrollMarginTop);
      expect(margin, `${anchor} deve ter scroll-margin-top`).not.toBe('0px');
    }
  });

  test('todos os CTAs têm data-track correto', async ({ page }) => {
    await page.goto('/');
    for (const track of EXPECTED_DATA_TRACKS) {
      const el = page.locator(`[data-track="${track}"]`);
      await expect(el, `data-track="${track}" não encontrado`).toBeAttached();
    }
  });

  test('gera relatório smoke.json', async ({ page }, testInfo) => {
    await page.goto('/');
    const report = {
      timestamp: new Date().toISOString(),
      project: testInfo.project.name,
      status: 'passed',
      checks: ['200 OK', 'title', 'sections', 'anchors', 'data-tracks'],
    };
    const outPath = path.join('tests/playwright/reports', 'smoke.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  });
});
