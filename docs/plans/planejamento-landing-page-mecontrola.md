# Planejamento — Landing Page MeControla (Astro 5 + Tailwind v4 + Cloudflare Pages)

## Contexto

O usuário quer uma landing page institucional production-ready/production-proof para o produto **MeControla**, replicando fielmente a arquitetura, CI/CD e padrões de SEO/performance do repositório-referência `LimaTeixeiraTecnologia/limateixeira-landingpage`, porém com o **conteúdo, marca e identidade visual** definidos em `LimaTeixeiraTecnologia/mecontrola-docs/landing-page` (preview HTML + 2 mascotes). O escopo desta entrega é apenas planejamento (sem implementação). A validação obrigatória pré-deploy é com Playwright MCP.

## 1. Resumo do objetivo

Entregar um plano executável que, ao ser implementado, produza:

- Repositório `LimaTeixeiraTecnologia/mecontrola-landingpage` (já existente sob o usuário JailtonJunior94) com stack Astro 5.18.x + Tailwind CSS v4.3.x + `@tailwindcss/vite` + `@astrojs/sitemap` + `wrangler@4`.
- Estrutura de pastas e arquivos de infraestrutura espelhada da referência LT (`limateixeira-landingpage`).
- Conteúdo, copy PT-BR, ordem semântica e ativos visuais fiéis a `mecontrola-docs/landing-page/preview-landing-page-sprint-1.html` + 2 mascotes JPEG.
- Identidade visual MeControla (preto `#0D0D0D`, neon `#C6FF00`, roxo `#7861FF`, Poppins) modelada como design tokens Tailwind v4 conforme skill `.agents/skills/tailwindcss`.
- Pipeline CI/CD via GitHub Actions → Cloudflare Pages (project `mecontrola-landingpage`, domínio canônico `mecontrola.app.br`).
- SEO técnico completo (canonical, OG, Twitter, JSON-LD, sitemap, robots, GA4 opcional via `PUBLIC_GA_ID`).
- Headers de segurança (CSP, HSTS, X-Frame-Options) e cache imutável de assets `/_astro/*` em `public/_headers`.
- Validação obrigatória Playwright MCP cobrindo smoke, responsividade (375/768/1280/1920), a11y (axe-core), SEO (meta/OG/JSON-LD/sitemap) e performance (budgets Lighthouse), com evidências por seção/viewport.

## 2. Inventário das referências

### 2.1 Vindo de `LimaTeixeiraTecnologia/limateixeira-landingpage` (estrutura/infra)

| Categoria          | Itens confirmados                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack              | `astro@5.18.1`, `tailwindcss@4.3.0`, `@tailwindcss/vite@4.3.0`, `@astrojs/sitemap@^3.7.2`, `@fontsource-variable/manrope@5.2.8` (será trocado por Poppins), `typescript@5.9.3`, `@astrojs/check@0.9.9`, `wrangler@4` (global no CI), Node `24.15.0`, pnpm `11.1.2`                                                                                                                                               |
| Config raiz        | `astro.config.mjs` (site, compressHTML, sitemap, vite tailwindcss plugin), `tsconfig.json` (strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes), `wrangler.toml` (name, compatibility_date, pages_build_output_dir=dist), `package.json` com `packageManager`, `Makefile` (install/dev/build/preview/check/clean/reset/og-image), `.gitignore`, `.editorconfig`, `.prettierrc`, `README.md`          |
| Estilos            | `src/styles/global.css` com `@import "tailwindcss" source(none);` + `@source "../**/*.{astro,ts}";` + `@theme { --color-* ; --font-* ; --shadow-* }` + `@layer base` (html scroll-smooth, body com vars, scroll-margin-top em `[id]`) + keyframes `fadeIn` e utilitário `.scrollbar-none`                                                                                                                        |
| Layout             | `src/layouts/Layout.astro` (head completo: canonical, OG, Twitter card, JSON-LD Organization/WebSite/WebPage, GA4 condicional, preconnect/dns-prefetch, favicon, Header, Footer, slot)                                                                                                                                                                                                                           |
| Componentes UI     | `src/components/ui/Button.astro` (variantes primary/outline/ghost, `href` vs `button`, foco e reduced-motion), `Card.astro`, `Icon.astro` (registry indexado por nome), `SectionHeader.astro`                                                                                                                                                                                                                    |
| Header/Footer/Logo | `src/components/Header.astro`, `Footer.astro`, `Logo.astro`                                                                                                                                                                                                                                                                                                                                                      |
| Sections           | `src/components/sections/` — Hero, Credibility, Methodology, Segments, Differentials, Results, Institutional, Content, FinalCta                                                                                                                                                                                                                                                                                  |
| Content layer      | `src/lib/content.ts` — tipos `IconName`, `ServiceItem`, `MethodologyStep`, etc.; objetos `hero`, `services`, `contact`, `footer` etc. (single source of truth)                                                                                                                                                                                                                                                   |
| Utils              | `src/lib/cn.ts` — merge de classes                                                                                                                                                                                                                                                                                                                                                                               |
| Pages              | `/`, `/politica-de-privacidade/`, `/lgpd/`                                                                                                                                                                                                                                                                                                                                                                       |
| Public             | `_headers` (CSP/HSTS/cache `_astro` imutável/HTML no-cache), `robots.txt`, `og-image.png`+`og-image.svg`, logo svg, sitemap auto via integração                                                                                                                                                                                                                                                                  |
| CI/CD              | `.github/workflows/deploy.yml`: push em `main` ou dispatch → pnpm install --frozen-lockfile → `./node_modules/.bin/astro build` (com `PUBLIC_GA_ID`) → `npm i -g wrangler@4` (fora do pnpm) → idempotent project create → `wrangler pages deploy dist --project-name=<...> --branch=main`. Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, opc. `PUBLIC_GA_ID`. Concurrency cancela jobs em progresso. |
| Docs               | `docs/DEPLOY.md` (arquitetura, setup, runbook, troubleshooting), `docs/prompts/`                                                                                                                                                                                                                                                                                                                                 |

### 2.2 Vindo de `mecontrola-docs/landing-page` (conteúdo/copy/assets)

Arquivos confirmados na pasta:

- `preview-landing-page-sprint-1.html` (~28 KB) — referência única de copy, ordem e visual.
- `brand-mascote-resumo-mes.jpeg` (~161 KB).
- `brand-mascote-meta-concluida.jpeg` (~141 KB).

**Seções na ordem do preview:**

