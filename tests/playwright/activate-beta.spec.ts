import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BACKEND_PATTERN = '**/api/v1/billing/beta-accesses/activate';
const LEGAL_PATTERN = '**/api/v1/legal/consent-requirements';

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

test.describe('/ativar-beta', () => {
  test.beforeEach(async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: false,
      terms_version: '',
      privacy_version: '',
    });
  });

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

test.describe('/ativar-beta — exigência de consentimento (RF-12, D-27)', () => {
  test('estado consent exibido no load; POST de ativação não dispara antes do aceite', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    let activateCalls = 0;
    await page.route(BACKEND_PATTERN, async (route) => {
      activateCalls += 1;
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

    const consent = page.locator('#activate-beta-consent');
    await expect(consent).toBeVisible();

    const checkbox = page.locator('#activate-beta-consent-checkbox');
    await expect(checkbox).not.toBeChecked();

    const submit = page.locator('#activate-beta-consent-submit');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');

    await page.waitForTimeout(500);
    expect(activateCalls).toBe(0);
  });

  test('marcar aceite e clicar habilita o envio; ativação ocorre com o payload de consent', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    let capturedBody: unknown = null;
    await page.route(BACKEND_PATTERN, async (route) => {
      capturedBody = route.request().postDataJSON();
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

    const checkbox = page.locator('#activate-beta-consent-checkbox');
    await checkbox.check();

    const submit = page.locator('#activate-beta-consent-submit');
    await expect(submit).not.toHaveAttribute('aria-disabled', 'true');
    await submit.click();

    const waBtn = page.locator('#activate-beta-wa-btn');
    await expect(waBtn).toBeVisible();

    expect(capturedBody).toEqual({
      activation_token: 'abc123',
      consent: { terms_version: 'v0.9', privacy_version: 'v0.9' },
    });
  });

  test('clicar no envio desabilitado não ativa e mostra erro perceptível', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    let activateCalls = 0;
    await page.route(BACKEND_PATTERN, async (route) => {
      activateCalls += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/ativar-beta?token=abc123');

    const submit = page.locator('#activate-beta-consent-submit');
    await submit.click({ force: true });

    const consentError = page.locator('#activate-beta-consent-error');
    await expect(consentError).toBeVisible();
    expect(activateCalls).toBe(0);
  });

  test('axe: 0 violações sérias/críticas no controle de aceite', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    await page.goto('/ativar-beta?token=abc123');
    await expect(page.locator('#activate-beta-consent')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('#activate-beta-consent')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const severe = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(severe, JSON.stringify(severe, null, 2)).toHaveLength(0);
  });

  test('BUG-37 — falha de rede na ativação: tenta novamente uma vez', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    let attempts = 0;
    await page.route(BACKEND_PATTERN, async (route) => {
      attempts += 1;
      await route.abort();
    });

    await page.goto('/ativar-beta?token=abc123');

    const checkbox = page.locator('#activate-beta-consent-checkbox');
    await checkbox.check();
    await page.locator('#activate-beta-consent-submit').click();

    await expect(page.locator('#activate-beta-error')).toBeVisible();
    expect(attempts).toBe(2);
  });

  test('BUG-37 — erro não transitório (invalid_transition) não é retentado', async ({ page }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    let attempts = 0;
    await page.route(BACKEND_PATTERN, async (route) => {
      attempts += 1;
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ errors: { code: 'invalid_transition' } }),
      });
    });

    await page.goto('/ativar-beta?token=abc123');

    const checkbox = page.locator('#activate-beta-consent-checkbox');
    await checkbox.check();
    await page.locator('#activate-beta-consent-submit').click();

    await expect(page.locator('#activate-beta-consumed')).toBeVisible();
    expect(attempts).toBe(1);
  });

  test('BUG-37 — falha restaura checkbox e botão para permitir nova tentativa manual', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.abort();
    });

    await page.goto('/ativar-beta?token=abc123');

    const checkbox = page.locator('#activate-beta-consent-checkbox');
    await checkbox.check();
    const submit = page.locator('#activate-beta-consent-submit');
    await submit.click();

    await expect(page.locator('#activate-beta-error')).toBeVisible();
    await expect(checkbox).toBeEnabled();
    await expect(submit).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('BUG-38 — endpoint de exigência lento não trava a ativação automática', async ({ page }) => {
    await page.route(LEGAL_PATTERN, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ consent_required: false, terms_version: '', privacy_version: '' }),
      });
    });
    await page.route(BACKEND_PATTERN, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    const startedAt = Date.now();
    await page.goto('/ativar-beta?token=abc123');

    await expect(page.locator('#activate-beta-wa-btn')).toBeVisible({ timeout: 2000 });
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  test('BUG-41/42 — submit desabilitado tem sinal visual e checkbox referencia o erro', async ({
    page,
  }) => {
    await routeLegalRequirements(page, {
      consent_required: true,
      terms_version: 'v0.9',
      privacy_version: 'v0.9',
    });

    await page.goto('/ativar-beta?token=abc123');

    const checkbox = page.locator('#activate-beta-consent-checkbox');
    await expect(checkbox).toHaveAttribute('aria-describedby', 'activate-beta-consent-error');

    const submit = page.locator('#activate-beta-consent-submit');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    await expect(submit).toHaveClass(/opacity-60/);
    const pointerEvents = await submit.evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents).not.toBe('none');

    await checkbox.check();
    await expect(submit).not.toHaveClass(/opacity-60/);
  });
});
