/**
 * Plain-English search over the game's methods and resource paths.
 *
 * There is no model behind this and no network call. What makes "kill a unit" find
 * `Actor.dieSimpleNone` is three cheap things:
 *   1. identifiers are split into words  (`spawnNewUnit` -> spawn, new, unit)
 *   2. each query word is expanded through a synonym map built for this game
 *   3. a word may also match by prefix or by a one-character typo
 *
 * Every query word has to match something, so "kill a unit" does not return every method
 * with "unit" in it. When nothing matches all the words, it falls back to ranking by how
 * many did.
 */

/** Words that carry no meaning in a search like "how do i kill a unit". */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'from', 'with', 'by', 'and', 'or',
  'how', 'do', 'i', 'can', 'get', 'me', 'my', 'is', 'it', 'that', 'this', 'what', 'which',
  'find', 'search', 'want', 'need', 'make', 'way', 'some', 'any', 'all', 'you', 'your',
]);

/**
 * Concept groups. Every word in a group expands to the whole group, so the modder's word
 * and the developer's word land on the same results.
 */
const SYNONYM_GROUPS: string[][] = [
  ['kill', 'die', 'death', 'dead', 'slay', 'murder', 'execute', 'rekt', 'destroy', 'remove', 'delete', 'dispose'],
  ['spawn', 'create', 'new', 'add', 'generate', 'make', 'summon', 'produce', 'build', 'place'],
  ['actor', 'unit', 'creature', 'mob', 'person', 'people', 'character', 'being', 'npc'],
  ['kingdom', 'faction', 'nation', 'empire', 'civ', 'civilisation', 'civilization', 'realm'],
  ['city', 'town', 'village', 'settlement', 'zone'],
  // War is a diplomatic state, damage is a thing you do to one unit. Keeping them apart
  // stops "damage a unit" ranking every war method above getHit.
  ['war', 'battle', 'conflict', 'siege', 'invasion'],
  ['damage', 'hit', 'hurt', 'strike', 'attack', 'fight', 'combat', 'wound'],
  ['heal', 'cure', 'restore', 'health', 'hp', 'revive', 'resurrect'],
  ['fire', 'burn', 'burning', 'flame', 'ignite'],
  ['freeze', 'frozen', 'ice', 'cold', 'snow'],
  ['trait', 'perk', 'ability', 'talent'],
  ['item', 'weapon', 'equipment', 'gear', 'armor', 'armour', 'sword', 'tool'],
  ['building', 'structure', 'house', 'construct', 'construction'],
  ['tile', 'terrain', 'ground', 'land', 'map', 'world'],
  ['stat', 'stats', 'attribute', 'bonus', 'modifier'],
  ['money', 'gold', 'coin', 'cash', 'currency'],
  ['king', 'leader', 'ruler', 'monarch', 'chief', 'boss'],
  ['religion', 'faith', 'god', 'divine', 'holy', 'sacred', 'cult'],
  ['culture', 'tradition', 'custom'],
  ['clan', 'family', 'bloodline', 'dynasty'],
  ['language', 'speech', 'word', 'book', 'text'],
  ['baby', 'child', 'children', 'kid', 'newborn', 'birth', 'born'],
  ['age', 'old', 'lifespan', 'elder', 'young'],
  ['water', 'ocean', 'sea', 'liquid', 'lava'],
  ['power', 'spell', 'magic', 'cast', 'miracle'],
  ['drop', 'loot', 'reward', 'resource'],
  ['status', 'effect', 'buff', 'debuff'],
  ['window', 'ui', 'panel', 'screen', 'menu', 'button', 'tab', 'interface'],
  ['icon', 'sprite', 'image', 'texture', 'art', 'picture'],
  ['sound', 'audio', 'music', 'sfx'],
  ['move', 'walk', 'run', 'speed', 'path', 'travel'],
  ['food', 'eat', 'hunger', 'nutrition', 'feed'],
  ['happy', 'happiness', 'mood', 'sad', 'anger', 'angry'],
  ['enemy', 'hostile', 'opponent', 'foe'],
  ['friend', 'ally', 'alliance', 'peace', 'friendly'],
  ['grow', 'growth', 'increase', 'raise', 'boost', 'improve'],
  ['reduce', 'decrease', 'lower', 'shrink', 'drain'],
  ['check', 'has', 'is', 'can', 'test', 'validate'],
  ['list', 'all', 'every', 'each', 'collection'],
  ['random', 'chance', 'roll', 'luck'],
  ['zombie', 'undead', 'skeleton'],
  ['explode', 'explosion', 'bomb', 'blast'],
  ['lightning', 'thunder', 'storm', 'bolt'],
  ['tree', 'forest', 'plant', 'vegetation', 'nature'],
  ['egg', 'hatch', 'lay'],
  ['boat', 'ship', 'sail'],
  ['army', 'squad', 'troop', 'soldier', 'warrior'],
];

const SYNONYMS = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    const existing = SYNONYMS.get(word);
    SYNONYMS.set(word, existing ? [...new Set([...existing, ...group])] : group);
  }
}

/** `spawnNewUnit` / `ui/Icons/iconFire` / `pActorAssetID` -> lowercase words. */
export function tokenize(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 1);
}

/** True when `a` and `b` differ by at most one edit. Catches "kindom" for "kingdom". */
function nearlyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (Math.min(a.length, b.length) < 4) return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export interface Indexed<T> {
  item: T;
  /** Words from the fields that identify the item. A hit here is worth the most. */
  primary: string[];
  /** Words from the supporting fields: class, parameters, folders. */
  secondary: string[];
}

