import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import Handlebars from 'handlebars';

/**
 * Собирает HTML из Handlebars-партиалов и JSON-контента.
 * Партиал `partials/sections/hero.hbs` доступен как `{{> sections/hero}}`.
 */
export default function handlebarsPlugin({ partialsDir, contentFile }) {
  const collectPartials = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return collectPartials(path);
      return name.endsWith('.hbs') ? [path] : [];
    });

  const createEngine = () => {
    const hbs = Handlebars.create();
    hbs.registerHelper('eq', (a, b) => a === b);
    hbs.registerHelper('pad', (n) => String(n).padStart(2, '0'));
    hbs.registerHelper('inc', (n) => Number(n) + 1);
    for (const file of collectPartials(partialsDir)) {
      const name = relative(partialsDir, file)
        .replace(/\.hbs$/, '')
        .split(sep)
        .join('/');
      hbs.registerPartial(name, readFileSync(file, 'utf8'));
    }
    return hbs;
  };

  return {
    name: 'design-expert:handlebars',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const content = JSON.parse(readFileSync(contentFile, 'utf8'));
        return createEngine().compile(html)(content);
      },
    },
    configureServer(server) {
      server.watcher.add([partialsDir, contentFile]);
      server.watcher.on('change', (file) => {
        if (file.startsWith(partialsDir) || file === contentFile) {
          server.hot.send({ type: 'full-reload' });
        }
      });
    },
  };
}
