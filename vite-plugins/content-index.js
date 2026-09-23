import fs from 'node:fs';
import path from 'node:path';

const VIRTUAL_ID = 'virtual:content-index';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/** Minimal frontmatter parser, same rules as src/lib/content.ts. */
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return {};
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return meta;
}

function buildIndex(contentDir) {
  const pages = [];
  if (!fs.existsSync(contentDir)) return pages;

  for (const lang of fs.readdirSync(contentDir)) {
    const langDir = path.join(contentDir, lang);
    if (!fs.statSync(langDir).isDirectory()) continue;

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith('.md')) continue;

        const rel = path.relative(langDir, full).replace(/\\/g, '/');
        const meta = parseFrontmatter(fs.readFileSync(full, 'utf8'));
        const fileName = rel.split('/').pop();
        const numMatch = /^(\d+)[-_]/.exec(fileName);

        pages.push({
          lang,
          // "nml/10-setup.md" -> "nml/setup"
          slug: rel
            .replace(/\.md$/, '')
            .split('/')
            .map((p) => p.replace(/^\d+[-_]/, ''))
            .join('/'),
          filePath: rel,
          title: meta.title || rel.replace(/\.md$/, ''),
          group: meta.group || undefined,
          subgroup: meta.subgroup || undefined,
          icon: meta.icon,
          tag: meta.tag,
          order:
            meta.order !== undefined && meta.order !== ''
              ? Number(meta.order)
              : numMatch
                ? Number(numMatch[1]) * 10
                : 999,
        });
      }
    };

    walk(langDir);
  }

  return pages;
}

/**
 * Serves `virtual:content-index`: every page's frontmatter, without its body.
 *
 * The nav needs a title and a group for every page in every language, but a reader only ever
 * reads one language. Keeping the metadata eager and the bodies behind `import.meta.glob`
 * (see src/lib/content.ts) is what stops the main bundle from growing with every translation.
 */
export function contentIndex() {
  let contentDir;

  return {
    name: 'vite-plugin-content-index',

    configResolved(config) {
      contentDir = path.resolve(config.root, 'src/content');
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      return `export default ${JSON.stringify(buildIndex(contentDir))};`;
    },

    configureServer(server) {
      // Pages are added and translated while the dev server runs, so the index must follow.
      const invalidate = (file) => {
        if (!file.endsWith('.md') || !file.startsWith(contentDir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (!mod) return;
        server.moduleGraph.invalidateModule(mod);
        server.reloadModule(mod);
      };

      server.watcher.on('add', invalidate);
      server.watcher.on('unlink', invalidate);
      server.watcher.on('change', invalidate);
    },
  };
}