1. Header sticky com logo `Me` + `Controla` (neon) + CTA "Ver planos" → `#planos`.
2. Hero — tag "Menos caos. Mais conquistas." + h1 "Sua vida financeira organizada, direto no WhatsApp." (highlight final neon) + sub + 3 bullets (Sem app complicado / Sem julgamento / Sem precisar virar especialista) + CTAs "Ver planos" e "Entender como funciona" → `#como-funciona` + mockup WhatsApp denso (status bar iOS, header WA, mensagens, recibo de gasto categorizado, indicador digitando, input bar com mic neon).
3. "Conheça o MeControla" — imagem `brand-mascote-resumo-mes.jpeg` + tag + h2 "Seu parceiro de finanças, direto no WhatsApp." + body + 3 bullets coração 💚 + CTA "Quero esse parceiro".
4. Benefícios — h2 "Menos aperto. Mais clareza. Mais chance de respirar no fim do mês." + 3 cards (👀 / 📦 / 📈).
5. "Como funciona" (id `como-funciona`) — h2 + 3 passos numerados + parágrafo de fechamento.
6. "Para quem é" — h2 + 3 bullets coração.
7. Planos (id `planos`) — h2 + sub + 3 cards (Mensal R$ 29,90/mês; Trimestral R$ 80,73/3m R$ 26,91/mês econ. R$ 8,97; Anual R$ 297,80/12m R$ 24,82/mês econ. R$ 61,00 — featured "Melhor custo-benefício") + nota de pagamento (PIX/cartão/cupom).
8. FAQ (id `faq`) — 4 perguntas (Preciso baixar app / Qual plano vale mais / Como pago / É para quem entende de finanças).
9. Strip mascote B — imagem `brand-mascote-meta-concluida.jpeg` (layout reverse) + tag + h2 "Cada meta batida vira motivo pra continuar." + body.
10. Final CTA — gradiente 160° roxo (`#7861FF` → `#4b39c0`) + h2 "Seu dinheiro não precisa continuar mandando na sua paz." + CTA "Ver planos e começar" → `#planos`.
11. Footer mínimo: logo + tagline + "Pré-visualização de design".
12. Sticky bar mobile fixa com "Comece do jeito mais simples" + "Ver planos".

**Tokens visuais inferidos do preview:**

- Cores: `#0D0D0D` (bg), `#1F1F1F` (cards), `#B8B8B8` (muted text), `#FFFFFF`, neon `#C6FF00`, roxo `#7861FF`, gradiente final `#7861FF`→`#4b39c0`, paleta WhatsApp (`#1F2C33`, `#0B141A`, `#005C4B`).
- Tipografia: Poppins (500/600/700/800), line-height 1.45 body / 1.15 headings, letter-spacing -0.02em em headings e .08em em tags.
- Atributos `data-track-*` em todos os CTAs (eg. `cta_header_ver_planos`, `plan_yearly_select`).
- Máscara radial `mask-image: radial-gradient(ellipse 78% 88% at 50% 50%, #000 62%, transparent 100%)` nas imagens de mascote.

**Gaps de conteúdo (declarados como blockers/premissas):**

- Sem texto de política de privacidade / LGPD / termos (rotas legais NÃO entram em v1 por decisão do usuário).
- Sem URLs reais de checkout por plano nem número/URL WhatsApp (serão placeholders em `src/lib/content.ts`).
- Sem OG image final desenhada (precisa gerar `og-image.svg`→`.png` 1200×630 baseada na marca MeControla).
- Sem favicon definitivo (precisa derivar do símbolo mascote do preview ou pedir asset).
- Footer do preview é minimal; copy real de footer (CNPJ, links institucionais, e-mail) não existe.

## 3. Rastreabilidade via `gh` CLI

`gh` CLI disponível: `/opt/homebrew/bin/gh`, autenticado como `JailtonJunior94`.

| Repositório                                       | Caminho consultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Comandos sugeridos (todos via `gh`)                                                                                                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LimaTeixeiraTecnologia/limateixeira-landingpage` | metadata, default branch, tree recursivo, conteúdo de `package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.toml`, `Makefile`, `public/_headers`, `public/robots.txt`, `src/styles/global.css`, `src/layouts/Layout.astro`, `src/components/{Header,Footer,Logo,ui/Button,ui/Card,ui/Icon,ui/SectionHeader,sections/Hero,sections/Credibility,sections/Methodology,sections/FinalCta}.astro`, `src/lib/{content.ts,cn.ts}`, `src/pages/{index,politica-de-privacidade,lgpd}.astro`, `.github/workflows/deploy.yml`, `docs/DEPLOY.md`, `.gitignore`, `.editorconfig`, `.prettierrc`, `README.md` | `gh api repos/LimaTeixeiraTecnologia/limateixeira-landingpage`; `gh api repos/.../git/trees/main?recursive=1`; `gh api repos/.../contents/<path>?ref=main` + `jq -r .content \| base64 -d`                                    |
| `LimaTeixeiraTecnologia/mecontrola-docs`          | `landing-page/`, `landing-page/preview-landing-page-sprint-1.html`, `landing-page/brand-mascote-resumo-mes.jpeg`, `landing-page/brand-mascote-meta-concluida.jpeg`                                                                                                                                                                                                                                                                                                                                                                                                                                       | `gh api repos/LimaTeixeiraTecnologia/mecontrola-docs`; `gh api repos/.../contents/landing-page`; `gh api repos/.../git/trees/<branch>?recursive=1` filtrando prefixo `landing-page/`; para imagens, salvar via `download_url` |

Ambos repositórios foram efetivamente consultados via `gh` CLI durante a fase de exploração. Qualquer task de execução que precise reconfirmar dados deve usar exclusivamente `gh` (nunca chute, nunca web genérica).

## 4. Perguntas de múltipla escolha (respondidas pelo usuário)

| #   | Decisão                                           | Resposta                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Identidade visual                                 | **Manter MeControla do preview** — preto/neon/roxo/Poppins fielmente; estrutura de tokens Tailwind v4 conforme skill.                                                                                                                                              |
| 2   | Rotas v1                                          | **Somente `/` (home)**; LGPD/privacidade/termos não entram nesta entrega.                                                                                                                                                                                          |
| 3   | Destinos CTA                                      | **Placeholders `'#'` + TODO comentado** em `src/lib/content.ts` (`WHATSAPP_URL`, `CHECKOUT_URL_MENSAL/TRIMESTRAL/ANUAL`).                                                                                                                                          |
| 4   | Cobertura Playwright MCP                          | **Completa** — smoke + responsividade + a11y + SEO + perf, com evidências.                                                                                                                                                                                         |
| 5   | Domínio canônico + project CF                     | **`mecontrola.app.br`** já configurado no Cloudflare; project `mecontrola-landingpage`.                                                                                                                                                                            |
| 6   | Analytics                                         | **GA4 opcional via `PUBLIC_GA_ID`** (mesmo padrão LT), **bloqueado até consent LGPD**.                                                                                                                                                                             |
| 7   | Mockup WhatsApp                                   | **Componente Astro dedicado** `WhatsAppMockup.astro` com SVGs inline e classes via tokens.                                                                                                                                                                         |
| 8   | Repo remoto                                       | **Já existe** em `LimaTeixeiraTecnologia/mecontrola-landingpage` sob o usuário JailtonJunior94 — apenas inicializar git, vincular remote e push.                                                                                                                   |
| 9   | Poppins                                           | **Self-hosted via `@fontsource/poppins`** (pesos 500/600/700/800). Sem mexer em CSP, melhor LCP/CLS.                                                                                                                                                               |
| 10  | LGPD / cookie consent                             | **Banner LGPD bloqueia GA4 até opt-in.** Componente `CookieConsent.astro` com Aceitar/Recusar; `PUBLIC_GA_ID` só injeta script após consent positivo.                                                                                                              |
| 11  | Página 404                                        | **`src/pages/404.astro` custom** com identidade MeControla (mascote + CTA voltar para `/`).                                                                                                                                                                        |
| 12  | Preview deploys por PR                            | **Não** — apenas deploy em `main`, igual LT.                                                                                                                                                                                                                       |
| 13  | Dados oficiais para JSON-LD Organization e rodapé | **CNPJ 52.162.759/0001-74**, **e-mail `contato@limateixeira.com.br`**, **Instagram `https://www.instagram.com/limateixeiraconsulting/`**. Razão social não informada → fica como TODO em `content.ts` (placeholder `"MeControla"` como `name` e `legalName` TODO). |
| 14  | `sameAs` JSON-LD                                  | **Instagram** (`https://www.instagram.com/limateixeiraconsulting/`). LinkedIn/X não informados.                                                                                                                                                                    |
| 15  | Footer v1                                         | **Minimal igual ao preview** (logo + tagline + copyright). Sem links legais (rotas legais fora do escopo).                                                                                                                                                         |
| 16  | Tooling DX                                        | **Prettier** (igual LT) + **Husky + lint-staged + commitlint (Conventional Commits)**. ESLint e Vitest **não** entram no escopo v1.                                                                                                                                |
| 17  | Otimização de imagens                             | **Astro `<Image>` nativo** com AVIF/WebP/JPEG responsivo (`srcset` 480/768/1200) via sharp.                                                                                                                                                                        |
| 18  | Gates de repositório                              | **Branch protection em `main`** exigindo PR + checks verdes; **CI separado em `.github/workflows/ci.yml`** (check + lint + build) rodando em `pull_request`; **`CODEOWNERS`** apontando para `@JailtonJunior94`. Dependabot **não** será habilitado nesta entrega. |

