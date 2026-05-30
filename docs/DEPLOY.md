# Deploy — Cloudflare Pages + GitHub Actions

Deploy automatizado do site (Astro 5, estático) no **Cloudflare Pages** via **GitHub Actions**.
Custo zero, HTTPS forçado, security headers, cache de assets imutáveis e redirect `www → apex`.

- **Domínio canônico:** `https://mecontrola.app.br`
- **Redirect:** `www.mecontrola.app.br` → apex (301)
- **Projeto Pages:** `mecontrola-landingpage` (tipo **Direct Upload**)
- **Branch de produção:** `main`

## Arquitetura

```
push em main ──▶ GitHub Actions ──▶ pnpm install ──▶ astro build (dist/) ──▶ wrangler pages deploy ──▶ Cloudflare Pages ──▶ mecontrola.app.br
```

O build roda no GitHub Actions (logs e reprodutibilidade no GitHub) e o artefato `dist/` é
publicado no Pages com o `wrangler` (instalado globalmente, chamado direto). O Pages serve o
site na borda da Cloudflare, aplicando o `_headers` incluído no build.

O redirect `www → apex` **não** é feito por arquivo no Pages (o `_redirects` não suporta
match por hostname) — é uma **Redirect Rule** na zona (ver passo 4).

Arquivos relevantes:

| Arquivo                        | Função                                               |
| ------------------------------ | ---------------------------------------------------- |
| `.github/workflows/deploy.yml` | Pipeline de build + deploy                           |
| `wrangler.toml`                | Nome do projeto Pages e diretório publicado (`dist`) |
| `public/_headers`              | Security headers + política de cache                 |
| `src/lib/content.ts`           | Placeholders de URLs de negócio (ver seção abaixo)   |

---

## Pré-requisitos

| Ferramenta        | Versão mínima                     |
| ----------------- | --------------------------------- |
| Node.js           | 24.15+                            |
| pnpm              | 11.1.2                            |
| wrangler (global) | 4.x — `npm install -g wrangler@4` |

---

## Setup inicial (uma vez)

### 1. API Token da Cloudflare

1. Cloudflare Dashboard → **My Profile → API Tokens → Create Token**.
2. Crie um **Custom token** com a permissão:
   - `Account` → `Cloudflare Pages` → **Edit**
3. Copie o token gerado (`CLOUDFLARE_API_TOKEN`).
4. Pegue o **Account ID** no sidebar direito de qualquer página do dashboard → `CLOUDFLARE_ACCOUNT_ID`.

```bash
# 1. Criar API Token no Cloudflare
# Dashboard → My Profile → API Tokens → Create Token
# Template: Custom token, permissão: Cloudflare Pages - Edit

# 2. Configurar secrets no GitHub
gh secret set CLOUDFLARE_API_TOKEN --body "seu-token"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "seu-account-id"
gh secret set PUBLIC_GA_ID --body "G-XXXXXXXXXX"  # opcional
```

### 2. GitHub Secrets

Repositório → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret                  | Obrigatório | Descrição                                                                                                                                 |
| ----------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | ✅          | Token criado no passo 1, permissão `Cloudflare Pages: Edit`                                                                               |
| `CLOUDFLARE_ACCOUNT_ID` | ✅          | Account ID da Cloudflare (sidebar do dashboard)                                                                                           |
| `PUBLIC_GA_ID`          | ⬜ Opcional | Measurement ID do GA4 (`G-XXXXXXXXXX`). GA4 nunca carrega antes do consentimento do usuário (LGPD). O build funciona normalmente sem ele. |

### 3. Domínio customizado

No projeto Pages → **Custom domains → Set up a custom domain**, adicione:

- `mecontrola.app.br`

**Redirect `www → apex` (301).** O `_redirects` do Pages não suporta match por hostname,
então o redirect é feito por uma **Redirect Rule** na zona:
**Rules → Redirect Rules → Create rule**:

