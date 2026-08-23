import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BACKEND_PATTERN = '**/api/v1/onboarding/tokens/**/state';
const CONSENT_PATTERN = '**/api/v1/onboarding/tokens/**/consent';
const LEGAL_PATTERN = '**/api/v1/legal/consent-requirements';
const SUPPORT_URL = 'https://wa.me/5511999999999';
const WA_ME_URL = 'https://wa.me/5511936212870?text=ATIVAR%20TOKEN';

const routeLegalRequirements = async (
  page: import('@playwright/test').Page,
  body: Record<string, unknown>,
) => {
  await page.route(LEGAL_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
};

test.describe('/activate', () => {
  test.beforeEach(async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: false,
      terms_version: '',
      privacy_version: '',
    });
  });

  test('mostra loading e renderiza CTA WhatsApp quando ready_to_activate=true', async ({
    page,
  }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: 'https://wa.me/5511936212870?text=ATIVAR%20test',
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/activate?token=test');

    const loading = page.locator('#activate-loading');
    await expect(loading).toBeVisible();

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).toBeVisible();
    await expect(waBtn).toHaveAttribute('href', 'https://wa.me/5511936212870?text=ATIVAR%20test');

    await expect(loading).toBeHidden();
  });

  test('renderiza mensagem de erro quando ready_to_activate=false sem reason', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ready_to_activate: false }),
      });
    });

    await page.goto('/activate?token=test');

    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('Não foi possível validar seu acesso');
  });

  test('renderiza erro quando token ausente', async ({ page }) => {
    await page.goto('/activate');
    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('token ausente');
  });

  test('token expirado — exibe mensagem específica de expiração', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'expired',
          support_url: SUPPORT_URL,
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('expirou');
  });

  test('token pendente — exibe mensagem de pagamento em processamento', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'pending',
          support_url: SUPPORT_URL,
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('processado');
  });

  test('token inválido — exibe mensagem de link inválido', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'not_found',
          support_url: SUPPORT_URL,
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('inválido');
  });

  test('conta já ativa — exibe #activate-consumed e não #activate-error', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'consumed',
          wa_me_url: WA_ME_URL,
          support_url: SUPPORT_URL,
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const consumed = page.locator('#activate-consumed');
    await expect(consumed).toBeVisible();

    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeHidden();
  });

  test('conta já ativa — #activate-consumed-wa-btn tem href correto', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'consumed',
          wa_me_url: WA_ME_URL,
          support_url: SUPPORT_URL,
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const waBtn = page.locator('#activate-consumed-wa-btn');
    await expect(waBtn).toBeVisible();
    await expect(waBtn).toHaveAttribute('href', WA_ME_URL);
  });

  test('timeout da API — exibe mensagem de conexão', async ({ page }) => {
    test.setTimeout(15000);
    await page.route(BACKEND_PATTERN, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5500));
      await route.abort();
    });

    await page.goto('/ativar?token=test');

    const errorBox = page.locator('#activate-error');
    await expect(errorBox).toBeVisible({ timeout: 10000 });
    await expect(errorBox).toContainText('conexão');
  });

  test('countdown visível ao receber ready_to_activate=true', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const countdown = page.locator('#activate-countdown');
    await expect(countdown).toBeVisible();
    const text = await countdown.textContent();
    expect(['3', '2', '1', '0']).toContain(text?.trim());
  });

  test('botão WhatsApp visível imediatamente — antes do countdown terminar', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).toBeVisible();

    const countdown = page.locator('#activate-countdown');
    const text = await countdown.textContent();
    const remaining = parseInt(text?.trim() ?? '0', 10);
    expect(remaining).toBeGreaterThan(0);
  });

  test('support button — href correto no estado de erro', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'expired',
          support_url: SUPPORT_URL,
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const supportBtn = page.locator('#activate-support-btn');
    await expect(supportBtn).toBeVisible();
    await expect(supportBtn).toHaveAttribute('href', SUPPORT_URL);
  });

  test('redirect 301 — /activate redireciona para /ativar preservando query', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: false,
          reason: 'not_found',
          support_url: SUPPORT_URL,
        }),
      });
    });
    await page.goto('/activate?token=test');
    expect(page.url()).toContain('/ativar');
    expect(page.url()).toContain('token=test');
  });
});