## 5. Plano por fases

### Fase 0 — Bootstrap & rastreabilidade

**Objetivo:** preparar terreno e reconfirmar referências via `gh` antes de tocar em código.
**Saída:** árvore de pastas vazia, `git init`, remote vinculado, inventário versionado em `docs/`.

### Fase 1 — Replicar estrutura/infra LT

**Objetivo:** trazer toda a base de configuração (Astro/Tailwind/TS/wrangler/Makefile/headers/workflow/docs) com substituições mínimas (nome do projeto, domínio, fonte Poppins).
**Saída:** projeto buildável local com `astro build` produzindo `dist/` vazio porém válido.

### Fase 2 — Modelar tokens MeControla via skill tailwindcss

**Objetivo:** mapear paleta neon/roxo/preto + Poppins como CSS variables no `@theme` do `global.css`, usando design tokens (`bg-background`, `text-foreground`, `bg-primary`, `bg-accent`, etc.) — nunca cores explícitas.
**Saída:** `src/styles/global.css` validado pela skill, sem `bg-white`/`text-black` em componentes.

### Fase 3 — Mapear conteúdo `mecontrola-docs` para `src/lib/content.ts`

**Objetivo:** transcrever literalmente (PT-BR, sem inventar) toda copy do preview HTML como objetos tipados; declarar placeholders para `WHATSAPP_URL` e `CHECKOUT_URL_*`.
**Saída:** single source of truth do conteúdo.

### Fase 4 — Compor componentes Astro

**Objetivo:** materializar Header, Hero (com `WhatsAppMockup.astro` dedicado), MeetMascot, Benefits, HowItWorks, ForWhom, Pricing, Faq, MascotStripGoal, FinalCta, Footer, MobileStickyBar usando exclusivamente tokens da skill.
**Saída:** `/` renderizado igual ao preview (visualmente fiel) em todos os viewports.

### Fase 5 — SEO técnico + assets

**Objetivo:** Layout.astro com canonical/OG/Twitter/JSON-LD; `robots.txt`; sitemap auto; favicon e og-image MeControla; preconnect Google Fonts; mascotes otimizadas (`<picture>` AVIF/WebP/JPEG, `loading="lazy"`, `decoding="async"`).
**Saída:** assertions SEO passam (ver Fase 7).

### Fase 6 — Pipeline CI/CD para Cloudflare Pages

**Objetivo:** replicar `.github/workflows/deploy.yml`, `wrangler.toml`, `public/_headers` adaptados ao projeto MeControla, com CSP, HSTS, cache imutável, secrets configurados.
**Saída:** push em `main` dispara build + deploy em `mecontrola.app.br`.

### Fase 7 — Validação obrigatória Playwright MCP (production-readiness)

**Objetivo:** executar bateria completa contra `pnpm preview` local (ou Pages Preview) e coletar evidências.
**Saída:** relatório aprovado → libera deploy em produção.

### Fase 8 — Deploy & smoke pós-produção

**Objetivo:** validar produção real (DNS, SSL, headers, redirects, Core Web Vitals).
**Saída:** landing page MeControla online em `https://mecontrola.app.br`.

## 6. Tasks detalhadas

> Convenção: cada task tem `id`, `título`, `objetivo`, `dependências`, `insumos`, `entregável`, `critérios de aceite`, `riscos`. Estilos sempre via tokens conforme skill `.agents/skills/tailwindcss`. Nunca implementar nada nesta fase — apenas planejar.

### T0.1 — Reconfirmar referências via `gh` CLI

- **Objetivo:** revalidar via `gh api` os arquivos críticos do LT (workflow, wrangler, headers, layout, content.ts) e a lista de arquivos do `mecontrola-docs/landing-page`.
- **Dependências:** nenhuma.
- **Insumos:** `gh auth status` ok; nomes dos repos.
- **Entregável:** `docs/referencias.md` versionado com URLs gh, SHAs do tree, lista de arquivos consultados.
- **Critérios de aceite:** todo arquivo citado nas tasks subsequentes tem entrada rastreável em `docs/referencias.md`; nenhum dado de referência veio de memória ou de web genérica.
- **Riscos:** rate limit de `gh api` (mitigar com `--paginate` e cache local).

### T0.2 — Inicializar repositório local e vincular remote

- **Objetivo:** `git init` em `/Users/jailtonjunior/Git/mecontrola-landingpage`, criar `.gitignore` (clonado de LT), commit inicial vazio, `git remote add origin git@github.com:LimaTeixeiraTecnologia/mecontrola-landingpage.git`.
- **Dependências:** T0.1.
- **Insumos:** repo remoto já existente conforme resposta do usuário.
- **Entregável:** working tree pronto para PRs/branches.
- **Critérios de aceite:** `git remote -v` mostra origin LimaTeixeiraTecnologia; branch `main` configurada.
- **Riscos:** permissões SSH/HTTPS na org (validar com `gh repo view LimaTeixeiraTecnologia/mecontrola-landingpage`).

