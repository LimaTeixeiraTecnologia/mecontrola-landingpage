SHELL := /bin/sh

PNPM := pnpm

.PHONY: help install dev build preview check clean reset og-image

help:
	@printf "\nComandos disponíveis:\n\n"
	@printf "  make install  - instala as dependências do projeto\n"
	@printf "  make dev      - inicia o servidor local de desenvolvimento\n"
	@printf "  make build    - gera a build estática em dist/\n"
	@printf "  make preview  - sobe o preview local da build\n"
	@printf "  make check    - valida os arquivos Astro e TypeScript\n"
	@printf "  make clean    - remove artefatos gerados (.astro e dist)\n"
	@printf "  make reset    - remove node_modules e artefatos para reinstalação limpa\n\n"

install:
	$(PNPM) install; $(PNPM) approve-builds --all; $(PNPM) install

dev:
	$(PNPM) dev

build:
	$(PNPM) build

preview:
	$(PNPM) preview

check:
	$(PNPM) astro check

clean:
	rm -rf .astro dist

reset:
	rm -rf node_modules .astro dist

og-image:
	rsvg-convert -w 1200 -h 630 public/og-image.svg -o public/og-image.png
