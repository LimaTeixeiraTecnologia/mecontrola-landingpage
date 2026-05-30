# Tasks Executáveis — Landing Page MeControla

> **10 tasks** executáveis end-to-end, cada uma com Objetivo, escopo completo de subatividades, Critério de Aceite (CA), Definition of Done (DoD), dependências e mapa de paralelização interna.
> Origem: `docs/plans/execucao-tasks-mecontrola.md` (mapa atômico detalhado) e `docs/plans/planejamento-landing-page-mecontrola.md` (planejamento mestre).
> Nenhum detalhe do plano mestre foi descartado — apenas reagrupado em unidades de execução maiores.

## Ordem de execução

| #                                       | Task                                            | Fase mestre    | Paralelizável dentro da task? | Bloqueia |
| --------------------------------------- | ----------------------------------------------- | -------------- | ----------------------------- | -------- |
| [T01](T01-bootstrap-rastreabilidade.md) | Bootstrap & rastreabilidade                     | Fase 0         | ✅ (gh refs)                  | T02      |
| [T02](T02-infra-base-tooling.md)        | Infra Astro/Tailwind + tooling DX               | Fase 1         | ✅ (config ║ Husky)           | T03, T04 |
| [T03](T03-design-tokens-poppins.md)     | Design tokens + Poppins                         | Fase 2         | ✅ (tokens ║ fonte)           | T05      |
| [T04](T04-conteudo-utils.md)            | Content.ts + utilitários                        | Fase 3         | ✅ (content ║ icons)          | T05      |
| [T05](T05-layout-ui-primitives.md)      | Layout base + UI primitives                     | Fase 4.1 + 4.2 | ❌ (pré-requisito)            | T06, T07 |
| [T06](T06-chrome-hero-mockup.md)        | Header/Footer/MobileBar + Hero + WhatsAppMockup | Fase 4.3 + 4.4 | ✅ (chrome ║ hero)            | T08      |
| [T07](T07-secoes-conteudo.md)           | Seções de conteúdo (Meet → FinalCta)            | Fase 4.5–4.12  | ✅ até 8 agentes paralelos    | T08      |
| [T08](T08-compose-consent-404.md)       | Compose index + CookieConsent + 404             | Fase 4.13–4.15 | parcial                       | T09      |
| [T09](T09-seo-assets-cicd.md)           | SEO + Assets + CI/CD + Cloudflare               | Fase 5 + 6     | ✅ (alto paralelismo)         | T10      |
| [T10](T10-playwright-deploy.md)         | Playwright MCP gate + Deploy                    | Fase 7 + 8     | ✅ (5 suites paralelas)       | —        |

## Convenções

- Tokens via skill `.agents/skills/tailwindcss` — nunca `bg-white`, `text-black`, `bg-zinc-*`, `bg-gray-*`.
- Referências externas (LT e mecontrola-docs) só via `gh` CLI.
- Copy PT-BR **literal** ao preview HTML do mecontrola-docs.
- Conventional Commits após T02 (commitlint ativo).

## Checklist universal antes de avançar de task

1. Todos os CAs internos da task atendidos.
2. DoD cumprido.
3. `pnpm exec astro check` 0 erros.
4. `pnpm build` produz `dist/` válido.
5. `grep -rE "bg-(white|black|zinc-|gray-)" src/` retorna vazio.
6. Commit em Conventional Commits.
7. PR aberto contra `main` com passing checks (após T09 ativa branch protection).