### T0.3 — Gates de repositório (CODEOWNERS + branch protection)

- **Objetivo:** criar `.github/CODEOWNERS` com `* @JailtonJunior94`; via `gh api -X PUT repos/.../branches/main/protection` configurar branch protection em `main` exigindo PR + status checks verdes (`ci/check`, `ci/lint`, `ci/build`) + 1 review (pode ser self-approve quando único maintainer) + dismiss stale reviews + linear history.
- **Dependências:** T0.2.
- **Insumos:** identidade do owner.
- **Entregável:** `.github/CODEOWNERS` versionado + regras de proteção ativas.
- **Critérios de aceite:** push direto em `main` é rejeitado; `gh api repos/.../branches/main/protection` retorna regras esperadas.
- **Riscos:** permissão de admin na org para configurar protection (validar antes).

### T1.1 — Replicar arquivos raiz de configuração

- **Objetivo:** criar `package.json` (deps EXATAS de LT salvo `@fontsource-variable/manrope` substituído por `@fontsource/poppins` ou Poppins via Google Fonts), `astro.config.mjs` (site `https://mecontrola.app.br`), `tsconfig.json`, `wrangler.toml` (`name="mecontrola-landingpage"`, `compatibility_date` atual, `pages_build_output_dir="dist"`), `Makefile`, `.gitignore`, `.editorconfig`, `.prettierrc`, `README.md`.
- **Dependências:** T0.2.
- **Insumos:** arquivos LT obtidos em T0.1.
- **Entregável:** repositório com configuração base.
- **Critérios de aceite:** `pnpm install --frozen-lockfile` passa; `astro check` passa; `astro build` produz `dist/` (mesmo vazio).
- **Riscos:** divergência de versão Astro vs Tailwind v4 (fixar nas mesmas minor do LT).

### T1.2 — Configurar Tailwind v4 via `@tailwindcss/vite`

- **Objetivo:** `astro.config.mjs` com `vite.plugins = [tailwindcss()]`; `src/styles/global.css` com `@import "tailwindcss" source(none);` e `@source "../**/*.{astro,ts}";` (vazio do `@theme` neste passo, preenchido em T2.x).
- **Dependências:** T1.1.
- **Insumos:** skill `.agents/skills/tailwindcss` (Quick Reference e patterns.md).
- **Entregável:** Tailwind ativo em build; classes utilitárias funcionam.
- **Critérios de aceite:** componente teste com `class="bg-background text-foreground"` renderiza sem erro.
- **Riscos:** typo no `@source` quebra inclusão de classes.

### T1.3 — Tooling DX (Prettier + Husky + lint-staged + commitlint)

- **Objetivo:** adicionar:
  - `.prettierrc` clonado do LT;
  - `husky` + `lint-staged` + `@commitlint/{cli,config-conventional}` como devDeps;
  - hook `pre-commit` rodando `lint-staged` (prettier --write + `astro check` em diff);
  - hook `commit-msg` rodando `commitlint --edit $1`;
  - `commitlint.config.cjs` com `extends: ['@commitlint/config-conventional']`;
  - script `prepare: "husky"` em `package.json`.
- **Dependências:** T1.1.
- **Insumos:** padrão Conventional Commits.
- **Entregável:** hooks instalados; commit fora do padrão é rejeitado.
- **Critérios de aceite:** `git commit -m "wip"` falha; `git commit -m "feat(hero): add whatsapp mockup"` passa; arquivos staged são auto-formatados.
- **Riscos:** Husky 9+ mudou caminho de hooks (`.husky/_/`) — usar instalação atual (`husky init`).

### T2.1 — Modelar design tokens MeControla

- **Objetivo:** preencher `@theme` em `src/styles/global.css` com tokens semânticos:
  - `--color-background: #0D0D0D`; `--color-surface: #1F1F1F`; `--color-card: #1F1F1F`; `--color-foreground: #FFFFFF`; `--color-muted-foreground: #B8B8B8`; `--color-border: rgba(255,255,255,0.08)`;
  - `--color-primary: #C6FF00`; `--color-primary-foreground: #0D0D0D`;
  - `--color-accent: #7861FF`; `--color-accent-foreground: #FFFFFF`;
  - `--color-destructive`/`--color-ring` se necessário;
  - `--font-sans: "Poppins", system-ui, sans-serif`;
  - `--shadow-glow-primary` e `--shadow-glow-accent` com neon/roxo;
  - gradiente final como variável CSS custom.
- **Dependências:** T1.2.
- **Insumos:** paleta extraída do preview; skill tailwindcss exigindo design tokens.
- **Entregável:** tokens consumíveis via `bg-background`, `bg-card`, `text-foreground`, `bg-primary`, `bg-accent` etc.
- **Critérios de aceite:** nenhum componente futuro usa `bg-white`/`text-black`/`bg-zinc-*`; checklist da skill passa.
- **Riscos:** colisão semântica (`primary` vs `accent` no preview são neon/roxo — documentar mapeamento em comentário do CSS).

### T2.2 — Carregar Poppins self-hosted via `@fontsource/poppins`

- **Objetivo:** adicionar `@fontsource/poppins` como dependência; importar em `src/styles/global.css` (ou em `Layout.astro`) os pesos 500/600/700/800:
  ```css
  @import '@fontsource/poppins/500.css';
  @import '@fontsource/poppins/600.css';
  @import '@fontsource/poppins/700.css';
  @import '@fontsource/poppins/800.css';
  ```
  Configurar `font-display: swap` no `@font-face` (já default do fontsource). Não tocar em CSP (sem 3rd-party).
- **Dependências:** T1.1.
- **Insumos:** tipografia do preview (Poppins).
- **Entregável:** fonte servida pelo próprio domínio, em `dist/_astro/*.woff2`.
- **Critérios de aceite:** Playwright/devtools confirmam que fonte usada é Poppins (computed style), nenhuma requisição a `fonts.googleapis.com` ou `gstatic.com`, CSP intacto.
- **Riscos:** importar pesos demais infla bundle — limitar a 4 pesos confirmados no preview.

### T3.1 — Transcrever copy do preview para `src/lib/content.ts`

- **Objetivo:** criar tipos e objetos:
  - `nav`, `hero`, `meetMascot`, `benefits[]`, `howItWorks{ steps[], closing }`, `forWhom{ heading, items[] }`, `plans[]` (com `priceLabel`, `equiv`, `savings`, `support`, `cta`, `featured`), `faq[]`, `mascotStripGoal`, `finalCta`, `footer`, `mobileSticky`.
  - Constantes URL: `WHATSAPP_URL = '#'`, `CHECKOUT_URL_MENSAL = '#'`, `CHECKOUT_URL_TRIMESTRAL = '#'`, `CHECKOUT_URL_ANUAL = '#'` — cada um com comentário `// TODO: substituir antes de promoção pública`.
  - Constantes oficiais (já fornecidas pelo usuário): `CONTACT_EMAIL = 'contato@limateixeira.com.br'`, `INSTAGRAM_URL = 'https://www.instagram.com/limateixeiraconsulting/'`, `CNPJ = '52.162.759/0001-74'`. Adicionar `LEGAL_NAME = ''` com `// TODO: razão social oficial`.
