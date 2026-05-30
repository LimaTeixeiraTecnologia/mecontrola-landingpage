# Execução — Tasks Atômicas da Landing Page MeControla

> **Fonte:** quebra granular de `docs/plans/planejamento-landing-page-mecontrola.md`.
> **Objetivo:** cada task abaixo é executável de forma isolada, com **Critério de Aceite (CA)** verificável e **Definition of Done (DoD)** que precisa estar 100% verde antes de avançar para a próxima task da mesma trilha.
> **Convenção de IDs:** `E<fase>.<task>.<subtask>` — ex: `E4.4.2` = Fase 4, Task 4 (Hero), Subtask 2.
> **Tokens:** todo CSS via tokens da skill `.agents/skills/tailwindcss`. Nunca `bg-white`, `text-black`, `bg-zinc-*`.
> **Rastreabilidade:** `gh` CLI é a única fonte verdadeira para referências externas (LT e mecontrola-docs).

---

## 0. Mapa de paralelização (visão executiva)

### Trilhas independentes (podem rodar em paralelo via subagentes)

```
Fase 0 (bootstrap) ── SEQUENCIAL ──┐
                                   ▼
Fase 1 (infra base) ── PARCIAL ────┐
   E1.1 (config raiz)              │
      ├─► E1.2 (Tailwind v4) ──────┤
      └─► E1.3 (Husky/lint) ───────┤  ◄── PARALELIZÁVEL após E1.1
                                   ▼
Fase 2 + Fase 3 ── PARALELO ───────┐
   E2.1 (tokens) ║ E2.2 (Poppins) ║ E3.1 (content.ts) ║ E3.2 (cn + icons)
                                   ▼
Fase 4.1/4.2 (Layout + UI) ── SEQUENCIAL crítica
                                   ▼
Fase 4.3..4.12 (seções) ── ALTA PARALELIZAÇÃO ──┐
   8 seções podem ser construídas em paralelo:  │
   Header/Footer ║ Hero+Mockup ║ MeetMascot ║   │
   Benefits ║ HowItWorks ║ ForWhom ║            │
   Pricing ║ Faq ║ FinalCta                     │
                                                ▼
Fase 4.13 (index.astro compose) ── SEQUENCIAL
                                   ▼
Fase 5 + Fase 6 ── PARALELO ─────────────────┐
   E5.1 (mascotes) ║ E5.2 (favicon/OG) ║     │
   E5.3 (robots/sitemap) ║ E5.4 (SEO head)   │
   E6.1 (_headers) ║ E6.2 (deploy.yml) ║     │
   E6.5 (ci.yml)                              │
                                              ▼
Fase 4.14 (CookieConsent) + 4.15 (404) — após T6.1 (CSP)
                                              ▼
Fase 7 (Playwright) ── SETUP sequencial, SUITES paralelas
                                              ▼
Fase 8 (deploy) ── SEQUENCIAL
```

### Estratégia de subagentes recomendada

| Cenário                                          | Agente sugerido                          | Quando spawnar                                                |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------- |
| Reconfirmar arquivos via `gh` (Fase 0)           | `Explore` ou `general-purpose`           | E0.1 — múltiplas consultas em paralelo (LT + mecontrola-docs) |
| Modelar tokens + Poppins (Fase 2)                | 2× `general-purpose` em paralelo         | E2.1 ║ E2.2 (independentes)                                   |
| Transcrever content.ts + criar cn/icons (Fase 3) | 2× `general-purpose` em paralelo         | E3.1 ║ E3.2                                                   |
| Construir seções (Fase 4.3–4.12)                 | até **8× `frontend-design`** em paralelo | após E4.1+E4.2 + E5.1 (mascotes)                              |
| Suites Playwright (Fase 7)                       | 5× `general-purpose` em paralelo         | smoke ║ responsive ║ a11y ║ seo ║ perf                        |
| Code review pré-merge                            | `code-reviewer`                          | antes de E8.1                                                 |

**Regra de ouro:** spawnar agentes em paralelo **somente** quando: (a) não há dependência cruzada de arquivos, (b) cada agente tem instruções autossuficientes com paths/CAs/DoD explícitos, (c) o trabalho cabe na janela de contexto do agente.

---

## Fase 0 — Bootstrap & rastreabilidade

### E0.1 — Reconfirmar referências via `gh` CLI

**Origem:** T0.1
**Dependências:** nenhuma
**Paralelizável:** ✅ (LT ║ mecontrola-docs em 2 subagentes Explore)

#### E0.1.1 — `gh auth status` + smoke das credenciais

- **Objetivo:** garantir `gh` autenticado como `JailtonJunior94` com escopo `repo`.
- **CA:** `gh auth status` retorna user logado; `gh api user` retorna `login: JailtonJunior94`.
- **DoD:** comando documentado em `docs/referencias.md` com timestamp.

#### E0.1.2 — Snapshot do tree de `LimaTeixeiraTecnologia/limateixeira-landingpage`

- **Objetivo:** capturar SHAs e estrutura completa do repo LT.
- **CA:** `gh api repos/LimaTeixeiraTecnologia/limateixeira-landingpage/git/trees/main?recursive=1` retorna 200; saída salva.
- **DoD:** `docs/referencias.md` lista SHA da árvore, URL e contagem de arquivos.

#### E0.1.3 — Baixar conteúdo dos arquivos críticos do LT

- **Objetivo:** salvar localmente versões base64-decodificadas dos arquivos listados na seção 2.1 do plano (`package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.toml`, `Makefile`, `public/_headers`, `public/robots.txt`, `src/styles/global.css`, `src/layouts/Layout.astro`, todos `src/components/**/*.astro`, `src/lib/{content.ts,cn.ts}`, `.github/workflows/deploy.yml`, `docs/DEPLOY.md`).
- **CA:** todos os arquivos da seção 2.1 com cópia em `docs/referencias/lt/` (gitignored, só para consulta) e SHA registrado.
- **DoD:** cada arquivo citado nas tasks E1.x–E6.x tem entrada rastreável em `docs/referencias.md`.

#### E0.1.4 — Snapshot e download de `mecontrola-docs/landing-page`

- **Objetivo:** baixar `preview-landing-page-sprint-1.html` + 2 mascotes JPEG.
- **CA:** 3 arquivos presentes em `docs/referencias/mecontrola-docs/landing-page/`; HTML com encoding UTF-8 íntegro (acentuação preservada).
- **DoD:** `file` mostra `HTML document, UTF-8 Unicode text` e `JPEG image data` respectivamente; SHAs registrados.

