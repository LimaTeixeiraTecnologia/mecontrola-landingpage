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

// Medicao de web vitals estabilizada para runner compartilhado.
//
// LCP e CLS medidos em UMA carga refletem tanto a pagina quanto a maquina. No runner
// hospedado do GitHub, sem GPU e com CPU disputada, fonte e imagem chegam tarde e o
// deslocamento medido explode: a mesma build que mede CLS 0.02 numa maquina ociosa
// mede 0.22 la. Isso reprovava o teste por ruido de ambiente, nao por regressao.
//
// A correcao NAO afrouxa o orcamento: BUDGETS permanece intocado. O que muda e o
// estimador — passa a ser a MEDIANA de N cargas, que descarta o outlier de uma carga
// azarada sem tolerar degradacao real. Uma regressao verdadeira desloca a mediana
// inteira e continua reprovando.
const VITALS_SAMPLES = 5;

async function measureVitals(
  browser: import('@playwright/test').Browser,
  viewport: { width: number; height: number },
  baseURL: string | undefined,
) {
  const samples: { lcp: number; cls: number; sources: { value: number; el: string }[] }[] = [];
  for (let i = 0; i < VITALS_SAMPLES; i++) {
    // Contexto NOVO a cada amostra. Reusar a mesma page mediria carga quente: da
    // segunda em diante o cache serve tudo de uma vez, o CLS cai para zero e o teste
    // passaria por medir um cenario mais facil, nao por ausencia de deslocamento.
    // O usuario real chega frio, e e isso que o orcamento existe para proteger.
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.addInitScript(() => {
      (window as any).__lcpValue = 0;
      (window as any).__clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__lcpValue = (entry as any).startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      (window as any).__clsSources = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).__clsValue += (entry as any).value;
          for (const src of (entry as any).sources ?? []) {
            const el = src.node as Element | null;
            (window as any).__clsSources.push({
              value: (entry as any).value,
              el: el
                ? `${el.tagName?.toLowerCase()}${el.id ? '#' + el.id : ''}${
                    el.className && typeof el.className === 'string'
                      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
                      : ''
                  }`
                : 'desconhecido',
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(baseURL ?? '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    samples.push({
      lcp: await page.evaluate(() => (window as any).__lcpValue ?? 0),
      cls: await page.evaluate(() => (window as any).__clsValue ?? 0),
      sources: await page.evaluate(() => (window as any).__clsSources ?? []),
    });
    await context.close();
  }
  const median = (values: number[]) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  return {
    lcp: median(samples.map((s) => s.lcp)),
    cls: median(samples.map((s) => s.cls)),
    samples,
  };
}

test.describe('Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('métricas de performance dentro dos budgets (mobile)', async ({ browser, baseURL }) => {
    const { lcp, cls, samples } = await measureVitals(
      browser,
      { width: 375, height: 667 },
      baseURL,
    );

    // Record metrics
    const metricsDir = path.join('tests/playwright/evidences/perf');
    fs.mkdirSync(metricsDir, { recursive: true });
    const metrics = { lcp, cls, samples, timestamp: new Date().toISOString() };
    fs.writeFileSync(
      path.join(metricsDir, 'metrics-mobile.json'),
      JSON.stringify(metrics, null, 2),
    );

    expect(lcp, `LCP ${lcp}ms deve ser ≤ ${BUDGETS.lcp}ms`).toBeLessThanOrEqual(BUDGETS.lcp);
    expect(
      cls,
      `CLS ${cls} deve ser ≤ ${BUDGETS.cls}. Elementos que deslocaram: ${JSON.stringify(
        samples[0]?.sources?.slice(0, 8) ?? [],
      )}`,
    ).toBeLessThanOrEqual(BUDGETS.cls);
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

  test('métricas de performance dentro dos budgets (desktop)', async ({ browser, baseURL }) => {
    const { lcp, cls, samples } = await measureVitals(
      browser,
      { width: 1280, height: 800 },
      baseURL,
    );

    const metricsDir = path.join('tests/playwright/evidences/perf');
    fs.mkdirSync(metricsDir, { recursive: true });
    const metrics = { lcp, cls, samples, timestamp: new Date().toISOString() };
    fs.writeFileSync(
      path.join(metricsDir, 'metrics-desktop.json'),
      JSON.stringify(metrics, null, 2),
    );

    // Desktop budgets (more lenient on LCP, same CLS)
    expect(lcp, `LCP ${lcp}ms deve ser ≤ ${BUDGETS.lcp}ms`).toBeLessThanOrEqual(BUDGETS.lcp);
    expect(
      cls,
      `CLS ${cls} deve ser ≤ ${BUDGETS.cls}. Elementos que deslocaram: ${JSON.stringify(
        samples[0]?.sources?.slice(0, 8) ?? [],
      )}`,
    ).toBeLessThanOrEqual(BUDGETS.cls);
  });
});
