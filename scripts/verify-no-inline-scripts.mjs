import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'module', 'application/javascript']);

const htmlFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.html')) htmlFiles.push(full);
  }
};

try {
  walk(DIST);
} catch {
  console.error(`❌ CSP guard: diretório "${DIST}" não encontrado — rode após o build.`);
  process.exit(1);
}

const violations = [];
const scriptTagRe = /<script\b([^>]*)>/gi;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = scriptTagRe.exec(html)) !== null) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const typeMatch = attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i);
    const type = (typeMatch ? typeMatch[1] : '').toLowerCase();
    if (EXECUTABLE_TYPES.has(type)) {
      violations.push({ file, tag: m[0] });
    }
  }
}

if (violations.length > 0) {
  console.error(
    `\n❌ CSP guard: ${violations.length} <script> executável inline em dist/ — bloqueado por script-src 'self' (sem unsafe-inline/hash):`,
  );
  for (const v of violations) console.error(`  - ${v.file}: ${v.tag}`);
  console.error(
    `\nMova o código para public/js/ como arquivo estático (servido por 'self') e referencie com <script is:inline src="/js/...">. Veja public/js/checkout.js.\n`,
  );
  process.exit(1);
}

console.log(
  `✅ CSP guard: nenhum <script> executável inline em ${htmlFiles.length} arquivo(s) HTML.`,
);
