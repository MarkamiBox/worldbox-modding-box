import fs from 'node:fs';
import path from 'node:path';

function findFileForSlug(lang, slug) {
  const baseDir = path.resolve(process.cwd(), 'src/content', lang);
  if (!fs.existsSync(baseDir)) return null;

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = scan(fullPath);
        if (found) return found;
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const rel = path
          .relative(baseDir, fullPath)
          .replace(/\\/g, '/')
          .replace(/\.md$/, '');
        const computedSlug = rel
          .split('/')
          .map((p) => p.replace(/^\d+[-_]/, ''))
          .join('/');
        if (computedSlug === slug) {
          return fullPath;
        }
      }
    }
    return null;
  }

  return scan(baseDir);
}

function formatMarkdown({ title, group, subgroup, icon, order, tag, body }) {
  const lines = ['---'];
  if (title) lines.push(`title: ${title}`);
  if (group) lines.push(`group: ${group}`);
  if (subgroup) lines.push(`subgroup: ${subgroup}`);
  if (icon) lines.push(`icon: ${icon}`);
  if (order !== undefined && order !== null && !isNaN(Number(order)) && Number(order) !== 999) {
    lines.push(`order: ${order}`);
  }
  if (tag) lines.push(`tag: ${tag}`);
  lines.push('---');
  lines.push('');
  lines.push(body.trimStart());
  if (!body.endsWith('\n')) lines.push('');
  return lines.join('\n');
}

export function contentApi() {
  return {
    name: 'vite-plugin-content-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/content')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/content/status' && req.method === 'GET') {
          res.statusCode = 200;
          return res.end(JSON.stringify({ ok: true, dev: true, available: true }));
        }

        if (pathname === '/api/content/save' && req.method === 'POST') {
          let raw = '';
          req.on('data', (chunk) => {
            raw += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(raw);
              const { lang, slug, filePath, title, group, subgroup, icon, order, tag, body } = data;

              if (!lang || (!slug && !filePath)) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ ok: false, error: 'Missing lang or slug' }));
              }

              let targetFile = null;
              if (filePath) {
                const directPath = path.resolve(process.cwd(), 'src/content', lang, filePath);
                if (fs.existsSync(directPath)) {
                  targetFile = directPath;
                }
              }

              if (!targetFile && slug) {
                targetFile = findFileForSlug(lang, slug);
              }

              if (!targetFile) {
                if (filePath) {
                  // Mirror exact relative path in target language
                  targetFile = path.resolve(process.cwd(), 'src/content', lang, filePath);
                  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
                } else {
                  // Fallback: mirror relative structure from another language
                  const otherLang = lang === 'en' ? 'it' : 'en';
                  const otherFile = findFileForSlug(otherLang, slug);
                  if (otherFile) {
                    const baseOther = path.resolve(process.cwd(), 'src/content', otherLang);
                    const rel = path.relative(baseOther, otherFile);
                    targetFile = path.resolve(process.cwd(), 'src/content', lang, rel);
                    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
                  } else {
                    const parts = slug.split('/');
                    const filename = parts.pop() + '.md';
                    const subDir = path.resolve(process.cwd(), 'src/content', lang, ...parts);
                    fs.mkdirSync(subDir, { recursive: true });
                    targetFile = path.join(subDir, filename);
                  }
                }
              }

              const formatted = formatMarkdown({ title, group, subgroup, icon, order, tag, body: body || '' });
              fs.writeFileSync(targetFile, formatted, 'utf8');

              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  ok: true,
                  message: 'Saved successfully',
                  file: path.relative(process.cwd(), targetFile),
                }),
              );
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });
          return;
        }

        if (pathname === '/api/content/create' && req.method === 'POST') {
          let raw = '';
          req.on('data', (chunk) => {
            raw += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(raw);
              const { lang = 'en', slug, title, group, subgroup, icon = '📄', order = 99, tag, body = '', createBoth = true } = data;

              if (!slug || !title) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ ok: false, error: 'Missing title or slug' }));
              }

              const safeSlug = slug
                .toLowerCase()
                .trim()
                .replace(/[^\w\d\-/]/g, '-')
                .replace(/-+/g, '-');

              const createForLang = (targetLang, initialBody) => {
                const parts = safeSlug.split('/');
                const filename = parts.pop() + '.md';
                const subDir = path.resolve(process.cwd(), 'src/content', targetLang, ...parts);
                fs.mkdirSync(subDir, { recursive: true });
                const filePath = path.join(subDir, filename);

                if (!fs.existsSync(filePath)) {
                  const content = formatMarkdown({
                    title,
                    group,
                    subgroup,
                    icon,
                    order,
                    tag,
                    body: initialBody || `# ${title}\n\nNuova pagina creata dal sito. Inizia a scrivere qui!`,
                  });
                  fs.writeFileSync(filePath, content, 'utf8');
                }
                return filePath;
              };

              createForLang(lang, body);
              if (createBoth) {
                const otherLang = lang === 'it' ? 'en' : 'it';
                createForLang(otherLang, body || `# ${title}\n\nPage created from web editor.`);
              }

              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  ok: true,
                  slug: safeSlug,
                  message: 'Page created successfully',
                }),
              );
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
