import { ASSET_LIBRARIES, STAT_IDS, STAT_TAGS, TRAIT_GROUPS, ITEM_GROUPS } from '../data/worldboxApi.ts';

export interface Diagnostic {
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
  ruleId: string;
}

/**
 * A scan of the source that knows what is code and what is not. Two views come out of it:
 * `mask`  - strings, char literals and comments all blanked, for structural rules.
 * `text`  - only comments blanked, so rules that read a string's value (a stat name, a
 *           group id) can still see it without ever matching prose in a comment.
 */
interface Scan {
  mask: string;
  text: string;
  diagnostics: Diagnostic[];
}

const OPEN: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
const CLOSE: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

const at = (code: string, index: number): { line: number; column: number } => {
  let line = 1;
  let last = -1;
  for (let i = 0; i < index; i++) {
    if (code[i] === '\n') {
      line++;
      last = i;
    }
  }
  return { line, column: index - last };
};

/** Single left-to-right pass: string/comment state, delimiter balance, and the code mask. */
function scan(code: string): Scan {
  const diagnostics: Diagnostic[] = [];
  const mask: string[] = new Array(code.length);
  const text: string[] = new Array(code.length);
  const stack: Array<{ ch: string; index: number }> = [];

  let i = 0;
  /** A comment: gone from both views. */
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) mask[k] = text[k] = code[k] === '\n' ? '\n' : ' ';
  };
  /** A string or char literal: gone from `mask`, kept in `text`. */
  const blankCode = (from: number, to: number) => {
    for (let k = from; k < to; k++) {
      mask[k] = code[k] === '\n' ? '\n' : ' ';
      text[k] = code[k];
    }
  };

  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];

    // line comment
    if (c === '/' && next === '/') {
      const end = code.indexOf('\n', i);
      blank(i, end === -1 ? code.length : end);
      i = end === -1 ? code.length : end;
      continue;
    }

    // block comment
    if (c === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      if (end === -1) {
        diagnostics.push({
          ...at(code, i),
          severity: 'error',
          ruleId: 'CS1035',
          message: 'Block comment is never closed. Add */.',
        });
        blank(i, code.length);
        i = code.length;
        continue;
      }
      blank(i, end + 2);
      i = end + 2;
      continue;
    }

    // verbatim string @"..."  ("" is an escaped quote, newlines are allowed)
    if ((c === '@' && next === '"') || (c === '$' && next === '@' && code[i + 2] === '"')) {
      const start = i;
      i = code.indexOf('"', i) + 1;
      let closed = false;
      while (i < code.length) {
        if (code[i] === '"') {
          if (code[i + 1] === '"') {
            i += 2;
            continue;
          }
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        diagnostics.push({
          ...at(code, start),
          severity: 'error',
          ruleId: 'CS1039',
          message: 'Verbatim string is never closed. Add the final ".',
        });
      }
      blankCode(start, i);
      continue;
    }

    // string, including interpolated $"..."
    if (c === '"' || (c === '$' && next === '"')) {
      const start = i;
      i = code.indexOf('"', i) + 1;
      let closed = false;
      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }
        if (code[i] === '\n') break; // a plain string may not span lines
        if (code[i] === '"') {
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        diagnostics.push({
          ...at(code, start),
          severity: 'error',
          ruleId: 'CS1010',
          message: 'String is never closed on this line. Add the closing ".',
        });
      }
      blankCode(start, i);
      continue;
    }

    // char literal
    if (c === "'") {
      const start = i;
      i++;
      let closed = false;
      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }
        if (code[i] === '\n') break;
        if (code[i] === "'") {
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) {
        diagnostics.push({
          ...at(code, start),
          severity: 'error',
          ruleId: 'CS1010',
          message: "Character literal is never closed. Add the closing '.",
        });
      }
      blankCode(start, i);
      continue;
    }

    if (OPEN[c]) stack.push({ ch: c, index: i });

    if (CLOSE[c]) {
      const top = stack.pop();
      if (!top) {
        diagnostics.push({
          ...at(code, i),
          severity: 'error',
          ruleId: 'CS1513',
          message: `Unexpected '${c}' — there is no matching '${CLOSE[c]}' open here.`,
        });
      } else if (OPEN[top.ch] !== c) {
        diagnostics.push({
          ...at(code, i),
          severity: 'error',
          ruleId: 'CS1513',
          message: `Expected '${OPEN[top.ch]}' to close the '${top.ch}' on line ${at(code, top.index).line}, found '${c}'.`,
        });
      }
    }

    mask[i] = c;
    text[i] = c;
    i++;
  }

  for (const left of stack) {
    diagnostics.push({
      ...at(code, left.index),
      severity: 'error',
      ruleId: 'CS1513',
      message: `'${left.ch}' is never closed. Add '${OPEN[left.ch]}'.`,
    });
  }

  for (let k = 0; k < code.length; k++) {
    if (mask[k] === undefined) mask[k] = ' ';
    if (text[k] === undefined) text[k] = ' ';
  }
  return { mask: mask.join(''), text: text.join(''), diagnostics };
}

