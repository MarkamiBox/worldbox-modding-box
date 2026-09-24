/**
 * Builds the two downloadable mods in public/ out of the guide's own code blocks.
 *
 *   hellobox.zip           the finished HelloBox, every file the guide builds
 *   hellobox-template.zip  the empty scaffold from "Your first mod"
 *
 * The point of extracting instead of keeping a copy: a page and its download can never
 * disagree. Edit a code block, run this, the zip follows.
 *
 *   npm run build-hellobox
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const enDir = path.join(rootDir, 'src', 'content', 'en');
const publicDir = path.join(rootDir, 'public');

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[90m${s}\x1b[0m`,
};

/** Files the guide shows as illustrations, not as part of the finished mod. */
const NOT_PART_OF_THE_MOD = new Set([
  'Code/HelloSomething.cs', // the shape every page's file follows
  'Code/HelloLocale.cs', // the code alternative to Locales/en.json, never staged
  'Code/HelloNativeWindow.cs', // the NML AbstractWindow route; HelloBox itself uses HelloWindow
]);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });

/**
 * Every ```lang Mods/HelloBox/<path> block in the English pages.
 * A file shown more than once (Main.cs grows page by page) keeps its longest version.
 */
function collectBlocks() {
  const fence = /^```[a-z]*[ \t]+Mods\/HelloBox\/([^\r\n`]+)\r?\n([\s\S]*?)^```/gm;
  const files = new Map();
  const locales = [];

  for (const page of walk(enDir).filter((f) => f.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(page, 'utf8');
    for (const m of raw.matchAll(fence)) {
      const rel = m[1].trim();
      const body = m[2];
      if (!rel || rel.endsWith('/') || NOT_PART_OF_THE_MOD.has(rel)) continue;

      // A .cs block without a namespace is a snippet, not a file.
      if (rel.endsWith('.cs') && !/\bnamespace\s+HelloBox\b/.test(body)) continue;

      if (rel === 'Locales/en.json') {
        locales.push({ page, body });
        continue;
      }
      const current = files.get(rel);
      if (!current || body.length > current.body.length) files.set(rel, { page, body });
    }
  }

const NML_TITLES = {
  en: {
    'Information Title': 'Information',
    'NeoModList Title': 'Mods',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Upload Mod',
    'ModUploadingProgress Title': 'Uploading...',
    'ModUploadAuthentication Title': 'Authentication',
    'nml_authentication': 'Authentication',
    'ModConfigure Title': 'Mod Settings',
  },
  it: {
    'Information Title': 'Informazioni',
    'NeoModList Title': 'Mod',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Carica Mod',
    'ModUploadingProgress Title': 'Caricamento...',
    'ModUploadAuthentication Title': 'Autenticazione',
    'nml_authentication': 'Autenticazione',
    'ModConfigure Title': 'Impostazioni Mod',
  },
  es: {
    'Information Title': 'Información',
    'NeoModList Title': 'Mods',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Subir Mod',
    'ModUploadingProgress Title': 'Subiendo...',
    'ModUploadAuthentication Title': 'Autenticación',
    'nml_authentication': 'Autenticación',
    'ModConfigure Title': 'Ajustes de Mod',
  },
  de: {
    'Information Title': 'Informationen',
    'NeoModList Title': 'Mods',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Mod hochladen',
    'ModUploadingProgress Title': 'Wird hochgeladen...',
    'ModUploadAuthentication Title': 'Authentifizierung',
    'nml_authentication': 'Authentifizierung',
    'ModConfigure Title': 'Mod-Einstellungen',
  },
  fr: {
    'Information Title': 'Informations',
    'NeoModList Title': 'Mods',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Publier le Mod',
    'ModUploadingProgress Title': 'Publication...',
    'ModUploadAuthentication Title': 'Authentification',
    'nml_authentication': 'Authentification',
    'ModConfigure Title': 'Paramètres du Mod',
  },
  ja: {
    'Information Title': '情報',
    'NeoModList Title': 'Mod一覧',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Modをアップロード',
    'ModUploadingProgress Title': 'アップロード中...',
    'ModUploadAuthentication Title': '認証',
    'nml_authentication': '認証',
    'ModConfigure Title': 'Mod設定',
  },
  ko: {
    'Information Title': '정보',
    'NeoModList Title': '모드 목록',
    'WorkshopMods Title': 'Steam 창작마당',
    'ModUpload Title': '모드 업로드',
    'ModUploadingProgress Title': '업로드 중...',
    'ModUploadAuthentication Title': '인증',
    'nml_authentication': '인증',
    'ModConfigure Title': '모드 설정',
  },
  pt: {
    'Information Title': 'Informações',
    'NeoModList Title': 'Mods',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Enviar Mod',
    'ModUploadingProgress Title': 'Enviando...',
    'ModUploadAuthentication Title': 'Autenticação',
    'nml_authentication': 'Autenticação',
    'ModConfigure Title': 'Configurações do Mod',
  },
  ru: {
    'Information Title': 'Информация',
    'NeoModList Title': 'Моды',
    'WorkshopMods Title': 'Steam Workshop',
    'ModUpload Title': 'Загрузить мод',
    'ModUploadingProgress Title': 'Загрузка...',
    'ModUploadAuthentication Title': 'Аутентификация',
    'nml_authentication': 'Аутентификация',
    'ModConfigure Title': 'Настройки мода',
  },
  zh: {
    'Information Title': '信息',
    'NeoModList Title': '模组列表',
    'WorkshopMods Title': '创意工坊',
    'ModUpload Title': '上传模组',
    'ModUploadingProgress Title': '上传中...',
    'ModUploadAuthentication Title': '身份认证',
    'nml_authentication': '身份认证',
    'ModConfigure Title': '模组配置',
  },
  cz: {
    'Information Title': '信息',
    'NeoModList Title': '模组列表',
    'WorkshopMods Title': '创意工坊',
    'ModUpload Title': '上传模组',
    'ModUploadingProgress Title': '上传中...',
    'ModUploadAuthentication Title': '身份认证',
    'nml_authentication': '身份认证',
    'ModConfigure Title': '模组配置',
  },
};

// Every page adds its own keys to the same file, so the download needs all of them.
  const baseKeys = {};
  for (const { page, body } of locales) {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      console.error(c.red(`  ! ${path.relative(rootDir, page)}: Locales/en.json is not valid JSON`));
      process.exitCode = 1;
      continue;
    }
    Object.assign(baseKeys, parsed);
  }

  // Generate locale files for all supported languages
  const targetLangs = ['en', 'it', 'es', 'de', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh', 'cz'];
  for (const l of targetLangs) {
    const langDict = {
      ...baseKeys,
      ...(NML_TITLES[l] || {}),
    };
    files.set(`Locales/${l}.json`, {
      page: 'merged',
      body: JSON.stringify(langDict, null, 2) + '\n',
    });
  }

  return files;
}

/** Every Stage("x", HelloThing.Initialize) call in Main.cs must have a file behind it. */
function checkStages(files) {
  const main = files.get('Code/Main.cs');
  if (!main) return ['Main.cs is missing'];

  const staged = [...main.body.matchAll(/Stage\("[^"]+",\s*(\w+)\.Initialize\)/g)].map((m) => m[1]);
  const present = new Set(
    [...files.keys()]
      .filter((f) => f.startsWith('Code/') && f.endsWith('.cs'))
      .map((f) => path.basename(f, '.cs')),
  );

  const problems = staged.filter((cls) => !present.has(cls)).map((cls) => `Main.cs stages ${cls}, but Code/${cls}.cs is nowhere in the guide`);

  const unused = [...present].filter(
    (cls) =>
      cls !== 'Main' &&
      !staged.includes(cls) &&
      !['HelloPatches', 'HelloSettings', 'HelloWindow'].includes(cls),
  );
  for (const cls of unused) problems.push(`Code/${cls}.cs exists but Main.cs never stages it`);

  return problems;
}

function writeTree(dir, files) {
  fs.rmSync(dir, { recursive: true, force: true });
  for (const [rel, { body }] of files) {
    const target = path.join(dir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body.replace(/\r?\n/g, '\r\n'));
  }
}

/**
 * Windows' own bsdtar, not Compress-Archive: PowerShell 5.1 writes the entries with backslashes,
 * and the Mac unzip then makes one flat file called "HelloBox\Code\Main.cs".
 */
function zip(sourceDir, outFile) {
  fs.rmSync(outFile, { force: true });
  if (process.platform === 'win32') {
    const tar = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    execFileSync(tar, ['-a', '-c', '-f', outFile, '-C', sourceDir, ...fs.readdirSync(sourceDir)], { stdio: 'pipe' });
  } else {
    // Linux and macOS: the zip tool, from inside the folder so the paths start at its contents
    execFileSync('zip', ['-r', '-X', '-q', outFile, ...fs.readdirSync(sourceDir)], { cwd: sourceDir, stdio: 'pipe' });
  }
}

/** One specific block from one specific page, for the scaffold. */
function blockFrom(pageRel, fileRel) {
  const raw = fs.readFileSync(path.join(enDir, pageRel), 'utf8');
  const fence = new RegExp(
    `^\`\`\`[a-z]*[ \\t]+Mods/HelloBox/${fileRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n([\\s\\S]*?)^\`\`\``,
    'm',
  );
  const m = fence.exec(raw);
  if (!m) throw new Error(`${pageRel} no longer contains a block for ${fileRel}`);
  return m[1];
}