#### E0.1.5 — Documentar `docs/referencias.md`

- **Objetivo:** consolidar inventário rastreável.
- **CA:** doc lista para cada arquivo: URL `gh api`, SHA, propósito, task que o consome.
- **DoD:** versionado; revisado contra a seção 3 do planejamento.

---

### E0.2 — Inicializar repositório local e vincular remote

**Origem:** T0.2
**Dependências:** E0.1
**Paralelizável:** ❌

#### E0.2.1 — `git init` + `.gitignore` base

- **Objetivo:** inicializar Git no diretório de trabalho com `.gitignore` clonado de LT (Node/Astro/Wrangler/macOS).
- **CA:** `git status` funciona; `.gitignore` contém `node_modules`, `dist`, `.astro`, `.wrangler`, `.DS_Store`, `.env*`.
- **DoD:** primeiro commit `chore: bootstrap repository` na branch `main`.

#### E0.2.2 — Vincular remote `origin`

- **Objetivo:** `git remote add origin git@github.com:LimaTeixeiraTecnologia/mecontrola-landingpage.git`.
- **CA:** `git remote -v` mostra origin; `gh repo view LimaTeixeiraTecnologia/mecontrola-landingpage` confirma acesso.
- **DoD:** `git push -u origin main` bem-sucedido (do commit bootstrap).

---

### E0.3 — Gates de repositório

**Origem:** T0.3
**Dependências:** E0.2; idealmente **após** E1.3 e E6.5 estarem mergeados (para os checks existirem)
**Paralelizável:** ❌ (depende de status checks existirem)

#### E0.3.1 — `.github/CODEOWNERS`

- **Objetivo:** criar arquivo com `* @JailtonJunior94`.
- **CA:** arquivo presente em `.github/CODEOWNERS`.
- **DoD:** commit `chore: add CODEOWNERS`.

#### E0.3.2 — Branch protection em `main`

- **Objetivo:** via `gh api -X PUT repos/.../branches/main/protection`, exigir PR + checks `ci/check`, `ci/lint`, `ci/build` + 1 review + dismiss stale + linear history.
- **CA:** `gh api repos/.../branches/main/protection` retorna regras esperadas (JSON).
- **DoD:** push direto em `main` é rejeitado; teste manual confirma bloqueio.

---

## Fase 1 — Replicar estrutura/infra LT

### E1.1 — Arquivos raiz de configuração

**Origem:** T1.1
**Dependências:** E0.2
**Paralelizável:** ❌ (base de tudo)

#### E1.1.1 — `package.json` com deps espelhadas de LT (Poppins no lugar de Manrope)

- **Objetivo:** criar `package.json` com deps EXATAS de LT, substituindo `@fontsource-variable/manrope` por `@fontsource/poppins`; `packageManager: "pnpm@11.1.2"`; scripts `dev|build|preview|check`.
- **CA:** `pnpm install --frozen-lockfile` passa (após gerar lockfile inicial).
- **DoD:** `pnpm exec astro --version` retorna 5.18.x; `pnpm-lock.yaml` versionado.

#### E1.1.2 — `astro.config.mjs`

- **Objetivo:** `site: 'https://mecontrola.app.br'`, `compressHTML: true`, integration `sitemap()`, `vite.plugins: [tailwindcss()]`.
- **CA:** `pnpm exec astro check` 0 erros; `pnpm build` produz `dist/` válido.
- **DoD:** confirmado que `dist/sitemap-index.xml` é gerado.

#### E1.1.3 — `tsconfig.json`

- **Objetivo:** strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (igual LT).
- **CA:** `pnpm exec astro check` passa com flags estritas.
- **DoD:** versionado.

#### E1.1.4 — `wrangler.toml`

- **Objetivo:** `name="mecontrola-landingpage"`, `compatibility_date="2026-05-30"`, `pages_build_output_dir="dist"`.
- **CA:** `wrangler --version` retorna 4.x; `wrangler pages project list` (com credenciais) reconhece o projeto.
- **DoD:** versionado.

#### E1.1.5 — `Makefile`, `.editorconfig`, `.prettierrc`, `README.md`

- **Objetivo:** clonar Makefile LT (`install/dev/build/preview/check/clean/reset/og-image`); `.editorconfig` (2 espaços, LF, UTF-8); `.prettierrc` igual LT; `README.md` mínimo com `make` targets + placeholders.
- **CA:** `make check` roda `astro check` com sucesso.
- **DoD:** todos versionados; `README.md` cita placeholders pendentes (WhatsApp URL, checkout URLs, legalName).

---

### E1.2 — Configurar Tailwind v4 via `@tailwindcss/vite`

**Origem:** T1.2
**Dependências:** E1.1
**Paralelizável:** com E1.3 ✅

#### E1.2.1 — `src/styles/global.css` esqueleto

- **Objetivo:** criar arquivo com `@import "tailwindcss" source(none);` + `@source "../**/*.{astro,ts}";` + `@theme {}` vazio (será preenchido em E2.1).
- **CA:** página teste com `<div class="bg-background text-foreground">` renderiza sem build error (mesmo que tokens estejam undefined).
- **DoD:** `pnpm build` passa.

#### E1.2.2 — Importar `global.css` no Layout placeholder

- **Objetivo:** criar `src/layouts/Layout.astro` mínimo importando `../styles/global.css` para validar pipeline.
- **CA:** classe utilitária `class="p-4"` resulta em CSS no `dist/_astro/*.css`.
- **DoD:** confirmado via `grep` no CSS gerado.

---

### E1.3 — Tooling DX (Prettier + Husky + lint-staged + commitlint)

**Origem:** T1.3
**Dependências:** E1.1
**Paralelizável:** com E1.2 ✅

#### E1.3.1 — Adicionar devDeps + scripts

- **Objetivo:** adicionar `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` como devDeps; script `prepare: "husky"`.
- **CA:** `pnpm install` instala sem warnings; `node_modules/.bin/husky` existe.
- **DoD:** `package.json` versionado.

#### E1.3.2 — Configurar `commitlint.config.cjs`

- **Objetivo:** `module.exports = { extends: ['@commitlint/config-conventional'] };`.
- **CA:** `echo "wip" | npx commitlint` falha; `echo "feat: x" | npx commitlint` passa.
- **DoD:** versionado.

