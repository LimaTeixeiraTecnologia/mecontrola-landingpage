# Playwright Tests — MeControla

## Pré-requisitos

```bash
pnpm install
npx playwright install --with-deps chromium webkit
```

## Executar (local, com dev server automático)

```bash
# Todas as suites
pnpm test

# Suites individuais
pnpm test:smoke
pnpm test:responsive
pnpm test:a11y
pnpm test:seo
pnpm test:perf
```

## Executar contra produção

```bash
BASE_URL=https://mecontrola.app.br pnpm test
```

## Estrutura

```
tests/playwright/
├── smoke.spec.ts        — 200 OK, seções, âncoras, data-tracks
├── responsive.spec.ts   — overflow, sticky bar, screenshots
├── a11y.spec.ts         — axe-core, h1 único, foco, reduced-motion
├── seo.spec.ts          — head, JSON-LD, sitemap, robots, 404, LGPD consent
├── perf.spec.ts         — LCP, CLS, JS budget
├── evidences/           — screenshots e métricas gerados em cada run
│   ├── responsive/{viewport}/{section}.png
│   └── perf/{metrics,js-budget}.json
└── reports/             — resultados JSON e HTML
```

## Projetos Playwright

| Nome                      | Viewport  | Engine   |
| ------------------------- | --------- | -------- |
| chromium-mobile-375x667   | 375×667   | Chromium |
| chromium-tablet-768x1024  | 768×1024  | Chromium |
| chromium-desktop-1280x800 | 1280×800  | Chromium |
| chromium-fhd-1920x1080    | 1920×1080 | Chromium |
| webkit-1280x800           | 1280×800  | WebKit   |

## Placeholders pendentes (obrigatório antes de campanhas pagas)

- `WHATSAPP_URL` — link de redirecionamento para WhatsApp Business
- `CHECKOUT_URL_MENSAL`, `CHECKOUT_URL_TRIMESTRAL`, `CHECKOUT_URL_ANUAL` — links de pagamento
- `LEGAL_NAME` — razão social legal da empresa (usado no JSON-LD)
- `PUBLIC_GA_ID` — ID do Google Analytics 4 (variável de ambiente Cloudflare)
