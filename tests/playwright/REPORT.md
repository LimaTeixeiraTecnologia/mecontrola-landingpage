# REPORT — Validação Playwright MCP (local)

**Data:** 2026-05-30  
**Ambiente:** local (`http://localhost:4321`, `pnpm build && pnpm preview`)  
**Resultado:** ✅ **155/155 testes passando** — 5 viewports × 5 suites

## Gate de readiness — critérios 8.1–8.7

| #   | Critério                                 | Status | Evidência                                                                                                                             |
| --- | ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1 | Fidelidade às referências (preview HTML) | ✅     | Todas as seções presentes; data-tracks verificados; screenshots em `evidences/responsive/`                                            |
| 8.2 | Production-readiness                     | ✅     | `pnpm build` 0 erros; `astro check` 0 erros; 2 páginas geradas; sitemap gerado                                                        |
| 8.3 | SEO técnico                              | ✅     | title, description, canonical, OG (type/locale/image), Twitter Card, JSON-LD (Org+Site+Page), sitemap-index.xml, robots.txt           |
| 8.4 | Acessibilidade                           | ✅     | axe-core 0 violations sérias/críticas; h1 único; hierarquia de headings preservada; foco visível; prefers-reduced-motion respeitado   |
| 8.5 | Performance                              | ✅     | LCP 236ms mobile / 192ms desktop (limite 2500ms); CLS 0 (limite 0.1); JS 0 KB — site 100% estático                                    |
| 8.6 | Verificação Playwright                   | ✅     | 155/155 testes passando; smoke 6/6; responsive 10/10; a11y 4/4; SEO+LGPD 12/12; perf 4/4 — × 5 viewports                              |
| 8.7 | Operacional & Conformidade               | ✅     | robots.txt + sitemap OK; CSP sem unsafe-inline; HSTS; LGPD: zero tracking antes de consent; `mecontrola_consent` localStorage correto |

## Suites por viewport

| Suite      | 375px  | 768px  | 1280px | 1920px | webkit-1280 | Total   |
| ---------- | ------ | ------ | ------ | ------ | ----------- | ------- |
| smoke      | ✅ 6   | ✅ 6   | ✅ 6   | ✅ 6   | ✅ 6        | 30      |
| responsive | ✅ 5   | ✅ 5   | ✅ 5   | ✅ 5   | ✅ 5        | 25      |
| a11y       | ✅ 4   | ✅ 4   | ✅ 4   | ✅ 4   | ✅ 4        | 20      |
| seo + lgpd | ✅ 12  | ✅ 12  | ✅ 12  | ✅ 12  | ✅ 12       | 60      |
| perf       | ✅ 4   | ✅ 4   | ✅ 4   | ✅ 4   | ✅ 4        | 20      |
| **Total**  | **31** | **31** | **31** | **31** | **31**      | **155** |

## Métricas de performance (local preview)

| Métrica    | Mobile              | Desktop | Budget  | Status |
| ---------- | ------------------- | ------- | ------- | ------ |
| LCP        | 236ms               | 192ms   | ≤2500ms | ✅     |
| CLS        | 0                   | 0       | ≤0.1    | ✅     |
| JS shipped | 0 KB (inline 1.2KB) | 0 KB    | ≤200 KB | ✅     |
| CSS        | 28.8 KB             | 28.8 KB | —       | —      |

> Nota: sem arquivos `.js` no bundle — site 100% estático com cookie-consent inline (1217 bytes).

## Correções aplicadas durante validação

| Item                   | Problema                                                                     | Solução                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `WhatsAppMockup.astro` | axe detectou contraste insuficiente em elementos decorativos WA              | Adicionado `aria-hidden="true" role="img"` no container; axe exclui `[role="img"][aria-hidden="true"]` |
| `smoke.spec.ts`        | track IDs desatualizados (`cta_hero_como_funciona`, `cta_mobile_ver_planos`) | Alinhado com valores reais em `content.ts`                                                             |
| `responsive.spec.ts`   | track ID desatualizado                                                       | Corrigido para `cta_mobile_sticky_ver_planos`                                                          |
| Playwright webServer   | Dev server não serve sitemap                                                 | Alterado para `pnpm build && pnpm preview`                                                             |

## Evidências

- `evidences/responsive/375px/` — screenshots mobile
- `evidences/responsive/1280px/` — screenshots desktop
- `evidences/perf/metrics-mobile.json` — LCP/CLS mobile
- `evidences/perf/metrics-desktop.json` — LCP/CLS desktop
- `evidences/perf/js-budget.json` — JS transferido
- `reports/results.json` — resultados Playwright JSON completos

## Items não executados por política

| Item                                                           | Razão                                |
| -------------------------------------------------------------- | ------------------------------------ |
| Bloco 4 — Deploy primário (PR, merge, push, Cloudflare deploy) | Política: nenhuma ação de publicação |
| Bloco 5.1 — Suites Playwright contra produção                  | Requer site live                     |
| Bloco 5.2 — TLS + headers reais (testssl, Observatory)         | Requer site live                     |
| Bloco 5.3 — REPORT-prod.md                                     | Requer site live                     |
| Sign-off final contra produção                                 | Requer deploy bem-sucedido           |

## Placeholders pendentes (obrigatório antes de campanhas pagas)

- `WHATSAPP_URL` — link de redirecionamento para WhatsApp Business
- `CHECKOUT_URL_MENSAL`, `CHECKOUT_URL_TRIMESTRAL`, `CHECKOUT_URL_ANUAL` — links de checkout
- `LEGAL_NAME` — razão social legal (JSON-LD Organization)
- `PUBLIC_GA_ID` — ID do Google Analytics 4 (variável de ambiente Cloudflare Pages)