#### E1.3.3 — Configurar `lint-staged`

- **Objetivo:** em `package.json`, `"lint-staged": { "*.{astro,ts,tsx,js,mjs,cjs,json,md,css}": ["prettier --write"] }`.
- **CA:** stage arquivo malformatado → hook formata → commit passa com versão formatada.
- **DoD:** validação manual.

#### E1.3.4 — Hooks `pre-commit` e `commit-msg`

- **Objetivo:** `husky init`; `pre-commit` roda `pnpm exec lint-staged`; `commit-msg` roda `pnpm exec commitlint --edit "$1"`.
- **CA:** commit `wip` é rejeitado; commit `feat(bootstrap): add husky` passa.
- **DoD:** hooks versionados em `.husky/`.

---

## Fase 2 — Design tokens MeControla

### E2.1 — Modelar tokens semânticos no `@theme`

**Origem:** T2.1
**Dependências:** E1.2
**Paralelizável:** com E2.2 ✅, com E3.x ✅

#### E2.1.1 — Tokens de cor (background/foreground/surface/border)

- **Objetivo:** declarar em `@theme`:
  ```
  --color-background: #0D0D0D;
  --color-foreground: #FFFFFF;
  --color-surface: #1F1F1F;
  --color-card: #1F1F1F;
  --color-card-foreground: #FFFFFF;
  --color-muted-foreground: #B8B8B8;
  --color-border: rgba(255,255,255,0.08);
  ```
- **CA:** `bg-background`, `text-foreground`, `bg-card`, `border-border` resolvem para os valores corretos no CSS gerado.
- **DoD:** snapshot do CSS confirmado.

#### E2.1.2 — Tokens de ação (primary/accent)

- **Objetivo:**
  ```
  --color-primary: #C6FF00;          /* neon */
  --color-primary-foreground: #0D0D0D;
  --color-accent: #7861FF;           /* roxo */
  --color-accent-foreground: #FFFFFF;
  --color-ring: #C6FF00;
  ```
- **CA:** `bg-primary text-primary-foreground` aplica neon com texto preto.
- **DoD:** comentário no CSS documentando mapeamento `primary=neon`, `accent=roxo`.

#### E2.1.3 — Tokens tipográficos

- **Objetivo:** `--font-sans: "Poppins", system-ui, sans-serif;`; `--tracking-tight: -0.02em;` para headings; `--tracking-wide: 0.08em;` para tags.
- **CA:** `font-sans` no body resulta em `Poppins`.
- **DoD:** validado em devtools após E2.2.

#### E2.1.4 — Tokens de sombra e gradiente

- **Objetivo:** `--shadow-glow-primary: 0 0 24px rgb(198 255 0 / 0.35);`, `--shadow-glow-accent: 0 0 24px rgb(120 97 255 / 0.35);`, `--gradient-final-cta: linear-gradient(160deg, #7861FF 0%, #4b39c0 100%);` como CSS custom property.
- **CA:** `shadow-glow-primary` aplicável; `bg-[image:var(--gradient-final-cta)]` renderiza.
- **DoD:** documentado no CSS com comentário de uso.

#### E2.1.5 — Layer base (scroll + reduced motion + scroll-margin-top)

- **Objetivo:** `@layer base { html { scroll-behavior: smooth; } [id] { scroll-margin-top: 80px; } @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important; transition: none !important; } } }`.
- **CA:** clicar âncora `#planos` faz scroll suave com offset.
- **DoD:** snapshot Playwright valida posicionamento.

---

### E2.2 — Poppins self-hosted via `@fontsource/poppins`

**Origem:** T2.2
**Dependências:** E1.1
**Paralelizável:** com E2.1 ✅

#### E2.2.1 — Adicionar dependência

- **Objetivo:** `pnpm add @fontsource/poppins`.
- **CA:** `node_modules/@fontsource/poppins/500.css` existe.
- **DoD:** lockfile atualizado.

#### E2.2.2 — Importar pesos 500/600/700/800 em `global.css`

- **Objetivo:** topo do `global.css`, antes do `@import "tailwindcss"`:
  ```css
  @import '@fontsource/poppins/500.css';
  @import '@fontsource/poppins/600.css';
  @import '@fontsource/poppins/700.css';
  @import '@fontsource/poppins/800.css';
  ```
- **CA:** dist gera `*.woff2` em `dist/_astro/`.
- **DoD:** zero requests externos a `fonts.googleapis.com` ou `gstatic.com` em build.

---

## Fase 3 — Conteúdo + utilitários

### E3.1 — Transcrever copy para `src/lib/content.ts`

**Origem:** T3.1
**Dependências:** E0.1 (preview HTML baixado)
**Paralelizável:** com E2.x e E3.2 ✅

#### E3.1.1 — Tipos TypeScript

- **Objetivo:** declarar interfaces `NavItem`, `HeroContent`, `BulletItem`, `BenefitCard`, `HowItWorksStep`, `Plan` (id, name, priceLabel, periodLabel, equiv, savings, ctaLabel, ctaHref, featured), `FaqItem`, `MeetMascotContent`, `MascotStripGoalContent`, `FinalCtaContent`, `FooterContent`, `MobileStickyBarContent`, `IconName` (literal union de ícones).
- **CA:** `astro check` 0 erros nas interfaces.
- **DoD:** versionado.

#### E3.1.2 — Constantes URL (placeholders + oficiais)

- **Objetivo:** exportar:
  ```ts
  export const WHATSAPP_URL = '#'; // TODO: substituir antes de promoção pública
  export const CHECKOUT_URL_MENSAL = '#'; // TODO
  export const CHECKOUT_URL_TRIMESTRAL = '#'; // TODO
  export const CHECKOUT_URL_ANUAL = '#'; // TODO
  export const CONTACT_EMAIL = 'contato@limateixeira.com.br';
  export const INSTAGRAM_URL = 'https://www.instagram.com/limateixeiraconsulting/';
  export const CNPJ = '52.162.759/0001-74';
  export const LEGAL_NAME = ''; // TODO: razão social oficial
  ```
- **CA:** imports funcionam; `astro check` 0 erros.
- **DoD:** `grep -n "TODO" src/lib/content.ts` lista todos pendentes.

#### E3.1.3 — Objetos: `nav`, `hero`

