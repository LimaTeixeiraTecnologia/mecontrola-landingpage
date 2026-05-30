# T08 — Compose index + CookieConsent (LGPD) + 404 custom

**Fase mestre:** 4.13 + 4.14 + 4.15 (E4.13, E4.14, E4.15)
**Dependências:** T05 (Layout), T06 (chrome + Hero), T07 (todas as seções), T09.parcial (mascote para 404 + CSP base do `_headers`)
**Paralelizável dentro:** parcial — compose sequencial; CookieConsent + 404 paralelos a compose
**Bloqueia:** T10 (Playwright)

## Objetivo

Montar a página `/` (compor todas as seções na ordem do preview), implementar o banner LGPD com gating de GA4, e a página 404 custom on-brand.

## Subatividades

### 1. `src/pages/index.astro` — compose

- Import Layout com props:
  - `title="MeControla — Sua vida financeira organizada, direto no WhatsApp."`
  - `description=` (extraído do hero do `content.ts`).
  - `canonical="https://mecontrola.app.br/"`.
  - `ogImage="https://mecontrola.app.br/og-image.png"`.
- Montar seções em **ordem do preview**:
  1. (Header — via Layout)
  2. `<Hero />`
  3. `<MeetMascot />`
  4. `<Benefits />`
  5. `<HowItWorks />`
  6. `<ForWhom />`
  7. `<Pricing />`
  8. `<Faq />`
  9. `<MascotStripGoal />`
  10. `<FinalCta />`
  11. (Footer — via Layout)
  12. (MobileStickyBar + CookieConsent — via Layout)

### 2. `src/components/CookieConsent.astro` — banner UI

- `<aside class="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">`.
- Copy: "Usamos cookies para entender uso do site e melhorar sua experiência. Você pode aceitar ou recusar a qualquer momento."
- Botões: `<Button variant="primary">Aceitar</Button>` + `<Button variant="ghost">Recusar</Button>`.
- Aparece **apenas** se `localStorage.mecontrola_consent` ausente; oculta após decisão.
- Não causa layout shift no conteúdo principal (pode-se reservar bottom-padding em mobile).

### 3. `src/components/CookieConsent.astro` — lógica (script externo)

- Script TS em arquivo separado (não inline, para manter CSP rígido):
  - `src/scripts/cookie-consent.ts`.
- Comportamento:
  - Ao carregar: ler `localStorage.mecontrola_consent` (`'accepted' | 'declined' | null`); se `null`, mostrar banner.
  - Click "Aceitar": grava `'accepted'`, dispara `window.dispatchEvent(new CustomEvent('consent-granted'))`, esconde banner, **injeta GA4** se `import.meta.env.PUBLIC_GA_ID` definido.
  - Click "Recusar": grava `'declined'`, esconde banner, **nenhum** script de tracking carregado (nem agora nem em reloads futuros).
- Persistência entre reloads validada.

### 4. Injeção dinâmica de GA4 (após consent)

- Função `loadGA(id: string)`:
  - Cria `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}">`.
  - Inicializa `window.dataLayer` + `gtag('js', new Date())` + `gtag('config', id, { anonymize_ip: true })`.
- **GA4 nunca carrega antes de Accept** — bloqueador absoluto LGPD; validado em T10.5.

### 5. `src/pages/404.astro` — custom on-brand

- Usa Layout com `title="Página não encontrada — MeControla"`, `description="Esta página decidiu sumir."`, canonical apontando para `/`.
- Conteúdo:
  - Mascote `brand-mascote-resumo-mes` (via Astro `<Image>`, T09).
  - h1: "Esta página decidiu sumir."
  - Body: "Mas relaxa: sua organização financeira começa por aqui."
  - `<Button variant="primary" href="/">Voltar para o início</Button>`.
- Cloudflare Pages serve `dist/404.html` automaticamente em rotas inexistentes.

## Critério de Aceite

- `src/pages/index.astro` renderiza as 12 seções na ordem correta sem console errors/warnings.
- Visualmente fiel ao preview HTML em 375/768/1280/1920 (validado em T10).
- `pnpm exec astro check` 0 erros.
- Banner LGPD aparece em primeiro acesso; some após decisão; reaparece se `localStorage` limpo.
- Playwright (T10.5) confirma:
  - Zero requests a `googletagmanager.com` ou `google-analytics.com` antes de clicar "Aceitar".
  - Após "Aceitar" com `PUBLIC_GA_ID` definido: request a gtag aparece.
  - Após "Recusar": tag **nunca** carrega, mesmo em reload.
  - Preferência persiste entre reloads.
- Página `/404` retorna status 404 (validado via Playwright contra build); CTA "Voltar" funcional.
- CSP de `_headers` (T09) libera `googletagmanager.com` em `script-src` — sem violations em devtools.

## Definition of Done

- `src/pages/index.astro`, `src/pages/404.astro`, `src/components/CookieConsent.astro`, `src/scripts/cookie-consent.ts` versionados.
- Layout (T05) atualizado para incluir `<CookieConsent />` no slot apropriado (após `<slot />`, antes do `</body>`).
- `pnpm build` produz `dist/index.html` + `dist/404.html`.
- Pronto para T10 (Playwright) validar todos os fluxos.

## Riscos

- CSP rígido + script inline: usar script externo (já decidido) ou hash; **não** introduzir `'unsafe-inline'` no script-src.
- `localStorage` indisponível (modo privado em alguns browsers): degradar graciosamente (banner sempre aparece, GA nunca carrega).
- 404 deve ser SSR-correto: Cloudflare Pages usa `404.html` estático — confirmar via teste real em T10/T11.

## Paralelização recomendada

- Agente A: passo 1 (compose `index.astro`) — sequencial, depende de T07.
- Agente B: passos 2–4 (CookieConsent) — paralelo a A.
- Agente C: passo 5 (404) — paralelo a A e B.
- 3 agentes simultâneos, integração final via PR único.
