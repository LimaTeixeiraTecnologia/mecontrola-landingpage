# T04 — Conteúdo (`content.ts`) + Utilitários

**Fase mestre:** 3 (E3.1, E3.2)
**Dependências:** T02 (TS estrito ativo) + T01 (preview HTML baixado)
**Paralelizável dentro:** ✅ — `content.ts` ║ `cn.ts`+`Icon` (arquivos distintos)
**Bloqueia:** T05 (Layout precisa de tipos), T06–T08 (todas as seções consomem content)

## Objetivo

Transcrever LITERALMENTE (PT-BR, sem reescrita) todo o conteúdo do preview HTML para `src/lib/content.ts` tipado; criar `cn.ts` e Icon registry SVG inline.

## Subatividades

### 1. Tipos TypeScript (`src/lib/content.ts`)

Declarar interfaces:

- `NavItem`, `HeroContent` (tag, headlinePre, headlineHighlight, sub, bullets[], ctaPrimary, ctaSecondary)
- `BulletItem` (icon: IconName, text)
- `BenefitCard` (emoji, title, body)
- `HowItWorksStep` (number, title, body)
- `HowItWorksContent` (heading, steps[], closing)
- `MeetMascotContent` (image, tag, heading, body, bullets[], cta)
- `ForWhomContent` (heading, items[])
- `Plan` (id, name, priceLabel, periodLabel, equiv?, savings?, ctaLabel, ctaHref, featured: boolean)
- `FaqItem` (question, answer)
- `MascotStripGoalContent` (image, tag, heading, body)
- `FinalCtaContent` (heading, body, ctaLabel, ctaHref, trackId)
- `FooterContent` (logo, tagline, legalLine)
- `MobileStickyBarContent` (copy, ctaLabel, ctaHref, trackId)
- `IconName` (literal union: `'check' | 'whatsapp' | 'eye' | 'package' | 'trending' | 'heart' | 'plus' | 'close' | 'arrow-right' | 'instagram' | 'mascot-face'`)

### 2. Constantes URL e dados oficiais

```ts
export const WHATSAPP_URL = '#'; // TODO: substituir antes de promoção pública
export const CHECKOUT_URL_MENSAL = '#'; // TODO
export const CHECKOUT_URL_TRIMESTRAL = '#'; // TODO
export const CHECKOUT_URL_ANUAL = '#'; // TODO
export const CONTACT_EMAIL = 'contato@limateixeira.com.br';
export const INSTAGRAM_URL = 'https://www.instagram.com/limateixeiraconsulting/';
export const CNPJ = '52.162.759/0001-74';
export const LEGAL_NAME = ''; // TODO: razão social oficial
```

### 3. Objetos de conteúdo — transcrição literal do preview

Mapear seções 1–12 do `preview-landing-page-sprint-1.html`:

- `nav`: link "Ver planos" → `#planos` (track `cta_header_ver_planos`).
- `hero`:
  - tag "Menos caos. Mais conquistas."
  - h1 dividido: pre "Sua vida financeira organizada, " + highlight "direto no WhatsApp."
  - sub literal do preview.
  - 3 bullets: "Sem app complicado", "Sem julgamento", "Sem precisar virar especialista".
  - CTAs: "Ver planos" (track `cta_hero_ver_planos`, → `#planos`), "Entender como funciona" (track `cta_hero_como_funciona`, → `#como-funciona`).
- `meetMascot`:
  - image `brand-mascote-resumo-mes`; tag; h2 "Seu parceiro de finanças, direto no WhatsApp."; body; 3 bullets coração 💚; CTA "Quero esse parceiro" (track `cta_meet_quero_parceiro`).
- `benefits[]`:
  - h2 "Menos aperto. Mais clareza. Mais chance de respirar no fim do mês."
  - 3 cards: 👀 / 📦 / 📈 com títulos e bodies literais.