- **Objetivo:** transcrever literal do HTML: tag "Menos caos. Mais conquistas.", h1 com `highlight` "direto no WhatsApp.", sub, 3 bullets, 2 CTAs (cta_hero_ver_planos, cta_hero_como_funciona).
- **CA:** strings idênticas ao preview (incluindo emojis, acentos, pontuação); validado por `diff` visual com HTML.
- **DoD:** `data-track` IDs documentados como constantes.

#### E3.1.4 — Objetos: `meetMascot`, `benefits[]`, `howItWorks`

- **Objetivo:** transcrever seções 3, 4, 5 do preview.
- **CA:** mesma fidelidade textual; 3 benefits com emojis 👀/📦/📈; 3 steps numerados.
- **DoD:** UTF-8 íntegro (validar `file src/lib/content.ts`).

#### E3.1.5 — Objetos: `forWhom`, `plans[]`, `faq[]`

- **Objetivo:** transcrever seções 6, 7, 8 do preview.
- **CA:** plans com valores EXATOS (R$ 29,90 / R$ 80,73 / R$ 297,80 e respectivos `equiv` e `savings`); Anual com `featured: true`; 4 perguntas FAQ literais.
- **DoD:** snapshot textual revisado.

#### E3.1.6 — Objetos: `mascotStripGoal`, `finalCta`, `footer`, `mobileSticky`

- **Objetivo:** seções 9, 10, 11, 12.
- **CA:** copy idêntica; footer minimal (logo + tagline + "Pré-visualização de design" substituído por copyright `© 2026 MeControla`).
- **DoD:** revisado contra preview.

---

### E3.2 — Util `cn()` e Icon registry

**Origem:** T3.2
**Dependências:** E1.1
**Paralelizável:** com E2.x, E3.1 ✅

#### E3.2.1 — `src/lib/cn.ts`

- **Objetivo:** clonar do LT (geralmente `clsx` + `tailwind-merge` ou implementação custom).
- **CA:** `cn('p-2', undefined, ['p-4'])` retorna `'p-4'` (merge correto).
- **DoD:** import funciona nos componentes.

#### E3.2.2 — `src/components/ui/Icon.astro` com registry

- **Objetivo:** componente recebe prop `name: IconName`; switch interno retorna SVG inline. Lista mínima: `check`, `whatsapp`, `eye`, `package`, `trending`, `heart`, `plus`, `close`, `arrow-right`, `instagram`, `mascot-face`.
- **CA:** `<Icon name="heart" class="size-5 text-accent" />` renderiza SVG roxo de 20px.
- **DoD:** registry tipado (sem `any`); fallback para nome inválido lança erro em dev.

---

## Fase 4 — Componentes

### E4.1 — Layout base `src/layouts/Layout.astro`

**Origem:** T4.1
**Dependências:** E2.1, E2.2, E3.1
**Paralelizável:** ❌ (pré-requisito de seções)

#### E4.1.1 — Head essencial

- **Objetivo:** `<head>` com charset, viewport, `<title>` (slot via prop), `<meta name="description">`, canonical absoluto.
- **CA:** Playwright valida presença de tags com props injetadas.
- **DoD:** props tipadas (`title`, `description`, `canonical?`, `ogImage?`).

#### E4.1.2 — Open Graph + Twitter Card

- **Objetivo:** OG (title, description, image, url, type=website, locale=pt_BR); Twitter card=summary_large_image.
- **CA:** Rich Results Test / Cards Validator aceita.
- **DoD:** ogImage absoluta (`https://mecontrola.app.br/og-image.png`).

#### E4.1.3 — Slot principal + Header/Footer

- **Objetivo:** estrutura `<body class="bg-background text-foreground font-sans antialiased">` + Header (E4.3) + `<slot />` + Footer (E4.3) + CookieConsent (E4.14) + MobileStickyBar (E4.3).
- **CA:** página `/` renderiza skeleton.
- **DoD:** sem erros TS.

> JSON-LD e GA4 ficam em **E5.4** (head SEO completo).

---

### E4.2 — UI primitives (Button, Card, SectionHeader, Tag)

**Origem:** T4.2
**Dependências:** E2.1, E3.2
**Paralelizável:** ❌ (pré-requisito de seções) — mas pode ser **1 agente especializado em primitives**

#### E4.2.1 — `Button.astro`

- **Objetivo:** variantes `primary` (neon → preto), `accent` (roxo → branco), `ghost` (outline border-foreground/20); `size` sm/md/lg; suporta `href` (renderiza `<a>`) ou `type="button"`; prop `data-track`; focus-ring visível; respeita reduced-motion.
- **CA:** `<Button variant="primary" href="#planos" data-track="cta_test">Ver planos</Button>` renderiza `<a>` com classes corretas.
- **DoD:** snapshot por variante; a11y axe-core 0 violations.

#### E4.2.2 — `Card.astro`

- **Objetivo:** wrapper `bg-card border border-border rounded-2xl p-6 md:p-8`; suporta prop `featured` (borda neon + glow).
- **CA:** featured aplica `border-primary shadow-glow-primary`.
- **DoD:** validado via Playwright snapshot.

#### E4.2.3 — `SectionHeader.astro`

- **Objetivo:** props `tag?`, `title`, `subtitle?`; tag em `text-primary uppercase tracking-wide text-xs`; título Poppins 700.
- **CA:** renderiza tag/título/subtítulo conforme preview.
- **DoD:** sem texto em imagem.

#### E4.2.4 — `Tag.astro`

- **Objetivo:** pill `inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-wide`.
- **CA:** usado em Hero/MeetMascot/MascotStripGoal.
- **DoD:** reusável.

---

### E4.3 — Chrome global (Header / Footer / MobileStickyBar)

**Origem:** T4.3
**Dependências:** E4.2
**Paralelizável:** ✅ (1 agente para os 3, ou 3 agentes — recomendado **1 agente** por coesão visual)

#### E4.3.1 — `Header.astro`

- **Objetivo:** `sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border`; logo `Me`+`Controla` (neon na segunda metade); CTA "Ver planos" → `#planos` com `data-track="cta_header_ver_planos"`.
- **CA:** Playwright confirma sticky behavior + backdrop-blur.
- **DoD:** acessível por teclado (Tab navega).

#### E4.3.2 — `Footer.astro`

