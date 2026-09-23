// Run with:  node --experimental-strip-types src/utils/csharpCheck.test.ts
//
// Two things this has to prove, in both directions:
//   1. broken code is reported (the check is not decoration)
//   2. working code is left alone (no false alarms on the guide's own snippets)
import { checkCode } from './csharpCheck.ts';

const ids = (code: string, lang = 'csharp') => checkCode(code, lang).map((d) => d.ruleId);
const has = (code: string, rule: string) => ids(code).includes(rule);

let failures = 0;
const expect = (name: string, ok: boolean, detail = '') => {
  if (!ok) {
    failures++;
    console.error(`  FAIL  ${name}${detail ? `\n        ${detail}` : ''}`);
  }
};

// ---------------------------------------------------------------- syntax errors

expect('missing semicolon', has('Debug.Log("hello")\nDebug.Log("world");', 'CS1002'));
expect('unclosed brace', has('public void A() {\n    int x = 1;', 'CS1513'));
expect('unclosed paren', has('Debug.Log("hi";', 'CS1513'));
expect('mismatched closer', has('int[] a = new int[1);', 'CS1513'));
expect('stray closer', has('int x = 1;\n}', 'CS1513'));
expect('unterminated string', has('Debug.Log("hello);', 'CS1010'));
expect('unterminated char', has("char c = 'a;", 'CS1010'));
expect('unterminated block comment', has('/* never ends\nint x = 1;', 'CS1035'));

// ------------------------------------------------------ member-declaration shape (class bodies)

const CLASS = (member: string) =>
  `public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset\n{\n    public List<T> list;\n    ${member}\n}`;

expect(
  'missing ; on a field, even though the line starts with a modifier',
  has(CLASS('public Dictionary<string, T> dict'), 'CS1002'),
);
expect('that same field is quiet once the ; is back', !has(CLASS('public Dictionary<string, T> dict;'), 'CS1519'));
expect(
  'a garbage token in a class body is caught',
  has('public class Foo\n{\n    public int x;\naaa\n}', 'CS1519'),
);
expect(
  'a generic with the opening < deleted is caught',
  has(CLASS('public Dictionaryring, T> dict;'), 'CS1519'),
);
expect('a builtin-type field is not a false alarm', !has(CLASS('public string id;'), 'CS1519'));
expect('a bool property is not a false alarm', !has(CLASS('public bool Flag { get; set; }'), 'CS1519'));
expect(
  'a multi-variable declarator is not a false alarm',
  !has('public class Foo\n{\n    int a, b, c;\n}', 'CS1519'),
);
expect(
  'a qualified type name is not a false alarm',
  !has('public class Foo\n{\n    public System.Collections.Generic.List<string> Items;\n}', 'CS1519'),
);
expect(
  '`i < Defs.Length` in a for-loop is never read as a generic',
  !has(
    'public class Foo\n{\n    public void Run()\n    {\n        for (int i = 0; i < Defs.Length; i++) { }\n    }\n}',
    'CS1519',
  ),
);

// ---------------------------------------------------------------- WorldBox API errors

expect('unknown AssetManager library', has('AssetManager.traitz.add(t);', 'WB001'));
expect(
  'unknown library suggests the real one',
  checkCode('AssetManager.trait.add(t);').some((d) => d.message.includes('traits')),
  checkCode('AssetManager.trait.add(t);')[0]?.message,
);
expect('valid library is quiet', !has('AssetManager.subspecies_traits.add(t);', 'WB001'));

expect('unknown stat key', has('trait.base_stats["dammage"] = 5;', 'WB002'));
expect(
  'unknown stat suggests the real one',
  checkCode('trait.base_stats["dammage"] = 5;').some((d) => d.message.includes('damage')),
);
expect('valid stat is quiet', !has('trait.base_stats["critical_chance"] = 0.1f;', 'WB002'));
expect('male/female stat blocks are checked too', has('t.base_stats_male["nope"] = 1;', 'WB002'));
expect('live stats block is checked too', has('float f = actor.stats["nope"];', 'WB002'));

