import { test, expect } from '@playwright/test';

const BACKEND_PATTERN = '**/api/v1/onboarding/tokens/**/state';

test.describe('/activate', () => {
  test('mostra loading e renderiza CTA WhatsApp quando ready_to_activate=true', async ({
    page,
  }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 150));
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

  test('renderiza mensagem de erro quando ready_to_activate=false', async ({ page }) => {
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
});
