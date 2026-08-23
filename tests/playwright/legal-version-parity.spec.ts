import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * BUG-39 — paridade de versão dos documentos legais.
 *
 * O valor esperado é congelado em `legal-versions.contract.json`, versionado neste
 * repositório. O gate roda SEMPRE (nada de skip por ambiente) e cobre três frentes:
 *   1. `LEGAL_DOCS_VERSION` (src/lib/content.ts) == contrato;
 *   2. versão renderizada nas páginas legais == contrato;
 *   3. quando o checkout do backend existe na máquina, as constantes
 *      CurrentTermsVersion/CurrentPrivacyVersion == contrato.
 * A frente 3 é a única condicional; ela é reforço, não a única prova, justamente porque
 * os repositórios são separados e o backend pode não existir no runner de CI.
 */

type LegalVersionContract = {
  terms_version: string;
  privacy_version: string;
};

const REPO_ROOT = process.cwd();
const CONTRACT_PATH = resolve(REPO_ROOT, 'legal-versions.contract.json');
const CONTENT_PATH = resolve(REPO_ROOT, 'src/lib/content.ts');

const BACKEND_ROOT = process.env['MECONTROLA_BACKEND_PATH'] ?? resolve(REPO_ROOT, '../mecontrola');
const BACKEND_VERSIONS_PATH = resolve(
  BACKEND_ROOT,
  'internal/identity/domain/valueobjects/current_versions.go',
);

const readContract = (): LegalVersionContract => {
  expect(
    existsSync(CONTRACT_PATH),
    `legal-versions.contract.json ausente em ${CONTRACT_PATH} — sem contrato não há como verificar paridade`,
  ).toBe(true);
  const parsed = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as Partial<LegalVersionContract>;
  expect(typeof parsed.terms_version, 'contrato deve declarar terms_version').toBe('string');
  expect(typeof parsed.privacy_version, 'contrato deve declarar privacy_version').toBe('string');
  return parsed as LegalVersionContract;
};

const readSiteVersion = (): string => {
  expect(existsSync(CONTENT_PATH), `src/lib/content.ts ausente em ${CONTENT_PATH}`).toBe(true);
  const source = readFileSync(CONTENT_PATH, 'utf8');
  const match = source.match(/export\s+const\s+LEGAL_DOCS_VERSION\s*=\s*['"]([^'"]+)['"]/);
  expect(match, 'LEGAL_DOCS_VERSION não encontrada em src/lib/content.ts').not.toBeNull();
  return match?.[1] ?? '';
};

const readBackendConst = (source: string, name: string): string => {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*"([^"]+)"`));
  expect(match, `${name} não encontrada em ${BACKEND_VERSIONS_PATH}`).not.toBeNull();
  return match?.[1] ?? '';
};

test.describe('Paridade de versão dos documentos legais (BUG-39)', () => {
  test('LEGAL_DOCS_VERSION é igual ao contrato congelado terms/privacy', () => {
    const contract = readContract();
    const siteVersion = readSiteVersion();

    expect(
      siteVersion,
      `LEGAL_DOCS_VERSION="${siteVersion}" divergiu de terms_version="${contract.terms_version}" em legal-versions.contract.json — bump de um lado só: atualize os dois no mesmo commit`,
    ).toBe(contract.terms_version);
    expect(
      siteVersion,
      `LEGAL_DOCS_VERSION="${siteVersion}" divergiu de privacy_version="${contract.privacy_version}" em legal-versions.contract.json`,
    ).toBe(contract.privacy_version);
  });

  test('páginas legais renderizam exatamente a versão do contrato', async ({ page }) => {
    const contract = readContract();
    const pages: Array<[string, string]> = [
      ['/termos-de-servico/', contract.terms_version],
      ['/politica-de-privacidade/', contract.privacy_version],
    ];

    for (const [legalPath, expected] of pages) {
      await page.goto(legalPath);
      const rendered = (await page.locator('text=/^Versão:\\s*v/').first().textContent()) ?? '';
      const displayed = rendered.replace(/^\s*Versão:\s*/, '').trim();
      expect(
        displayed,
        `${legalPath} exibe "${displayed}" enquanto o contrato declara "${expected}" — o titular leria versão diferente da gravada na prova de aceite (RF-22 torna isso irreversível)`,
      ).toBe(expected);
    }
  });

  test('constantes Go do backend batem com o contrato quando o checkout existe', () => {
    const contract = readContract();
    if (!existsSync(BACKEND_VERSIONS_PATH)) {
      test.info().annotations.push({
        type: 'checagem-cruzada-indisponivel',
        description: `checkout do backend ausente em ${BACKEND_VERSIONS_PATH}; a paridade continua provada pelo contrato congelado (frentes 1 e 2). Defina MECONTROLA_BACKEND_PATH para habilitar esta checagem extra.`,
      });
      return;
    }

    const source = readFileSync(BACKEND_VERSIONS_PATH, 'utf8');
    const backendTerms = readBackendConst(source, 'CurrentTermsVersion');
    const backendPrivacy = readBackendConst(source, 'CurrentPrivacyVersion');

    expect(
      backendTerms,
      `CurrentTermsVersion="${backendTerms}" divergiu do contrato "${contract.terms_version}" — atualize legal-versions.contract.json e LEGAL_DOCS_VERSION`,
    ).toBe(contract.terms_version);
    expect(
      backendPrivacy,
      `CurrentPrivacyVersion="${backendPrivacy}" divergiu do contrato "${contract.privacy_version}"`,
    ).toBe(contract.privacy_version);
  });
});
