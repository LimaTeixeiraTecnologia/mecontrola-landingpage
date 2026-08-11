import { test, expect } from '@playwright/test';

const BACKEND_PATTERN = '**/api/v1/billing/beta-accesses/activate';

test.describe('/ativar-beta', () => {
  test('exibe erro de token ausente quando query string não tem token', async ({ page }) => {
    await page.goto('/ativar-beta');

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('token ausente');
  });

  test('ativação automática com sucesso — mostra CTA WhatsApp com o número correto', async ({
    page,
  }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          beta_access_id: '00000000-0000-0000-0000-000000000000',
          status: 'ACTIVE',
          activated_at: '2026-08-11T10:00:00Z',
          expires_at: '2026-09-10T10:00:00Z',
          entitlement_status: 'TRIALING',
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const waBtn = page.locator('#activate-beta-wa-btn');
    await expect(waBtn).toBeVisible();
    await expect(waBtn).toHaveAttribute('href', /^https:\/\/wa\.me\/5511936212870\?text=/);

    const loading = page.locator('#activate-beta-loading');
    await expect(loading).toBeHidden();
  });

  test('countdown visível e inicia em 3 após ativação com sucesso', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          beta_access_id: '00000000-0000-0000-0000-000000000000',
          status: 'ACTIVE',
          activated_at: '2026-08-11T10:00:00Z',
          expires_at: '2026-09-10T10:00:00Z',
          entitlement_status: 'TRIALING',
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const countdown = page.locator('#activate-beta-countdown');
    await expect(countdown).toBeVisible();
    const text = await countdown.textContent();
    expect(['3', '2', '1', '0']).toContain(text?.trim());
  });

  test('token já ativado (replay) — exibe #activate-beta-consumed com CTA WhatsApp', async ({
    page,
  }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'concessão não pode ser ativada no estado atual',
          errors: { code: 'invalid_transition' },
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const consumed = page.locator('#activate-beta-consumed');
    await expect(consumed).toBeVisible();

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeHidden();

    const waBtn = page.locator('#activate-beta-consumed-wa-btn');
    await expect(waBtn).toHaveAttribute('href', /^https:\/\/wa\.me\/5511936212870\?text=/);
  });

  test('token inválido — exibe mensagem específica retornada pela API', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'activation_token inválido',
          errors: { code: 'invalid_activation_token' },
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Link inválido ou já utilizado');
  });

  test('token expirado — exibe mensagem de expiração', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Unprocessable Entity',
          status: 422,
          detail: 'token de ativação expirado',
          errors: { code: 'activation_token_expired' },
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('expirou');
  });

  test('conflito com assinatura paga — exibe mensagem específica', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'usuário já possui assinatura paga ativa',
          errors: { code: 'paid_entitlement_conflict' },
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('assinatura ativa');
  });

  test('rate limit (429) — exibe mensagem de muitas tentativas', async ({ page }) => {
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Too Many Requests',
          status: 429,
          detail: 'rate limit exceeded',
        }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Muitas tentativas');
  });

  test('timeout da API — exibe mensagem de conexão', async ({ page }) => {
    test.setTimeout(20000);
    await page.route(BACKEND_PATTERN, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 11000));
      await route.abort();
    });

    await page.goto('/ativar-beta?token=abc123');

    const error = page.locator('#activate-beta-error');
    await expect(error).toBeVisible({ timeout: 15000 });
    await expect(error).toContainText('conexão');
  });
});
