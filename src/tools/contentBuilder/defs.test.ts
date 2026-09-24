// Runs every Content builder generator with its defaults (and with every toggle on) through
// the same C# checker the code blocks use. A generator that emits broken code fails here.
import { DEFS, type Values } from './defs.ts';
import { checkCode } from '../../utils/csharpCheck.ts';

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
    if (!out.code.includes('public static void Initialize()')) {
      failed++;
      console.error(`${def.key}: no Initialize()`);
    }
  }
}
if (failed) {
  console.error(`contentBuilder: ${failed} failures`);
  process.exit(1);
}
console.log(`contentBuilder: all ${DEFS.length} content types generate clean code`);