- _When incoming requests match:_ `Hostname equals www.mecontrola.app.br`
  (expressão: `http.host eq "www.mecontrola.app.br"`)
- _Then:_ **Dynamic redirect** →
  - Expression: `concat("https://mecontrola.app.br", http.request.uri.path)`
  - Status: `301` · Preserve query string: ON

### 4. SSL/TLS e HTTPS

Na zona `mecontrola.app.br` (dashboard):

- **SSL/TLS → Overview:** modo **Full (strict)**
- **SSL/TLS → Edge Certificates:**
  - **Always Use HTTPS** → ON
  - **Automatic HTTPS Rewrites** → ON

### 5. Primeiro deploy

- Faça `push` em `main`, **ou**
- Acione manualmente: **Actions → "Deploy to Cloudflare Pages" → Run workflow**.

O workflow cria o projeto Pages automaticamente no primeiro deploy caso ele ainda não exista.

---

## Operação no dia a dia

- Todo `push` em `main` dispara build + deploy de produção automaticamente.
- O `concurrency` cancela um deploy em andamento se um novo push chegar.

### Deploy manual (via workflow_dispatch)

```bash
gh workflow run deploy.yml
```

### Deploy local (emergência)

```bash
pnpm build
npm install -g wrangler@4
wrangler pages deploy dist --project-name=mecontrola-landingpage --branch=main
```

> Exige `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` exportados na sessão local,
> ou autenticação prévia via `wrangler login`.

### Reverter para commit anterior

```bash
git checkout <commit-sha>
pnpm build
wrangler pages deploy dist --project-name=mecontrola-landingpage --branch=main
```

Alternativa sem rebuild: **Cloudflare Pages → Deployments → (deploy anterior) → Rollback**.

---

## Placeholders obrigatórios antes de campanhas pagas

Os itens abaixo estão em `src/lib/content.ts` e precisam ser preenchidos antes de qualquer
campanha paga ou divulgação pública:

| Placeholder               | Descrição                           |
| ------------------------- | ----------------------------------- |
| `WHATSAPP_URL`            | URL do WhatsApp Business            |
| `CHECKOUT_URL_MENSAL`     | URL de checkout do plano mensal     |
| `CHECKOUT_URL_TRIMESTRAL` | URL de checkout do plano trimestral |
| `CHECKOUT_URL_ANUAL`      | URL de checkout do plano anual      |
| `LEGAL_NAME`              | Razão social oficial da empresa     |

---

## Troubleshooting

**`ERR_PNPM_IGNORED_BUILDS` ao instalar dependências.**
O pnpm v11 exige aprovação de build-scripts. Rode:

```bash
pnpm approve-builds --all && pnpm install
```

**Build falha no CI.**
Verifique se `PUBLIC_GA_ID` está ausente — isso não deve causar falha, pois o build funciona
sem ele (GA4 é renderizado condicionalmente por consentimento). Se o erro for em
`esbuild`/`sharp`, force a reconstrução: `pnpm rebuild esbuild sharp`.

**CSP violation no console (scripts/recursos bloqueados).**
A CSP está em `public/_headers`. Ao adicionar terceiros, inclua o domínio na diretiva
apropriada (`script-src`, `connect-src`, `img-src`).

**`wrangler` permissão negada / deploy falha com 403.**
Verifique se o token tem a permissão `Cloudflare Pages: Edit`. Tokens com apenas `Workers`
não funcionam para Pages.

**Deploy vai para "preview" em vez de produção.**
Garanta `--branch=main` no comando e que a production branch do projeto é `main`.

**`www` não redireciona para o apex (serve 200 em vez de 301).**
O `_redirects` do Pages não faz redirect por hostname. Crie a Redirect Rule da zona (passo 3).

**GA4 não aparece em produção.**
`PUBLIC_GA_ID` é lido em **tempo de build**. Adicione-o como GitHub Secret e rode um novo
deploy — variáveis `PUBLIC_*` do Astro são embutidas no bundle, não injetadas em runtime.
