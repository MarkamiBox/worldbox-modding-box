import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/** Parse minimal frontmatter and body from raw markdown */
function parseMarkdown(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const meta = {};
  let body = raw;

  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i > 0) {
        meta[line.slice(0, i).trim()] = line
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    }
  }

  // Extract all headings
  const headings = [];
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(body)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }

  // Icon tokens, in order. `::tool:name::` is the widget syntax, not an icon.
  const tokens = [...body.replace(/::tool:[a-z-]+::/g, '').matchAll(/:([a-zA-Z0-9_+-]+):/g)].map(
    (t) => t[1],
  );

  // Bullets are where a translator quietly drops half a section.
  const bullets = (body.match(/^[ 	]*[-*][ 	]+\S/gm) || []).length;

  return { meta, body, headings, tokens, bullets };
}

/** Recursively get all .md files in directory */
function getMarkdownFiles(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

/** Parse UI translations from src/lib/i18n.ts */
function parseI18nStrings() {
  const i18nPath = path.join(rootDir, 'src', 'lib', 'i18n.ts');
  const content = fs.readFileSync(i18nPath, 'utf8');

  // Extract STRINGS block
  const stringsBlockMatch = /const STRINGS:\s*Record<Lang,\s*Record<string,\s*string>>\s*=\s*(\{[\s\S]*?\n\};)/.exec(
    content,
  );
  if (!stringsBlockMatch) {
    return { error: 'Could not locate STRINGS object in src/lib/i18n.ts' };
  }

  // Match each language dictionary: lang: { ... }
  const langRegex = /([a-z]{2}):\s*\{([\s\S]*?)\n\s*\},/g;
  const languages = {};
  let lMatch;

  while ((lMatch = langRegex.exec(stringsBlockMatch[1])) !== null) {
    const langCode = lMatch[1];
    const dictContent = lMatch[2];
    const keyRegex = /([a-zA-Z0-9_-]+):\s*['"`](.*?)['"`],?/g;
    const keys = {};
    let kMatch;

    while ((kMatch = keyRegex.exec(dictContent)) !== null) {
      keys[kMatch[1]] = kMatch[2];
    }
    languages[langCode] = keys;
  }

  return { languages };
}

// ---------------------- MAIN CHECKER ----------------------

async function runCheck() {
  const isStrict = process.argv.includes('--strict');
  let hasErrors = false;
  let hasWarnings = false;

  console.log(`\n${colors.bright}${colors.cyan}================================================================`);
  console.log(`         WORLDBOX DOCS - TRANSLATION & CONTENT CHECKER`);
  console.log(`================================================================${colors.reset}\n`);

  // 1. Check UI Translations
  console.log(`${colors.bright}🌐 1. UI STRINGS TRANSLATIONS (src/lib/i18n.ts)${colors.reset}`);
  const { languages, error } = parseI18nStrings();

  if (error) {
    console.log(`  ${colors.red}✗ ${error}${colors.reset}`);
    hasErrors = true;
  } else {
    const baseKeys = Object.keys(languages.en || {});
    console.log(`  ${colors.gray}Base language [EN]: ${baseKeys.length} total keys${colors.reset}\n`);

    for (const [lang, keys] of Object.entries(languages)) {
      if (lang === 'en') continue;

      const presentKeys = Object.keys(keys);
      const missingKeys = baseKeys.filter((k) => !presentKeys.includes(k));
      const percentage = Math.round((presentKeys.length / baseKeys.length) * 100);

      if (missingKeys.length === 0) {
        console.log(
          `  ${colors.green}✓ [${lang.toUpperCase()}]${colors.reset} 100% complete (${presentKeys.length}/${baseKeys.length} keys)`,
        );
      } else if (lang === 'it') {
        // Italian is a primary target language
        console.log(
          `  ${colors.red}✗ [${lang.toUpperCase()}]${colors.reset} Missing ${missingKeys.length} keys: ${colors.yellow}${missingKeys.join(', ')}${colors.reset}`,
        );
        hasErrors = true;
      } else {
        // Other languages fallback to EN
        console.log(
          `  ${colors.yellow}⚠ [${lang.toUpperCase()}]${colors.reset} ${percentage}% complete (${presentKeys.length}/${baseKeys.length} keys) ${colors.gray}- ${missingKeys.length} fallback to EN${colors.reset}`,
        );
        hasWarnings = true;
      }
    }
  }

  // 2. Content pages, every language against English
  console.log(`\n${colors.bright}\u{1F4C4} 2. CONTENT PAGES (src/content/)${colors.reset}`);
  const contentDir = path.join(rootDir, 'src', 'content');
  const enDir = path.join(contentDir, 'en');

  const enFiles = getMarkdownFiles(enDir);
  const enMap = new Map(enFiles.map((f) => [f.relativePath, f]));

  // Every language folder that exists, so adding one is a mkdir and nothing else.
  const langs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'en')
    .map((e) => e.name)
    .sort();

  console.log(`  ${colors.gray}Base [EN]: ${enFiles.length} pages | comparing ${langs.length} languages${colors.reset}\n`);

  const problems = [];
  const report = [];

  for (const lang of langs) {
    const langFiles = getMarkdownFiles(path.join(contentDir, lang));
    const langMap = new Map(langFiles.map((f) => [f.relativePath, f]));

    let translated = 0;
    let drifted = 0;
    let stale = 0;

    for (const enFile of enFiles) {
      const target = langMap.get(enFile.relativePath);
      if (!target) continue; // a page nobody has translated yet is backlog, not breakage
      translated++;

      const enParsed = parseMarkdown(fs.readFileSync(enFile.fullPath, 'utf8'));
      const tParsed = parseMarkdown(fs.readFileSync(target.fullPath, 'utf8'));
      const issues = [];

      if (!tParsed.meta.title) issues.push('no title');
      if (enParsed.meta.group && !tParsed.meta.group) issues.push('no group');

      // order and icon must match English byte for byte: a translated order reorders the
      // sidebar, and a translated icon token renders as literal text.
      if (enParsed.meta.order !== tParsed.meta.order) {
        issues.push(`order ${tParsed.meta.order} != EN ${enParsed.meta.order}`);
      }
      if (enParsed.meta.icon !== tParsed.meta.icon) {
        issues.push(`icon ${tParsed.meta.icon} != EN ${enParsed.meta.icon}`);
      }

      if (tParsed.headings.length !== enParsed.headings.length) {
        issues.push(`${tParsed.headings.length} sections vs EN ${enParsed.headings.length}`);
      }

      // Which icon sits where is the English page's decision, so the token list must match
      // it exactly, in order. This is what catches a page re-iconed in EN and nowhere else.
      if (tParsed.tokens.join(',') !== enParsed.tokens.join(',')) {
        const extra = tParsed.tokens.filter((t) => !enParsed.tokens.includes(t));
        const missing = enParsed.tokens.filter((t) => !tParsed.tokens.includes(t));
        const detail =
          extra.length || missing.length
            ? `${missing.length ? `missing :${missing.slice(0, 3).join(': :')}:` : ''}${
                missing.length && extra.length ? ', ' : ''
              }${extra.length ? `extra :${extra.slice(0, 3).join(': :')}:` : ''}`
            : 'same icons, different order';
        issues.push(`icons differ from EN (${detail})`);
      }

      // A section can keep its heading and lose most of its content.
      if (tParsed.bullets < enParsed.bullets * 0.6) {
        issues.push(`${tParsed.bullets} bullets vs EN ${enParsed.bullets}`);
      }

      const body = tParsed.body.trim();
      if (body.length < 10 && !body.includes('::tool:')) issues.push('empty body');

      if (issues.length > 0) {
        drifted++;
        problems.push({ lang, page: enFile.relativePath, issues });
      }

      // English edited after the translation was written: the page is out of date even
      // though every structural check passes.
      if (fs.statSync(enFile.fullPath).mtimeMs > fs.statSync(target.fullPath).mtimeMs + 1000) {
        stale++;
        problems.push({ lang, page: enFile.relativePath, issues: ['EN changed since this was translated'] });
      }
    }

    const orphans = langFiles.filter((f) => !enMap.has(f.relativePath));
    for (const o of orphans) {
      problems.push({ lang, page: o.relativePath, issues: ['no English page with this name'] });
    }

    report.push({ lang, translated, drifted, stale, orphans: orphans.length });
  }

  for (const r of report) {
    const pct = Math.round((r.translated / enFiles.length) * 100);
    const bar = '#'.repeat(Math.round(pct / 5)).padEnd(20, '.');
    const flags = [];
    if (r.drifted) flags.push(`${r.drifted} drifted`);
    if (r.stale) flags.push(`${r.stale} stale`);
    if (r.orphans) flags.push(`${r.orphans} orphan`);

    const colour = pct === 100 && flags.length === 0 ? colors.green : pct === 0 ? colors.gray : colors.yellow;
    const mark = pct === 100 && flags.length === 0 ? '\u2713' : pct === 0 ? '\u00b7' : '\u26a0';

    console.log(
      `  ${colour}${mark} [${r.lang.toUpperCase()}]${colors.reset} ${bar} ` +
        `${String(r.translated).padStart(3)}/${enFiles.length} ${String(pct).padStart(3)}%` +
        (flags.length ? `  ${colors.yellow}${flags.join(', ')}${colors.reset}` : ''),
    );

    // Drift and orphans mean a page is wrong. Missing and stale mean a page is simply
    // not done yet, which is the normal state of a translation effort.
    if (r.drifted || r.orphans) hasErrors = true;
    if (r.stale) hasWarnings = true;
  }

  if (problems.length > 0) {
    const verbose = process.argv.includes('--verbose');
    const show = verbose ? problems : problems.slice(0, 20);
    console.log(`\n  ${colors.bright}Needs attention${colors.reset}`);
    for (const p of show) {
      console.log(`    ${colors.yellow}[${p.lang.toUpperCase()}]${colors.reset} ${p.page} ${colors.gray}${p.issues.join('; ')}${colors.reset}`);
    }
    if (!verbose && problems.length > show.length) {
      console.log(`    ${colors.gray}...and ${problems.length - show.length} more, run with --verbose${colors.reset}`);
    }
  }


  // 4. Custom Icons Check
  console.log(`\n${colors.bright}🎨 3. CUSTOM ICONS FOLDER (src/custom-icons/)${colors.reset}`);
  const customIconsDir = path.join(rootDir, 'src', 'custom-icons');
  if (fs.existsSync(customIconsDir)) {
    const iconFiles = fs
      .readdirSync(customIconsDir)
      .filter((f) => /\.(png|svg|webp|gif|jpg|jpeg)$/i.test(f));
    console.log(
      `  ${colors.green}✓ Drop-folder ready:${colors.reset} ${iconFiles.length} custom icons detected in src/custom-icons/`,
    );
    if (iconFiles.length > 0) {
      console.log(
        `    ${colors.gray}Available tokens: ${iconFiles.map((f) => `:${f.replace(/\.[^.]+$/, '')}:`).join(' ')}${colors.reset}`,
      );
    }
  } else {
    console.log(`  ${colors.red}✗ src/custom-icons directory missing${colors.reset}`);
    hasErrors = true;
  }

  // Summary
  console.log(`\n${colors.cyan}----------------------------------------------------------------${colors.reset}`);
  if (!hasErrors && !hasWarnings) {
    console.log(`${colors.green}${colors.bright}✓ ALL TRANSLATIONS & INTERNAL CONTENT 100% IN SYNC!${colors.reset}`);
  } else if (!hasErrors) {
    console.log(`${colors.yellow}${colors.bright}✓ Core translations in sync (minor warnings noted above).${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}✗ Translation check failed with errors.${colors.reset}`);
  }
  console.log(`${colors.cyan}================================================================${colors.reset}\n`);

  if (isStrict && hasErrors) {
    process.exit(1);
  }
}

runCheck().catch((err) => {
  console.error('Checker error:', err);
  process.exit(1);
});
