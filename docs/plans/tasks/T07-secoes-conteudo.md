# T07 — Seções de Conteúdo (Meet → FinalCta)

**Fase mestre:** 4.5 a 4.12 (E4.5, E4.6, E4.7, E4.8, E4.9, E4.10, E4.11, E4.12)
**Dependências:** T05 (Layout + UI primitives), T04 (content), T09.parcial (mascotes otimizadas via Astro Image — pode ser pre-feito ou stub temporário)
**Paralelizável dentro:** ✅✅✅ — **até 8 subagentes `frontend-design` simultâneos** (paralelização máxima do projeto)
**Bloqueia:** T08 (compose final)

## Objetivo

Materializar todas as seções intermediárias da landing (entre Hero e Footer), cada uma como componente Astro consumindo `src/lib/content.ts` e tokens da skill.

## Subatividades

### 1. `src/components/sections/MeetMascot.astro` (seção 3 do preview)

- Layout 2 colunas (`md:grid-cols-2 items-center gap-12`): imagem esquerda + conteúdo direita.
- Prop `reverse?: boolean` para reuso em `MascotStripGoal`.
- Imagem `brand-mascote-resumo-mes` via `<Image>` Astro (T09) com `mask-image: radial-gradient(ellipse 78% 88% at 50% 50%, #000 62%, transparent 100%)`.
- Conteúdo: `<Tag>` + h2 + body + 3 bullets coração (`<Icon name="heart" class="text-accent" />`) + `<Button variant="primary" dataTrack="cta_meet_quero_parceiro">Quero esse parceiro</Button>`.
- Empilha em `<md`.

### 2. `src/components/sections/Benefits.astro` (seção 4)

- `<SectionHeader title="Menos aperto. Mais clareza. Mais chance de respirar no fim do mês." align="center" />`.
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- 3 `<Card>` com emoji 👀/📦/📈 (text-4xl) + h3 + p `text-muted-foreground`.
- Mobile-first; zero overflow em 375px.

### 3. `src/components/sections/HowItWorks.astro` (seção 5, id `como-funciona`)

- `<section id="como-funciona">`.
- SectionHeader.
- 3 passos numerados: badge circular `bg-primary text-primary-foreground rounded-full size-10 grid place-items-center font-bold` + título + body.
- Closing paragraph `text-muted-foreground` ao final.
- Âncora `#como-funciona` funciona com `scroll-margin-top` (T03.layer base).

### 4. `src/components/sections/ForWhom.astro` (seção 6)

- SectionHeader.
- Lista vertical de 3 itens; cada item: `<Icon name="heart" class="text-accent size-5" />` + texto.
- Alinhamento limpo; mobile responsivo.

### 5. `src/components/sections/Pricing.astro` (seção 7, id `planos`)

- `<section id="planos">`.
- SectionHeader com h2 + sub.
- Grid `md:grid-cols-3 gap-6` com 3 `<Card>` (Mensal, Trimestral, Anual).
- Anual:
  - `featured: true` (recebe `border-primary shadow-glow-primary` via Card).
  - Badge "Melhor custo-benefício" posicionado `absolute -top-4 left-1/2 -translate-x-1/2` com `bg-primary text-primary-foreground`.
- Para cada card:
  - Nome (h3).
  - priceLabel (h4 grande).
  - periodLabel (`text-muted-foreground`).
  - equiv (se houver).
  - savings badge (se houver) com `bg-primary/10 text-primary`.
  - `<Button variant="primary" href={plan.ctaHref} dataTrack={plan.trackId} class="w-full">{plan.ctaLabel}</Button>`.
- Footer da seção: nota "PIX, cartão ou cupom" centralizada.

### 6. `src/components/sections/Faq.astro` (seção 8, id `faq`)

- `<section id="faq">`.
- SectionHeader.
- 4 itens com `<details><summary>` (semântica nativa, acessível por teclado).
- Estilo: `bg-card border border-border rounded-2xl p-4`; chevron rotaciona via CSS `[open] > summary svg { transform: rotate(180deg); }`; transição respeita `prefers-reduced-motion`.
- Opcional: primeira pergunta `open` por default.

### 7. `src/components/sections/MascotStripGoal.astro` (seção 9)

- Reusa `MeetMascot` com `reverse={true}` e content do objeto `mascotStripGoal`.
- Imagem `brand-mascote-meta-concluida`.
- Layout espelhado (imagem à direita).

### 8. `src/components/sections/FinalCta.astro` (seção 10)

- `<section class="bg-[image:var(--gradient-final-cta)]">` (token de gradiente roxo 160°).
- Container centralizado: h2 + body + `<Button variant="primary" href="#planos" dataTrack="cta_final_ver_planos">Ver planos e começar</Button>`.
- Contraste AA validado (testo branco sobre roxo) em T10/axe.

## Critério de Aceite

- 8 componentes em `src/components/sections/` (MeetMascot, Benefits, HowItWorks, ForWhom, Pricing, Faq, MascotStripGoal, FinalCta).
- Cada um consome dados de `src/lib/content.ts` (nada hardcoded).
- Copy textual idêntica ao preview HTML.
- `pnpm exec astro check` 0 erros.
- axe-core 0 violations sérias/críticas em cada seção isoladamente (validado em T10).
- Grid degradação: 3→2→1 cols conforme breakpoint (Benefits, Pricing).
- Pricing: Anual visualmente destacado com glow + badge "Melhor custo-benefício".
- Faq: `<details>` abre/fecha por teclado; axe-core 0 violations.
- HowItWorks: deep-link `#como-funciona` posiciona corretamente com offset (`scroll-margin-top`).
- MascotStripGoal: layout espelhado de MeetMascot (sem duplicação de código).
- FinalCta: gradiente 160° fiel ao preview; CTA neon legível sobre roxo.
- Tokens: nenhuma classe `bg-white`, `text-black`, `bg-zinc-*`, `bg-gray-*` em qualquer seção.

## Definition of Done

- 8 arquivos versionados.
- Cada seção testada isoladamente em `pnpm dev` (rota teste ou via Storybook-like opcional).
- Mascote consumida via `<Image>` Astro com srcset AVIF/WebP/JPEG (acordo com T09 pré-rodada parcial).
- Pronto para T08 compor todas no `index.astro`.

## Riscos

- Componentes denso com muitos imports → manter cada um focado e testável.
- Conflito de paralelização: todos editam `src/components/sections/` mas em arquivos distintos — coordenar via PR único para evitar merge thrash.
- MascotStripGoal depende de MeetMascot → garantir ordem (ou stub temporário).

## Paralelização recomendada

- **Estratégia máxima**: spawn de até 8 subagentes `frontend-design` simultâneos, um por seção.
  - Agente 1: MeetMascot (base que MascotStripGoal reusa — fazer primeiro ou primeiro entre paralelos).
  - Agente 2: Benefits
  - Agente 3: HowItWorks
  - Agente 4: ForWhom
  - Agente 5: Pricing (mais complexa — alocar tempo)
  - Agente 6: Faq
  - Agente 7: MascotStripGoal (sequencial após Agente 1)
  - Agente 8: FinalCta
- Cada subagente recebe prompt autossuficiente com referência à seção do preview HTML, CA específico, DoD, tokens permitidos.
- Após todos: review humano de fidelidade visual + integração.
