// Проверяет, что все локальные картинки из собранного HTML лежат в public/.
// По умолчанию предупреждает, с STRICT_ASSETS=1 — падает (для релиза).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const sources = [...html.matchAll(/\ssrc="(\/images\/[^"]+)"/g)].map(([, src]) => src);
const missing = [...new Set(sources)].filter(
  (src) => !existsSync(resolve(root, 'public', `.${src}`)),
);

if (missing.length === 0) {
  console.log(`✓ Все ${sources.length} изображений на месте`);
} else {
  console.warn(`⚠ Нет ${missing.length} изображений (см. docs/design/assets.md):`);
  for (const src of missing) console.warn(`  public${src}`);
  if (process.env.STRICT_ASSETS === '1') process.exit(1);
}