- **Dependências:** T0.1 (transcrição literal do HTML obtido por `gh`).
- **Insumos:** `preview-landing-page-sprint-1.html`, dados oficiais informados pelo usuário.
- **Entregável:** `src/lib/content.ts` tipado.
- **Critérios de aceite:** `astro check` passa; toda copy PT-BR preservada literalmente (sem reescrita); placeholders documentados; UTF-8 validado.
- **Riscos:** quebra de PT-BR (acentuação) ao decodificar base64 — verificar com `iconv -f utf-8` e inspeção visual.

### T3.2 — Util `cn()` e Icon registry

- **Objetivo:** clonar `src/lib/cn.ts` do LT; criar `src/lib/icons.ts` ou `src/components/ui/Icon.astro` com símbolos SVG inline (mascote, check, whatsapp, eye, package, trending, heart, plus/close para FAQ).
- **Dependências:** T1.1.
- **Insumos:** SVGs do preview (`#mc-face` mascote, ícones inline).
- **Entregável:** sistema de ícones reutilizável.
- **Critérios de aceite:** ícones renderizam idênticos ao preview; sem dependência externa de icon font.

### T4.1 — Layout base `src/layouts/Layout.astro`

- **Objetivo:** replicar Layout LT adaptado (Poppins, paleta MeControla, GA4 condicional, SEO completo, Header/Footer slots).
- **Dependências:** T2.1, T2.2, T3.1.
- **Insumos:** `Layout.astro` LT.
- **Entregável:** master layout reutilizável.
- **Critérios de aceite:** canonical dinâmico funciona; OG/Twitter rendem com props; JSON-LD válido (validador schema.org).

### T4.2 — Componentes UI (Button, Card, SectionHeader, Tag, Icon)

- **Objetivo:** UI primitivos com variantes (`primary` neon, `accent` roxo, `ghost` outline) usando tokens; suporte `href` (anchor) com `data-track` attribute.
- **Dependências:** T2.1, T3.2.
- **Insumos:** Button.astro LT como base.
- **Entregável:** `src/components/ui/{Button,Card,SectionHeader,Tag,Icon}.astro`.
- **Critérios de aceite:** focus ring visível (a11y); reduced-motion respeitado; classes via tokens conforme skill.

### T4.3 — Header sticky + Footer + MobileStickyBar

- **Objetivo:** `Header.astro` com logo MeControla (Me + Controla neon), CTA "Ver planos"; `Footer.astro` minimal com tagline; `MobileStickyBar.astro` `fixed bottom-0 md:hidden`.
- **Dependências:** T4.2.
- **Insumos:** seções 3.2/3.12/3.13 do inventário.
- **Entregável:** chrome global do site.
- **Critérios de aceite:** sticky bar mobile aparece <768px e somente lá; backdrop-blur em header funciona.

### T4.4 — `Hero.astro` + `WhatsAppMockup.astro`

- **Objetivo:** Hero em grid 2 colunas (texto à esquerda, mockup à direita; empilha em mobile). Mockup dedicado com: status bar iOS (9:41 + ícones), header WA com avatar mascote, balões (incoming "80 no cinema 🎬", outgoing "Pronto, lancei 😉", balão recibo estilizado, indicador digitando 3 dots animados), input bar com mic neon. Tudo em SVG/HTML+Tailwind via tokens.
- **Dependências:** T4.2, T3.2.
- **Insumos:** seção 3.3 do inventário.
- **Entregável:** `src/components/sections/Hero.astro` + `src/components/sections/hero/WhatsAppMockup.astro`.
- **Critérios de aceite:** Playwright snapshot em 375/768/1280/1920 mostra mockup proporcional; texto acessível (sem texto em imagem); animação `dots` respeita `prefers-reduced-motion`.
- **Riscos:** complexidade visual alta — orçar margem de tempo extra.

### T4.5 — `MeetMascot.astro` (seção "Conheça o MeControla")

- **Objetivo:** layout 2 colunas (imagem `brand-mascote-resumo-mes` à esquerda com máscara radial via `mask-image`; texto + bullets coração + CTA à direita); empilha em mobile.
- **Dependências:** T4.2, T5.1.
- **Insumos:** seção 3.4 do inventário; asset T5.1.
- **Entregável:** componente reutilizável (prop `reverse` para reuso em MascotStripGoal).
- **Critérios de aceite:** imagem com `loading="lazy"`, `decoding="async"`, `<picture>` AVIF/WebP/JPEG; máscara renderiza no Chromium e Safari (testar via Playwright).

### T4.6 — `Benefits.astro` (3 cards)

- **Objetivo:** grid responsivo `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` com 3 cards (emoji 👀/📦/📈 + h3 + p).
- **Dependências:** T4.2.
- **Insumos:** seção 3.5.
- **Entregável:** componente section.
- **Critérios de aceite:** grid mobile-first conforme skill; bordas via `border-border`.

### T4.7 — `HowItWorks.astro` (id `como-funciona`)

- **Objetivo:** 3 passos numerados (1/2/3) + closing paragraph.
- **Dependências:** T4.2.
- **Insumos:** seção 3.6.
- **Entregável:** componente section.
- **Critérios de aceite:** âncora `#como-funciona` funciona com `scroll-margin-top` configurado no `@layer base`.

### T4.8 — `ForWhom.astro` (lista 💚)

- **Objetivo:** h2 + lista de 3 itens com bullet coração roxo.
- **Dependências:** T4.2.
- **Insumos:** seção 3.7.
- **Entregável:** componente section.

### T4.9 — `Pricing.astro` (id `planos`)

- **Objetivo:** grid 3 colunas com cards Mensal/Trimestral/Anual; cartão Anual com badge "Melhor custo-benefício" absoluto acima; badges de economia neon; CTAs com `data-track="plan_<id>_select"` apontando para `CHECKOUT_URL_*` em `content.ts`; nota PIX/cartão/cupom.
- **Dependências:** T4.2, T3.1.
- **Insumos:** seção 3.8.
- **Entregável:** componente section.
- **Critérios de aceite:** card featured tem destaque visual (borda neon, glow); valores idênticos ao preview.

### T4.10 — `Faq.astro` (id `faq`)

- **Objetivo:** 4 itens com `<details><summary>` (Astro suporta nativo) ou pattern de acordeão acessível com `aria-expanded`.
- **Dependências:** T4.2.
- **Insumos:** seção 3.9.
- **Entregável:** componente section.
- **Critérios de aceite:** axe-core passa; ícone rotaciona via CSS transition respeitando reduced-motion.

