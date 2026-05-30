# T05 — Layout base + UI Primitives

**Fase mestre:** 4.1 + 4.2 (E4.1, E4.2)
**Dependências:** T03 (tokens), T04 (tipos + Icon + cn)
**Paralelizável dentro:** ❌ — Layout consome primitives em seguida (cadeia curta)
**Bloqueia:** T06 (chrome/hero), T07 (seções), T08 (compose)

## Objetivo

Materializar o Layout master (`src/layouts/Layout.astro`) com head SEO essencial + slot principal + slots de chrome global, e os UI primitives (`Button`, `Card`, `SectionHeader`, `Tag`) usados por todas as seções.

> SEO completo (JSON-LD) + GA4 gating ficam em T08/T09. Aqui só o head essencial.

## Subatividades

### 1. Layout — head essencial

- `<html lang="pt-BR">`.
- Charset UTF-8, viewport, theme-color (`#0D0D0D`).
- Props: `title: string`, `description: string`, `canonical?: string`, `ogImage?: string`.
- `<title>{title}</title>`, `<meta name="description">`, canonical absoluto.
- Favicon (placeholder até T09; pode apontar para `/favicon.svg`).

### 2. Layout — Open Graph + Twitter Card

- OG: `og:title`, `og:description`, `og:image` (absoluta), `og:url`, `og:type=website`, `og:locale=pt_BR`.
- Twitter: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- Default `ogImage = 'https://mecontrola.app.br/og-image.png'` (asset criado em T09).

### 3. Layout — body + slot + chrome slots

- `<body class="bg-background text-foreground font-sans antialiased">`.
- Slots/imports: `<Header />`, `<slot />`, `<Footer />`, `<CookieConsent />`, `<MobileStickyBar />`.
- Em T05, Header/Footer/MobileStickyBar/CookieConsent ainda não existem — usar **stubs** vazios temporários (`<div data-stub="header" />`) com TODO; serão substituídos em T06/T08.
- Alternativa: deferir import até T06.

### 4. `src/components/ui/Button.astro`

- Variantes: `primary` (`bg-primary text-primary-foreground hover:shadow-glow-primary`), `accent` (`bg-accent text-accent-foreground hover:shadow-glow-accent`), `ghost` (`border border-border text-foreground hover:bg-surface`).
- Sizes: `sm`, `md` (default), `lg` — controlam padding e font-size.
- Polymorphic: prop `href` → renderiza `<a>`; ausente → `<button type={type}>`.
- Prop `dataTrack?: string` → atributo `data-track`.
- Acessibilidade: `focus-visible:ring-2 ring-ring outline-none`; respeita reduced-motion.
- Suporta `<slot />` para conteúdo (texto + ícone).

### 5. `src/components/ui/Card.astro`

- Base: `bg-card border border-border rounded-2xl p-6 md:p-8`.
- Prop `featured?: boolean` → `border-primary shadow-glow-primary` (sem cor explícita, via token).
- Prop `as?: 'div' | 'article'` (default `div`).
- `<slot />` para conteúdo livre.

### 6. `src/components/ui/SectionHeader.astro`

- Props: `tag?: string`, `title: string`, `subtitle?: string`, `align?: 'left' | 'center'` (default `left`).
- Tag estilo eyebrow: `text-primary uppercase tracking-wide text-xs`.
- Title: Poppins 700, `letter-spacing: var(--tracking-tight)`, sizes responsivos (`text-3xl md:text-4xl lg:text-5xl`).
- Subtitle: `text-muted-foreground`.

### 7. `src/components/ui/Tag.astro`

- Pill: `inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-wide`.
- Prop opcional `variant: 'primary' | 'accent'` (default `primary`).
- `<slot />` para texto + ícone opcional.

## Critério de Aceite

- `<Button variant="primary" href="#planos" dataTrack="cta_test">Ver planos</Button>` renderiza `<a href="#planos" data-track="cta_test" class="...">`.
- `<Button type="button">` renderiza `<button type="button">`.
- `<Card featured>` aplica `border-primary shadow-glow-primary` no DOM (validar via classes ou computed style).
- `<SectionHeader tag="..." title="..." subtitle="..." />` produz hierarquia semântica `<p>tag</p><h2>title</h2><p>subtitle</p>`.
- `<Tag>Menos caos.</Tag>` renderiza pill neon.
- Layout aceita props tipadas; faltando obrigatórios → erro TS.
- canonical e OG image absolutos (validar com URL parsing).
- axe-core 0 violations sérias em snapshot de teste com Button e Card.
- `prefers-reduced-motion` desativa transition/animation nos primitives (validar via devtools).

## Definition of Done

- 5 arquivos versionados: `src/layouts/Layout.astro`, `src/components/ui/Button.astro`, `Card.astro`, `SectionHeader.astro`, `Tag.astro`.
- Página teste (`src/pages/index.astro` placeholder) renderiza Layout com primitive demo sem erros.
- `pnpm exec astro check` 0 erros.
- `pnpm build` produz `dist/index.html` válido com `<title>`, canonical, OG.

## Riscos

- Imports circulares se Layout importar componentes que importam Layout — manter Layout no topo da árvore.
- Variantes de Button com `data-track` em `<button>` (sem href) ainda precisam validar atributo presente.

## Paralelização recomendada

- 2 agentes:
  - Agente A: Layout (passos 1–3) com stubs para Header/Footer.
  - Agente B: UI primitives (passos 4–7).
- Encontram-se ao fim para integração via Layout demo.