- **Objetivo:** minimal — Logo + tagline ("Menos caos. Mais conquistas.") + linha legal (`© 2026 MeControla · CNPJ 52.162.759/0001-74 · ${CONTACT_EMAIL}` + Instagram icon link).
- **CA:** todos os dados oficiais do `content.ts` aparecem.
- **DoD:** sem links legais (LGPD/privacidade fora do escopo v1).

#### E4.3.3 — `MobileStickyBar.astro`

- **Objetivo:** `fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border p-4 flex items-center justify-between gap-3`; copy "Comece do jeito mais simples" + CTA "Ver planos".
- **CA:** Playwright valida visibilidade <768px e ocultação ≥768px.
- **DoD:** sem overflow horizontal; respeita safe-area-inset-bottom.

---

### E4.4 — Hero + WhatsAppMockup

**Origem:** T4.4
**Dependências:** E4.2, E3.2
**Paralelizável:** ✅ (agente dedicado — task mais complexa) — **frontend-design**

#### E4.4.1 — `Hero.astro` — coluna esquerda

- **Objetivo:** Tag + h1 (com highlight neon na frase final via `<span class="text-primary">direto no WhatsApp.</span>`) + sub + 3 bullets com check neon + 2 CTAs (primary "Ver planos" + ghost "Entender como funciona").
- **CA:** texto fiel ao preview; CTAs com `data-track`.
- **DoD:** acessível (heading hierarchy h1→h2 nas seções seguintes).

#### E4.4.2 — `WhatsAppMockup.astro` — frame iOS + header WA

- **Objetivo:** componente standalone. Status bar iOS topo (9:41 + ícones de sinal/wifi/bateria como SVG); abaixo, header WA (avatar mascote + nome "MeControla" + status "online").
- **CA:** renderiza idêntico ao preview em 1280×800.
- **DoD:** width/height explícitos em SVGs (zero CLS).

#### E4.4.3 — `WhatsAppMockup.astro` — balões de conversa

- **Objetivo:** sequência: incoming "80 no cinema 🎬", outgoing "Pronto, lancei 😉", incoming recibo estilizado (categoria/data/valor), indicador "digitando" (3 dots animados).
- **CA:** cores fiéis à paleta WhatsApp (`#1F2C33`, `#0B141A`, `#005C4B`); typing dots animam (CSS) e param sob `prefers-reduced-motion`.
- **DoD:** snapshot validado.

#### E4.4.4 — `WhatsAppMockup.astro` — input bar

- **Objetivo:** input bar bottom com placeholder "Mensagem" + ícone de microfone neon.
- **CA:** elementos posicionados conforme preview.
- **DoD:** integrado ao Hero em layout grid 2 colunas (`md:grid-cols-2`).

#### E4.4.5 — Integração responsiva Hero

- **Objetivo:** layout empilha em `<1024px` (texto em cima, mockup embaixo).
- **CA:** Playwright em 375/768/1280 mostra layout esperado.
- **DoD:** sem overflow.

---

### E4.5 — `MeetMascot.astro`

**Origem:** T4.5
**Dependências:** E4.2, E5.1 (mascote otimizada)
**Paralelizável:** ✅ (agente dedicado)

- **Objetivo:** seção 2 colunas (imagem esquerda com `mask-image: radial-gradient(...)`, conteúdo direita: Tag + h2 + body + 3 bullets coração 💚 + CTA "Quero esse parceiro" com `data-track="cta_meet_quero_parceiro"`); prop `reverse` para reuso em E4.11.
- **CA:** máscara renderiza no Chromium e Safari (Playwright em ambos).
- **DoD:** `<Image>` Astro com `loading="lazy"`, `decoding="async"`, srcset AVIF/WebP/JPEG.

---

### E4.6 — `Benefits.astro`

**Origem:** T4.6
**Dependências:** E4.2
**Paralelizável:** ✅ (agente dedicado, simples)

- **Objetivo:** h2 + grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` com 3 Cards (emoji 👀/📦/📈 + h3 + p).
- **CA:** mobile-first; sem overflow em 375px.
- **DoD:** axe-core 0 violations.

---

### E4.7 — `HowItWorks.astro`

**Origem:** T4.7
**Dependências:** E4.2
**Paralelizável:** ✅

- **Objetivo:** id `como-funciona`; h2 + 3 passos numerados (badge circular neon) + closing paragraph.
- **CA:** âncora `#como-funciona` funciona com `scroll-margin-top` configurado.
- **DoD:** Playwright valida deep-link.

---

### E4.8 — `ForWhom.astro`

**Origem:** T4.8
**Dependências:** E4.2
**Paralelizável:** ✅

- **Objetivo:** h2 + lista 3 itens bullet coração roxo (`<Icon name="heart" class="text-accent" />`).
- **CA:** copy fiel; alinhamento limpo.
- **DoD:** mobile responsivo.

---

### E4.9 — `Pricing.astro`

**Origem:** T4.9
**Dependências:** E4.2, E3.1
**Paralelizável:** ✅ (agente dedicado — média complexidade)

#### E4.9.1 — Estrutura grid + cards básicos

- **Objetivo:** id `planos`; h2 + sub; grid 3 colunas (`md:grid-cols-3 gap-6`); 3 Cards (Mensal/Trimestral/Anual) com nome, valor, periodicidade, CTA.
- **CA:** valores idênticos ao preview.
- **DoD:** sem hardcoded — tudo de `plans[]` em content.ts.

#### E4.9.2 — Card featured (Anual) — badge + glow

- **Objetivo:** badge "Melhor custo-benefício" absoluto acima do card; borda neon + glow; `data-track="plan_yearly_select"`.
- **CA:** apenas o Anual recebe destaque.
- **DoD:** badge legível em todos os viewports.

#### E4.9.3 — Badges de economia + nota PIX/cartão/cupom

- **Objetivo:** Trimestral mostra "economia R$ 8,97"; Anual "economia R$ 61,00"; nota final "PIX, cartão ou cupom".
- **CA:** copy literal.
- **DoD:** acessível para screen readers.

---

### E4.10 — `Faq.astro`

**Origem:** T4.10
**Dependências:** E4.2
**Paralelizável:** ✅

- **Objetivo:** id `faq`; h2 + 4 `<details><summary>` (semântica nativa) com chevron rotacionando via CSS; respeita reduced-motion.
- **CA:** axe-core 0 violations; teclado abre/fecha.
- **DoD:** primeira pergunta `open` por default (opcional).

---

### E4.11 — `MascotStripGoal.astro`