/** Line endings that mean "this statement carries on below", so no semicolon is due yet. */
const CONTINUES = /[{}([,:;+\-*/%&|<>=?]$|=>$|&&$|\|\|$|\.$/;
/** A following line that is itself a continuation of the one above. */
const CONTINUATION_START = /^([{})\]]|\.|\?|:|&&|\|\||\+|,|=>|where\b|else\b)/;
const BLOCK_HEAD =
  /^(if|else|for|foreach|while|switch|do|try|catch|finally|lock|using|fixed|unsafe|checked|unchecked|get|set|add|remove|case|default|namespace|class|struct|interface|enum|record|delegate|public|private|protected|internal|static|abstract|sealed|virtual|override|partial|new|readonly|const|\[|#)/;

function checkSemicolons(code: string, mask: string): Diagnostic[] {
  const out: Diagnostic[] = [];
  const lines = mask.split('\n');
  const rawLines = code.split('\n');

  const nextMeaningful = (from: number) => {
    for (let k = from + 1; k < lines.length; k++) {
      const t = lines[k].trim();
      if (t) return t;
    }
    return '';
  };

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    if (CONTINUES.test(t)) continue;
    if (BLOCK_HEAD.test(t)) continue;
    // A bare `)` or an attribute never needs one; a label ends in ':' and is caught above.
    if (/^\w+\s*:$/.test(t)) continue;

    const after = nextMeaningful(i);
    if (after && CONTINUATION_START.test(after)) continue;

    // Only flag lines that look like a finished statement: a call, an assignment, a return.
    if (!/[\w)\]"']$/.test(t)) continue;
    if (!/(\)|\w)$/.test(t)) continue;
    if (/^(return|break|continue|throw|yield)\b/.test(t) || /=|\(\s*\)|\)/.test(t)) {
      out.push({
        line: i + 1,
        column: rawLines[i].length + 1,
        severity: 'error',
        ruleId: 'CS1002',
        message: 'Missing ; at the end of this statement.',
      });
    }
  }
  return out;
}

const distance = (a: string, b: string): number => {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let corner = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, corner + (a[i - 1] === b[j - 1] ? 0 : 1));
      corner = t;
    }
  }
  return prev[b.length];
};

/** The closest known name, when it is close enough to be worth naming. */
function nearest(name: string, known: Iterable<string>): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const k of known) {
    const d = distance(name.toLowerCase(), k.toLowerCase());
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return best && bestD <= Math.max(2, Math.floor(name.length / 3)) ? best : null;
}

