// Pulls every method and every resource path out of the decompiled game and writes the two
// datasets the search tools read.
//
//   node scripts/extract-game-api.mjs
//
// Input:  ../EntireGameCode.txt   (the decompiled game, not in this repo's build)
// Output: src/data/methods.json   every method, with class, signature and visibility
//         src/data/icons.json     every sprite/resource path the game loads by string
//
// The output is committed, so the site builds without the game corpus. Re-run after a game
// update, otherwise the tools describe an API that no longer exists.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const source = path.resolve(rootDir, '..', 'EntireGameCode.txt');

if (!fs.existsSync(source)) {
  console.error(`Cannot find ${source}. This script needs the decompiled game corpus.`);
  process.exit(1);
}

const src = fs.readFileSync(source, 'utf8');
const lines = src.split('\n');

// ---------------------------------------------------------------- methods

const CLASS_RE = /^(?:public|internal)\s+(?:abstract\s+|sealed\s+|static\s+|partial\s+)*(?:class|struct|interface|enum)\s+(\w+)/;
const MODIFIERS = '(?:static|virtual|override|sealed|async|new|unsafe|extern|abstract|partial|readonly)';
const METHOD_RE = new RegExp(
  `^\\t(public|internal|protected internal|protected)\\s+(?:${MODIFIERS}\\s+)*` +
    `([\\w<>,.\\[\\]?]+)\\s+(\\w+)\\s*\\(([^;{]*)\\)\\s*$`,
);
// A property or field, not a method: `public Foo bar => ...` / `public Foo bar;`
const NOT_A_METHOD = /[=;]\s*$/;

const methods = [];
let currentClass = '';

for (const raw of lines) {
  const line = raw.replace(/\r$/, '');

  const cls = CLASS_RE.exec(line);
  if (cls) {
    currentClass = cls[1];
    continue;
  }

  if (NOT_A_METHOD.test(line)) continue;

  const m = METHOD_RE.exec(line);
  if (!m) continue;

  const [, visibility, returnType, name, params] = m;

  // Constructors and the compiler's own plumbing are noise for a modder.
  if (name === currentClass) continue;
  if (name.startsWith('<') || name.startsWith('_') || name.includes('__')) continue;
  if (returnType === 'new' || returnType === 'return') continue;

  methods.push({
    c: currentClass,
    n: name,
    r: returnType,
    p: params.trim(),
    v: visibility === 'public' ? 'public' : 'internal',
  });
}