**Origem:** T4.11
**Dependências:** E4.5
**Paralelizável:** ✅ (trivial — reuso)

- **Objetivo:** reusa `MeetMascot` (ou componente irmão) com `reverse={true}` + imagem `brand-mascote-meta-concluida` + copy seção 9 do preview.
- **CA:** layout espelhado (imagem direita).
- **DoD:** sem duplicação de código.

---

### E4.12 — `FinalCta.astro`

**Origem:** T4.12
**Dependências:** E4.2
**Paralelizável:** ✅

- **Objetivo:** `<section>` full-width com `background: var(--gradient-final-cta)`; h2 + body + CTA primary "Ver planos e começar" → `#planos` com `data-track="cta_final_ver_planos"`.
- **CA:** gradiente 160° fiel ao preview.
- **DoD:** contraste AA validado em axe-core.

---

### E4.13 — Página `src/pages/index.astro`

**Origem:** T4.13
**Dependências:** **TODAS** E4.3–E4.12
**Paralelizável:** ❌

- **Objetivo:** importar Layout + montar seções na ordem 1–12: Header (Layout), Hero, MeetMascot, Benefits, HowItWorks, ForWhom, Pricing, Faq, MascotStripGoal, FinalCta, Footer (Layout), MobileStickyBar (Layout); passar title/description/canonical para Layout.
- **CA:** Playwright em 4 viewports mostra fidelidade visual ao preview.
- **DoD:** zero console errors / warnings; `astro check` passa.

---

### E4.14 — `CookieConsent.astro` + gating GA4

**Origem:** T4.14
**Dependências:** E4.1, E6.1 (CSP)
**Paralelizável:** ✅ (agente dedicado, lógica isolada)

#### E4.14.1 — Banner UI

- **Objetivo:** `fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border p-4` com copy LGPD + botões "Aceitar" / "Recusar".
- **CA:** aparece apenas se `localStorage.mecontrola_consent` ausente.
- **DoD:** dismissable sem layout shift no resto da página.

#### E4.14.2 — Lógica de consent (script externo)

- **Objetivo:** script TypeScript em arquivo separado (não inline, para CSP rígido) que: lê localStorage; em Accept grava `'accepted'`, dispara `consent-granted`, injeta GA4 se `PUBLIC_GA_ID`; em Decline grava `'declined'`, nada carrega.
- **CA:** Playwright (E7.5) confirma zero requests a `googletagmanager.com` antes de Accept.
- **DoD:** persistência entre reloads.

#### E4.14.3 — Injeção dinâmica GA4

- **Objetivo:** ao consent granted, criar `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` + init gtag.
- **CA:** após Accept, request a gtag aparece; após Decline (e reload), nunca aparece.
- **DoD:** sem violar CSP (script-src libera googletagmanager).

---

### E4.15 — `src/pages/404.astro`

**Origem:** T4.15
**Dependências:** E4.1, E5.1
**Paralelizável:** ✅

- **Objetivo:** Layout + h1 "Esta página decidiu sumir." + body "Mas relaxa: sua organização financeira começa por aqui." + mascote (reuso `brand-mascote-resumo-mes`) + CTA "Voltar para o início" → `/`.
- **CA:** CF Pages serve `dist/404.html`; Playwright valida 404 status code via headers.
- **DoD:** mesma identidade visual.

---

## Fase 5 — SEO + Assets

### E5.1 — Otimizar mascotes via Astro `<Image>`

**Origem:** T5.1
**Dependências:** E0.1.4 (mascotes baixadas)
**Paralelizável:** ✅

#### E5.1.1 — Mover JPEGs para `src/assets/mascotes/`

- **Objetivo:** salvar `resumo-mes.jpeg` e `meta-concluida.jpeg` em `src/assets/mascotes/`.
- **CA:** arquivos versionados (não em `public/` para passar pelo pipeline sharp).
- **DoD:** paths consumíveis via `import` em `.astro`.

#### E5.1.2 — Componente `<Image>` em MeetMascot/MascotStripGoal/404

- **Objetivo:** `import { Image } from 'astro:assets'`; `<Image src={mascote} widths={[480, 768, 1200]} formats={['avif', 'webp', 'jpg']} loading="lazy" decoding="async" alt="...">`.
- **CA:** `dist/` contém variantes AVIF/WebP/JPEG; HTML renderiza `<picture>` com srcset.
- **DoD:** LCP da seção mascote ≤ 2.5s mobile (validado em E7.6).

---

### E5.2 — Favicon + OG image

**Origem:** T5.2
**Dependências:** E3.2 (Icon registry com `mascot-face`)
**Paralelizável:** ✅

#### E5.2.1 — `public/favicon.svg`

- **Objetivo:** SVG derivado do símbolo mascote, simplificado para 32×32 viewBox.
- **CA:** browser exibe favicon na aba.
- **DoD:** PNG fallback opcional para Safari legacy.

#### E5.2.2 — `og-image.svg` + Makefile target

- **Objetivo:** SVG 1200×630 com logo + headline "Sua vida financeira organizada, direto no WhatsApp." + paleta MeControla; Makefile target `og-image` converte via `rsvg-convert` para PNG.
- **CA:** `make og-image` gera `public/og-image.png`.
- **DoD:** Facebook Sharing Debugger aceita.

---

### E5.3 — `robots.txt` + sitemap

**Origem:** T5.3
**Dependências:** E1.1
**Paralelizável:** ✅

#### E5.3.1 — `public/robots.txt`

- **Objetivo:** `User-agent: *\nAllow: /\nSitemap: https://mecontrola.app.br/sitemap-index.xml\n`.
- **CA:** arquivo servido em `/robots.txt`.
- **DoD:** versionado.

#### E5.3.2 — Sitemap via `@astrojs/sitemap`

- **Objetivo:** já integrado em E1.1.2; validar configuração.
- **CA:** `dist/sitemap-index.xml` lista `/`.
- **DoD:** Google Search Console aceita URL.

---

### E5.4 — Layout SEO completo (JSON-LD)

**Origem:** T5.4
**Dependências:** E4.1, E3.1, E4.14
**Paralelizável:** ✅ (após E4.1)

#### E5.4.1 — JSON-LD Organization

- **Objetivo:** `<script type="application/ld+json">` com Organization (name, legalName TODO, url, logo, email, taxID CNPJ, sameAs [Instagram]).
- **CA:** Rich Results Test sem erros.
- **DoD:** dados oficiais do `content.ts`.