/** Which trait system a snippet is talking about, when it is talking about exactly one. */
function traitSystem(code: string): string | null {
  const found = new Set<string>();
  const pairs: Array<[RegExp, string]> = [
    [/\bnew ActorTrait\b|AssetManager\.traits\b|AssetManager\.trait_groups\b/, 'actor'],
    [/\bnew CultureTrait\b|AssetManager\.culture_traits\b/, 'culture'],
    [/\bnew ReligionTrait\b|AssetManager\.religion_traits\b/, 'religion'],
    [/\bnew SubspeciesTrait\b|AssetManager\.subspecies_traits\b/, 'subspecies'],
    [/\bnew ClanTrait\b|AssetManager\.clan_traits\b/, 'clan'],
    [/\bnew LanguageTrait\b|AssetManager\.language_traits\b/, 'language'],
    [/\bnew KingdomTrait\b|AssetManager\.kingdoms_traits\b/, 'kingdom'],
  ];
  for (const [re, name] of pairs) if (re.test(code)) found.add(name);
  return found.size === 1 ? [...found][0] : null;
}

/** Members the game marks `internal`, so they only compile against a publicized dll. */
const INTERNAL_MEMBERS: Record<string, string> = {
  addStatusEffect: 'World.world.statuses.newStatus(actor, asset, seconds)',
  getHit: 'a Harmony patch, or changeHealth()',
  updateStats: 'a Harmony postfix on Actor.updateStats',
  addBuilding: 'World.world.buildings.addBuilding on a publicized dll',
};