### T4.11 — `MascotStripGoal.astro`

- **Objetivo:** reuso de MeetMascot com `reverse` + imagem `brand-mascote-meta-concluida`.
- **Dependências:** T4.5.
- **Entregável:** componente section.

### T4.12 — `FinalCta.astro`

- **Objetivo:** seção full-width com gradiente roxo 160° (`#7861FF`→`#4b39c0` como custom CSS variable), h2 + body + CTA neon.
- **Dependências:** T4.2.
- **Insumos:** seção 3.11.
- **Entregável:** componente section.

### T4.13 — Página `src/pages/index.astro`

- **Objetivo:** compor todas as seções na ordem 1–12; usar Layout com metas próprios (title, description, OG).
- **Dependências:** T4.3–T4.12.
- **Entregável:** rota `/` completa.
- **Critérios de aceite:** preview local visualmente fiel ao preview HTML do mecontrola-docs em 375/768/1280/1920; sem console errors.

### T4.14 — `src/components/CookieConsent.astro` (LGPD) e gating de GA4

- **Objetivo:** componente client-side (script Astro `is:inline` ou `<script>` separado, mantendo CSP) que:
  - Lê `localStorage.mecontrola_consent` (`'accepted'` | `'declined'` | ausente).
  - Se ausente, renderiza banner fixo (bottom) com copy "Usamos cookies para entender uso do site e melhorar sua experiência. Você pode aceitar ou recusar a qualquer momento." + botões "Aceitar" / "Recusar".
  - Em "Aceitar": grava `localStorage`, dispara `window.dispatchEvent(new Event('consent-granted'))` e injeta dinamicamente o script GA4 (somente se `PUBLIC_GA_ID` definido).
  - Em "Recusar": grava `localStorage`, nenhum script de tracking carregado.
  - GA4 **nunca** carrega antes do consent positivo.
- **Dependências:** T4.1 (Layout), T6.1 (CSP libera `googletagmanager`).
- **Insumos:** padrão LGPD BR.
- **Entregável:** `src/components/CookieConsent.astro` + integração no Layout.
- **Critérios de aceite:** Playwright valida ausência de requests para `googletagmanager` antes do clique em "Aceitar"; após "Aceitar", a tag aparece; preferência persiste entre reloads; CSP intacto.
- **Riscos:** inline scripts sob CSP — usar `<script>` externo ou hash; alternativamente `unsafe-inline` apenas se já presente.

### T4.15 — `src/pages/404.astro` custom

- **Objetivo:** página 404 on-brand com layout MeControla:
  - Mascote (reuso de `brand-mascote-resumo-mes` ou ilustração simplificada).
  - h1 "Esta página decidiu sumir."
  - Body curto "Mas relaxa: sua organização financeira começa por aqui."
  - CTA "Voltar para o início" (primary neon → `/`).
- **Dependências:** T4.1, T5.1.
- **Entregável:** rota `/404`.
- **Critérios de aceite:** Cloudflare Pages serve `dist/404.html` em rotas inexistentes; Playwright valida status 404 + presença do CTA.

### T5.1 — Otimizar mascotes via Astro `<Image>` nativo

- **Objetivo:** salvar JPEGs originais (download via `gh api ... | jq -r .download_url`) em `src/assets/mascotes/`; usar componente `astro:assets` `<Image>` (sharp como built-in) com `widths={[480, 768, 1200]}`, `formats={['avif', 'webp', 'jpg']}`, `loading="lazy"`, `decoding="async"`, `alt` literal do preview. Para hero (above-the-fold), `loading="eager"` e `fetchpriority="high"` apenas se aplicável.
- **Dependências:** T0.1 (download via gh API).
- **Entregável:** assets versionados em `src/assets/mascotes/` + uso de `<Image>` nos componentes Meet/MascotStripGoal/404.
- **Critérios de aceite:** dist gera variantes AVIF + WebP + JPEG; `<picture>` correto no HTML; LCP da seção mascote < 2.5s em throttling 4G (Lighthouse mobile); zero CLS por imagem sem `width/height`.

### T5.2 — Favicon e OG image MeControla

- **Objetivo:** derivar favicon SVG do símbolo mascote `#mc-face`; criar `og-image.svg` 1200×630 com logo/headline + Makefile target `og-image` via `rsvg-convert` (mesmo padrão LT).
- **Dependências:** T3.2.
- **Entregável:** `public/favicon.svg`, `public/og-image.png`+`.svg`.
- **Critérios de aceite:** validador OG (Facebook/Twitter) reconhece imagem.

### T5.3 — `robots.txt` + sitemap

- **Objetivo:** `public/robots.txt` apontando `Sitemap: https://mecontrola.app.br/sitemap-index.xml`; `@astrojs/sitemap` integrado em `astro.config.mjs`.
- **Dependências:** T1.1.
- **Entregável:** SEO discoverability.
- **Critérios de aceite:** após build, `dist/sitemap-index.xml` existe e referencia `/`.

### T5.4 — Layout SEO completo (canonical, OG, Twitter, JSON-LD)