// Same class + name + parameter list twice means the file listed it twice.
const seen = new Set();
const uniqueMethods = methods.filter((x) => {
  const key = `${x.c}.${x.n}(${x.p})`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// ---------------------------------------------------------------- resource paths

// Two sources, because neither is complete on its own:
//
//   The exported sprite folder is the real inventory of what art exists. AssetRipper
//   flattens it, so `ui/Icons/iconFire` lands as `ui__Icons__iconFire.png`.
//
//   The code only gives the paths it loads by string literal. That is a much smaller set,
//   but it is the one that tells you a path is actually used, and it catches sprite *lists*
//   where the path is a folder rather than a file.
const IMAGE_DIR = process.env.WB_IMAGES ?? '';

const fromCode = new Set();
const pathRe = /"((?:ui|effects|actors|buildings|items|drops|shadows|tiles|windows|banners|maps)\/[\w/\-.]+)"/g;
for (const m of src.matchAll(pathRe)) {
  const p = m[1];
  if (p.endsWith('/')) continue;
  if (/\.(png|jpg|jpeg|json|txt|asset|prefab)$/i.test(p)) continue; // loaded paths carry no extension
  fromCode.add(p);
}

const fromImages = new Set();
if (fs.existsSync(IMAGE_DIR)) {
  for (const file of fs.readdirSync(IMAGE_DIR)) {
    if (!file.endsWith('.png')) continue;
    const name = file.slice(0, -4);
    // Loose textures with no folder are exported as `Texture2D__name`; they have no
    // Resources path a mod could use, so they are not worth listing.
    if (!name.includes('__') || name.startsWith('Texture2D__')) continue;
    fromImages.add(name.split('__').join('/'));
  }
} else {
  console.warn(`No sprite export at ${IMAGE_DIR}, falling back to code-referenced paths only.`);
}

const all = [...new Set([...fromImages, ...fromCode])].sort();
// `u` marks a path the game loads by name somewhere in its own code, which is a good signal
// that it is a real, usable Resources path rather than a stray export.
const icons = all.map((p) => (fromCode.has(p) ? { p, u: 1 } : { p }));


// ---------------------------------------------------------------- asset fields

// The asset classes a modder actually builds. For each one we list every public field it has,
// including the ones it inherits, so nobody has to guess a field name or its type again.
const ASSET_CLASSES = [
  'ActorTrait', 'ItemAsset', 'StatusAsset', 'GodPower', 'BuildingAsset', 'ActorAsset',
  'DropAsset', 'DisasterAsset', 'WorldLawAsset', 'SpellAsset', 'ProjectileAsset',
  'SubspeciesTrait', 'CultureTrait', 'KingdomTrait', 'ClanTrait', 'ReligionTrait',
  'BehaviourTaskActor', 'ActorJob', 'TileType', 'ResourceAsset', 'CloudAsset', 'TopTileType',
];

// `public int rate_birth;` / `public string id = "x";` / `public List<string> materials;`
const FIELD_RE = /^\t(public)\s+(?!(?:static|const|readonly|event|delegate)\s)([\w<>,.\[\]?]+)\s+(\w+)\s*(?:=\s*([^;]+))?;\s*$/;
// The `<...>` is optional but common: `class BaseTrait<TTrait> : BaseAugmentationAsset`.
// Without it the base class is missed and inherited fields (id, base_stats) never show up.
const CLASS_HEAD_RE =
  /^(?:public|internal)\s+(?:abstract\s+|sealed\s+|static\s+|partial\s+)*class\s+(\w+)(?:<[^>]*>)?(?:\s*:\s*([^\n{]+))?/;

// Where every class starts, and what it inherits from.
const classStart = new Map();
const classBase = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = CLASS_HEAD_RE.exec(lines[i]);
  if (!m || classStart.has(m[1])) continue;
  classStart.set(m[1], i);
  if (m[2]) {
    // "BaseTrait<ActorTrait>, IFoo" -> "BaseTrait" (generic args and interfaces dropped)
    const first = m[2].split(',')[0].trim().replace(/<.*$/, '');
    if (first && !/^I[A-Z]/.test(first)) classBase.set(m[1], first);
  }
}

function fieldsOf(className) {
  const start = classStart.get(className);
  if (start === undefined) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (CLASS_HEAD_RE.test(lines[i])) break; // next top-level class
    const m = FIELD_RE.exec(lines[i]);
    if (m) out.push({ t: m[2], n: m[3], d: m[4] ? m[4].trim() : undefined });
  }
  return out;
}

const assets = [];
for (const name of ASSET_CLASSES) {
  if (!classStart.has(name)) {
    console.warn(`  asset class not found in corpus: ${name}`);
    continue;
  }
  const seen = new Set();
  const fields = [];
  let current = name;
  const chain = [];
  // Walk up the inheritance chain so inherited fields (id, base_stats, ...) are listed too.
  while (current && classStart.has(current) && chain.length < 6) {
    chain.push(current);
    for (const f of fieldsOf(current)) {
      if (seen.has(f.n)) continue;
      seen.add(f.n);
      fields.push({ ...f, from: current === name ? undefined : current });
    }
    current = classBase.get(current);
  }
  assets.push({ c: name, chain, fields });
}

// ---------------------------------------------------------------- write

const dataDir = path.join(rootDir, 'src', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const write = (file, value) => {
  const out = path.join(dataDir, file);
  fs.writeFileSync(out, JSON.stringify(value), 'utf8');
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`${file}  ${value.length} entries  ${kb} KB`);
};

write('methods.json', uniqueMethods);

// Without the sprite export this run only sees paths referenced in code, which is a fraction
// of the real list. Overwriting a fuller file with that would quietly shrink the icon search.
const iconsPath = path.join(dataDir, 'icons.json');
const existingIcons = fs.existsSync(iconsPath) ? JSON.parse(fs.readFileSync(iconsPath, 'utf8')) : [];
if (!fs.existsSync(IMAGE_DIR) && existingIcons.length > icons.length) {
  console.warn(
    `icons.json  kept (${existingIcons.length} entries) - this run only found ${icons.length} ` +
      `without the sprite export at ${IMAGE_DIR}`,
  );
} else {
  write('icons.json', icons);
}
write('assetFields.json', assets);

const used = icons.filter((i) => i.u).length;
console.log(`  of which referenced in code: ${used}`);

const classes = new Set(uniqueMethods.map((m) => m.c));
console.log(`\nfrom ${classes.size} classes`);
console.log(`public: ${uniqueMethods.filter((m) => m.v === 'public').length}`);
console.log(`internal: ${uniqueMethods.filter((m) => m.v === 'internal').length}`);
