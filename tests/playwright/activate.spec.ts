import { test, expect } from '@playwright/test';

const BACKEND_PATTERN = '**/api/v1/onboarding/tokens/**/state';
const SUPPORT_URL = 'https://wa.me/5511999999999';
const WA_ME_URL = 'https://wa.me/5511936212870?text=ATIVAR%20TOKEN';

test.describe('/activate', () => {
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

    const tgBtn = page.locator('#activate-tg-btn');
    await expect(tgBtn).toBeHidden();

    await expect(loading).toBeHidden();
  });

  test('renderiza ambos CTAs quando telegram_deep_link presente', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ready_to_activate: true,
          wa_me_url: 'https://wa.me/5511936212870?text=ATIVAR%20test',
          bot_number_display: '+55 11 93621-2870',
          telegram_deep_link: 'https://t.me/mecontrola_bot?start=ATIVAR_test',
        }),
      });
    });

    await page.goto('/activate?token=test');

    const waBtn = page.locator('#activate-wa-btn');
    const tgBtn = page.locator('#activate-tg-btn');

    await expect(waBtn).toBeVisible();
    await expect(tgBtn).toBeVisible();
    await expect(tgBtn).toHaveAttribute('href', 'https://t.me/mecontrola_bot?start=ATIVAR_test');
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
