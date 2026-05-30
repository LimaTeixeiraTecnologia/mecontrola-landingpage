# Prompt Enriquecido: Planejamento da Landing Page MeControla

## Input bruto

> Eu quero criar uma landing page com Astro 5, Tailwind CSS v4 (mandatório usar a skill do `.agents/skills/tailwindcss`) a landing page deve ser robusta, eficiente, production-ready, production-proof pronta para deploy em produção em uma cloudflare page. Quero exatamente igual foi feito em: `https://github.com/LimaTeixeiraTecnologia/limateixeira-landingpage`, estrutura de pasta, ci/cd para cloudflare, foco em seo, utilize o gh cli para isso.
>
> Inegociável a landingpage deve usar: `https://github.com/LimaTeixeiraTecnologia/mecontrola-docs/tree/main/landing-page` todo conteúdo dessa página.
>
> O output desse prompt deve ser um planejamento que irá quebrar em tasks, me fazer perguntas multiplas escolhas para confrontar todo material de apoio, e quebrar em tasks para execução.
>
> Inegociável a validação com o Playwright MCP para validar tudo e comprovar que a futura implementação será realmente production-ready, production-proof, robusta e eficiente.
>
> Inegociável e mandatório: as referências de `https://github.com/LimaTeixeiraTecnologia/mecontrola-docs/tree/main/landing-page` e `https://github.com/LimaTeixeiraTecnologia/limateixeira-landingpage` devem ser buscadas com `gh` CLI.
>
> NÃO IMPLEMENTE NADA, APENAS ENRIQUEÇA O PROMPT.

## Classificacao

- Modo principal: `generation`
- Pressao principal de otimizacao: `robustness`

## Prompt enriquecido

```text
[PAPEL OU POSTURA]
Atue como um agente senior de planejamento tecnico para frontend e entrega web, com foco em robustez, clareza operacional e reducao de ambiguidade antes da execucao.

[OBJETIVO]
Produza apenas um planejamento executavel, em PT-BR, para criar uma landing page da MeControla em Astro 5 com Tailwind CSS v4, pronta para producao e deploy em Cloudflare Pages, espelhando a estrutura de pasta, os arquivos de infraestrutura e a estrategia de CI/CD do repositorio https://github.com/LimaTeixeiraTecnologia/limateixeira-landingpage, usando obrigatoriamente todo o conteudo de https://github.com/LimaTeixeiraTecnologia/mecontrola-docs/tree/main/landing-page. Nao implemente nada.

[ENTRADAS]
- Repositorio de referencia estrutural e operacional: `LimaTeixeiraTecnologia/limateixeira-landingpage`
- Repositorio de conteudo obrigatorio: `LimaTeixeiraTecnologia/mecontrola-docs`, pasta `landing-page`
- Busque e inspecione obrigatoriamente com `gh` CLI, nao por suposicao, estas duas referencias:
  - `https://github.com/LimaTeixeiraTecnologia/limateixeira-landingpage`
  - `https://github.com/LimaTeixeiraTecnologia/mecontrola-docs/tree/main/landing-page`
- Preserve como referencia minima os arquivos e diretorios observados no repositorio estrutural:
  `.github/workflows/deploy.yml`, `astro.config.mjs`, `wrangler.toml`, `public/_headers`, `src/components`, `src/components/sections`, `src/components/ui`, `src/layouts`, `src/lib`, `src/pages`, `src/styles`, `docs/DEPLOY.md`, `docs/prompts`
- Considere como material obrigatorio de conteudo, no minimo:
  `landing-page/preview-landing-page-sprint-1.html`, `landing-page/brand-mascote-meta-concluida.jpeg`, `landing-page/brand-mascote-resumo-mes.jpeg`
- Stack-base observada na referencia estrutural:
  Astro 5.x, Tailwind CSS v4.x, `@tailwindcss/vite`, `@astrojs/sitemap`, `wrangler@4`, `pnpm`, foco em SEO e Cloudflare Pages
- Skill obrigatoria para toda decisao de estilo, layout e classes utilitarias: `.agents/skills/tailwindcss`
- Validacao obrigatoria na futura execucao: Playwright MCP

[RESTRICOES]
- Nao implemente, nao edite arquivos, nao gere scaffold, nao escreva codigo final, nao rode instalacoes.
- Use explicitamente a skill `.agents/skills/tailwindcss` durante a fase de analise de estilo e arquitetura visual.
- E obrigatorio usar `gh` CLI para buscar e inspecionar os dois repositorios citados antes de concluir o planejamento.
- Nao substitua `gh` CLI por memoria, busca web generica, inferencia, copia manual de links ou suposicao.
- A prioridade entre referencias e:
  1. Estrutura de pastas, padroes de projeto, CI/CD e deploy: `limateixeira-landingpage`
  2. Conteudo textual, ordem semantica, imagens e narrativa da landing page: `mecontrola-docs/landing-page`
- O planejamento deve ser production-ready e production-proof para Cloudflare Pages.
- O planejamento deve considerar SEO, acessibilidade, performance, responsividade, operacao em CI/CD e validacao antes de deploy.
- A validacao final e inegociavel com Playwright MCP, cobrindo a experiencia real da pagina e a comprovacao objetiva de robustez.
- Nao invente conteudo ausente nem descarte conteudo obrigatorio do material de apoio.
- Se encontrar conflito entre as referencias, exponha o conflito e proponha a resolucao no planejamento sem implementar nada.

