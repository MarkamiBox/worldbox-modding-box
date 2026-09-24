---
title: 戦争の種類
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbmartialwarfare:
order: 179
---

# 戦争の種類 :wbmartialwarfare:

ゲームのすべての戦争には種類があります：普通の征服戦争、全員を相手にする恨みの戦争、反乱。種類は、戦争がどう名付けられるか、どのアイコンを出すか、同盟国が加わるか、そしてどう終われるかのいくつかのルールを決めます。バニラには5つしかないので、新しいものは目立ちます。

このページでは **残り火の確執** を作ります：両陣営の同盟国を巻き込み、"Cinder Feud of Karvia" のような名前が付き、普通の戦争のように和平の陰謀で終わらせられる戦争です。

## コード

```csharp Mods/HelloBox/Code/HelloWars.cs
namespace HelloBox
{
    public static class HelloWars
    {
        public const string FEUD = "hello_ember_feud";
        public const string NAMES = "hello_war_feud";

        public static void Initialize()
        {
            Names();

            if (AssetManager.war_types_library.has(FEUD)) return;

            AssetManager.war_types_library.add(new WarTypeAsset
            {
                id = FEUD,
                name_template = NAMES,                      // the generator for war names, below
                localized_type = "war_type_hello_ember_feud",
                localized_war_name = "war_name_hello_ember_feud",
                path_icon = "wars/war_hello_ember_feud",    // GameResources/wars/war_hello_ember_feud.png
                kingdom_for_name_attacker = true,           // $kingdom$ in the name = the attacker
                alliance_join = true,                       // both sides' allies join
                can_end_with_plot = true                    // a king can plot to end it
            });
        }

        /** War names in the dictionary style: whole words picked from lists. */
        private static void Names()
        {
            if (AssetManager.name_generator.has(NAMES)) return;

            NameGeneratorAsset names = new NameGeneratorAsset
            {
                id = NAMES,
                use_dictionary = true,
                replacer_kingdom = NameGeneratorReplacers.replaceKingdom   // fills $kingdom$
            };
            names.addDictPart("kingdom_name", "$kingdom$");
            names.addDictPart(" ", " ");
            names.addDictPart("of", "of");
            names.addDictPart("ember", "Ember,Cinder,Ash,Smoke,Soot");
            names.addDictPart("feud", "Feud,Quarrel,Grudge,Blaze");
            names.addTemplate("ember, ,feud");
            names.addTemplate("ember, ,feud, ,of, ,kingdom_name");

            AssetManager.name_generator.add(names);
        }

        /** Start one. The game's own wars go through this same method. */
        public static War Start(Kingdom pAttacker, Kingdom pDefender)
        {
            WarTypeAsset feud = AssetManager.war_types_library.get(FEUD);
            if (feud == null || pAttacker == null || pDefender == null) return null;

            // internal: compiles inside NML. It checks there is no war between them already,
            // logs it in the world history, and pulls in the allies when alliance_join is on.
            return World.world.diplomacy.startWar(pAttacker, pDefender, feud);
        }
    }
}
```

`HelloWars.Initialize()` は `OnModLoad` に入れます。ただし、あなたの戦争が勝手に始まることはありません：バニラの戦争はゲームの外交コードから来ていて、それは自分の5種類しか知りません。`HelloWars.Start` は、ふさわしい場所から呼んでください：**[ゴッドパワー](#/nml/god-powers)**、王が試せる **[陰謀](#/nml/plots)**、あるいは **[意思決定](#/nml/custom-ai)**。

## フィールド

| フィールド | 役割 |
| --- | --- |
| `name_template` | この戦争の名前を作る名前ジェネレーター。バニラ：`war_conquest`、`war_spite`、`war_rebellion`、`war_inspire`、`war_whisper` |
| `localized_war_name` | UIが戦争の種類として表示するテキストキー。ツールチップと戦争ウィンドウに出ます |
| `localized_type` | ゲームが種類用に持っている2つ目のテキストキー。どこに表示されるかは見つけられなかったので、両方埋めてください |
| `path_icon` | 戦争のアイコン。書いたとおりに読み込まれます |
| `kingdom_for_name_attacker` | `$kingdom$` に入る名前：攻撃側（`true`）か防衛側（`false`）か |
| `alliance_join` | 始まったとき、両陣営の同盟が参戦する |
| `total_war` | 攻撃側が恨みの戦争のように**すべての**王国と戦争状態になる。防衛側なしで開始する |
| `rebellion` | 反乱として印を付ける。誰が誰に加われるかが変わる |
| `can_end_with_plot` | 十分に長引いたら、王が和平の陰謀で終わらせられる |
| `forced_war` | 今は何からも呼ばれていないヘルパーがひとつ読むだけ。オフのままで |

> [!WARNING] 総力戦には防衛側がいない
> `total_war` では防衛側が `null` なので、`$kingdom$` を含み `kingdom_for_name_attacker = false` の名前テンプレートは、誰でもない者の名前を求めることになります。総力戦は攻撃側の名前で呼びましょう :PES2_Shrug:。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

名前そのもの（"Cinder Grudge of Karvia"）は生成されるので、キーはありません。単語は `Names()` の辞書から来ます。翻訳したいなら言語ごとにジェネレーターが必要になり、バニラの戦争もそこまではしていません。

## 自作のアイコン

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

テスト中はバニラのものを借りましょう：`wars/war_conquest`、`wars/war_spite`、`wars/war_rebellion`、`wars/war_whisper`。

> [!NOTE] セーブは種類をIDで覚えている
> 戦争は自分の種類のIDをセーブに保存します。あなたのmodなしでそのワールドを読み込むと、戦争はもう存在しない種類を求めて何も受け取れず、無事に済むとは思えません。戦争の途中でプレイヤーがmodを外すリスクは完全には防げませんが、modの説明に1行書いておく価値はあります。
