---
title: 言語特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbconfused:
order: 112
---

# 言語特性 :wbconfused:

**言語**は都市や王国に属し、伝播とともに語形変化を起こし、そして最も重要な点として**書物**が執筆される母体となります。言語特性とは、話し言葉や書き言葉そのものに宿る性質です。

7つある特性システムの中で最も規模が小さく、最も固有のフックを備えています。すなわち、誰かがその言語で書かれた**本を読んだ**際に実行されるコードです。

| | |
| --- | --- |
| ライブラリ | `AssetManager.language_traits` |
| クラス | `LanguageTrait` |
| グループ | `AssetManager.language_trait_groups`, クラス `LanguageTraitGroupAsset` |
| 実行時の所持者 | `Language`, `World.world.languages` 内 |
| ローカライズ接頭辞 | `language_trait_` |
| デフォルトのアイコンフォルダ | `ui/Icons/language_traits/` |

## 登録する

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // この特性の「価値」。詳細は後述
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

言語の `base_stats` はユニットに**確実に届きます**。`Actor.updateStats()` はその言語を話す全員に `language.base_stats` を合成します。合成順序は **[ステータスリファレンス](#/nml/stats)** を参照してください。

## 読書フック

`read_book_trait_action` は言語特性だけが備えている専用フィールドです。ユニットがその言語で書かれた本を読み終えた瞬間に発火します:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // バニラではこのフックの発動確率として `value` を再利用します

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

バニラの呪われた書物や祝福された書物はまさにこのように動作しています。`words_of_madness` は `value` で判定を行って `madness` 特性を付与し、`cursed_font` はステータス効果を付与し、`font_of_gods` はより強力な効果を付与します。

バニラから真似るべき2つのポイント:

- **定数ではなく `pTrait.value` から確率を読み取ること。** 特性オブジェクトが引数として渡されるのは、同一のデリゲートで強度違いの複数特性を処理できるようにするためです。
- **免疫を持つべきユニットは早期リターンで弾くこと。** バニラの実装はすべて最初に `evil` や `blessed` をチェックしています。

## 独自の本の種類を作成する

ゲーム内の書籍フォーマットは `AssetManager.book_types` で定義されています:

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset book = new BookTypeAsset
            {
                id = ALMANAC,
                name = "book_type_" + ALMANAC,
                description = "book_type_info_" + ALMANAC,
                rarity = 5
            };
            AssetManager.book_types.add(book);
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## `value` フィールド

`value` は全特性クラスに存在しますが、言語において最も活用されています。バニラでは主に2つの用途で設定されています:

| 用途 | 例 |
| --- | --- |
| 言語の品格・品質 | `melodic` や `stylish_writing` が `value = 3f` を使用 |
| 読書フックの発動確率 | `words_of_madness` が `value = 0.1f` を使用 |

どちらの意味を選ぶかは開発者に委ねられています。特性ごとに意図を決め、首尾一貫させましょう。

## 相反する特性

言語特性は他のどのシステムよりも対立ペアを形成します。言語に整った文法があるか、それとも落書き同然かは二者択一だからです:

```csharp
trait.addOpposite("scribble");
```

バニラが `scribble` と `nicely_structured_grammar` を互いの相反特性として定義しているのと同様に、双方向から宣言してください。

## バニラのグループ

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

独自のタブを作成する場合: **[特性グループとタブ](#/nml/trait-groups)** を参照してください（`AssetManager.language_trait_groups` と `LanguageTraitGroupAsset`）。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## 特性を付与する

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

`Language` は `cities`, `kingdoms`, `books` も公開しており、自作コードで言語の勢力圏を調べる際にこれらを参照します。

> [!TIP] 書物は過小評価されている伝達システム
> 自作の言語で書かれた本は、特性やステータス効果をじわじわと世界に定着させる有機的な手段です。図書館を通じて巡り、世代を超えて広がり、プレイヤーはその光景を見届けます。この仕組みに手をつけるMOD開発者は稀であり、だからこそ作る価値があります :PES4_Classy:。
