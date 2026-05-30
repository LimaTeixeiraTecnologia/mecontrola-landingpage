# Lima Teixeira Landing Page

Landing page institucional da Lima Teixeira Consulting, construída com Astro e Tailwind CSS v4. O projeto apresenta posicionamento da consultoria, áreas de atuação, diferenciais, resultados esperados e páginas legais de privacidade e LGPD.

## Visão Geral

O site foi estruturado como uma aplicação estática com foco em:

- performance de carregamento
- manutenção simples de conteúdo institucional
- SEO básico e metadados sociais
- navegação responsiva para desktop e mobile

O conteúdo editorial da home está centralizado em [`src/lib/content.ts`](./src/lib/content.ts), o que reduz dispersão de texto entre componentes e simplifica ajustes futuros.

## Stack

- [Astro 5](https://astro.build/) para composição estática das páginas
- [Tailwind CSS v4](https://tailwindcss.com/) para styling
- TypeScript para tipagem do conteúdo e utilitários
- `@fontsource-variable/manrope` para tipografia local

## Rotas

| Rota                        | Finalidade                            |
| --------------------------- | ------------------------------------- |
| `/`                         | Página principal institucional        |
| `/politica-de-privacidade/` | Política de Privacidade               |
| `/lgpd/`                    | Informações institucionais sobre LGPD |

## Estrutura do Projeto

```text
.
├── public/
│   ├── logo-mark.svg
│   ├── logo.svg
│   └── logo.jpeg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── sections/
│   │   └── ui/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── astro.config.mjs
├── Makefile
├── package.json
└── tsconfig.json
```

### Diretórios principais

- [`src/pages`](./src/pages): definição das rotas públicas
- [`src/components/sections`](./src/components/sections): blocos de composição da home
- [`src/components/ui`](./src/components/ui): componentes reutilizáveis de interface
- [`src/assets`](./src/assets): arquivos vetoriais usados inline no front
- [`src/layouts`](./src/layouts): layout base com metadados e estrutura HTML
- [`src/lib/content.ts`](./src/lib/content.ts): textos, listas, CTAs e dados institucionais
- [`src/styles/global.css`](./src/styles/global.css): tema global, tokens e base do Tailwind
- [`public`](./public): ativos estáticos servidos diretamente
- [`Makefile`](./Makefile): atalhos para setup, desenvolvimento, validação e limpeza

## Requisitos

- Node.js 24.15.0 (ver `engines` em `package.json`)
- pnpm 11.1.2 (ver campo `packageManager`)

## Instalação

```bash
make install
```

## Comandos do Projeto

O fluxo principal do projeto pode ser executado via `Makefile`:

```bash
make help
make install
make dev
make build
make preview
make check
make clean
make reset
```

### Descrição dos comandos

| Comando        | Finalidade                                                 |
| -------------- | ---------------------------------------------------------- |
| `make help`    | Exibe a lista de comandos disponíveis                      |
| `make install` | Instala as dependências do projeto                         |
| `make dev`     | Inicia o servidor local de desenvolvimento                 |
| `make build`   | Gera a build estática em `dist/`                           |
| `make preview` | Sobe o preview local da build gerada                       |
| `make check`   | Valida arquivos Astro e TypeScript                         |
| `make clean`   | Remove artefatos gerados (`.astro/` e `dist/`)             |
| `make reset`   | Remove `node_modules/` e artefatos para reinstalação limpa |

## Scripts PNPM

Os scripts originais do `package.json` continuam disponíveis:

```bash
pnpm dev
pnpm build
pnpm preview
pnpm astro check
```

### Uso local

1. Instale as dependências com `make install`
2. Inicie o ambiente local com `make dev`
3. Acesse a URL exibida pelo Astro no terminal

## Fluxo de Conteúdo

Grande parte do conteúdo institucional da home está concentrada em [`src/lib/content.ts`](./src/lib/content.ts). Em termos práticos:

- títulos, subtítulos e CTAs da hero são definidos ali
- listas de serviços, segmentos, diferenciais e resultados também
- dados do rodapé, links legais e contatos institucionais ficam no mesmo arquivo

Esse desenho é útil para ajustes rápidos de copy sem necessidade de editar cada seção manualmente.

## SEO e Metadados

O layout base em [`src/layouts/Layout.astro`](./src/layouts/Layout.astro) já define:

- `title` e `description`
- URL canônica
- Open Graph
- Twitter Cards
- favicon baseado em `public/logo-mark.svg`
- imagem social e logo principal baseados em `public/logo.svg`

O domínio canônico do projeto está configurado em [`astro.config.mjs`](./astro.config.mjs) como `https://limateixeira.com.br`.

## Deploy

O deploy é automatizado via **GitHub Actions → Cloudflare Pages** (Direct Upload). Todo `push`
em `main` dispara build e publicação em produção (`https://limateixeira.com.br`).

O passo a passo completo — secrets, criação do projeto Pages, domínio customizado, SSL/TLS e
troubleshooting — está em [`docs/DEPLOY.md`](./docs/DEPLOY.md).

## Observações para Produção

Existem placeholders institucionais definidos em [`src/lib/content.ts`](./src/lib/content.ts) que devem ser revisados antes de publicação definitiva:

- e-mail
- canal de WhatsApp usado nos CTAs
- LinkedIn
- endereço

Também vale revisar periodicamente:

- metadados de SEO por página
- imagem social usada no compartilhamento
- consistência entre a copy institucional e a oferta comercial atual

## Build

Para gerar a versão estática de produção:

```bash
make build
```

Os arquivos compilados são emitidos em `dist/`.

## Qualidade

Validação básica do projeto:

```bash
make check
```

Esse comando verifica tipagem e diagnósticos dos arquivos Astro e TypeScript.

## Última revisão

Revisado em 16 de maio de 2026.
