# T10 — Validação Playwright MCP + Deploy

**Fase mestre:** 7 + 8 (E7.1..E7.7, E8.1, E8.2)
**Dependências:** T08 (compose completo + CookieConsent + 404), T09 (CI/CD + headers + assets)
**Paralelizável dentro:** ✅ — 5 suites de teste em paralelo após setup; deploy + smoke pós-prod sequenciais
**Bloqueia:** —

## Objetivo

Executar bateria completa de validação Playwright MCP (smoke + responsividade + a11y + SEO/LGPD + performance) como gate **inegociável** antes do deploy, e em seguida promover para produção e revalidar contra o site real.

## Subatividades

### Bloco 1 — Setup

#### 1.1 Install + config Playwright

- DevDeps: `@playwright/test`, `@axe-core/playwright`, opcional `playwright-lighthouse`.
- `npx playwright install --with-deps chromium webkit`.
- `playwright.config.ts` em `tests/playwright/` com:
  - `projects`: `chromium-mobile-375x667`, `chromium-tablet-768x1024`, `chromium-desktop-1280x800`, `chromium-fhd-1920x1080`, `webkit-1280x800` (para validar mask-image WebKit).
  - `baseURL` configurável via env (default `http://localhost:4321`).
- Estrutura: `tests/playwright/{smoke,responsive,a11y,seo,perf}.spec.ts` + `tests/playwright/evidences/` (versionada).
- `tests/playwright/README.md` documenta como rodar.

### Bloco 2 — Suites de teste (paralelas)

#### 2.1 Suite **smoke** (`smoke.spec.ts`)

- Asserts:
  - GET `/` retorna 200.
  - `<title>` não vazio.
  - Presença das **12 seções** do preview (querySelectors por id/data-section ou heading text).
  - Âncoras `#como-funciona`, `#planos`, `#faq` navegam corretamente (scroll com offset `scroll-margin-top`).
  - Todos os CTAs esperados têm `data-track` correto:
    - `cta_header_ver_planos`, `cta_hero_ver_planos`, `cta_hero_como_funciona`, `cta_meet_quero_parceiro`, `plan_monthly_select`, `plan_quarterly_select`, `plan_yearly_select`, `cta_final_ver_planos`, `cta_mobile_ver_planos`.
- DoD: relatório `tests/playwright/reports/smoke.json` + 100% pass.

#### 2.2 Suite **responsividade** (`responsive.spec.ts`)

- Em cada viewport (375, 768, 1280, 1920):
  - Zero overflow horizontal (`document.documentElement.scrollWidth <= clientWidth`).
  - MobileStickyBar visível apenas em `<768px`; oculta em `≥768px`.
  - Hero mockup empilha em `<1024px`; lado-a-lado em `≥1024px`.
  - Pricing grid: 3 colunas em `≥md`, 1 em mobile; Benefits: 3→2→1 conforme breakpoint.
  - Footer/Header acessíveis sem clipping.
- Captura **screenshot por seção × viewport** em `tests/playwright/evidences/responsive/{viewport}/{section}.png`.

#### 2.3 Suite **a11y** (`a11y.spec.ts`)

- `@axe-core/playwright` aplicado a `/` em cada viewport.
- Filtro: falhar em `impact: 'serious' | 'critical'`.
- Verificações extras:
  - Contraste AA respeitado em todos os tokens (foreground sobre background; primary-foreground sobre primary; etc.).
  - Foco visível ao navegar por Tab.
  - Hierarquia de headings (h1 único, sem pular níveis).
  - `prefers-reduced-motion` respeitado (animações suspensas).
- DoD: 0 violations sérias/críticas; relatório axe por viewport.

#### 2.4 Suite **SEO + LGPD** (`seo.spec.ts`)

**SEO técnico:**

- Head:
  - `<title>` não vazio.
  - `<meta name="description">` presente.
  - canonical absoluto correto (`https://mecontrola.app.br/`).
  - OG: title, description, image absoluta, url, type=website, locale=pt_BR.
  - Twitter: card=summary_large_image, title, description, image.
  - JSON-LD parseável (`JSON.parse(textContent)` sem erro); tipos `Organization` + `WebSite` + `WebPage` presentes.
- `/sitemap-index.xml` retorna 200 e referencia `/`.
- `/robots.txt` retorna 200 com `Sitemap:` correto.
- `/404` retorna **status 404** (validar via `response.status()`); CTA "Voltar para o início" presente.

**LGPD (consent gating):**

- `page.on('request')` antes de qualquer interação:
  - Zero requests para `googletagmanager.com` e `google-analytics.com`.
- Click "Aceitar":
  - Com `PUBLIC_GA_ID` configurado: request para `googletagmanager.com/gtag/js?id=` aparece.
  - `localStorage.mecontrola_consent === 'accepted'` após reload.
- Click "Recusar":
  - Nenhum request para googletagmanager nem agora nem após reload.
  - `localStorage.mecontrola_consent === 'declined'`.
- Reload com consent gravado: banner não reaparece.

#### 2.5 Suite **performance** (`perf.spec.ts`)

- Rodar Lighthouse (CLI ou `playwright-lighthouse`) em mobile (`--preset=mobile`) e desktop (`--preset=desktop`).
- Budgets:
  - Performance ≥ 90 mobile / ≥ 95 desktop.
  - LCP ≤ 2.5s mobile.
  - CLS ≤ 0.1.
  - TBT ≤ 200ms.
  - JS shipped ≤ 200 KB (gzip).