- `howItWorks`: id `como-funciona`; h2; 3 passos numerados; closing paragraph.
- `forWhom`: h2; 3 bullets coração.
- `plans[]`: ordem Mensal/Trimestral/Anual.
  - Mensal: R$ 29,90/mês; track `plan_monthly_select` → `CHECKOUT_URL_MENSAL`.
  - Trimestral: R$ 80,73/3m; equiv R$ 26,91/mês; savings R$ 8,97; track `plan_quarterly_select` → `CHECKOUT_URL_TRIMESTRAL`.
  - Anual: R$ 297,80/12m; equiv R$ 24,82/mês; savings R$ 61,00; `featured: true`; track `plan_yearly_select` → `CHECKOUT_URL_ANUAL`.
  - Nota: "PIX, cartão ou cupom".
- `faq[]`: 4 perguntas (Preciso baixar app / Qual plano vale mais / Como pago / É para quem entende de finanças).
- `mascotStripGoal`: image `brand-mascote-meta-concluida`; tag; h2 "Cada meta batida vira motivo pra continuar."; body.
- `finalCta`: h2 "Seu dinheiro não precisa continuar mandando na sua paz."; CTA "Ver planos e começar" (track `cta_final_ver_planos`, → `#planos`).
- `footer`: logo + tagline ("Menos caos. Mais conquistas.") + linha legal `© 2026 MeControla · CNPJ ${CNPJ} · ${CONTACT_EMAIL}` + link Instagram.
- `mobileSticky`: "Comece do jeito mais simples" + CTA "Ver planos" (track `cta_mobile_ver_planos`).

### 4. Util `cn()` (`src/lib/cn.ts`)

Clonar de LT (geralmente `clsx` + `tailwind-merge`). Comportamento: `cn('p-2', undefined, ['p-4']) === 'p-4'`.

### 5. Icon registry (`src/components/ui/Icon.astro`)

- Prop `name: IconName`, `class?: string`.
- Switch interno retorna SVG inline com `viewBox`, `currentColor`, `aria-hidden="true"` ou `aria-label`.
- Símbolos mínimos: `check`, `whatsapp`, `eye`, `package`, `trending`, `heart`, `plus`, `close`, `arrow-right`, `instagram`, `mascot-face` (símbolo do preview `#mc-face`).
- Fallback para nome inválido: lançar erro em dev (`throw new Error`).

## Critério de Aceite

- `pnpm exec astro check` 0 erros.
- Toda copy PT-BR preservada **literalmente** (validado por `diff` visual com preview HTML — incluindo emojis, acentos, pontuação).
- `grep -n "TODO" src/lib/content.ts` lista exatamente: `WHATSAPP_URL`, `CHECKOUT_URL_MENSAL`, `CHECKOUT_URL_TRIMESTRAL`, `CHECKOUT_URL_ANUAL`, `LEGAL_NAME`.
- UTF-8 validado (`file src/lib/content.ts` → UTF-8); palavras "Conheça", "está", "também" íntegras.
- Plans com valores EXATOS do preview.
- `<Icon name="heart" class="size-5 text-accent" />` renderiza SVG roxo de 20px.
- `cn()` faz merge correto de classes Tailwind conflitantes.

## Definition of Done

- `src/lib/content.ts` + `src/lib/cn.ts` + `src/components/ui/Icon.astro` versionados.
- Imports funcionam em arquivo de teste sem `astro check` erros.
- Documentação inline (1 linha por seção) mapeando para a seção do preview.
- Pronto para T05–T08 consumirem.

## Riscos

- Acentuação corrompida ao decodificar base64 → validar com `iconv -f utf-8` e inspeção visual.
- Reescrita acidental de copy → vedar com revisão `diff` antes de mergear.
- Mismatch entre `IconName` e símbolos usados → TS estrito pega na compilação.

## Paralelização recomendada

- Agente A: passos 1–3 (tipos + constantes + objetos de copy).
- Agente B: passos 4–5 (`cn` + `Icon`).
- Independentes; sem conflito de arquivos.
