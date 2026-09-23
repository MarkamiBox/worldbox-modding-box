// Content gate for the guide pages. Run it after touching anything under src/content/.
//
//   node scripts/check-content.mjs
//
// It catches the five things that break silently in the browser instead of at build time:
//   1. a `:token:` nobody can resolve, so the page prints `:pepecool:` as text
//   2. a `#/slug` link pointing at a page that does not exist
//   3. frontmatter that is missing or malformed
//   4. a real mod's name used as an example (the guide uses HelloBox for everything)
//   5. a `#anchor` link to a heading that is not on the page
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'src', 'content');

const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

/** Every `:token:` the site can actually render: the icon pack plus the built-in SVGs. */
function knownIcons() {
  const known = new Set();
  const add = (raw) => {
    for (const v of [raw, raw.replace(/\s+/g, '_'), raw.replace(/\s+/g, '-'), raw.replace(/\s+/g, '')]) {
      known.add(v);
      known.add(v.toLowerCase());
    }
  };

  const iconDir = path.join(rootDir, 'src', 'custom-icons');
  for (const file of fs.readdirSync(iconDir)) {
    const raw = file.replace(/\.[^.]+$/, '');
    add(raw);
    // Downloaded packs keep the site's id in the filename ("5368-nerd.png"); the loader
    // registers the readable half too, so the checker has to know about both.
    const short = raw.replace(/^\d+[-_]/, '');
    if (short && short !== raw) add(short);
  }

  const icons = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'icons.ts'), 'utf8');
  for (const m of icons.matchAll(/^ {2}([a-zA-Z0-9_+-]+):\s*(strokeSvg|fillSvg|')/gm)) add(m[1]);

  return known;
}

/** "en/nml/10-custom-traits.md" -> "nml/custom-traits" */
const slugOf = (rel) =>
  rel
    .replace(/\\/g, '/')
    .replace(/^[a-z]{2}\//, '')
    .replace(/\.md$/, '')
    .split('/')
    .map((part) => part.replace(/^\d+[-_]/, ''))
    .join('/');

const files = walk(contentDir).filter((f) => f.endsWith('.md'));
const icons = knownIcons();

// Slugs come from the English pages: they are the canonical set every language falls back to.
const slugs = new Set(
  files
    .map((f) => path.relative(contentDir, f))
    .filter((rel) => rel.replace(/\\/g, '/').startsWith('en/'))
    .map(slugOf),
);

// Real mods belong in the credits, never in an example. The guide's example mod is HelloBox.
const REAL_MODS = /\b(flybox|armybox|clothesbox|lootbox|spellbox|storybox|kingbox|economybox|aibox|artifactbox|wallbox|jevbox|rulerbox|loopbox|scpbox|corebox)\b/i;
const CREDITS = /(^|[\\/])credits\.md$/;

const problems = [];
const report = (file, line, rule, message) =>
  problems.push({ file: path.relative(rootDir, file), line, rule, message });

// The id a heading gets on the page, computed the way src/lib/markdown.tsx does it:
// inline HTML, tags and entities out, then slugify.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const plain = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
const md = new Marked({ gfm: true });
const headingIds = (body) => {
  const ids = new Set();
  md.walkTokens(md.lexer(body), (t) => {
    if (t.type === 'heading') ids.add(slugify(plain(md.parseInline(t.text))));
  });
  return ids;
};

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/);

  // --- frontmatter
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!fm) {
    report(file, 1, 'frontmatter', 'No frontmatter block. Every page needs title, group, icon and order.');
  } else {
    const meta = {};
    for (const l of fm[1].split(/\r?\n/)) {
      const i = l.indexOf(':');
      if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
    }
    for (const key of ['title', 'group', 'icon', 'order']) {
      if (!meta[key]) report(file, 1, 'frontmatter', `Missing "${key}:" in frontmatter.`);
    }
    if (meta.order && Number.isNaN(Number(meta.order))) {
      report(file, 1, 'frontmatter', `"order: ${meta.order}" is not a number.`);
    }

    // --- the H1 carries the page's icon, and every page has one
    const h1Index = lines.findIndex((l) => /^#\s+\S/.test(l));
    if (h1Index < 0) {
      report(file, 1, 'heading', 'No "# " heading. The page renders with no title and an empty TOC.');
    } else if (meta.icon && !lines[h1Index].includes(meta.icon)) {
      report(
        file,
        h1Index + 1,
        'heading',
        `The H1 does not carry "${meta.icon}" from the frontmatter. Sidebar and page would show different icons.`,
      );
    }
  }

  // frontmatter off first, or its closing --- turns the block above it into a heading
  const ids = headingIds(raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''));
  let inFence = false;

  lines.forEach((text, i) => {
    const line = i + 1;
    if (/^\s*```/.test(text)) inFence = !inFence;

    // --- in-page anchors
    if (!inFence) {
      for (const m of text.matchAll(/\]\(#([^)/][^)]*)\)/g)) {
        if (!ids.has(m[1])) report(file, line, 'anchor', `"#${m[1]}" matches no heading on this page.`);
      }
    }

    // --- :token: that will render as literal text
    // `::tool:name::` is the widget syntax, not an icon.
    const withoutWidgets = text.replace(/::tool:[a-z-]+::/g, '');
    for (const m of withoutWidgets.matchAll(/:([a-zA-Z0-9_+-]+):/g)) {
      const key = m[1];
      const norm = key.toLowerCase().replace(/[-_]/g, '');
      if (icons.has(key) || icons.has(key.toLowerCase()) || icons.has(norm)) continue;
      report(file, line, 'icon', `":${key}:" resolves to nothing and will print as raw text.`);
    }

    // --- internal links
    for (const m of text.matchAll(/\(#\/([a-z0-9\-/]+)\)/g)) {
      if (!slugs.has(m[1])) report(file, line, 'link', `"#/${m[1]}" does not match any page.`);
    }

    // --- real mod names outside the credits
    if (!CREDITS.test(file)) {
      const hit = REAL_MODS.exec(text);
      if (hit) report(file, line, 'example', `Real mod name "${hit[0]}" in an example. Use HelloBox.`);
    }
  });
}

if (problems.length === 0) {
  console.log(`${c.green}check-content: ${files.length} pages, no problems${c.reset}`);
  process.exit(0);
}

for (const p of problems) {
  console.log(`${c.red}${p.file}:${p.line}${c.reset} ${c.gray}${p.rule}${c.reset} ${p.message}`);
}
console.log(`\n${c.yellow}check-content: ${problems.length} problem(s) in ${files.length} pages${c.reset}`);
process.exit(1);
