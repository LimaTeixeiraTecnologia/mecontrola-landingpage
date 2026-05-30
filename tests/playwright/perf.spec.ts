import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Performance budgets per T10 spec
const BUDGETS = {
  lcp: 2500, // ms
  cls: 0.1,
  tbt: 200, // ms
  jsBudget: 200 * 1024, // 200 KB gzip (approximated via transferred size)
};

test.describe('Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('métricas de performance dentro dos budgets (mobile)', async ({ page }) => {
    // Inject performance observer before navigation
    await page.addInitScript(() => {
      (window as any).__lcpValue = 0;
      (window as any).__clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__lcpValue = (entry as any).startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__clsValue += (entry as any).value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const lcp: number = await page.evaluate(() => (window as any).__lcpValue ?? 0);
    const cls: number = await page.evaluate(() => (window as any).__clsValue ?? 0);

    // Record metrics
    const metricsDir = path.join('tests/playwright/evidences/perf');
    fs.mkdirSync(metricsDir, { recursive: true });
    const metrics = { lcp, cls, timestamp: new Date().toISOString() };
    fs.writeFileSync(
      path.join(metricsDir, 'metrics-mobile.json'),
      JSON.stringify(metrics, null, 2),
    );

    expect(lcp, `LCP ${lcp}ms deve ser ≤ ${BUDGETS.lcp}ms`).toBeLessThanOrEqual(BUDGETS.lcp);
    expect(cls, `CLS ${cls} deve ser ≤ ${BUDGETS.cls}`).toBeLessThanOrEqual(BUDGETS.cls);
  });

  test('transferência de JS dentro do budget (≤200 KB)', async ({ page }) => {
    let jsTransferred = 0;
    page.on('response', async (response) => {
      const ct = response.headers()['content-type'] ?? '';
      if (ct.includes('javascript')) {
        try {
          const body = await response.body();
          jsTransferred += body.length;
        } catch {
          // ignore
        }
      }
    });
    await page.goto('/', { waitUntil: 'networkidle' });

    const metricsDir = path.join('tests/playwright/evidences/perf');
    fs.mkdirSync(metricsDir, { recursive: true });
    fs.writeFileSync(
      path.join(metricsDir, 'js-budget.json'),
      JSON.stringify({ jsTransferred, limit: BUDGETS.jsBudget }, null, 2),
    );

    expect(
      jsTransferred,
      `JS transferido ${Math.round(jsTransferred / 1024)}KB deve ser ≤ ${BUDGETS.jsBudget / 1024}KB`,
    ).toBeLessThanOrEqual(BUDGETS.jsBudget);
  });

  test('screenshot da página completa (evidência)', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const screenshotPath = path.join('tests/playwright/evidences/perf', 'fullpage-mobile.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('fullpage-mobile', {
      path: screenshotPath,
      contentType: 'image/png',
    });
  });
});

test.describe('Performance (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('métricas de performance dentro dos budgets (desktop)', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__lcpValue = 0;
      (window as any).__clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__lcpValue = (entry as any).startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__clsValue += (entry as any).value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const lcp: number = await page.evaluate(() => (window as any).__lcpValue ?? 0);
    const cls: number = await page.evaluate(() => (window as any).__clsValue ?? 0);

    const metricsDir = path.join('tests/playwright/evidences/perf');
    fs.mkdirSync(metricsDir, { recursive: true });
    const metrics = { lcp, cls, timestamp: new Date().toISOString() };
    fs.writeFileSync(
      path.join(metricsDir, 'metrics-desktop.json'),
      JSON.stringify(metrics, null, 2),
    );

    // Desktop budgets (more lenient on LCP, same CLS)
    expect(lcp, `LCP ${lcp}ms deve ser ≤ ${BUDGETS.lcp}ms`).toBeLessThanOrEqual(BUDGETS.lcp);
    expect(cls, `CLS ${cls} deve ser ≤ ${BUDGETS.cls}`).toBeLessThanOrEqual(BUDGETS.cls);
  });
});
