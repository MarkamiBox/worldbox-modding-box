---
title: 本
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbscroll:
order: 187
---

# 本 :wbscroll:

ユニットは本を書き、都市は本を保管し、ほかのユニットはそれを読んで少し変わって出てきます。本の種類とは、この循環の中の新しい種類の本のことです：誰が書くか、何という題か、表紙はどんな見た目か、読むと何が起きるか。

**[言語特性](#/nml/language-traits)** のページで、もう小さな本をひとつ作っています。残り火の年鑑です。このページではその同じ本を仕上げます：自前の題名、ちゃんとした報酬、そして読んだときに起きること。

## 本が生まれるまで

ここではパッチは一切いりません。循環を知っていればいいだけです：

1. ユニットが書くと決めます。ゲームは、そのユニットで `requirement_check` を通るすべての本の種類を集めます。
2. それぞれが `writing_rate` 回（`rate_calc` を設定していればその回数）袋に入り、**最大10回**、そこからひとつ引かれます。
3. 本には、書き手の**都市**に空きのある本棚を持つ建物が必要です。図書館がなければ本もありません。
4. 題名は `name_template` の名前ジェネレーターから、表紙は `path_icons` のフォルダから来ます。
5. あとで誰かがそれを読み、下の報酬を受け取ります。

ゲームは毎回 `book_types.list` を読み直すので、本の種類に必要なのは `add()` だけです。プールもpost-initもなし。珍しくうれしい驚きです :PESgn_Neat:。

## コード

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

このファイルは言語特性のページの `HelloBooks.cs` を**置き換えます**。同じクラスが成長したものです。`HelloBooks.Initialize()` は、使っている特性とステータスの後に置いてください。

## 読むと何がもらえるか

`base_stats` の数値は、時間で消えるバフではありません。読むたびに1回配られます：

| ステータス | 読んだ人がもらうもの |
| --- | --- |
| `happiness` | その分の幸福度。「本を読んだばかり」イベントとして。マイナスも可、気が滅入る本に |
| `experience` | その分の経験値 |
| `mana` | その分のマナ |
| `diplomacy`、`warfare`、`stewardship`、`intelligence` | 読んだ人に**永久に**加算。読むたびにまた |

最後の行が強力です。`intelligence = 1` の本は、読書好きの都市を世代ごとに賢くしていくので、小さい値にしておきましょう。+10の本なら、50年目までに天才の王国ができあがります :wbgenius:。

言語と文化の特性は最初の2つを変えられます：`beautiful_calligraphy` を持つ言語は幸福度を大きくし、`reading_lovers` を持つ文化は悲しい本を楽しい本に変えます。

## 重要なフィールド

| フィールド | 役割 |
| --- | --- |
| `name_template` | 題名用の名前ジェネレーター。バニラの例：`book_name_fable`、`book_name_love_story`、`book_name_history`... |
| `writing_rate` | 書き手が種類を選ぶときの重み。バニラは1〜3 |
| `rate_calc` | 代わりに重みを返すメソッド。バニラの戦争の手引きは書き手の `warfare` を使います。やはり最大10 |
| `requirement_check` | 誰が書けるか。`null` = 誰でも |
| `read_action` | 自分のコード。読むたびに1回 |
| `path_icons` | `books/book_icons/` 以下のフォルダで、画像のリストとして読まれます。本ごとにひとつ選ばれる |
| `color_text` | UIでの題名の色 |
| `save_culture` / `save_religion` | 書き手の文化と宗教を本が覚えるかどうか。どちらもデフォルトでオンで、信仰を広める本には大事です |

## 題名ジェネレーター

題名は **[名前ジェネレーター](#/nml/name-generators)** の辞書スタイルを使います。テンプレートは辞書キーのリストで、各キーが自分のリストから単語をひとつ選びます：

- `addDictPart("almanac", "Almanac,Handbook,Notes")` は、候補が3つあるキーを作ります。
- `addTemplate("almanac,of,fire")` は各キーから1語ずつつなげます："Handbook of Ash"。
- `$unit$` や `$city$` のような単語はプレースホルダーです。**replacer** が書き手の本当の名前や都市で埋めます。対応する replacer がないと、表紙にそのまま `$unit$` と出ます :wbfacepalm:。

`$base_book_template$` を複製するのが近道です：小さな単語（`of`、`and`、`about`、`the`...）、すべてのプレースホルダー、ゲーム自身の題名の整形がすでに入っています。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

キーは固定です：`book_type_<id>` と `book_type_info_<id>`。題名そのものは生成されるので、キーはありません。

## 自作の表紙

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` は**フォルダ**で、最後に `/` が付きます。PNGは1枚で十分、中に入っていればいいだけです。テスト中は `fable/` のようなバニラのフォルダを借りましょう。

動いているところを見るには、ワールドを作り、あなたの特性を持つ都市が図書館を建てるまで育てて、都市の本を開いてください。時間はかかります。なにせ本ですから :PES2_Shrug:。
