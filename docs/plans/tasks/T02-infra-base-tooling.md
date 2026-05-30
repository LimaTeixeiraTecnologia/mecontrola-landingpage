# T02 — Infra Astro/Tailwind + Tooling DX

**Fase mestre:** 1 (E1.1, E1.2, E1.3)
**Dependências:** T01
**Paralelizável dentro:** ✅ — após arquivos raiz, Tailwind setup ║ Husky setup
**Bloqueia:** T03, T04

## Objetivo

Replicar a base de configuração de LT (Astro 5 / Tailwind v4 / TypeScript estrito / wrangler / Makefile / Prettier) substituindo Manrope por Poppins, e instalar tooling DX (Husky + lint-staged + commitlint).

## Subatividades

### 1. Arquivos raiz de configuração

- **`package.json`** com deps EXATAS de LT, exceto:
  - remover `@fontsource-variable/manrope`;
  - adicionar `@fontsource/poppins`.
  - `packageManager: "pnpm@11.1.2"`.
  - Scripts: `dev`, `build`, `preview`, `check`, `prepare: "husky"`.
- **`astro.config.mjs`**:
  - `site: 'https://mecontrola.app.br'`
  - `compressHTML: true`
  - integration `sitemap()` (`@astrojs/sitemap@^3.7.2`)
  - `vite.plugins: [tailwindcss()]` (`@tailwindcss/vite@4.3.0`)
- **`tsconfig.json`**: strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (igual LT).
- **`wrangler.toml`**: `name="mecontrola-landingpage"`, `compatibility_date="2026-05-30"`, `pages_build_output_dir="dist"`.
- **`Makefile`** clonado de LT: targets `install/dev/build/preview/check/clean/reset/og-image`.
- **`.editorconfig`**: 2 espaços, LF, UTF-8.
- **`.prettierrc`**: igual LT.
- **`.gitignore`**: já criado em T01.
- **`README.md`** mínimo: targets `make`, lista de placeholders pendentes (`WHATSAPP_URL`, `CHECKOUT_URL_*`, `LEGAL_NAME`), explicação do consent LGPD.

### 2. Tailwind v4 ativo

- `src/styles/global.css` esqueleto:
  ```css
  @import 'tailwindcss' source(none);
  @source "../**/*.{astro,ts}";
  @theme {
    /* preenchido em T03 */
  }
  ```
- Layout placeholder importa `../styles/global.css` para validar pipeline.
- Build deve gerar CSS em `dist/_astro/*.css` com utilitárias funcionais.

### 3. Tooling DX

- DevDeps: `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`.
- **`commitlint.config.cjs`**: `module.exports = { extends: ['@commitlint/config-conventional'] };`
- **`lint-staged`** em `package.json`:
  ```json
  "lint-staged": { "*.{astro,ts,tsx,js,mjs,cjs,json,md,css}": ["prettier --write"] }
  ```
- `husky init` → hooks:
  - `.husky/pre-commit`: `pnpm exec lint-staged`
  - `.husky/commit-msg`: `pnpm exec commitlint --edit "$1"`

## Critério de Aceite

- `pnpm install --frozen-lockfile` passa (lockfile inicial gerado).
- `pnpm exec astro --version` → 5.18.x.
- `pnpm exec astro check` 0 erros.
- `pnpm build` produz `dist/` válido (mesmo com Layout placeholder).
- `pnpm exec wrangler --version` → 4.x (ou local; no CI será global).
- Página teste com `class="bg-background text-foreground"` renderiza sem build error (mesmo com tokens vazios — virão em T03).
- `make check` roda `astro check` com sucesso.
- Commit `wip` rejeitado; `feat(bootstrap): tooling` aceito.
- Stage de arquivo malformatado → hook `lint-staged` formata antes do commit.

## Definition of Done

- Todos arquivos raiz versionados.
- `pnpm-lock.yaml` versionado.
- Hooks Husky funcionando (validados manualmente com commit válido + inválido).
- Pronto para T03 preencher `@theme` e T04 começar `content.ts`.

## Riscos

- Divergência de minor entre Astro 5.18 e Tailwind v4.3 — fixar exatamente nas versões LT (T01.referencias.md).
- Husky 9+ instala hooks em `.husky/_/` — usar `husky init` (não a forma legada).
- pnpm + wrangler em CI: manter `wrangler` global no workflow (decisão LT, ver T09).

## Paralelização recomendada

- 2 subagentes após passo 1:
  - Agente A: passo 2 (Tailwind ativo + Layout placeholder).
  - Agente B: passo 3 (Husky + lint-staged + commitlint).
- Passos não tocam arquivos comuns (exceto `package.json` — coordenar via PR único ou pré-merge).
