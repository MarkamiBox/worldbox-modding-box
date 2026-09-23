// Run with:  node --experimental-strip-types src/lib/naturalSearch.test.ts
//
// Proves the plain-English queries in the tool's own placeholder text actually land on the
// right thing. Each case says: for this query, one of these must appear in the top N.
import { buildIndex, search, searchWithPins } from './naturalSearch.ts';
import methodsJson from '../data/methods.json' with { type: 'json' };
import iconsJson from '../data/icons.json' with { type: 'json' };

interface Method { c: string; n: string; r: string; p: string; v: string }
interface Icon { p: string }

const methods = methodsJson as Method[];
const icons = iconsJson as Icon[];

const methodIndex = buildIndex(methods, (m) => `${m.n} ${m.c}`, (m) => `${m.c} ${m.p} ${m.r}`);
const iconIndex = buildIndex(icons, (i) => i.p.split('/').pop() ?? '', (i) => i.p);

let failures = 0;

function expectTop(label: string, query: string, wanted: string[], topN: number, run: (q: string) => string[]) {
  const got = run(query).slice(0, topN);
  const hit = wanted.some((w) => got.some((g) => g.toLowerCase().includes(w.toLowerCase())));
  if (!hit) {
    failures++;
    console.error(`  FAIL  ${label}: "${query}"`);
    console.error(`        wanted one of: ${wanted.join(', ')}`);
    console.error(`        top ${topN}: ${got.slice(0, 8).join(' | ') || '(nothing)'}`);
  }
}

const boost = (m: Method) => (m.v === 'public' ? 1.25 : 1);
const keyOf = (m: Method) => `${m.c}.${m.n}`;
const runMethods = (q: string) => searchWithPins(q, methodIndex, methods, keyOf, 40, boost).map(keyOf);
const runIcons = (q: string) => search(q, iconIndex, 40).map((h) => h.item.p);

// ---------------------------------------------------------------- methods

expectTop('methods', 'kill a unit', ['die', 'kill'], 10, runMethods);
expectTop('methods', 'spawn a unit', ['spawnNewUnit', 'createNewUnit'], 10, runMethods);
expectTop('methods', 'add a trait', ['addTrait'], 5, runMethods);
expectTop('methods', 'check if a unit has a trait', ['hasTrait'], 10, runMethods);
expectTop('methods', 'damage a unit', ['getHit', 'changeHealth'], 15, runMethods);
expectTop('methods', 'heal a unit', ['restoreHealth', 'changeHealth'], 15, runMethods);
expectTop('methods', 'start a war', ['startWar', 'newWar'], 10, runMethods);
expectTop('methods', 'create a kingdom', ['makeNewCivKingdom', 'newKingdom'], 15, runMethods);
expectTop('methods', 'open a window', ['showWindow', 'openUnitWindow'], 10, runMethods);
expectTop('methods', 'get a tile', ['GetTile'], 10, runMethods);
expectTop('methods', 'place a building', ['addBuilding'], 20, runMethods);
expectTop('methods', 'make it rain', ['rain'], 10, runMethods);
expectTop('methods', 'equip an item', ['setItem', 'equip'], 15, runMethods);
expectTop('methods', 'kindom', ['Kingdom'], 20, runMethods); // typo tolerance

// ---------------------------------------------------------------- icons

expectTop('icons', 'death king', ['king', 'skull', 'death'], 12, runIcons);
expectTop('icons', 'kingdom burning', ['fire', 'kingdom', 'burn'], 15, runIcons);
expectTop('icons', 'fire', ['fire'], 5, runIcons);
expectTop('icons', 'crown', ['crown', 'king'], 10, runIcons);
expectTop('icons', 'sword weapon', ['sword'], 10, runIcons);
expectTop('icons', 'lightning bolt', ['lightning'], 10, runIcons);
expectTop('icons', 'water drop', ['water', 'drop'], 10, runIcons);
expectTop('icons', 'zombie', ['zombie'], 8, runIcons);

// ---------------------------------------------------------------- sanity

if (methods.length < 5000) {
  failures++;
  console.error(`  FAIL  expected the full method set, got ${methods.length}`);
}
if (icons.length < 500) {
  failures++;
  console.error(`  FAIL  expected the full path set, got ${icons.length}`);
}
if (search('', methodIndex).length !== 0) {
  failures++;
  console.error('  FAIL  an empty query should return nothing');
}

if (failures > 0) {
  console.error(`\nnaturalSearch: ${failures} check(s) failed`);
  process.exit(1);
}
console.log(`naturalSearch: all checks passed (${methods.length} methods, ${icons.length} paths)`);