function checkWorldBoxApi(code: string, mask: string, text: string): Diagnostic[] {
  const out: Diagnostic[] = [];
  const lineAt = (index: number) => at(code, index);

  /** Structural rules read `mask`; rules that need a literal's value read `text`. */
  const scanIn = (source: string) => (re: RegExp, fn: (m: RegExpExecArray) => Diagnostic | null) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const d = fn(m);
      if (d) out.push(d);
    }
  };
  const scanAll = scanIn(mask);
  const scanText = scanIn(text);

  // AssetManager.<library>
  scanAll(/\bAssetManager\s*\.\s*([A-Za-z_]\w*)/g, (m) => {
    const name = m[1];
    if (ASSET_LIBRARIES.has(name)) return null;
    const guess = nearest(name, ASSET_LIBRARIES);
    return {
      ...lineAt(m.index),
      severity: 'error',
      ruleId: 'WB001',
      message: `AssetManager has no library called '${name}'.${guess ? ` Did you mean '${guess}'?` : ''}`,
    };
  });

  // base_stats["..."] / stats["..."] — an unknown key throws a NullReferenceException.
  scanText(/\b(base_stats(?:_male|_female|_meta)?|stats)\s*\[\s*"([^"\n]*)"/g, (m) => {
    const key = m[2];
    if (STAT_IDS.has(key)) return null;
    const guess = nearest(key, STAT_IDS);
    return {
      ...lineAt(m.index),
      severity: 'error',
      ruleId: 'WB002',
      message: `'${key}' is not a stat. base_stats looks it up and gets null, so this line throws a NullReferenceException.${guess ? ` Did you mean '${guess}'?` : ''}`,
    };
  });

  // addTag / hasTag
  scanText(/\b(?:addTag|hasTag)\s*\(\s*"([^"\n]*)"/g, (m) => {
    const tag = m[1];
    if (STAT_TAGS.has(tag)) return null;
    const guess = nearest(tag, STAT_TAGS);
    return {
      ...lineAt(m.index),
      severity: 'warning',
      ruleId: 'WB003',
      message: `Nothing in the game reads the tag '${tag}', so this never matches.${guess ? ` Did you mean '${guess}'?` : ''}`,
    };
  });

  // group_id, when the snippet names exactly one trait system
  const system = traitSystem(mask);
  if (system) {
    const groups = TRAIT_GROUPS[system];
    scanText(/\bgroup_id\s*=\s*"([^"\n]*)"/g, (m) => {
      const id = m[1];
      if (groups.has(id)) return null;
      const guess = nearest(id, groups);
      return {
        ...lineAt(m.index),
        severity: 'warning',
        ruleId: 'WB004',
        message: `'${id}' is not a vanilla ${system} trait group, so the trait has no tab to appear in. Register the group first, or use one of: ${[...groups].join(', ')}.${guess ? ` Did you mean '${guess}'?` : ''}`,
      };
    });
  }

  // item group_id, only when the snippet is clearly about equipment
  if (!system && /\bnew (Equipment|Item)Asset\b|AssetManager\.items\b|AssetManager\.item_groups\b/.test(mask)) {
    scanText(/\bgroup_id\s*=\s*"([^"\n]*)"/g, (m) => {
      const id = m[1];
      if (ITEM_GROUPS.has(id)) return null;
      return {
        ...lineAt(m.index),
        severity: 'warning',
        ruleId: 'WB005',
        message: `'${id}' is not a vanilla item group. Register it in AssetManager.item_groups first, and create its equipment pools.`,
      };
    });
  }

  // clone() already registers, so a following add() of the same variable registers twice
  scanAll(/\b(\w+)\s*=\s*AssetManager\s*\.\s*(\w+)\s*\.\s*clone\s*\(/g, (m) => {
    const variable = m[1];
    const dup = new RegExp(`AssetManager\\s*\\.\\s*\\w+\\s*\\.\\s*add\\s*\\(\\s*${variable}\\s*\\)`);
    const found = dup.exec(mask.slice(m.index));
    if (!found) return null;
    return {
      ...lineAt(m.index + found.index),
      severity: 'warning',
      ruleId: 'WB006',
      message: `clone() already calls add(), so registering '${variable}' again logs "duplicate asset - overwriting...". Drop the add().`,
    };
  });

  // base_stats written before the asset is registered: the library allocates it inside add()
  scanAll(/\b(\w+)\s*=\s*new\s+\w*(?:Trait|Asset|Power)\w*\s*[({]/g, (m) => {
    const variable = m[1];
    const addRe = new RegExp(`\\.\\s*add\\s*\\(\\s*${variable}\\s*\\)`);
    const add = addRe.exec(mask);
    if (!add) return null;
    const statRe = new RegExp(`\\b${variable}\\s*\\.\\s*base_stats\\w*\\s*\\[`, 'g');
    let s: RegExpExecArray | null;
    while ((s = statRe.exec(mask)) !== null) {
      if (s.index < add.index) {
        return {
          ...lineAt(s.index),
          severity: 'error',
          ruleId: 'WB007',
          message: `'${variable}.base_stats' does not exist yet — the library allocates it inside add(). Move this below AssetManager.<library>.add(${variable}); or you get a NullReferenceException.`,
        };
      }
    }
    return null;
  });

  // internal members need a publicized Assembly-CSharp.dll
  for (const [member, alternative] of Object.entries(INTERNAL_MEMBERS)) {
    scanAll(new RegExp(`\\.\\s*(${member})\\s*\\(`, 'g'), (m) => ({
      ...lineAt(m.index),
      severity: 'warning',
      ruleId: 'WB008',
      message: `'${member}' is internal in the game assembly. It only compiles against a publicized Assembly-CSharp.dll — otherwise use ${alternative}.`,
    }));
  }

  return out;
}

function checkJson(code: string): Diagnostic[] {
  try {
    JSON.parse(code);
    return [];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const pos = /position (\d+)/.exec(message);
    const where = pos ? at(code, Number(pos[1])) : { line: 1, column: 1 };
    return [{ ...where, severity: 'error', ruleId: 'JSON', message }];
  }
}

/**
 * Check a snippet. Reports real problems only: it never rewrites the code, and it never
 * reports a "fix", because a wrong autofix is worse than no check at all.
 */
export function checkCode(code: string, language = 'csharp'): Diagnostic[] {
  if (!code.trim()) return [];
  if (language === 'json') return checkJson(code);
  if (language !== 'csharp' && language !== 'cs' && language !== 'c#') return [];

  const { mask, text, diagnostics } = scan(code);
  const all = [...diagnostics];

  // A broken delimiter or string makes every later pass guess, so stop and report that first.
  if (all.length === 0) all.push(...checkSemicolons(code, mask));
  all.push(...checkWorldBoxApi(code, mask, text));

  return all.sort((a, b) => a.line - b.line || a.column - b.column);
}