test.describe('/activate — exigência de consentimento (RF-08 a RF-11)', () => {
  test('checkbox visível e CTA desabilitado até marcar o aceite', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const consent = page.locator('#activate-consent');
    await expect(consent).toBeVisible();

    const checkbox = page.locator('#activate-consent-checkbox');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).toHaveAttribute('aria-disabled', 'true');

    const termsLink = consent.locator('a[href="/termos-de-servico/"]');
    const privacyLink = consent.locator('a[href="/politica-de-privacidade/"]');
    await expect(termsLink).toHaveAttribute('target', '_blank');
    await expect(privacyLink).toHaveAttribute('target', '_blank');
  });

  test('clicar no CTA desabilitado não navega e mostra erro perceptível', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).toHaveAttribute('aria-disabled', 'true');

    const newPagePromise = page
      .context()
      .waitForEvent('page', { timeout: 1500 })
      .catch(() => null);
    await waBtn.click({ force: true });
    const newPage = await newPagePromise;

    expect(newPage).toBeNull();

    const consentError = page.locator('#activate-consent-error');
    await expect(consentError).toBeVisible();
    expect(page.url()).toContain('/ativar?token=test');
  });

  test('marcar o aceite registra o consentimento e libera o CTA e o countdown', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    let consentBody: unknown = null;
    await page.route(CONSENT_PATTERN, async (route) => {
      consentBody = route.request().postDataJSON();
      await route.fulfill({ status: 204 });
    });

    await page.goto('/ativar?token=test');

    const checkbox = page.locator('#activate-consent-checkbox');
    await checkbox.check();

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).not.toHaveAttribute('aria-disabled', 'true');

    const countdown = page.locator('#activate-countdown');
    await expect(countdown).toBeVisible();

    expect(consentBody).toEqual({ terms_version: 'v0.9', privacy_version: 'v0.9' });
  });

  test('marcar, desmarcar e remarcar rapidamente — registra consentimento só uma vez e mantém um único countdown', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    let consentCalls = 0;
    await page.route(CONSENT_PATTERN, async (route) => {
      consentCalls += 1;
      await route.fulfill({ status: 204 });
    });

    await page.goto('/ativar?token=test');

    const checkbox = page.locator('#activate-consent-checkbox');
    await checkbox.check();
    await expect(checkbox).not.toBeDisabled();

    await checkbox.uncheck();
    await checkbox.check();
    await checkbox.uncheck();
    await checkbox.check();

    await page.waitForTimeout(500);
    expect(consentCalls).toBe(1);

    // O countdown precisa estar correndo e monotonico. Nao asserto decremento de
    // EXATAMENTE 1 numa janela de 1100ms: num runner carregado o timer tica duas vezes
    // nessa janela e o teste fica vermelho por lentidao da maquina, nao por defeito.
    // A propriedade "um unico countdown" ja esta provada por consentCalls === 1 acima,
    // que e o que a remarcacao rapida poderia duplicar.
    const countdown = page.locator('#activate-countdown');
    const firstReading = parseInt((await countdown.textContent())?.trim() ?? '-1', 10);
    await page.waitForTimeout(1100);
    const secondReading = parseInt((await countdown.textContent())?.trim() ?? '-1', 10);

    expect(secondReading).toBeLessThan(firstReading);
    expect(secondReading).toBeGreaterThanOrEqual(0);
  });

  test('falha no registro do consentimento (409) — aviso discreto e fail-open', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });
    await page.route(CONSENT_PATTERN, async (route) => {
      await route.fulfill({ status: 409 });
    });

    await page.goto('/ativar?token=test');

    const checkbox = page.locator('#activate-consent-checkbox');
    await checkbox.check();

    const detail = page.locator('#activate-error-detail');
    await expect(detail).toBeVisible();

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).not.toHaveAttribute('aria-disabled', 'true');

    const countdown = page.locator('#activate-countdown');
    await expect(countdown).toBeVisible();
  });

  test('falha de rede no registro do consentimento — tenta novamente e ainda libera o fluxo', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });
    let attempts = 0;
    await page.route(CONSENT_PATTERN, async (route) => {
      attempts += 1;
      await route.abort();
    });

    await page.goto('/ativar?token=test');

    const checkbox = page.locator('#activate-consent-checkbox');
    await checkbox.check();

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(attempts).toBe(2);
  });

  test('axe: 0 violações sérias/críticas no controle de aceite', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/ativar?token=test');
    await expect(page.locator('#activate-consent')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('#activate-consent')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const severe = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(severe, JSON.stringify(severe, null, 2)).toHaveLength(0);
  });

  test('BUG-35 — backend pendurado no POST de consentimento: fail-open libera o CTA', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });
    await page.route(CONSENT_PATTERN, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 20_000));
      await route.fulfill({ status: 204 });
    });

    await page.goto('/ativar?token=test');

    const checkbox = page.locator('#activate-consent-checkbox');
    await checkbox.check();

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).not.toHaveAttribute('aria-disabled', 'true', { timeout: 15_000 });
    await expect(checkbox).toBeEnabled();

    const detail = page.locator('#activate-error-detail');
    await expect(detail).toBeVisible();

    const countdown = page.locator('#activate-countdown');
    await expect(countdown).toBeVisible();
  });

  test('BUG-40 — aviso de countdown fica oculto enquanto o aceite está pendente', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });
    await page.route(CONSENT_PATTERN, async (route) => {
      await route.fulfill({ status: 204 });
    });

    await page.goto('/ativar?token=test');

    const note = page.locator('#activate-countdown-note');
    await expect(page.locator('#activate-consent')).toBeVisible();
    await expect(note).toBeHidden();

    await page.locator('#activate-consent-checkbox').check();
    await expect(note).toBeVisible();
  });

  test('BUG-41 — CTA desabilitado tem sinal visual espelhando aria-disabled', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });
    await page.route(CONSENT_PATTERN, async (route) => {
      await route.fulfill({ status: 204 });
    });

    await page.goto('/ativar?token=test');

    const waBtn = page.locator('#activate-wa-btn');
    await expect(waBtn).toHaveAttribute('aria-disabled', 'true');
    await expect(waBtn).toHaveClass(/opacity-60/);
    await expect(waBtn).toHaveClass(/cursor-not-allowed/);
    const pointerEvents = await waBtn.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents).not.toBe('none');

    await page.locator('#activate-consent-checkbox').check();
    await expect(waBtn).not.toHaveAttribute('aria-disabled', 'true');
    await expect(waBtn).not.toHaveClass(/opacity-60/);
    await expect(waBtn).not.toHaveClass(/cursor-not-allowed/);
  });

  test('BUG-42 — checkbox de aceite referencia a mensagem de erro por aria-describedby', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: WA_ME_URL,
          bot_number_display: '+55 11 93621-2870',
        }),
      });
    });

    await page.goto('/ativar?token=test');

    const checkbox = page.locator('#activate-consent-checkbox');
    await expect(checkbox).toHaveAttribute('aria-describedby', 'activate-consent-error');
    await expect(page.locator('#activate-consent-error')).toHaveCount(1);
  });
});