export function buildIndex<T>(
  items: T[],
  primaryOf: (item: T) => string,
  secondaryOf: (item: T) => string,
): Array<Indexed<T>> {
  return items.map((item) => ({
    item,
    primary: tokenize(primaryOf(item)),
    secondary: tokenize(secondaryOf(item)),
  }));
}

/**
 * The handful of questions every modder asks, and the method that is actually the answer.
 *
 * Pure word matching cannot get these right: "damage a unit" has 9000 candidates and a
 * dozen of them are literally named `...Damage`, while the real answer is `getHit`. Each
 * entry pins its methods to the top when all of its `when` words are in the query.
 *
 * Keep it short. This is for intents where the obvious words lead somewhere else, not a
 * second search engine.
 */
export const PINNED: Array<{ when: string[]; methods: string[] }> = [
  { when: ['damage'], methods: ['Actor.getHit', 'BaseSimObject.changeHealth'] },
  { when: ['kill'], methods: ['Actor.dieSimpleNone', 'Actor.dieAndDestroy'] },
  { when: ['heal'], methods: ['Actor.restoreHealth', 'BaseSimObject.changeHealth'] },
  { when: ['spawn', 'unit'], methods: ['ActorManager.spawnNewUnit', 'ActorManager.createNewUnit'] },
  { when: ['spawn', 'building'], methods: ['BuildingManager.addBuilding'] },
  { when: ['spawn', 'drop'], methods: ['DropManager.spawn'] },
  { when: ['trait'], methods: ['Actor.addTrait', 'Actor.hasTrait'] },
  { when: ['status'], methods: ['StatusManager.newStatus'] },
  { when: ['window'], methods: ['ScrollWindow.showWindow'] },
  { when: ['tile'], methods: ['MapBox.GetTile'] },
  { when: ['item'], methods: ['ItemManager.generateItem', 'ActorEquipment.setItem'] },
  { when: ['war'], methods: ['WarManager.newWar'] },
];

/** The pinned method keys for a query, in order, or an empty array. */
export function pinnedFor(query: string): string[] {
  const words = new Set(tokenize(query));
  const out: string[] = [];
  for (const rule of PINNED) {
    if (rule.when.every((w) => words.has(w))) out.push(...rule.methods);
  }
  return [...new Set(out)];
}

/**
 * Search, then lift this query's canonical answers to the top. Nothing is dropped, the
 * pinned entries just stop being on page three.
 */
export function searchWithPins<T>(
  query: string,
  index: Array<Indexed<T>>,
  all: T[],
  keyOf: (item: T) => string,
  limit = 80,
  boostOf?: (item: T) => number,
): T[] {
  if (!query.trim()) return [];

  const found = search(query, index, limit, boostOf).map((h) => h.item);
  const pins = new Set(pinnedFor(query));
  if (pins.size === 0) return found;

  const pinned = all.filter((item) => pins.has(keyOf(item)));
  const rest = found.filter((item) => !pins.has(keyOf(item)));
  return [...pinned, ...rest];
}

/** How well one query word matches one record. 0 means it does not. */
function scoreWord(word: string, entry: Indexed<unknown>): number {
  const expansions = SYNONYMS.get(word) ?? [word];
  let best = 0;

  for (const candidate of expansions) {
    const isOriginal = candidate === word;
    // A synonym is a weaker signal than the word the user actually typed.
    const weight = isOriginal ? 1 : 0.55;

    for (const token of entry.primary) {
      if (token === candidate) best = Math.max(best, 10 * weight);
      else if (token.startsWith(candidate) && candidate.length >= 3) best = Math.max(best, 6 * weight);
      else if (candidate.length >= 4 && token.includes(candidate)) best = Math.max(best, 4 * weight);
      else if (isOriginal && nearlyEqual(token, candidate)) best = Math.max(best, 3);
    }

    for (const token of entry.secondary) {
      if (token === candidate) best = Math.max(best, 3 * weight);
      else if (token.startsWith(candidate) && candidate.length >= 3) best = Math.max(best, 2 * weight);
    }
  }

  return best;
}

export interface Hit<T> {
  item: T;
  score: number;
}

/**
 * `boostOf` lets the caller nudge the ranking with something the words cannot express, such
 * as "a method a mod can actually call beats one it cannot".
 */
export function search<T>(
  query: string,
  index: Array<Indexed<T>>,
  limit = 60,
  boostOf?: (item: T) => number,
): Array<Hit<T>> {
  const words = tokenize(query).filter((w) => !STOPWORDS.has(w));
  if (words.length === 0) return [];

  const complete: Array<Hit<T>> = [];
  const partial: Array<Hit<T>> = [];

  for (const entry of index) {
    let total = 0;
    let matched = 0;

    for (const word of words) {
      const s = scoreWord(word, entry);
      if (s > 0) {
        matched++;
        total += s;
      }
    }

    if (matched === 0) continue;

    // A short name that matches is a better answer than a long one that also happens to.
    const brevity = 1 + 3 / (entry.primary.join('').length + 3);
    const boost = boostOf ? boostOf(entry.item) : 1;
    const hit = { item: entry.item, score: total * brevity * boost };

    if (matched === words.length) complete.push(hit);
    else partial.push({ ...hit, score: hit.score * (matched / words.length) * 0.4 });
  }

  const results = complete.length > 0 ? complete : partial;
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