#### E5.4.2 — JSON-LD WebSite + WebPage

- **Objetivo:** WebSite com `potentialAction` search opcional; WebPage por rota.
- **CA:** schema.org validator aceita.
- **DoD:** sem duplicação entre rotas.

#### E5.4.3 — Preconnect / dns-prefetch

- **Objetivo:** `<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>` (somente injetado após consent — pode ficar fora do Layout estático).
- **CA:** sem preconnect a domínios não usados antes de consent.
- **DoD:** validado em E7.5.

---

## Fase 6 — CI/CD

### E6.1 — `public/_headers`

**Origem:** T6.1
**Dependências:** E1.1
**Paralelizável:** ✅

- **Objetivo:** replicar headers LT:
  - CSP: `default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; font-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`
  - HSTS: `max-age=63072000; includeSubDomains; preload`
  - X-Frame-Options: `DENY`; X-Content-Type-Options: `nosniff`; Referrer-Policy: `strict-origin-when-cross-origin`; Permissions-Policy: `camera=(), microphone=(), geolocation=()`
  - Cache: `/_astro/* Cache-Control: public, max-age=31536000, immutable`
  - HTML: `Cache-Control: public, max-age=0, must-revalidate`
- **CA:** Mozilla Observatory ≥ A; sem CSP violations no console.
- **DoD:** versionado; validado em E7.5 e E8.2.

---

### E6.2 — `.github/workflows/deploy.yml`

**Origem:** T6.2
**Dependências:** E1.1, E6.1
**Paralelizável:** com E6.5 ✅

- **Objetivo:** workflow espelhado de LT — trigger push `main` + workflow_dispatch; concurrency cancel-in-progress; checkout; setup pnpm via packageManager; Node 24.15.0 cache pnpm; install --frozen-lockfile; `./node_modules/.bin/astro build` com env `PUBLIC_GA_ID`; `npm i -g wrangler@4`; project create idempotente; `wrangler pages deploy dist --project-name=mecontrola-landingpage --branch=main`.
- **CA:** dry-run em branch teste via workflow_dispatch conclui sem erro.
- **DoD:** secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` configurados via `gh secret set`.

---

### E6.3 — Cloudflare Pages (projeto + domínio + SSL)

**Origem:** T6.3
**Dependências:** E6.2
**Paralelizável:** ❌

- **Objetivo:** confirmar/criar projeto `mecontrola-landingpage`; custom domain `mecontrola.app.br` + `www` 301 → apex; SSL Full strict; Always HTTPS; Auto Rewrites.
- **CA:** `curl -I https://mecontrola.app.br` retorna 200 + todos os headers de E6.1.
- **DoD:** `curl -I http://www.mecontrola.app.br` retorna 301 para apex HTTPS.

---

### E6.4 — `docs/DEPLOY.md`

**Origem:** T6.4
**Dependências:** E6.2, E6.3
**Paralelizável:** ✅

- **Objetivo:** doc operacional: arquitetura, setup tokens CF, secrets, runbook (passos para promover), troubleshooting (erros comuns wrangler/pnpm).
- **CA:** novo dev consegue fazer deploy seguindo apenas o doc.
- **DoD:** revisado por checklist humano.

---

### E6.5 — `.github/workflows/ci.yml` (PR gate)

**Origem:** T6.5
**Dependências:** E1.3, E6.2, E0.3
**Paralelizável:** com E6.2 ✅

#### E6.5.1 — Job `ci/check`

- **Objetivo:** `pnpm exec astro check`.
- **CA:** falha se houver erro TS/Astro.
- **DoD:** job nomeado exatamente `ci/check`.

#### E6.5.2 — Job `ci/lint`

- **Objetivo:** `pnpm exec prettier --check .`.
- **CA:** falha se houver arquivo não formatado.
- **DoD:** job nomeado `ci/lint`.

#### E6.5.3 — Job `ci/build`

- **Objetivo:** `pnpm build` + upload `dist/` como artifact.
- **CA:** artifact disponível por 7 dias.
- **DoD:** job nomeado `ci/build`.

---

## Fase 7 — Validação Playwright MCP (gate de produção)

### E7.1 — Setup Playwright

**Origem:** T7.1
**Dependências:** E6.2
**Paralelizável:** ❌ (pré-requisito)

#### E7.1.1 — Install + config

- **Objetivo:** `pnpm add -D @playwright/test @axe-core/playwright`; `npx playwright install --with-deps chromium webkit`; `playwright.config.ts` com viewports 375×667, 768×1024, 1280×800, 1920×1080.
- **CA:** `npx playwright test --list` enumera suites.
- **DoD:** configuração versionada em `tests/playwright/`.

#### E7.1.2 — Pasta de evidências

- **Objetivo:** criar `tests/playwright/evidences/` (versionada) e `.gitignore` para outputs efêmeros.
- **CA:** estrutura pronta para receber screenshots.
- **DoD:** documentado em `tests/playwright/README.md`.

---

### E7.2–E7.6 — Suites de teste

**Paralelizável:** ✅ (após E7.1, **5 subagentes em paralelo**)

| ID   | Origem | Foco                       | CA                                                                                                                                                      | DoD                                                        |
| ---- | ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| E7.2 | T7.2   | **Smoke**                  | status 200, 12 seções presentes, âncoras navegam, CTAs com `data-track`                                                                                 | 100% pass; relatório `tests/playwright/reports/smoke.json` |
| E7.3 | T7.3   | **Responsividade**         | sem overflow horizontal nos 4 viewports; MobileStickyBar só <768; Hero empilha <1024; grids degradam                                                    | screenshot por seção × viewport em `evidences/responsive/` |
| E7.4 | T7.4   | **a11y axe-core**          | 0 violations sérias/críticas nos 4 viewports; contraste AA                                                                                              | relatório axe por viewport                                 |
| E7.5 | T7.5   | **SEO + LGPD**             | head completo, sitemap 200, robots 200, JSON-LD parseável, 404 retorna 404; **zero requests googletagmanager antes de Accept**; persistência de consent | relatório SEO + log de network                             |
| E7.6 | T7.6   | **Performance Lighthouse** | Perf ≥ 90 mobile / ≥ 95 desktop; LCP ≤ 2.5s; CLS ≤ 0.1; TBT ≤ 200ms; JS ≤ 200KB                                                                         | `.html` reports anexados                                   |

