import fs from 'fs';
import path from 'path';

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res.push(...walk(full));
    else if (f.endsWith('.md')) res.push(full);
  }
  return res;
}

const enBase = path.join('src', 'content', 'en');
const enFiles = walk(enBase).map(f => path.relative(enBase, f).replace(/\\/g, '/'));

const langs = ['de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];

console.log('Total EN files:', enFiles.length);

for (const lang of langs) {
  const langBase = path.join('src', 'content', lang);
  const missing = enFiles.filter(f => !fs.existsSync(path.join(langBase, f)));
  console.log(`Lang [${lang}]: missing ${missing.length}`);
}

const deBase = path.join('src', 'content', 'de');
const missingFiles = enFiles.filter(f => !fs.existsSync(path.join(deBase, f)));
console.log('Missing list:', JSON.stringify(missingFiles, null, 2));