- **Objetivo:** props do Layout aceitam `title`, `description`, `canonical`, `ogImage`; JSON-LD Organization preenchido com dados oficiais:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MeControla",
    "legalName": "<TODO razão social>",
    "url": "https://mecontrola.app.br",
    "logo": "https://mecontrola.app.br/og-image.png",
    "email": "contato@limateixeira.com.br",
    "taxID": "52.162.759/0001-74",
    "sameAs": ["https://www.instagram.com/limateixeiraconsulting/"]
  }
  ```

  - JSON-LD `WebSite` (search action opcional) e `WebPage` por rota. GA4 **NÃO** é injetado pelo Layout; quem decide é o `CookieConsent.astro` (T4.14).

- **Dependências:** T4.1, T3.1, T4.14.
- **Entregável:** head completo.
- **Critérios de aceite:** Rich Results Test válido para Organization e WebSite; `legalName` marcado como TODO até o usuário fornecer.

### T6.1 — `public/_headers` (CSP/HSTS/cache)

- **Objetivo:** replicar headers LT adaptando CSP (script-src libera googletagmanager se GA4; permite `'self'` e Google Fonts se aplicável); cache `/_astro/* immutable`; HTML `no-cache`.
- **Dependências:** T1.1.
- **Entregável:** `public/_headers`.
- **Critérios de aceite:** Mozilla Observatory / securityheaders.com ≥ A; sem CSP violations no console em produção.

### T6.2 — `.github/workflows/deploy.yml`

- **Objetivo:** replicar workflow LT: trigger push `main` + workflow_dispatch; checkout; setup pnpm via packageManager; Node 24.15.0 cache pnpm; `pnpm install --frozen-lockfile`; `./node_modules/.bin/astro build` com env `PUBLIC_GA_ID`; `npm i -g wrangler@4`; idempotent project create; `wrangler pages deploy dist --project-name=mecontrola-landingpage --branch=main`. Concurrency cancel-in-progress.
- **Dependências:** T1.1, T6.1.
- **Entregável:** pipeline funcional.
- **Critérios de aceite:** dry-run (workflow_dispatch em branch teste) conclui sem erro; secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` configurados.
- **Riscos:** pnpm + wrangler conflito → manter wrangler global como LT.

### T6.3 — Cloudflare Pages: projeto, domínio, SSL

- **Objetivo:** confirmar projeto `mecontrola-landingpage` no CF (ou criar via wrangler no primeiro deploy); custom domain `mecontrola.app.br` (e `www` redirect 301 → apex); SSL Full (strict); Always HTTPS + Auto Rewrites.
- **Dependências:** T6.2.
- **Entregável:** site servindo em `https://mecontrola.app.br`.
- **Critérios de aceite:** `curl -I https://mecontrola.app.br` retorna 200 + headers de segurança.

### T6.5 — `.github/workflows/ci.yml` (gate de PR)

- **Objetivo:** workflow separado disparado em `pull_request` para `main`:
  - Steps: checkout → setup pnpm (via packageManager) → setup Node 24.15.0 com cache pnpm → `pnpm install --frozen-lockfile` → `pnpm exec prettier --check .` → `pnpm exec astro check` → `pnpm build` → upload `dist/` como artifact (opcional, para inspecção).
  - Jobs nomeados `ci/check`, `ci/lint`, `ci/build` (separados) para alinhar com required status checks de T0.3.
- **Dependências:** T1.3, T6.2, T0.3.
- **Entregável:** `.github/workflows/ci.yml`.
- **Critérios de aceite:** PR sem build verde não consegue ser mergeado; logs claros para cada job.
- **Riscos:** duplicação de setup entre `ci.yml` e `deploy.yml` — aceitar (independência > DRY em CI).

### T6.4 — `docs/DEPLOY.md`

- **Objetivo:** replicar doc operacional LT adaptado (arquitetura, setup tokens CF, secrets, runbook, troubleshooting).
- **Dependências:** T6.2, T6.3.
- **Entregável:** doc.
- **Critérios de aceite:** novo dev consegue rodar deploy seguindo somente o doc.

### T7.1 — Setup Playwright MCP

- **Objetivo:** instalar Playwright MCP server, configurar projeto de validação (`tests/playwright/`), targets de viewports 375×667, 768×1024, 1280×800, 1920×1080.
- **Dependências:** T6.2 (preview servindo em CI ou local).
- **Entregável:** infra de testes.
- **Critérios de aceite:** `npx playwright test --list` enumera suites smoke/responsive/a11y/seo/perf.

### T7.2 — Playwright MCP: smoke

- **Objetivo:** abrir `/`, asserts: status 200, title, presença das 12 seções, navegação por âncoras `#como-funciona`, `#planos`, `#faq` funciona com `scroll-margin-top`, todos CTAs têm `data-track` esperado.
- **Dependências:** T7.1, T4.13.
- **Entregável:** suite smoke.
- **Critérios de aceite:** 100% pass.

### T7.3 — Playwright MCP: responsividade

- **Objetivo:** em cada viewport, asserts: layout não overflowa horizontalmente, MobileStickyBar visível apenas <768px, Hero mockup empilha em <1024px, grids 3-col degradam para 1-col em mobile. Captura screenshot por seção × viewport.
- **Dependências:** T7.1.
- **Entregável:** suite responsive + diretório de evidências `tests/playwright/evidences/`.

### T7.4 — Playwright MCP: a11y (axe-core)

- **Objetivo:** `@axe-core/playwright` rodando em `/` por viewport; falha em violações sérias/críticas.
- **Dependências:** T7.1.
- **Entregável:** suite a11y.
- **Critérios de aceite:** 0 violations sérias/críticas; contraste mínimo AA respeitado nos tokens.

### T7.5 — Playwright MCP: SEO técnico + LGPD

- **Objetivo:** asserts em `<head>`: `<title>` não vazio, meta description, canonical absoluto correto, OG (title/description/image absoluta/url/type=website), Twitter card, JSON-LD parseável e tipos `Organization`+`WebSite`; `/sitemap-index.xml` retorna 200 e referencia `/`; `/robots.txt` retorna 200; **404 custom** retorna status 404 e renderiza CTA voltar.
  - **LGPD:** verificar via `page.on('request')` que nenhuma requisição para `googletagmanager.com`/`google-analytics.com` ocorre antes do clique em "Aceitar"; após clicar, a tag carrega; após "Recusar", nunca carrega; preferência persiste em reload.
- **Dependências:** T7.1, T5.3, T5.4, T4.14, T4.15.
- **Entregável:** suite SEO + LGPD.
- **Critérios de aceite:** todas asserções passam; Rich Results Test (manual ou via API) sem erros; 0 requests de tracking sem consent.

### T7.6 — Playwright MCP: performance (Lighthouse budgets)

- **Objetivo:** rodar Lighthouse CLI (ou playwright-lighthouse) em mobile e desktop; budgets: Performance ≥ 90 mobile / ≥ 95 desktop, LCP ≤ 2.5s mobile, CLS ≤ 0.1, TBT ≤ 200ms, JS ≤ 200KB.
- **Dependências:** T7.1, T5.1.
- **Entregável:** suite perf + relatórios `.html`.
- **Critérios de aceite:** budgets respeitados; relatórios anexados como evidência.
- **Riscos:** WhatsAppMockup denso pode estourar CLS — testar cedo.

### T7.7 — Playwright MCP: evidências e gate de readiness

- **Objetivo:** consolidar relatório `tests/playwright/REPORT.md` com link para screenshots por seção/viewport, relatórios axe e Lighthouse, traces.
- **Dependências:** T7.2–T7.6.
- **Entregável:** documento auditável.
- **Critérios de aceite:** todo critério das seções 7.x marcado como passed; somente então liberar deploy.

### T8.1 — Deploy primário

- **Objetivo:** merge para `main` → workflow dispara deploy.
- **Dependências:** T7.7 aprovado.
- **Entregável:** site em `https://mecontrola.app.br`.

### T8.2 — Smoke pós-produção

- **Objetivo:** rodar suite Playwright contra produção; validar TLS (`testssl.sh` ou `curl -v`), headers reais, sitemap.xml em produção, Core Web Vitals reais (CrUX se disponível).
- **Dependências:** T8.1.
- **Entregável:** sign-off de produção.

## 7. Riscos e bloqueios

| Risco/blocker                                                                                                             | Mitigação                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mockup WhatsApp do hero é visualmente denso (status bar iOS, balões, recibo, typing dots) e pode degradar performance/CLS | Componentizar em `WhatsAppMockup.astro` (T4.4), usar SVG inline com `width/height` explícitos, `prefers-reduced-motion`, validar com Lighthouse cedo (T7.6)    |
| Fonte Poppins via Google Fonts viola CSP rígido de LT                                                                     | Preferir `@fontsource/poppins` self-hosted; se Google Fonts for necessário, atualizar `font-src` no CSP (T2.2 + T6.1)                                          |
| Conteúdo legal (privacidade/LGPD/termos) não existe nos materiais → CTAs sem URLs reais                                   | Placeholders em `content.ts` (T3.1) marcados como `TODO`; rotas legais ficam fora de v1 conforme decisão; bloquear deploy se CTAs de pagamento ainda forem `#` |
| OG image e favicon MeControla não existem prontos                                                                         | T5.2 cria SVGs derivados do símbolo mascote + Makefile target `og-image`                                                                                       |
| Conflito de identidade visual entre LT e mecontrola-docs                                                                  | Resolvido: preservar marca MeControla (resposta usuário), usar arquitetura de tokens do LT                                                                     |
| `gh` CLI indisponível ou sem auth no ambiente de execução                                                                 | Validar antes de iniciar (T0.1); blocker explícito caso falhe                                                                                                  |
| Secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` ausentes no repo                                                   | T6.2 documenta requisitos; pipeline falha rápido com mensagem clara                                                                                            |
| Conteúdo PT-BR com acentuação corrompida ao transcrever via API base64                                                    | Validar UTF-8 em T3.1; `astro check` + lint passam                                                                                                             |
| Imagem mascote pesada (~160 KB JPEG) compromete LCP                                                                       | Pipeline `<Image>` Astro gera AVIF/WebP/JPEG responsivos com `srcset` (T5.1)                                                                                   |
| Headers CSP quebram GA4 ou mockup interativo                                                                              | CSP igual LT já libera googletagmanager; validar em T7.5 com console limpo                                                                                     |
| pnpm + wrangler conflito (já observado em LT)                                                                             | Manter `npm i -g wrangler@4` fora do pnpm conforme workflow LT (T6.2)                                                                                          |
| LGPD: GA4 carregando antes do opt-in vira não-conformidade                                                                | `CookieConsent.astro` (T4.14) controla injeção dinâmica; Playwright (T7.5) bloqueia merge se houver request a googletagmanager sem consent                     |
| Razão social oficial ausente → JSON-LD `legalName` vazio                                                                  | Marcar TODO em `content.ts`; deploy não bloqueado, mas plano de follow-up obriga preencher antes de campanhas pagas                                            |
| Commitlint Conventional Commits pode atrapalhar bootstrap (commits iniciais)                                              | Permitir tipo `chore` e `build` desde o início; documentar no README                                                                                           |
| Branch protection bloqueia auto-deploy de bootstrap                                                                       | T0.3 só ativa proteção depois do commit inicial; ou desativar temporariamente via `gh api` durante setup                                                       |

## 8. Critérios de aceite da futura implementação

### 8.1 Fidelidade às referências

- Estrutura de pastas espelha LT (`src/{components,layouts,lib,pages,styles}`, `public/_headers`, `.github/workflows/deploy.yml`, `wrangler.toml`, `astro.config.mjs`, `tsconfig.json`, `Makefile`, `docs/DEPLOY.md`).
- Toda copy PT-BR da home é literal ao `preview-landing-page-sprint-1.html`; mascotes `brand-mascote-resumo-mes.jpeg` e `brand-mascote-meta-concluida.jpeg` aparecem nas seções correspondentes; ordem das 12 seções preservada.
- Identidade visual MeControla (preto/neon/roxo/Poppins) implementada via design tokens; nenhum componente usa cores explícitas (`bg-white`, `text-black`, `bg-zinc-*`) conforme skill `tailwindcss`.

### 8.2 Production-readiness técnica

- `pnpm install --frozen-lockfile && pnpm build` reproduz em CI; `astro check` 0 erros.
- Pipeline `.github/workflows/deploy.yml` faz deploy bem-sucedido a partir de push em `main`.
- `https://mecontrola.app.br` serve HTTPS válido (Full strict), redirect `www` → apex, todos headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) presentes.
- Cache: `/_astro/*` com `max-age=31536000, immutable`; HTML com `max-age=0, must-revalidate`.

### 8.3 SEO técnico

- Sitemap em `/sitemap-index.xml`; `robots.txt` correto; canonical, OG, Twitter, JSON-LD (Organization + WebSite + WebPage) presentes; Rich Results Test sem erros.

### 8.4 Acessibilidade

- 0 violações sérias/críticas em axe-core nas 4 viewports.
- Foco visível, contraste AA, `prefers-reduced-motion` respeitado em animações.

### 8.5 Performance

- Lighthouse Performance ≥ 90 mobile, ≥ 95 desktop; LCP ≤ 2.5s mobile; CLS ≤ 0.1; TBT ≤ 200ms; JS shipped ≤ 200 KB.

### 8.6 Verificável por Playwright MCP (inegociável)

- Suite **smoke**: status 200, todas as seções presentes, âncoras navegam, CTAs com `data-track` esperados.
- Suite **responsividade**: screenshots por seção × {375, 768, 1280, 1920}, sem overflow horizontal, MobileStickyBar comportamento correto.
- Suite **a11y**: axe-core 0 sérias/críticas por viewport.
- Suite **SEO**: head completo, sitemap/robots, JSON-LD parseável.
- Suite **performance**: budgets Lighthouse aprovados; relatórios anexados.
- Relatório consolidado `tests/playwright/REPORT.md` com evidências; sem este relatório aprovado, **deploy bloqueado**.
- Pós-deploy: a suite roda contra `https://mecontrola.app.br` e todos os critérios acima permanecem verdes.

### 8.7 Operacional & Conformidade

- `docs/DEPLOY.md` cobre setup do projeto CF, secrets, runbook e troubleshooting.
- `README.md` documenta `make dev|build|preview|check|og-image`, lista placeholders pendentes (`WHATSAPP_URL`, `CHECKOUT_URL_*`, `LEGAL_NAME`) que precisam ser definidos antes de promoção real ao público, e explica o consent LGPD.
- `CookieConsent.astro` ativo; `legalName` em JSON-LD documentado como pendente.
- Branch protection ativa em `main`; PR sem `ci/check`, `ci/lint`, `ci/build` verdes não merge.
- Hooks Husky funcionando (commits fora de Conventional Commits rejeitados).
- 404 custom em `dist/404.html` servido por CF Pages.

---

### Plano de verificação end-to-end (resumo executivo)

1. `pnpm install --frozen-lockfile && pnpm check && pnpm build` localmente.
2. `pnpm preview` → rodar suites Playwright MCP (T7.2–T7.6) e gerar `REPORT.md` (T7.7).
3. Merge em `main` dispara workflow → deploy Cloudflare Pages.
4. Rodar T8.2 (Playwright contra produção) + `curl -I` para confirmar headers + Mozilla Observatory ≥ A.
5. Sign-off final apenas se 8.1–8.7 estiverem todos verdes.
