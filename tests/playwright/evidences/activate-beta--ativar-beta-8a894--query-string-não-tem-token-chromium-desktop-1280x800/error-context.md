# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activate-beta.spec.ts >> /ativar-beta >> exibe erro de token ausente quando query string não tem token
- Location: tests/playwright/activate-beta.spec.ts:6:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#activate-beta-error')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#activate-beta-error')

```

```yaml
- main:
  - img
  - 'heading "404: Not found" [level=1]'
  - text: "Path: /ativar-beta"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BACKEND_PATTERN = '**/api/v1/billing/beta-accesses/activate';
  4   | 
  5   | test.describe('/ativar-beta', () => {
  6   |   test('exibe erro de token ausente quando query string não tem token', async ({ page }) => {
  7   |     await page.goto('/ativar-beta');
  8   | 
  9   |     const error = page.locator('#activate-beta-error');
> 10  |     await expect(error).toBeVisible();
      |                         ^ Error: expect(locator).toBeVisible() failed
  11  |     await expect(error).toContainText('token ausente');
  12  |   });
  13  | 
  14  |   test('ativação automática com sucesso — mostra CTA WhatsApp com o número correto', async ({
  15  |     page,
  16  |   }) => {
  17  |     await page.route(BACKEND_PATTERN, async (route) => {
  18  |       await route.fulfill({
  19  |         status: 200,
  20  |         contentType: 'application/json',
  21  |         body: JSON.stringify({
  22  |           beta_access_id: '00000000-0000-0000-0000-000000000000',
  23  |           status: 'ACTIVE',
  24  |           activated_at: '2026-08-11T10:00:00Z',
  25  |           expires_at: '2026-09-10T10:00:00Z',
  26  |           entitlement_status: 'TRIALING',
  27  |         }),
  28  |       });
  29  |     });
  30  | 
  31  |     await page.goto('/ativar-beta?token=abc123');
  32  | 
  33  |     const waBtn = page.locator('#activate-beta-wa-btn');
  34  |     await expect(waBtn).toBeVisible();
  35  |     await expect(waBtn).toHaveAttribute('href', /^https:\/\/wa\.me\/5511936212870\?text=/);
  36  | 
  37  |     const loading = page.locator('#activate-beta-loading');
  38  |     await expect(loading).toBeHidden();
  39  |   });
  40  | 
  41  |   test('countdown visível e inicia em 3 após ativação com sucesso', async ({ page }) => {
  42  |     await page.route(BACKEND_PATTERN, async (route) => {
  43  |       await route.fulfill({
  44  |         status: 200,
  45  |         contentType: 'application/json',
  46  |         body: JSON.stringify({
  47  |           beta_access_id: '00000000-0000-0000-0000-000000000000',
  48  |           status: 'ACTIVE',
  49  |           activated_at: '2026-08-11T10:00:00Z',
  50  |           expires_at: '2026-09-10T10:00:00Z',
  51  |           entitlement_status: 'TRIALING',
  52  |         }),
  53  |       });
  54  |     });
  55  | 
  56  |     await page.goto('/ativar-beta?token=abc123');
  57  | 
  58  |     const countdown = page.locator('#activate-beta-countdown');
  59  |     await expect(countdown).toBeVisible();
  60  |     const text = await countdown.textContent();
  61  |     expect(['3', '2', '1', '0']).toContain(text?.trim());
  62  |   });
  63  | 
  64  |   test('token já ativado (replay) — exibe #activate-beta-consumed com CTA WhatsApp', async ({
  65  |     page,
  66  |   }) => {
  67  |     await page.route(BACKEND_PATTERN, async (route) => {
  68  |       await route.fulfill({
  69  |         status: 409,
  70  |         contentType: 'application/problem+json',
  71  |         body: JSON.stringify({
  72  |           type: 'about:blank',
  73  |           title: 'Conflict',
  74  |           status: 409,
  75  |           detail: 'concessão não pode ser ativada no estado atual',
  76  |           errors: { code: 'invalid_transition' },
  77  |         }),
  78  |       });
  79  |     });
  80  | 
  81  |     await page.goto('/ativar-beta?token=abc123');
  82  | 
  83  |     const consumed = page.locator('#activate-beta-consumed');
  84  |     await expect(consumed).toBeVisible();
  85  | 
  86  |     const error = page.locator('#activate-beta-error');
  87  |     await expect(error).toBeHidden();
  88  | 
  89  |     const waBtn = page.locator('#activate-beta-consumed-wa-btn');
  90  |     await expect(waBtn).toHaveAttribute('href', /^https:\/\/wa\.me\/5511936212870\?text=/);
  91  |   });
  92  | 
  93  |   test('token inválido — exibe mensagem específica retornada pela API', async ({ page }) => {
  94  |     await page.route(BACKEND_PATTERN, async (route) => {
  95  |       await route.fulfill({
  96  |         status: 400,
  97  |         contentType: 'application/problem+json',
  98  |         body: JSON.stringify({
  99  |           type: 'about:blank',
  100 |           title: 'Bad Request',
  101 |           status: 400,
  102 |           detail: 'activation_token inválido',
  103 |           errors: { code: 'invalid_activation_token' },
  104 |         }),
  105 |       });
  106 |     });
  107 | 
  108 |     await page.goto('/ativar-beta?token=abc123');
  109 | 
  110 |     const error = page.locator('#activate-beta-error');
```