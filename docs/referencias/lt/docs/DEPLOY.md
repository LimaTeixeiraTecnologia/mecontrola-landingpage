# Deploy — Cloudflare Pages + GitHub Actions

Deploy automatizado do site (Astro 5, estático) no **Cloudflare Pages** via **GitHub Actions**.
Custo zero, HTTPS forçado, security headers, cache de assets imutáveis e redirect `www → apex`.

- **Domínio canônico:** `https://limateixeira.com.br`
- **Redirect:** `www.limateixeira.com.br` → apex (301)
- **Projeto Pages:** `limateixeira-landingpage` (tipo **Direct Upload**)
- **Branch de produção:** `main`

## Arquitetura

```
push em main ──▶ GitHub Actions ──▶ pnpm install ──▶ astro build (dist/) ──▶ wrangler pages deploy ──▶ Cloudflare Pages ──▶ limateixeira.com.br
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

---

## Setup inicial (uma vez)

### 1. API Token da Cloudflare

1. Cloudflare Dashboard → **My Profile → API Tokens → Create Token**.
2. Use o template **"Edit Cloudflare Workers"** ou crie um custom token com a permissão:
   - `Account` → `Cloudflare Pages` → **Edit**
3. Copie o token gerado (`CLOUDFLARE_API_TOKEN`).
4. Pegue o **Account ID** em qualquer página do dashboard (sidebar/URL) → `CLOUDFLARE_ACCOUNT_ID`.

### 2. Criar o projeto Pages (Direct Upload)

**Opcional** — o workflow cria o projeto automaticamente no primeiro deploy
(`wrangler pages project list || pages project create`). Se preferir criar manualmente:

```bash
# requer o token exportado na sessão
export CLOUDFLARE_API_TOKEN=***
export CLOUDFLARE_ACCOUNT_ID=***
npx wrangler pages project create limateixeira-landingpage --production-branch=main
```

> Alternativa via dashboard: **Workers & Pages → Create → Pages → Direct Upload**,
> nome `limateixeira-landingpage`, production branch `main`.

### 3. GitHub Secrets

Repositório → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret                  | Obrigatório | Descrição                                                                       |
| ----------------------- | ----------- | ------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | ✅          | Token criado no passo 1                                                         |
| `CLOUDFLARE_ACCOUNT_ID` | ✅          | Account ID da Cloudflare                                                        |
| `PUBLIC_GA_ID`          | ⬜ Opcional | Measurement ID do GA4 (`G-XXXXXXXXXX`). Sem ele, o Analytics não é renderizado. |

### 4. Domínio customizado

No projeto Pages → **Custom domains → Set up a custom domain**, adicione **os dois**:

- `limateixeira.com.br`
- `www.limateixeira.com.br`

A Cloudflare cria/ajusta os registros DNS automaticamente (a zona já está na conta).

**Redirect `www → apex` (301).** O `_redirects` do Pages **não** suporta match por hostname,
então o redirect é feito por uma Redirect Rule na zona: **Rules → Redirect Rules → Create rule**:

- _When incoming requests match:_ `Hostname equals www.limateixeira.com.br`
  (expressão: `http.host eq "www.limateixeira.com.br"`)
- _Then:_ **Dynamic redirect** →
  - Expression: `concat("https://limateixeira.com.br", http.request.uri.path)`
  - Status: `301` · Preserve query string: ON

(Para o caso simples, _Static redirect_ → `https://limateixeira.com.br` também resolve, sem
preservar o caminho.)

### 5. SSL/TLS e HTTPS

Na zona `limateixeira.com.br` (dashboard):

- **SSL/TLS → Overview:** modo **Full (strict)**
- **SSL/TLS → Edge Certificates:**
  - **Always Use HTTPS** → ON
  - **Automatic HTTPS Rewrites** → ON

Brotli/gzip são aplicados automaticamente pela Cloudflare — nenhuma configuração necessária.

### 6. Primeiro deploy

- Faça `push` em `main`, **ou**
- Acione manualmente: **Actions → "Deploy to Cloudflare Pages" → Run workflow**.

---

## Operação no dia a dia

- Todo `push` em `main` dispara build + deploy de produção automaticamente.
- O `concurrency` cancela um deploy em andamento se um novo push chegar.
- Rollback: **Cloudflare Pages → Deployments → (deploy anterior) → Rollback**.

---

## Troubleshooting

**Build falha em `esbuild`/`sharp` ("could not be built" ou binário ausente).**
O pnpm v11 exige aprovação de build-scripts de dependências. O projeto já declara isso em
`package.json` (`pnpm.allowBuilds`) e `pnpm-workspace.yaml`. O workflow chama
`./node_modules/.bin/astro build` diretamente para contornar o quirk do wrapper de scripts
do pnpm v11. Se ainda falhar, force a reconstrução: `pnpm rebuild esbuild sharp`.

**Deploy falha ao instalar o wrangler (`ERR_PNPM_IGNORED_BUILDS` ou `Cannot read
properties of null`).**
Não instale o wrangler dentro do projeto: o `node_modules` do pnpm é simbólico e quebra
tanto o gate de build-scripts do pnpm (dep `workerd`) quanto o arborist do npm. Por isso o
workflow instala o wrangler **globalmente** (`npm install -g wrangler@4`) e chama o binário
direto com autenticação por variáveis de ambiente, sem o `cloudflare/wrangler-action`.

**`wrangler` pede confirmação interativa / "project not found".**
O projeto Pages não existe. Rode o passo 2 (criação) antes do deploy.

**Deploy vai para "preview" em vez de produção.**
Garanta `--branch=main` no comando do workflow e que a production branch do projeto é `main`.

**`www` não redireciona para o apex (serve 200 em vez de 301).**
O `_redirects` do Pages não faz redirect por hostname. Crie a Redirect Rule da zona
(passo 4). Confirme também que `www.limateixeira.com.br` está anexado como custom domain.

**Violações de CSP no console (ex.: scripts/recursos bloqueados).**
A CSP está em `public/_headers`. Ela libera inline scripts (JSON-LD + bootstrap do gtag) e
os domínios do GA4. Ao adicionar terceiros (ex.: outro script externo), inclua o domínio na
diretiva apropriada (`script-src`, `connect-src`, `img-src`).

**GA4 não aparece em produção.**
`PUBLIC_GA_ID` é lido em **tempo de build**. Adicione-o como GitHub Secret (passo 3) e
rode um novo deploy — variáveis `PUBLIC_*` do Astro são embutidas no build.

---

## Verificação pós-deploy

```bash
# Página principal: 200 + headers de segurança
curl -sI https://limateixeira.com.br | grep -iE 'HTTP/|strict-transport|content-security|x-content-type'

# www -> apex (301)
curl -sI https://www.limateixeira.com.br | grep -iE 'HTTP/|location'

# Assets imutáveis (substitua pelo nome real do arquivo em /_astro/)
curl -sI https://limateixeira.com.br/_astro/<arquivo>.css | grep -i cache-control

# SEO
curl -s https://limateixeira.com.br/robots.txt
curl -s https://limateixeira.com.br/sitemap-index.xml
```

Recomendado: validar os headers em <https://securityheaders.com> (alvo: nota **A**).