- Relatórios `.html` anexados em `tests/playwright/evidences/perf/{mobile,desktop}.html`.

### Bloco 3 — Relatório consolidado (gate de readiness)

#### 3.1 `tests/playwright/REPORT.md`

- Tabela com checklist 8.1–8.7 do planejamento mestre:
  - Fidelidade às referências.
  - Production-readiness.
  - SEO técnico.
  - Acessibilidade.
  - Performance.
  - Verificação Playwright.
  - Operacional & Conformidade.
- Links para evidências (screenshots/relatórios axe/Lighthouse/JSON).
- Cada célula = ✅ ou justificativa de blocker.
- **Sem este relatório aprovado, Bloco 4 (deploy) está BLOQUEADO.**

### Bloco 4 — Deploy primário

#### 4.1 PR → merge → deploy

- Abrir PR com todas as mudanças contra `main`.
- Checks `ci/check`, `ci/lint`, `ci/build` verdes.
- 1 review (self-approve permitido).
- Merge → workflow `deploy.yml` (T09.D) dispara.
- Aguardar conclusão; validar logs sem erros.

#### 4.2 Validação imediata

- `curl -I https://mecontrola.app.br` retorna 200 + todos os headers de T09.C.
- Página renderiza visualmente fielmente em 1280px.

### Bloco 5 — Smoke pós-produção

#### 5.1 Suites Playwright contra produção

- Re-executar suites 2.1–2.5 com `BASE_URL=https://mecontrola.app.br`.
- Mesmos critérios. Salvar evidências em `tests/playwright/evidences-prod/`.

#### 5.2 TLS + headers + sitemap reais

- `testssl.sh https://mecontrola.app.br` (ou `curl -v --resolve`) — validar TLS:
  - Apenas TLS 1.2+ aceito.
  - SSL Labs ≥ A.
- Mozilla Observatory ≥ A.
- `curl https://mecontrola.app.br/sitemap-index.xml` retorna XML válido.
- `curl https://mecontrola.app.br/robots.txt` retorna texto válido com Sitemap correto.
- `curl https://www.mecontrola.app.br` retorna 301 → `https://mecontrola.app.br`.

#### 5.3 Relatório de produção

- `tests/playwright/REPORT-prod.md` consolida resultados.
- Sign-off final = todos os critérios 8.1–8.7 verdes contra produção.

## Critério de Aceite

- `npx playwright test --list` enumera 5 suites.
- Suite smoke: 100% pass.
- Suite responsiva: screenshots gerados; sem overflow.
- Suite a11y: 0 violations sérias/críticas.
- Suite SEO: head completo, sitemap/robots/404 corretos, JSON-LD parseável.
- Suite LGPD: zero requests de tracking antes de Accept; tag carrega após Accept; nunca carrega após Decline.
- Suite perf: budgets respeitados em mobile e desktop.
- `REPORT.md` consolidado e aprovado.
- Deploy em produção bem-sucedido; `https://mecontrola.app.br` renderiza fiel ao preview.
- `REPORT-prod.md` valida mesmas suites contra produção.
- TLS ≥ A; Mozilla Observatory ≥ A.

## Definition of Done

- 5 specs em `tests/playwright/` versionadas.
- Evidências em `tests/playwright/evidences/` e `tests/playwright/evidences-prod/`.
- `REPORT.md` + `REPORT-prod.md` versionados.
- Site live em `https://mecontrola.app.br` com todos os critérios 8.1–8.7 do planejamento mestre verdes.
- Lista de placeholders pendentes (`WHATSAPP_URL`, `CHECKOUT_URL_*`, `LEGAL_NAME`) documentada no `README.md` como follow-up obrigatório antes de campanhas pagas.

## Riscos

- Mockup WhatsApp denso estourar CLS → corrigir cedo via Bloco 2.5 em local antes de promover.
- Lighthouse instável em CI → preferir local controlado (rede throttling 4G) para baseline; CI como sanity.
- WebKit (Safari) com `mask-image` divergente → suite valida em `webkit-1280x800`.
- Cloudflare cache servindo HTML stale → headers `must-revalidate` + purge no primeiro deploy.
- Secrets `PUBLIC_GA_ID` ausente → CookieConsent não injeta script, mas suite LGPD ainda deve passar (zero requests garantido por ausência da variável).

## Paralelização recomendada

- **Bloco 1** (setup): sequencial, 1 agente.
- **Bloco 2**: spawn de **5 subagentes** simultâneos (1 por suite).
  - Agente 1: smoke.
  - Agente 2: responsividade.
  - Agente 3: a11y.
  - Agente 4: SEO + LGPD.
  - Agente 5: performance (Lighthouse).
- **Bloco 3**: 1 agente sequencial agrega relatórios.
- **Bloco 4**: humano + workflow automático.
- **Bloco 5.1**: 5 subagentes paralelos (mesmas suites contra produção).
- **Bloco 5.2**: 1 agente (TLS + curl), pode rodar paralelo a 5.1.
- **Bloco 5.3**: sequencial após 5.1 e 5.2.
- Pré-merge: opcional rodada de `code-reviewer` agent para revisão final.

## Sign-off final

Marcar projeto como **production-ready** somente se:

- ✅ `REPORT.md` (validação local) aprovado.
- ✅ Deploy bem-sucedido.
- ✅ `REPORT-prod.md` aprovado.
- ✅ TLS + Mozilla Observatory ≥ A.
- ✅ Todos os critérios 8.1–8.7 do planejamento mestre verdes contra produção.
- ✅ Placeholders documentados como follow-up.