---

### E7.7 — Relatório consolidado + gate

**Origem:** T7.7
**Dependências:** E7.2..E7.6
**Paralelizável:** ❌

- **Objetivo:** `tests/playwright/REPORT.md` com links para evidências de cada suite; tabela checklist 8.1–8.7 do planejamento.
- **CA:** todas as células = ✅ ou justificativa de blocker.
- **DoD:** **sem este relatório aprovado, E8.x bloqueado.**

---

## Fase 8 — Deploy

### E8.1 — Deploy primário

**Origem:** T8.1
**Dependências:** E7.7 aprovado
**Paralelizável:** ❌

- **Objetivo:** PR para `main` (passando todos os checks E6.5 + branch protection E0.3) → merge → workflow E6.2 dispara → site live.
- **CA:** workflow GitHub Actions verde.
- **DoD:** `https://mecontrola.app.br` retorna 200 e renderiza home fielmente.

### E8.2 — Smoke pós-produção

**Origem:** T8.2
**Dependências:** E8.1
**Paralelizável:** ❌

#### E8.2.1 — Rodar suites Playwright contra produção

- **Objetivo:** executar E7.2..E7.6 com `BASE_URL=https://mecontrola.app.br`.
- **CA:** mesmos critérios das suites locais.
- **DoD:** novo `REPORT-prod.md`.

#### E8.2.2 — TLS + headers + sitemap em produção

- **Objetivo:** `testssl.sh https://mecontrola.app.br` (ou `curl -v`); validar headers de E6.1; `curl https://mecontrola.app.br/sitemap-index.xml` retorna XML.
- **CA:** SSL Labs ≥ A; Mozilla Observatory ≥ A.
- **DoD:** logs anexados ao `REPORT-prod.md`.

---

## Anexo A — Prompts para subagentes (template)

### A.1 Template `frontend-design` para seções (E4.4–E4.12)

```
Você está implementando a seção <NOME> da landing page MeControla.

Contexto:
- Stack: Astro 5 + Tailwind v4 (@tailwindcss/vite). Tokens em src/styles/global.css.
- Conteúdo: importe de `src/lib/content.ts` (objeto `<NOME>`). NÃO invente copy.
- Tokens disponíveis: bg-background, bg-surface, bg-card, text-foreground, text-muted-foreground, bg-primary (neon #C6FF00), bg-accent (roxo #7861FF), border-border, shadow-glow-primary, shadow-glow-accent, font-sans (Poppins). Nunca bg-white/text-black/bg-zinc-*.
- Referência visual: docs/referencias/mecontrola-docs/landing-page/preview-landing-page-sprint-1.html, seção <N>.
- UI primitives prontos: Button, Card, SectionHeader, Tag, Icon (src/components/ui/).

Arquivo a criar: src/components/sections/<NOME>.astro

Critério de Aceite:
- <copiar CA da task E4.x>
- Renderiza sem erros em pnpm dev.
- pnpm exec astro check 0 erros.

Definition of Done:
- <copiar DoD da task E4.x>
- Testado nos 4 viewports (375/768/1280/1920) sem overflow.
- Aplicar tokens via skill .agents/skills/tailwindcss.

Reporte ao final: caminho dos arquivos criados/modificados + screenshot conceitual em ASCII se útil.
```

### A.2 Template `general-purpose` para suites Playwright (E7.2–E7.6)

```
Você está implementando a suite <FOCO> de validação Playwright MCP para a landing page MeControla.

Stack: @playwright/test + @axe-core/playwright. Config em tests/playwright/playwright.config.ts.
BASE_URL padrão: http://localhost:4321 (pnpm preview). Override via env.

Viewports obrigatórios: 375×667, 768×1024, 1280×800, 1920×1080.

Arquivo a criar: tests/playwright/<foco>.spec.ts

Critério de Aceite:
- <copiar CA da task E7.x>

Definition of Done:
- 100% testes verdes contra pnpm preview local.
- Evidências (screenshots/reports) salvos em tests/playwright/evidences/<foco>/.
- Output JSON em tests/playwright/reports/<foco>.json.

Reporte: arquivos criados + comando para rodar a suite + resumo de pass/fail.
```

---

## Anexo B — Ordem recomendada de execução (linha do tempo)

```
SEMANA 1
─ Dia 1: E0.1 (gh refs) ║ E0.2 (git init)
─ Dia 2: E1.1 (config) → E1.2 + E1.3 (paralelo)
─ Dia 3: E2.1 + E2.2 + E3.1 + E3.2 (4 paralelo)
─ Dia 4: E4.1 (Layout) → E4.2 (UI primitives) → E5.1 (mascotes) + E5.3 + E6.1 + E6.2 (4 paralelo)

SEMANA 2 — paralelização máxima de seções
─ Dias 5–6: spawn de até 8 agentes frontend-design simultâneos:
  E4.3 ║ E4.4 ║ E4.5 ║ E4.6 ║ E4.7 ║ E4.8 ║ E4.9 ║ E4.10 ║ E4.12
─ Dia 7: E4.11 (depende E4.5) + E5.4 + E5.2 + E6.4 + E6.5
─ Dia 8: E4.13 (compose) → E4.14 (CookieConsent) + E4.15 (404)

SEMANA 3 — gate + deploy
─ Dia 9: E7.1 → spawn paralelo E7.2..E7.6 → E7.7
─ Dia 10: E0.3 (branch protection com checks existentes) → E6.3 (CF Pages) → E8.1
─ Dia 11: E8.2 (smoke prod) → sign-off
```

---

## Anexo C — Checklist de "Pronto para Próxima Task"

Antes de marcar qualquer task como concluída e avançar, validar:

1. ✅ Todos os CAs explícitos atendidos (testáveis localmente).
2. ✅ DoD cumprido (arquivos versionados, comandos passando).
3. ✅ `pnpm exec astro check` 0 erros.
4. ✅ `pnpm build` produz `dist/` válido.
5. ✅ Nenhuma cor explícita introduzida (`grep -rE "bg-(white|black|zinc-|gray-)" src/` retorna vazio).
6. ✅ Commit segue Conventional Commits (após E1.3).
7. ✅ PR aberto contra `main` com descrição da task ID + screenshots se UI (após E0.3 ativa).

**Bloqueador absoluto:** sem E7.7 aprovado, deploy E8.1 não pode ocorrer.
