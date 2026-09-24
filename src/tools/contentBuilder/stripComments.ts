/**
 * Strips single-line (//) and multi-line (/* *\/) comments from C# code.
 * Preserves strings (regular, verbatim @"" and char literals) containing comment tokens.
 */
export function stripCSharpComments(code: string): string {
  let result = '';
  let i = 0;
  const len = code.length;
  let inString = false;
  let inVerbatimString = false;
  let inChar = false;
  let inLineComment = false;
  let inBlockComment = false;

  let lineStartIdx = 0;
  let lineHasCode = false;

  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : '';

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        if (lineHasCode) {
          result += '\n';
        }
        lineStartIdx = result.length;
        lineHasCode = false;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inString) {
      result += ch;
      if (ch === '\\' && i + 1 < len) {
        result += next;
        i += 2;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      i++;
      continue;
    }

    if (inVerbatimString) {
      result += ch;
      if (ch === '"' && next === '"') {
        result += next;
        i += 2;
        continue;
      }
      if (ch === '"') {
        inVerbatimString = false;
      }
      i++;
      continue;
    }

    if (inChar) {
      result += ch;
      if (ch === '\\' && i + 1 < len) {
        result += next;
        i += 2;
        continue;
      }
      if (ch === '\'') {
        inChar = false;
      }
      i++;
      continue;
    }

    // Normal mode
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      if (lineHasCode) {
        let last = result.length - 1;
        while (last >= lineStartIdx && (result[last] === ' ' || result[last] === '\t')) {
          last--;
        }
        result = result.slice(0, last + 1);
      } else {
        result = result.slice(0, lineStartIdx);
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (ch === '@' && next === '"') {
      inVerbatimString = true;
      result += '@"';
      i += 2;
      lineHasCode = true;
      continue;
    }

    if (ch === '"') {
      inString = true;
      result += ch;
      i++;
      lineHasCode = true;
      continue;
    }

    if (ch === '\'') {
      inChar = true;
      result += ch;
      i++;
      lineHasCode = true;
      continue;
    }

    if (ch === '\n') {
      result += ch;
      lineStartIdx = result.length;
      lineHasCode = false;
      i++;
      continue;
    }

    if (ch !== ' ' && ch !== '\t' && ch !== '\r') {
      lineHasCode = true;
    }

    result += ch;
    i++;
  }

  return result
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}
