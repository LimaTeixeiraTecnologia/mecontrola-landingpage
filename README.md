# MeControla — Landing Page

Landing page institucional do MeControla, construída com Astro 5 + Tailwind v4 e deployada no Cloudflare Pages.

## Comandos

| Comando         | Descrição                                              |
| --------------- | ------------------------------------------------------ |
| `make install`  | Instala as dependências                                |
| `make dev`      | Inicia o servidor local (`http://localhost:4321`)      |
| `make build`    | Gera a build estática em `dist/`                       |
| `make preview`  | Preview local da build                                 |
| `make check`    | Valida arquivos Astro e TypeScript                     |
| `make clean`    | Remove `.astro/` e `dist/`                             |
| `make reset`    | Remove `node_modules/`, `.astro/` e `dist/`            |
| `make og-image` | Converte `public/og-image.svg` → `public/og-image.png` |

## Placeholders pendentes (obrigatório antes de campanhas pagas)

- `WHATSAPP_URL` em `src/lib/content.ts` — URL real do WhatsApp Business
- `CHECKOUT_URL_MENSAL` em `src/lib/content.ts` — URL de checkout plano mensal
- `CHECKOUT_URL_TRIMESTRAL` em `src/lib/content.ts` — URL de checkout plano trimestral
- `CHECKOUT_URL_ANUAL` em `src/lib/content.ts` — URL de checkout plano anual
- `LEGAL_NAME` em `src/lib/content.ts` — Razão social oficial

## LGPD / Consent

O banner de cookies (`CookieConsent`) implementa gating LGPD sobre o Google Analytics 4:

- GA4 **nunca** carrega antes do usuário clicar "Aceitar".
- A preferência persiste em `localStorage.mecontrola_consent`.
- `PUBLIC_GA_ID` deve ser configurado como secret no GitHub Actions para ativar o tracking em produção.

## Deploy

Ver `docs/DEPLOY.md` para arquitetura, setup de secrets e runbook operacional.
