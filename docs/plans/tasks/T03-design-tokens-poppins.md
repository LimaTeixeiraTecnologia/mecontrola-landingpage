# T03 — Design Tokens MeControla + Poppins

**Fase mestre:** 2 (E2.1, E2.2)
**Dependências:** T02
**Paralelizável dentro:** ✅ — tokens `@theme` ║ import Poppins (arquivos distintos no global.css mas seções diferentes)
**Bloqueia:** T05

## Objetivo

Modelar a identidade visual MeControla (preto/neon/roxo/Poppins) como tokens semânticos Tailwind v4 conforme skill `.agents/skills/tailwindcss`, e carregar Poppins self-hosted via `@fontsource/poppins` (sem dependência externa, sem alteração de CSP).

## Subatividades

### 1. Tokens de cor — background/surface/foreground/border

Em `src/styles/global.css`, dentro de `@theme`:

```css
--color-background: #0d0d0d;
--color-foreground: #ffffff;
--color-surface: #1f1f1f;
--color-card: #1f1f1f;
--color-card-foreground: #ffffff;
--color-muted-foreground: #b8b8b8;
--color-border: rgba(255, 255, 255, 0.08);
```

### 2. Tokens de ação — primary (neon) / accent (roxo)

```css
--color-primary: #c6ff00; /* neon */
--color-primary-foreground: #0d0d0d;
--color-accent: #7861ff; /* roxo */
--color-accent-foreground: #ffffff;
--color-ring: #c6ff00;
```

Comentário documentando: `primary = neon, accent = roxo` (mapeamento explícito).

### 3. Tokens tipográficos

```css
--font-sans: 'Poppins', system-ui, sans-serif;
--tracking-tight: -0.02em; /* headings */
--tracking-wide: 0.08em; /* tags/eyebrow */
```

Body com `font-family: var(--font-sans)`; headings com `letter-spacing: var(--tracking-tight)`; line-height 1.15 headings / 1.45 body.

### 4. Tokens de sombra + gradiente

```css
--shadow-glow-primary: 0 0 24px rgb(198 255 0 / 0.35);
--shadow-glow-accent: 0 0 24px rgb(120 97 255 / 0.35);
--gradient-final-cta: linear-gradient(160deg, #7861ff 0%, #4b39c0 100%);
```

Uso: `class="shadow-glow-primary"`, `class="bg-[image:var(--gradient-final-cta)]"`.

### 5. Layer base — scroll/anchors/reduced-motion

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }
  [id] {
    scroll-margin-top: 80px;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    ::before,
    ::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
}
```

Keyframes auxiliares (ex.: `fadeIn`) e utilitários (`.scrollbar-none`) clonados de LT.

### 6. Poppins self-hosted via `@fontsource/poppins`

- `pnpm add @fontsource/poppins`.
- Topo de `global.css`, **antes** de `@import "tailwindcss"`:
  ```css
  @import '@fontsource/poppins/500.css';
  @import '@fontsource/poppins/600.css';
  @import '@fontsource/poppins/700.css';
  @import '@fontsource/poppins/800.css';
  ```
- `font-display: swap` default do fontsource — manter.
- Limitar a 4 pesos (500/600/700/800) — sem 100/200/300/400/900 para não inflar bundle.

## Critério de Aceite

- `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-accent`, `text-accent-foreground` resolvem para os valores corretos no CSS gerado (validar via `grep` em `dist/_astro/*.css`).
- `font-sans` no body → computed style = `Poppins`.
- Âncora `#planos` faz scroll suave com offset `80px` (validado em T10 via Playwright).
- `dist/_astro/*.woff2` gerados; **zero** requests externos a `fonts.googleapis.com` ou `gstatic.com`.
- Animações respeitam `prefers-reduced-motion` (testado via devtools rendering).
- `shadow-glow-primary` aplicável; `bg-[image:var(--gradient-final-cta)]` renderiza gradiente 160°.
- Checklist da skill `.agents/skills/tailwindcss` 100% verde: **nenhuma** cor explícita.

## Definition of Done

- `global.css` versionado com tokens completos + Poppins.
- Comentários no CSS explicam mapeamento (`primary=neon`, `accent=roxo`).
- `pnpm build` passa; snapshot do CSS confirma todas as classes resolvendo.
- Bundle de fontes inspecionado: somente Poppins 500/600/700/800.

## Riscos

- Colisão semântica primary/accent: documentar em comentário do CSS (já no item 2).
- Importar pesos demais infla bundle: limitar aos 4 confirmados no preview.
- Tailwind v4 não detecta classes em `src/` se `@source` errado: validar com classe utilitária aleatória.

## Paralelização recomendada

- Agente A: passos 1–5 (tokens em `@theme` + layer base).
- Agente B: passo 6 (Poppins import).
- Conflito de merge mínimo (seções distintas do mesmo arquivo) — coordenar via PR único.