[PROCESSO]
1. Busque e inspecione com `gh` CLI o repositorio estrutural `LimaTeixeiraTecnologia/limateixeira-landingpage` e extraia a arquitetura real do projeto, os arquivos de deploy e os pontos de controle de build/publicacao.
2. Busque e inspecione com `gh` CLI a pasta `landing-page` do repositorio `LimaTeixeiraTecnologia/mecontrola-docs` e identifique a fonte de verdade para copy, secoes, mascote, imagens e CTA.
3. Monte um inventario objetivo do material de apoio, separando:
   - estrutura/infra
   - conteudo/copy
   - assets
   - riscos e lacunas
4. Registre no inventario quais referencias foram confirmadas via `gh` CLI e quais arquivos/diretorios foram efetivamente consultados.
5. Antes de propor as tasks, gere perguntas de multipla escolha para confrontar ambiguidades reais do material de apoio. As perguntas devem ser curtas, mutuamente exclusivas e focadas em decisoes que impactam a execucao. Coloque a opcao recomendada primeiro e explique o impacto de cada opcao em uma frase.
6. Depois das perguntas, gere um plano de execucao quebrado em tasks ordenadas, com dependencias, criterio de aceite, riscos, artefatos esperados e bloqueios potenciais.
7. Inclua explicitamente as tasks necessarias para:
   - mapear conteudo obrigatorio para componentes Astro
   - replicar estrutura de pastas e organizacao do repositorio de referencia
   - definir estrategia de SEO tecnico e metadados
   - definir estrategia de responsividade e acessibilidade
   - definir estrategia de assets e imagens
   - definir pipeline de CI/CD para Cloudflare Pages
   - definir validacoes antes de deploy
   - definir a estrategia de validacao obrigatoria com Playwright MCP
   - definir quais evidencias o Playwright MCP deve coletar para comprovar readiness de producao
8. Se alguma informacao critica nao puder ser confirmada via `gh` CLI, declare a lacuna como premissa ou blocker, sem preencher no chute.

[CONTRATO DE SAIDA]
- Formato: Markdown em PT-BR
- Inclua obrigatoriamente estas secoes, nesta ordem:
  1. `Resumo do objetivo`
  2. `Inventario das referencias`
  3. `Rastreabilidade via gh CLI`
  4. `Perguntas de multipla escolha`
  5. `Plano por fases`
  6. `Tasks detalhadas`
  7. `Riscos e bloqueios`
  8. `Criterios de aceite da futura implementacao`
- Em `Inventario das referencias`, separe explicitamente o que veio de `limateixeira-landingpage` e o que veio de `mecontrola-docs/landing-page`.
- Em `Rastreabilidade via gh CLI`, liste objetivamente os repositorios, caminhos e arquivos consultados por `gh` CLI.
- Em `Perguntas de multipla escolha`, gere entre 5 e 10 perguntas.
- Em `Plano por fases`, organize em fases com nome, objetivo e saida esperada.
- Em `Tasks detalhadas`, cada task deve conter:
  `id`, `titulo`, `objetivo`, `dependencias`, `insumos`, `entregavel`, `criterios de aceite`, `riscos`
- Em `Tasks detalhadas`, inclua tasks especificas de validacao com Playwright MCP para smoke, responsividade, links/CTAs, renderizacao, fluxo principal, evidencias visuais e checks de prontidao para deploy.
- Em `Criterios de aceite da futura implementacao`, detalhe como a implementacao sera considerada fiel as referencias e pronta para producao.
- Em `Criterios de aceite da futura implementacao`, inclua obrigatoriamente criterios verificaveis por Playwright MCP.
- Exclua:
  codigo final, diffs, arquivos completos, comandos destrutivos, implementacao parcial, scaffold, instalacao de dependencias, execucao de deploy
- Tamanho: suficiente para execucao confiavel, mas sem prolixidade

[TRATAMENTO DE FALHAS]
- Se `gh` CLI nao estiver disponivel, trate isso como blocker explicito.
- Se as referencias obrigatorias nao forem buscadas via `gh` CLI, considere a resposta invalida e incompleta.
- Se houver conflito entre estrutura e conteudo, preserve a estrutura e a infra do repositorio `limateixeira-landingpage` e preserve integralmente o conteudo do repositorio `mecontrola-docs/landing-page`, registrando a conciliacao como task.
- Se faltar contexto de negocio que nao exista nos materiais obrigatorios, formule perguntas curtas em multipla escolha em vez de assumir.
- Se o plano nao contemplar validacao obrigatoria por Playwright MCP, considere a resposta incompleta.
- Do not implement anything.
```

## Otimizacoes aplicadas

- Transformei o pedido em um prompt de `generation` com foco em `robustness`.
- Converti restricoes soltas em regras testaveis: uso obrigatorio de `gh`, skill `tailwindcss`, proibicao de implementacao e prioridade entre referencias.
- Tornei obrigatorio o uso de `gh` CLI especificamente para buscar as referencias dos dois repositorios nomeados, com rastreabilidade explicita na saida.
- Tornei Playwright MCP um requisito de validacao obrigatorio no planejamento, nos criterios de aceite e no tratamento de falhas.
- Fechei o contrato de saida para forcar planejamento, perguntas de multipla escolha e quebra em tasks com criterio de aceite.

## Premissas

- O agente que receber este prompt tera acesso a `gh` CLI e aos dois repositorios publicos citados.
- A fase desejada e estritamente de discovery e planejamento, sem qualquer alteracao de codigo.