expect('unknown stat tag', has('t.base_stats.addTag("immunity_fyre");', 'WB003'));
expect('valid stat tag is quiet', !has('t.base_stats.addTag("immunity_fire");', 'WB003'));

expect(
  'unknown actor trait group',
  has('ActorTrait t = new ActorTrait { group_id = "warfare" };\nAssetManager.traits.add(t);', 'WB004'),
);
expect(
  'valid actor trait group is quiet',
  !has('ActorTrait t = new ActorTrait { group_id = "physique" };\nAssetManager.traits.add(t);', 'WB004'),
);
expect(
  'culture groups are checked against the culture list',
  !has('CultureTrait t = new CultureTrait { group_id = "warfare" };\nAssetManager.culture_traits.add(t);', 'WB004'),
);

expect(
  'add() after clone()',
  has(
    'BuildingAsset b = AssetManager.buildings.clone("x", "temple_human");\nAssetManager.buildings.add(b);',
    'WB006',
  ),
);
expect(
  'clone on its own is quiet',
  !has('BuildingAsset b = AssetManager.buildings.clone("x", "temple_human");\nb.max_houses = 0;', 'WB006'),
);

expect(
  'base_stats before add()',
  has(
    'ActorTrait t = new ActorTrait { id = "x" };\nt.base_stats["damage"] = 5;\nAssetManager.traits.add(t);',
    'WB007',
  ),
);
expect(
  'base_stats after add() is quiet',
  !has(
    'ActorTrait t = new ActorTrait { id = "x" };\nAssetManager.traits.add(t);\nt.base_stats["damage"] = 5;',
    'WB007',
  ),
);

expect('internal member is flagged', has('actor.addStatusEffect("hello_cursed");', 'WB008'));

// ---------------------------------------------------------------- JSON

expect('broken json', ids('{ "a": 1,, }', 'json').includes('JSON'));
expect('valid json is quiet', ids('{ "a": 1 }', 'json').length === 0);

// ---------------------------------------------------------------- no false alarms

const VALID = [
  `ActorTrait swift = new ActorTrait
{
    id = "hello_swift",
    path_icon = "ui/Icons/iconSpeed",
    group_id = "physique",
    rate_birth = 0
};
AssetManager.traits.add(swift);
swift.base_stats["speed"] = 20f;`,

  `cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null) return false;
    return true;
};`,

  `tab = TabManager.CreateTab(
    "Tab_MyMod",
    "mymod_tab",
    "mymod_tab_description",
    SpriteTextureLoader.getSprite("ui/Icons/iconMyTab"));`,

  `string path = System.IO.Path.Combine(
    GetDeclaration().FolderPath,
    "GameResources",
    "ui");`,

  `blade.materials = new List<string> { "iron", "steel" };`,

  `public const string SWIFT = "hello_swift";
public const char SEP = ';';`,

  `namespace HelloBox
{
    public static class HelloTraits
    {
        // a comment with an unmatched ( and a stray " inside it
        public static void Initialize()
        {
            if (AssetManager.traits.has("hello_swift")) return;
        }
    }
}`,

  `string s = @"a verbatim ""quoted"" path C:\\Users";
string t = $"interpolated {s} value";`,

  `for (int i = 0; i < Defs.Length; i++)
{
    Register(Defs[i]);
}`,

  `[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    public static void Postfix(Actor __instance)
    {
        __instance.stats["speed"] += 20f;
    }
}`,
];

for (const code of VALID) {
  const found = checkCode(code).filter((d) => d.severity === 'error');
  expect(
    'valid snippet stays clean',
    found.length === 0,
    found.map((d) => `line ${d.line}: ${d.ruleId} ${d.message}`).join('\n        ') + `\n---\n${code}`,
  );
}

if (failures > 0) {
  console.error(`\ncsharpCheck: ${failures} check(s) failed`);
  process.exit(1);
}
console.log('csharpCheck: all checks passed');
