# T09 — SEO + Assets + CI/CD + Cloudflare Pages

**Fase mestre:** 5 + 6 (E5.1, E5.2, E5.3, E5.4, E6.1, E6.2, E6.3, E6.4, E6.5)
**Dependências:** T02 (config raiz), T04 (content + Icon), T05 (Layout), T08 (CookieConsent — JSON-LD/GA gating); T01 (CODEOWNERS)
**Paralelizável dentro:** ✅✅ — bloco SEO/Assets ║ bloco CI/CD (até 6 subagentes); mascotes e favicon antes para destravar T07/T08
**Bloqueia:** T10 (precisa de pipeline + assets para validar)

## Objetivo

Entregar SEO técnico completo (canonical, OG, Twitter, JSON-LD, sitemap, robots), otimizar mascotes via Astro Image, criar favicon + OG image, headers de segurança/cache, workflow de deploy para Cloudflare Pages, CI gate de PR, e doc operacional.

> Algumas subatividades (mascotes, favicon, CSP em `_headers`) podem ser **adiantadas** para destravar T07/T08, e o restante (deploy, ci, doc) executado em paralelo após T08.

## Subatividades

### Bloco A — Assets

#### A.1 Mascotes via Astro `<Image>` nativo

- Mover JPEGs baixados em T01 para `src/assets/mascotes/`:
  - `resumo-mes.jpeg`
  - `meta-concluida.jpeg`
- Em MeetMascot/MascotStripGoal/404 usar:
  ```astro
  import {Image} from 'astro:assets'; import mascote from '../../assets/mascotes/resumo-mes.jpeg';
  <Image
    src={mascote}
    widths={[480, 768, 1200]}
    formats={['avif', 'webp', 'jpg']}
    loading="lazy"
    decoding="async"
    alt="..."
  />
  ```
- Hero não usa mascote como LCP (LCP é o h1); se for usar imagem above-the-fold, `loading="eager"` + `fetchpriority="high"`.

#### A.2 Favicon + OG image

- `public/favicon.svg`: SVG derivado do símbolo mascote `#mc-face`, simplificado para viewBox 32×32.
- `public/og-image.svg` 1200×630: logo + headline "Sua vida financeira organizada, direto no WhatsApp." + paleta MeControla.
- Makefile target `og-image` converte SVG→PNG via `rsvg-convert` (mesmo padrão LT).
- `public/og-image.png` versionado (saída do conversor).

### Bloco B — SEO técnico

#### B.1 `public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://mecontrola.app.br/sitemap-index.xml
```

#### B.2 Sitemap via `@astrojs/sitemap`

- Integração já adicionada em T02. Validar: `dist/sitemap-index.xml` lista `/`.

#### B.3 JSON-LD no Layout

- Em `src/layouts/Layout.astro` head, injetar `<script type="application/ld+json">` com:

**Organization:**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MeControla",
  "legalName": "",
  "url": "https://mecontrola.app.br",
  "logo": "https://mecontrola.app.br/og-image.png",
  "email": "contato@limateixeira.com.br",
  "taxID": "52.162.759/0001-74",
  "sameAs": ["https://www.instagram.com/limateixeiraconsulting/"]
}
```

`legalName` fica vazio com comentário TODO — não bloqueia deploy, mas plano de follow-up obriga preencher antes de campanhas pagas.

**WebSite + WebPage:** por rota; WebPage por página (`url`, `name`, `description`, `isPartOf`).

#### B.4 Preconnect/dns-prefetch (condicional ao consent)

- Sem preconnect a `googletagmanager.com` antes de consent.
- Após `consent-granted` event (T08), CookieConsent script pode inserir `<link rel="preconnect">` dinamicamente.

### Bloco C — Headers de segurança/cache (`public/_headers`)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; font-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
  Cache-Control: public, max-age=0, must-revalidate

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

### Bloco D — Workflow `.github/workflows/deploy.yml`

- Triggers: `push` em `main` + `workflow_dispatch`.
- `concurrency: { group: deploy-main, cancel-in-progress: true }`.
- Steps:
  1. `actions/checkout`.
  2. `pnpm/action-setup` (via `packageManager` do package.json).
  3. `actions/setup-node` Node 24.15.0 com `cache: pnpm`.
  4. `pnpm install --frozen-lockfile`.
  5. `./node_modules/.bin/astro build` com env `PUBLIC_GA_ID: ${{ secrets.PUBLIC_GA_ID }}`.
  6. `npm i -g wrangler@4` (FORA do pnpm, igual LT).
  7. Idempotent project create: `wrangler pages project create mecontrola-landingpage --production-branch=main || true`.
  8. `wrangler pages deploy dist --project-name=mecontrola-landingpage --branch=main`.
- Secrets necessários: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, opcional `PUBLIC_GA_ID`.

### Bloco E — Workflow `.github/workflows/ci.yml` (PR gate)

