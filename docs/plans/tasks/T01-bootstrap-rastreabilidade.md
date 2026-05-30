# T01 — Bootstrap & Rastreabilidade

**Fase mestre:** 0 (E0.1, E0.2, E0.3)
**Dependências:** nenhuma
**Paralelizável dentro:** ✅ — `gh` refs LT ║ mecontrola-docs (2 subagentes Explore)
**Bloqueia:** T02 em diante

## Objetivo

Preparar terreno: validar `gh` CLI, capturar referências fiéis de LT e mecontrola-docs, inicializar repo Git local, vincular remote, configurar CODEOWNERS e (após T09) ativar branch protection.

## Subatividades

### 1. Validar `gh` CLI

- `gh auth status` retorna usuário `JailtonJunior94` com escopo `repo`.
- `gh api user` confirma login.

### 2. Snapshot e download de `LimaTeixeiraTecnologia/limateixeira-landingpage`

- `gh api repos/.../git/trees/main?recursive=1` → salvar em `docs/referencias/lt/tree.json` (SHA registrado).
- Baixar conteúdo decodificado (UTF-8) dos arquivos:
  - raiz: `package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.toml`, `Makefile`, `.gitignore`, `.editorconfig`, `.prettierrc`, `README.md`
  - `public/_headers`, `public/robots.txt`
  - `src/styles/global.css`
  - `src/layouts/Layout.astro`
  - `src/components/{Header,Footer,Logo}.astro`
  - `src/components/ui/{Button,Card,Icon,SectionHeader}.astro`
  - todos `src/components/sections/*.astro`
  - `src/lib/{content.ts,cn.ts}`
  - `src/pages/{index,politica-de-privacidade,lgpd}.astro`
  - `.github/workflows/deploy.yml`
  - `docs/DEPLOY.md`
- Para cada: registrar URL `gh api` exata + SHA blob em `docs/referencias.md`.

### 3. Snapshot e download de `mecontrola-docs/landing-page`

- Baixar:
  - `preview-landing-page-sprint-1.html` (~28 KB)
  - `brand-mascote-resumo-mes.jpeg` (~161 KB)
  - `brand-mascote-meta-concluida.jpeg` (~141 KB)
- Validar UTF-8 íntegro no HTML (acentuação: "Conheça", "está", "também"); `file` confirma `JPEG image data`.

### 4. Consolidar `docs/referencias.md`

- Para cada arquivo: URL gh, SHA, propósito (uma linha), task downstream que o consome (T02..T09).
- Nenhum arquivo citado nas tasks subsequentes pode ficar sem entrada no doc.

### 5. Inicializar repositório local

- `git init` em `/Users/jailtonjunior/Git/mecontrola-landingpage`.
- `.gitignore` clonado de LT (contém: `node_modules`, `dist`, `.astro`, `.wrangler`, `.DS_Store`, `.env*`, `*.log`).
- Commit inicial: `chore: bootstrap repository` na branch `main`.

### 6. Vincular remote `origin`

- `git remote add origin git@github.com:LimaTeixeiraTecnologia/mecontrola-landingpage.git`.
- `gh repo view LimaTeixeiraTecnologia/mecontrola-landingpage` confirma acesso.
- `git push -u origin main` bem-sucedido.

### 7. CODEOWNERS

- Criar `.github/CODEOWNERS` com `* @JailtonJunior94`.
- Commit `chore: add CODEOWNERS`.

### 8. Branch protection (DEFERRED para após T09)

- Após CI (`ci/check`, `ci/lint`, `ci/build`) e deploy existirem, ativar via `gh api -X PUT repos/.../branches/main/protection`:
  - PR obrigatório, dismiss stale reviews, linear history.
  - Required status checks: `ci/check`, `ci/lint`, `ci/build`.
  - 1 review (self-approve permitido enquanto único maintainer).

## Critério de Aceite

- `gh auth status` ok com escopo `repo`.
- `docs/referencias.md` lista TODOS os arquivos LT + mecontrola-docs com SHA e URL `gh api`.
- 3 arquivos do mecontrola-docs presentes em `docs/referencias/mecontrola-docs/landing-page/` com encoding íntegro.
- `git remote -v` mostra origin LimaTeixeiraTecnologia; `main` configurada como upstream.
- `.github/CODEOWNERS` versionado.
- Branch protection ativa **somente** após T09 (sem bloquear bootstrap).

## Definition of Done

- Commit bootstrap empurrado para `origin/main`.
- `docs/referencias.md` revisado contra seção 3 do planejamento mestre — zero gaps.
- Pronto para T02 ler os arquivos baixados em `docs/referencias/lt/` como fonte de verdade.

## Riscos

- Rate limit `gh api` em downloads massivos → usar `--paginate` ou batches; cachear localmente.
- Permissão SSH/HTTPS ausente na org → validar com `ssh -T git@github.com`.
- Acentuação corrompida em base64 → validar com `file` e inspeção visual antes de T04 transcrever copy.
- Token expirado → `gh auth refresh -s repo`.

## Paralelização recomendada

- 2 subagentes Explore: um para LT (passo 2), outro para mecontrola-docs (passo 3), em paralelo.
- Consolidação (passo 4) sequencial.
