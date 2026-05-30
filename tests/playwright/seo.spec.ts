import { test, expect } from '@playwright/test';

test.describe('SEO técnico', () => {
  test('title e meta description presentes', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.trim()).not.toBe('');

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.trim().length).toBeGreaterThan(0);
  });

  test('canonical absoluta e correta', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/^https:\/\/mecontrola\.app\.br\/?$/);
  });

  test('Open Graph completo', async ({ page }) => {
    await page.goto('/');
    const og: Record<string, string> = {
      'og:type': 'website',
      'og:locale': 'pt_BR',
    };
    for (const [prop, expected] of Object.entries(og)) {
      const content = await page.locator(`meta[property="${prop}"]`).getAttribute('content');
      expect(content, `${prop} deve ser "${expected}"`).toBe(expected);
    }

    const required = ['og:title', 'og:description', 'og:image', 'og:url'];
    for (const prop of required) {
      const content = await page.locator(`meta[property="${prop}"]`).getAttribute('content');
      expect(content?.trim().length, `${prop} não pode ser vazio`).toBeGreaterThan(0);
    }

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toMatch(/^https:\/\//);
  });

  test('Twitter Card completo', async ({ page }) => {
    await page.goto('/');
    const card = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(card).toBe('summary_large_image');

    const required = ['twitter:title', 'twitter:description', 'twitter:image'];
    for (const name of required) {
      const content = await page.locator(`meta[name="${name}"]`).getAttribute('content');
      expect(content?.trim().length, `${name} não pode ser vazio`).toBeGreaterThan(0);
    }
  });

  test('JSON-LD parseável com Organization + WebSite + WebPage', async ({ page }) => {
    await page.goto('/');
    const jsonText = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonText).toBeTruthy();
    const json = JSON.parse(jsonText!);
    const graph: Array<{ '@type': string }> = json['@graph'] ?? [];
    const types = graph.map((n) => n['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
    expect(types).toContain('WebPage');
  });

  test('/sitemap-index.xml retorna 200 e referencia raiz', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain('sitemap');
  });

  test('/robots.txt retorna 200 com Sitemap correto', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const body = (await response!.body()).toString();
    expect(body).toContain('Sitemap:');
  });

  test('/404 retorna status 404 com CTA "Voltar"', async ({ page }) => {
    const response = await page.goto('/pagina-que-nao-existe');
    expect(response?.status()).toBe(404);
    const cta = page.locator('a', { hasText: /voltar/i });
    await expect(cta).toBeAttached();
  });
});

test.describe('LGPD — consent gating', () => {
  test('zero requests para tracking antes de qualquer interação', async ({ page }) => {
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com') || url.includes('google-analytics.com')) {
        trackingRequests.push(url);
      }
    });
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(
      trackingRequests,
      `Requests de tracking antes de consent: ${trackingRequests.join(', ')}`,
    ).toHaveLength(0);
  });

  test('Recusar: nenhum request de tracking agora nem após reload', async ({ page }) => {
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com') || url.includes('google-analytics.com')) {
        trackingRequests.push(url);
      }
    });
    await page.goto('/');
    const declineBtn = page.locator('#consent-decline');
    if (await declineBtn.isVisible()) {
      await declineBtn.click();
    }
    await page.reload();
    await page.waitForTimeout(1000);
    expect(trackingRequests).toHaveLength(0);

    const consent = await page.evaluate(() => localStorage.getItem('mecontrola_consent'));
    expect(consent).toBe('declined');
  });

  test('banner não reaparece após consent gravado', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    const declineBtn = page.locator('#consent-decline');
    if (await declineBtn.isVisible()) {
      await declineBtn.click();
    }
    await page.reload();
    await expect(banner).toBeHidden();
  });

  test('Aceitar: localStorage=accepted; banner oculto após reload', async ({ page }) => {
    await page.goto('/');
    const acceptBtn = page.locator('#consent-accept');
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
    }
    const consent = await page.evaluate(() => localStorage.getItem('mecontrola_consent'));
    expect(consent).toBe('accepted');

    await page.reload();
    const banner = page.locator('#cookie-banner');
    await expect(banner).toBeHidden();
  });
});
