---
title: 名前ジェネレーター
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbscroll:
order: 186
---

# 名前ジェネレーター :wbscroll:

WorldBoxのすべての名前はジェネレーターから生まれます：ユニット、都市、王国、氏族、戦争、本。あなたの生き物も自分専用のものを持てるので、残り火の精霊の村を人間の名前の借り物ではなく、Ashra や Cindox でいっぱいにできます。

## 名前はどこから来るか

生き物から文字まで、3つの段階です：

| 段階 | アセット | 中身 |
| --- | --- | --- |
| 生き物 | `ActorAsset.name_template_sets` | **名前セット**のIDのリスト。文化ごとにひとつ選ばれる |
| 名前セット | `NameSetAsset`（`name_sets`） | 物の種類ごとに使うジェネレーター：`unit`、`city`、`kingdom`、`clan`、`family`、`culture`、`language`、`religion` |
| ジェネレーター | `NameGeneratorAsset`（`name_generator`） | 名前を実際にどう組み立てるか |

つまり種族全体の名前を変えるには、ジェネレーターを作り、それを使う名前セットを作り、生き物をそのセットに向けます。

## 名前の組み立て方は3通り

ジェネレーターは3つのスタイルのどれかで動き、どのフィールドを埋めたかでゲームが選びます：

- **パーツグループ。** グループのリストがあり、それぞれからランダムにひとつずつ取って貼り合わせます。いちばん簡単で、このページで使う方法です。
- **辞書。** 名前付きのリストから単語を丸ごと選んで文にします。戦争や本が "Bloody Hatred" のような題名を得るのはこれです。**[戦争の種類](#/nml/war-types)** と **[本](#/nml/books)** を参照。
- **オノマスティクス。** バニラの文明のほとんどが使うコンパクトな文字列形式で、文化の中で名前が時間とともに変化するようにもできます。強力ですが、最初に手を出すものではありません。使いたいなら `NameGeneratorLibrary` から既存のものをコピーして、音節を変えてください。

## コード

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

それから、**[カスタムアクター](#/nml/custom-actors)** の生き物に：

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

アクターがセットを参照するので、`HelloNames.Initialize()` は `OnModLoad` でアクターより**前**に置きます。

> [!WARNING] 名前セットの枠はすべて埋める
> 文化は、物の種類ごとに名前セットにジェネレーターを尋ねます。`city` 枠が空だと、ゲームは `""` という名前のジェネレーターを探して `null` を受け取り、あなたの生き物が最初の都市を建てた瞬間にゲームごと落ちます。ほかに案がなければ、全部の枠に同じジェネレーターを入れてください :PESgn_Stop:。

## テンプレートの単語

テンプレートはカンマ区切りの単語のリストです。パーツグループ型のジェネレーターで役立つのはこれらです：

| 単語 | 追加されるもの |
| --- | --- |
| `part_group` / `Part_group` | 各 `addPartGroup` グループからひとつずつ。大文字のPは最初の文字を大文字にする |
| `part_group2`、`part_group3` | `addPartGroup2` と `addPartGroup3` に同じことをする。2語目、3語目用 |
| `space` | 空白。`Part_group,space,Part_group2` で名前と名字になる |
| `vowel` / `consonant` | `vowels` / `consonants` から1文字 |
| `number` | 0〜9の数字1つ。ロボット用、たぶん |

`addTemplate` を何度か呼ぶと、ゲームは名前ごとにランダムでテンプレートを選びます。

## 赤ちゃんを待たずにテストする

`NameGenerator.getName` は public なので、読み込み時にログへ名前を10個出せます：

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

半分が猫がキーボードを歩いたように見えるなら、グループが長すぎます。パーツは短く、グループは多く。ゲームのブラックリストに当たる名前は捨てられて振り直されるので、そういう名前を見ることはありません :PES5_Noted:。

単語を丸ごと使う題名（戦争、本、標語）には辞書スタイルが向いていて、次の2ページでどちらもひとつずつ作ります。
