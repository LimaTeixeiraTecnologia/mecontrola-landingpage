# T06 — Chrome Global (Header/Footer/MobileBar) + Hero + WhatsAppMockup

**Fase mestre:** 4.3 + 4.4 (E4.3, E4.4)
**Dependências:** T05 (Layout + primitives), T04 (content + Icon)
**Paralelizável dentro:** ✅ — chrome ║ Hero+Mockup (subagentes distintos)
**Bloqueia:** T08 (compose final)

## Objetivo

Materializar Header sticky, Footer minimal, MobileStickyBar, e o Hero com seu `WhatsAppMockup.astro` dedicado (componente visualmente mais complexo da landing).

## Subatividades

### 1. `src/components/Header.astro`

- `sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border`.
- Logo: `<a href="/">` com `Me` (text-foreground) + `Controla` (text-primary).
- Nav: link "Ver planos" → `#planos`, com `data-track="cta_header_ver_planos"`.
- Acessível por teclado; respeita reduced-motion na transição do backdrop-blur.

### 2. `src/components/Footer.astro`

- Minimal: logo + tagline ("Menos caos. Mais conquistas.") + linha legal `© 2026 MeControla · CNPJ ${CNPJ} · ${CONTACT_EMAIL}` + Icon Instagram link → `INSTAGRAM_URL`.
- Sem links legais (LGPD/privacidade fora do escopo v1).
- Dados oficiais consumidos de `src/lib/content.ts`.

### 3. `src/components/MobileStickyBar.astro`

- `fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur border-t border-border p-4 flex items-center justify-between gap-3`.
- Conteúdo: "Comece do jeito mais simples" + Button primary "Ver planos" → `#planos` (track `cta_mobile_ver_planos`).
- Respeita `env(safe-area-inset-bottom)` para iOS.

### 4. `src/components/sections/Hero.astro` — coluna texto

- Grid 2 colunas em `md:grid-cols-2 items-center gap-12`; empilha `<md`.
- Coluna esquerda:
  - `<Tag>Menos caos. Mais conquistas.</Tag>`
  - h1: pre "Sua vida financeira organizada, " + `<span class="text-primary">direto no WhatsApp.</span>`
  - sub `text-muted-foreground`.
  - 3 bullets com `<Icon name="check" class="text-primary" />` + texto.
  - Dois CTAs: `<Button variant="primary" href="#planos" dataTrack="cta_hero_ver_planos">Ver planos</Button>` + `<Button variant="ghost" href="#como-funciona" dataTrack="cta_hero_como_funciona">Entender como funciona</Button>`.

### 5. `src/components/sections/hero/WhatsAppMockup.astro` — frame iOS + header WA

- Frame: container `relative rounded-[2.5rem] overflow-hidden bg-[#0B141A] border border-border shadow-2xl` com `aspect-[9/19]` (proporção mobile).
- Status bar iOS topo: "9:41" + ícones SVG (signal, wifi, battery) inline com `width/height` explícitos.
- Header WhatsApp: avatar mascote (Icon `mascot-face`) + nome "MeControla" + status "online" (cor `#00A884`).
- Cores fiéis à paleta WA: `#1F2C33` (header), `#0B141A` (background).

### 6. `WhatsAppMockup.astro` — balões de conversa

- Lista de balões (ordem do preview):
  1. Incoming (esquerda, `bg-[#1F2C33] rounded-2xl`): "80 no cinema 🎬"
  2. Outgoing (direita, `bg-[#005C4B] rounded-2xl`): "Pronto, lancei 😉"
  3. Incoming balão recibo estilizado: categoria + data + valor (mini-card).
  4. Indicador "digitando" (3 dots animando via CSS keyframes; suspenso sob `prefers-reduced-motion`).
- Width/height explícitos em SVGs para zero CLS.

### 7. `WhatsAppMockup.astro` — input bar

- Bottom: `<div class="absolute inset-x-0 bottom-0 p-3 bg-[#1F2C33]">` com:
  - Input fake `<div>` com placeholder "Mensagem".
  - Ícone microfone neon (`text-primary`) circular à direita.

### 8. Hero responsivo

- `<lg`: mockup empilha abaixo do texto.
- 375px: zero overflow horizontal; mockup com `max-width` adequado.
- 1280px+: mockup à direita, texto à esquerda.

## Critério de Aceite

- Header sticky funcional (validado em scroll); backdrop-blur visível.
- Footer mostra logo, tagline, linha legal completa com CNPJ/email/Instagram. Sem links legais.
- MobileStickyBar visível apenas em `<768px`; oculto em `≥768px` (validado em Playwright T10).
- Hero h1 com hierarquia semântica única; CTA primary é botão neon, CTA secondary é ghost.
- Mockup renderiza idêntico ao preview em 1280×800 (snapshot Playwright validado em T10).
- Typing dots animam; param sob `prefers-reduced-motion: reduce`.
- Mockup tem width/height em todos SVGs → CLS = 0 da seção hero (Lighthouse T10).
- Hero empilha corretamente em 375/768; lado-a-lado em 1280/1920.
- Sem texto em imagem.
- Tokens via skill: nenhuma classe `bg-white`/`text-black`/`bg-zinc-*`. Cores WhatsApp puramente cosméticas (paleta WA) podem usar arbitrary values (`bg-[#1F2C33]`) com comentário justificando (não fazem parte do design system MeControla).

## Definition of Done

- 5 arquivos versionados: `Header.astro`, `Footer.astro`, `MobileStickyBar.astro`, `sections/Hero.astro`, `sections/hero/WhatsAppMockup.astro`.
- Layout (T05) atualizado para usar os componentes reais (substitui stubs).
- `pnpm exec astro check` 0 erros.
- `pnpm dev` mostra hero fielmente em 1280px.

## Riscos

- Mockup é o ponto mais visualmente denso e arriscado para CLS/perf → testar Lighthouse cedo (T10).
- Cores hard-coded da paleta WhatsApp podem disparar alerta da skill tailwindcss → documentar exceção (3rd-party brand reference, não design system MeControla).
- Sticky header pode quebrar com fontes carregando late → garantir `font-display: swap` (T03).

## Paralelização recomendada

- Agente A (genérico, médio): passos 1–3 (chrome Header/Footer/MobileBar).
- Agente B (`frontend-design`, complexo): passos 4–8 (Hero + Mockup).
- Independentes; integração no Layout (T05) ao fim.