/**
 * The mod's own art, generated from the base pixel-art cube and sized correctly for each asset.
 * Recursively copies everything from src/hellobox-art into the mod folder.
 */
function copyArt(dir) {
  const artDir = path.join(rootDir, 'src', 'hellobox-art');
  if (!fs.existsSync(artDir)) {
    console.error(c.red('  ! src/hellobox-art does not exist. Run scripts/generate-hellobox-art.ps1'));
    process.exitCode = 1;
    return;
  }
  const copyRec = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
      const srcFile = path.join(from, ent.name);
      const dstFile = path.join(to, ent.name);
      if (ent.isDirectory()) {
        copyRec(srcFile, dstFile);
      } else {
        fs.copyFileSync(srcFile, dstFile);
      }
    }
  };
  copyRec(artDir, dir);
}

const TEMPLATE_RESOURCES = [
  'Put your own art in here, in the same folder shape the game uses.',
  '',
  '  GameResources/ui/Icons/iconHelloSwift.png  ->  "ui/Icons/iconHelloSwift"',
  '',
  'See the Sprites & resources page of the guide. You can delete this file.',
  '',
].join('\n');

const files = collectBlocks();
const problems = checkStages(files);

if (problems.length > 0) {
  console.error(c.red('build-hellobox: the guide does not agree with itself'));
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'hellobox-'));
fs.mkdirSync(publicDir, { recursive: true });

