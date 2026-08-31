import { test, expect } from '@playwright/test';

/**
 * N-01 — art. 33, VIII da LGPD exige, para transferência internacional baseada em
 * consentimento, que ele seja "específico e em destaque para a transferência, com
 * informação prévia sobre o caráter internacional da operação, distinguindo esta de
 * outras finalidades". Este gate prova que o banner pratica o que a Política declara.
 *
 * Issue #14 removeu o bloco `#cookie-intl-transfer` (destaque visual específico do banner)
 * por pedido de produto. O terceiro teste abaixo ainda cobra da Política de Privacidade a
 * menção a esse bloco destacado — hoje ela descreve algo que o banner não exibe mais.
 * Ajustar o texto legal exige revisão jurídica/produto e bump de LEGAL_DOCS_VERSION +
 * legal-versions.contract.json (ver tests/playwright/legal-version-parity.spec.ts); fora do
 * escopo desta issue, por isso não foi alterado aqui.
 */

test.describe('Consentimento de transferência internacional no banner (art. 33, VIII)', () => {
  test('banner informa previamente a medição e não carrega tracking antes do consentimento', async ({
    page,
  }) => {
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com') || url.includes('google-analytics.com')) {
        trackingRequests.push(url);
      }
    });

    await page.goto('/');

    const banner = page.locator('#cookie-banner');
    await expect(banner, 'banner deve aparecer antes de qualquer aceite').toBeVisible();

    await expect(page.locator('#consent-accept')).toHaveText('Permitir medição');
    await expect(page.locator('#consent-decline')).toHaveText('Continuar sem medição');

    expect(
      trackingRequests,
      `informação prévia inútil se o GA já carregou: ${trackingRequests.join(', ')}`,
    ).toHaveLength(0);
  });

  test('aceite grava consentimento e só então o GA pode carregar', async ({ page }) => {
    const trackingRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('googletagmanager.com') || url.includes('google-analytics.com')) {
        trackingRequests.push(url);
      }
    });

    await page.goto('/');
    expect(trackingRequests).toHaveLength(0);

    const gaId = await page.locator('#cookie-banner').getAttribute('data-ga-id');
    await page.locator('#consent-accept').click();

    const consent = await page.evaluate(() => localStorage.getItem('mecontrola_consent'));
    expect(consent).toBe('accepted');
    await expect(page.locator('#cookie-banner')).toBeHidden();

    if (gaId) {
      await expect
        .poll(() => trackingRequests.length, {
          message: 'com PUBLIC_GA_ID configurado, o GA deve carregar somente após o aceite',
          timeout: 5000,
        })
        .toBeGreaterThan(0);
    }
  });

  test('Política de Privacidade descreve exatamente o que o banner faz', async ({ page }) => {
    await page.goto('/politica-de-privacidade/');
    const body = ((await page.locator('main').textContent()) ?? '').replace(/\s+/g, ' ').trim();

    expect(body, 'a Política deve manter a âncora do art. 33, VIII para o Google LLC').toContain(
      'art. 33, VIII',
    );
    expect(
      body,
      'a Política deve descrever o banner como fonte da informação prévia, não um fluxo inexistente',
    ).toContain(
      'o banner de cookies exibe, em bloco destacado e apartado do aviso geral de cookies',
    );
    expect(
      body,
      'AWS não pode continuar ancorada em segurança da informação sob art. 33, IX (art. 7º, IX não está entre II, V e VI)',
    ).not.toContain('à segurança da informação (art. 33, IX');
  });
});
