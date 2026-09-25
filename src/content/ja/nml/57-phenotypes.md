---
title: 表現型と遺伝
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbgoldenbrain:
order: 115
---

# 表現型と遺伝 :wbgoldenbrain:

WorldBoxの亜種システムでは、生き物の姿は単一のスプライトに固定されていません。肌の色合い、髪色、頭部装飾、角といった**表現型（phenotype）**を持ち、親から遺伝し世代を超えて変異します。

ここでは `AssetManager.phenotype_library` の仕組みと独自の表現型を追加する方法を解説します。

## 表現型の仕組み

生物の亜種はそれぞれ表現型の候補プールを持っています：

| プロパティ | 設定内容 |
| --- | --- |
| **`id`** | 表現型アセットの一意なID |
| **`skin_colors`** | 選択可能な肌色のカラーパレット |
| **`hair_colors`** | 選択可能な髪色のカラーパレット |
| **`head_pieces`** | 頭部アクセサリ、角、耳、顔面パーツ |
| **`chance`** | 亜種生成時に選ばれる確率ウェイト |

繁殖時、子は両親の遺伝子を組み合わせ、低確率の突然変異によって新たな表現型を発現させます :PES5_BigBrain:。

## コード

このコードでは燃えるような肌色と専用の角を持つ表現型を登録します：

```csharp Mods/HelloBox/Code/HelloPhenotypes.cs
using System;
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloPhenotypes
    {
        public const string PHENOTYPE_ID = "phenotype_hello_ember";

        public static void Initialize()
        {
            if (AssetManager.phenotype_library.has(PHENOTYPE_ID)) return;

            // 1. Create the phenotype asset
            PhenotypeAsset ember = new PhenotypeAsset
            {
                id = PHENOTYPE_ID,
                localized_key = "phenotype_name_hello_ember",
                chance = 10
            };

            // 2. Set allowed skin tone and hair color ranges
            ember.colors_skin = new List<string> { "#FF4500", "#FF8C00", "#FFA500" };
            ember.colors_hair = new List<string> { "#8B0000", "#B22222", "#FF0000" };

            AssetManager.phenotype_library.add(ember);
        }

        /** Attach this phenotype to a subspecies */
        public static void ApplyToSubspecies(Subspecies pSubspecies)
        {
            if (pSubspecies == null) return;

            if (pSubspecies.data != null && pSubspecies.data.phenotypes != null)
            {
                if (!pSubspecies.data.phenotypes.Contains(PHENOTYPE_ID))
                {
                    pSubspecies.data.phenotypes.Add(PHENOTYPE_ID);
                }
            }
        }
    }
}
```

## 独自の角や頭部パーツを追加する

頭部パーツは `GameResources/actors/species/` 内のスプライトシートを参照します：

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

スプライト画像はMODの `GameResources/` フォルダ内に配置します（**[スプライトとリソース](#/nml/sprites-and-resources)** を参照）。

## よくある落とし穴

- **カラーリストの空指定**: 色リストが空だとユニットがマゼンタ色や真っ黒で描画されます。
- **遺伝的浮動**: 希少な表現型は世代交代を繰り返すうちに自然淘汰されることがあります。`chance` のバランスを調整してください :PES2_HmmmmNoted:。
- **亜種特性との組み合わせ**: 外見だけでなく機能的な違いも与えるため、**[亜種の特性](#/nml/subspecies-traits)** と連動させましょう。