// 1. The finished mod
const fullDir = path.join(staging, 'full', 'HelloBox');
writeTree(fullDir, files);
copyArt(fullDir);
zip(path.join(staging, 'full'), path.join(publicDir, 'hellobox.zip'));

// 2. The empty scaffold: what "Your first mod" tells you to create by hand
const templateDir = path.join(staging, 'template', 'HelloBox');
writeTree(
  templateDir,
  new Map([
    ['mod.json', files.get('mod.json')],
    ['Code/Main.cs', { body: blockFrom('nml/02-your-first-mod.md', 'Code/Main.cs') }],
    ['Locales/en.json', { body: '{\n}\n' }],
    ['GameResources/ui/Icons/README.txt', { body: TEMPLATE_RESOURCES }],
  ]),
);
fs.copyFileSync(
  path.join(rootDir, 'src', 'hellobox-art', 'icon.png'),
  path.join(templateDir, 'icon.png'),
);
zip(path.join(staging, 'template'), path.join(publicDir, 'hellobox-template.zip'));

fs.rmSync(staging, { recursive: true, force: true });

const artFilesCount = walk(path.join(rootDir, 'src', 'hellobox-art')).length;
const kb = (f) => Math.round(fs.statSync(path.join(publicDir, f)).size / 1024);
const total = files.size + artFilesCount;
console.log(
  c.green(
    `build-hellobox: hellobox.zip (${total} files, ${kb('hellobox.zip')} KB), hellobox-template.zip (${kb('hellobox-template.zip')} KB)`,
  ),
);
console.log(c.dim(`  every file came out of a code block in src/content/en/`));
