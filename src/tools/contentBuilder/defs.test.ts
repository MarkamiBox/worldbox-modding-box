// Runs every Content builder generator with its defaults (and with every toggle on) through
// the same C# checker the code blocks use. A generator that emits broken code fails here.
import { DEFS, type Values } from './defs.ts';
import { checkCode } from '../../utils/csharpCheck.ts';
import { TEMPLATES } from './templates.ts';
import { stripCSharpComments } from './stripComments.ts';
// @ts-expect-error plain JS script
import { buildTemplates } from '../../../scripts/build-builder-templates.mjs';

// the templates must still match the guide pages they were copied from
const fresh = buildTemplates() as Record<string, string>;
for (const key of Object.keys(fresh)) {
  if (fresh[key] !== TEMPLATES[key]) {
    console.error(`contentBuilder: template "${key}" is out of date. Run node scripts/build-builder-templates.mjs`);
    process.exit(1);
  }
}

let failed = 0;
for (const def of DEFS) {
  const base: Values = { name: 'Name', desc: 'Description' };
  for (const fl of def.fields) base[fl.key] = fl.def;
  const variants: Values[] = [base, { ...base, ...Object.fromEntries(def.fields.filter((fl) => fl.kind === 'bool').map((fl) => [fl.key, !fl.def])) }];
  if (def.fields.some((fl) => fl.kind === 'stats')) variants.push({ ...base, stats: [{ stat: 'damage', value: 5 }, { stat: 'speed', value: 0.5 }] });
  for (const fl of def.fields.filter((x) => x.kind === 'select')) {
    for (const opt of fl.options ?? []) variants.push({ ...base, [fl.key]: opt });
  }
  for (const v of variants) {
    const out = def.gen(v, 'MyMod');
    const errors = checkCode(out.code).filter((d) => d.severity === 'error');
    if (errors.length) {
      failed++;
      console.error(`${def.key}: ${errors.map((e) => `${e.line}: ${e.message}`).join('; ')}`);
    }
    if (!def.template && !out.code.includes('public static void Initialize()')) {
      failed++;
      console.error(`${def.key}: no Initialize()`);
    }
    const stripped = stripCSharpComments(out.code);
    const strippedErrors = checkCode(stripped).filter((d) => d.severity === 'error');
    if (strippedErrors.length) {
      failed++;
      console.error(`${def.key} (stripped): ${strippedErrors.map((e) => `${e.line}: ${e.message}`).join('; ')}`);
    }
  }
}
if (failed) {
  console.error(`contentBuilder: ${failed} failures`);
  process.exit(1);
}
console.log(`contentBuilder: all ${DEFS.length} content types generate clean code, templates match the guide`);