- Trigger: `pull_request` para `main`.
- Jobs separados (para alinhar com required status checks de T01):
  - **`ci/check`**: `pnpm exec astro check`.
  - **`ci/lint`**: `pnpm exec prettier --check .`.
  - **`ci/build`**: `pnpm build` + upload `dist/` como artifact (retenção 7 dias).
- Setup compartilhado por job: pnpm + Node 24.15.0 + cache + install.

### Bloco F — Cloudflare Pages (projeto + domínio)

- Confirmar/criar projeto `mecontrola-landingpage` no CF (primeiro deploy faz idempotente).
- Custom domain `mecontrola.app.br` (apex).
- `www.mecontrola.app.br` → 301 → apex (via CF redirect rule).
- SSL: Full (strict); Always HTTPS; Auto Rewrites.
- Validar pós-deploy: `curl -I https://mecontrola.app.br` retorna 200 + todos os headers do Bloco C.

### Bloco G — `docs/DEPLOY.md`

- Arquitetura: GitHub Actions → wrangler → Cloudflare Pages.
- Setup tokens CF (passo a passo: criar API Token com permissão `Cloudflare Pages: Edit`).
- Lista de secrets e como configurar via `gh secret set`.
- Runbook: como promover, como reverter (re-deploy de commit anterior via `wrangler`).
- Troubleshooting: erros comuns (`wrangler` permissão, build falhando, CSP violations).

### Bloco H — Ativar branch protection (deferred de T01)

- Após blocos D e E funcionando (jobs `ci/check`, `ci/lint`, `ci/build` existem como checks):
  - `gh api -X PUT repos/LimaTeixeiraTecnologia/mecontrola-landingpage/branches/main/protection` com:
    - `required_status_checks: { strict: true, contexts: ["ci/check","ci/lint","ci/build"] }`.
    - `enforce_admins: false`.
    - `required_pull_request_reviews: { required_approving_review_count: 1, dismiss_stale_reviews: true }`.
    - `required_linear_history: true`.
    - `allow_force_pushes: false`.
    - `allow_deletions: false`.

## Critério de Aceite

- `dist/` contém variantes AVIF/WebP/JPEG das mascotes; `<picture>` correto no HTML.
- LCP da seção mascote ≤ 2.5s mobile (Lighthouse T10).
- `public/favicon.svg`, `public/og-image.svg`, `public/og-image.png` versionados; `make og-image` regenera PNG.
- `dist/sitemap-index.xml` existe e referencia `/`; `robots.txt` retorna 200 em produção.
- JSON-LD Organization+WebSite+WebPage parseável; Rich Results Test sem erros (legalName vazio aceito como TODO).
- Headers de `_headers` aplicados em produção (validar com `curl -I` em T10/T11): Mozilla Observatory ≥ A.
- `/_astro/*` com `max-age=31536000, immutable`; HTML com `max-age=0, must-revalidate`.
- CSP libera googletagmanager para que GA4 funcione **após** consent (T08); zero CSP violations no console.
- `deploy.yml` dry-run em branch teste (workflow_dispatch) conclui sem erro; secrets configurados.
- `ci.yml` falha em PR com `wip` no commit, com arquivo malformatado, ou com erro TS.
- Cloudflare Pages projeto criado; `mecontrola.app.br` acessível com SSL Full strict; `www` 301 → apex.
- `docs/DEPLOY.md` permite que novo dev faça deploy seguindo apenas o doc.
- Branch protection ativa em `main`; push direto rejeitado.

## Definition of Done

- Bloco A entregue **antes** de T07.MeetMascot/MascotStripGoal e T08.404 (ou via stub local na sequência paralela).
- Bloco C entregue **antes** de T08.CookieConsent (CSP libera googletagmanager).
- Blocos B, D, E, F, G entregues em paralelo ou logo após T08.
- Bloco H ativado **apenas após** D e E rodarem com sucesso em ao menos um PR (para checks existirem).
- `pnpm build` localmente equivale ao que o CI gera.

## Riscos

- pnpm + wrangler conflito → manter wrangler global (decisão LT mantida).
- Secrets ausentes → workflow falha rápido com mensagem clara; documentar em DEPLOY.md.
- CSP violation em produção (algum SVG/script novo) → validar em T10/T11; ajustar `_headers` se necessário.
- LCP estourar por mockup denso → corrigir cedo via Lighthouse local.
- Branch protection ativada antes dos checks existirem → bloqueia bootstrap; ativar somente em Bloco H.

## Paralelização recomendada

- Spawn de 6 subagentes simultâneos para os blocos A–G (exceto H que é gate final):
  - Agente 1 (asset/sharp): Bloco A (mascotes + favicon + OG).
  - Agente 2 (SEO): Bloco B + Bloco C (headers + JSON-LD).
  - Agente 3 (CI/CD): Bloco D (deploy.yml).
  - Agente 4 (CI/CD): Bloco E (ci.yml).
  - Agente 5 (CF): Bloco F (projeto + domínio).
  - Agente 6 (docs): Bloco G (DEPLOY.md).
- Bloco H executado por humano/agente após D+E mergeados.
