---
title: バイオーム
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbflowerbud:
order: 171
---

# バイオーム :wbflowerbud:

バイオームは、世界の他のすべてがぶら下がっている部分です：どんな地面を塗るか、どんな木や植物が育つか、どんな生き物がやって来るか、そこで生まれたものがどんな特性（trait）を得るか。バイオームmod？このご時世に？ええ、しかも見た目ほど大変ではありません。バイオームはほとんど他人のIDのリストだからです :PESgn_Noice:。

このページでは **残り火の原** を作ります：自前のタイル2枚、自前の種、サバンナの生き物、そしてそこで生まれるもの全部に付く特性。

## 部品

バイオームはひとつのアセットではなく、互いを指し合う4つのアセットです：

| 部品 | ライブラリ | 役割 |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | バイオーム本体：何が育ち、何が出現し、どう広がるか |
| `TopTileType` 2つ | `top_tiles` | 塗る地面：**低い**ものと**高い**もの |
| `DropAsset` | `drops` | 落ちて地面をあなたのバイオームに変える種 |
| `GodPower` | `powers` | プレイヤーが種をまくボタン |

タイルは自分がどのバイオームに属するか（`biome_id`）を、バイオームはどのタイルが自分のものか（`tile_low`、`tile_high`）を持っています。両方向が一致していなければなりません。

## コード

```csharp Mods/HelloBox/Code/HelloBiomes.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloBiomes
    {
        public const string BIOME = "biome_hello_ember";
        public const string LOW = "hello_ember_low";
        public const string HIGH = "hello_ember_high";
        public const string SEEDS = "seeds_hello_ember";

        public static void Initialize()
        {
            if (AssetManager.biome_library.has(BIOME)) return;

            // 1. The ground. Clone the grass pair and point both at your biome.
            TopTileType low = Tile(LOW, "grass_low", "#B5582A");
            TopTileType high = Tile(HIGH, "grass_high", "#8E4020");

            // 2. The biome.
            BiomeAsset biome = new BiomeAsset
            {
                id = BIOME,
                tile_low = LOW,
                tile_high = HIGH,
                localized_key = BIOME,              // its text key, in snake_case
                spread_biome = true,                // grows into the grass next to it
                spread_by_drops_water = true,
                generator_pot_amount = 3,           // how often new worlds roll it. Grass uses 8
                grow_type_selector_minerals = TileActionLibrary.getGrowTypeRandomMineral,
                grow_type_selector_trees = TileActionLibrary.getGrowTypeRandomTrees,
                grow_type_selector_plants = TileActionLibrary.getGrowTypeRandomPlants,
                grow_type_selector_bushes = TileActionLibrary.getGrowTypeRandomBushes,
                subspecies_name_suffix = new string[] { "cinereus", "ardens" }
            };
            AssetManager.biome_library.add(biome);

            // what grows and what walks in. The number is the weight
            biome.addTree("savanna_tree_1", 3);
            biome.addPlant("savanna_plant");
            biome.addBush("fruit_bush");
            biome.addMineral("mineral_stone", 4);
            biome.addUnit("hyena");
            biome.addUnit("buffalo", 2);
            biome.addSapientUnit("human");

            // born here, gets this. biome.addActorTrait() does the same, but it is internal:
            // fine inside NML, a compile error in your own .dll. The list works everywhere
            biome.spawn_trait_actor = new List<string> { "fire_proof" };

            // linkAssets() built the world generator's pool at startup, before your mod existed.
            for (int i = 0; i < biome.generator_pot_amount; i++)
            {
                BiomeLibrary.pool_biomes.Add(biome);
            }

            // now the tiles can link back to the biome that exists
            low.biome_asset = biome;
            high.biome_asset = biome;

            // 3. The seeds. Clone the grass seeds and aim them at your two tiles.
            DropAsset seeds = AssetManager.drops.clone(SEEDS, "seeds_grass");
            seeds.drop_type_low = LOW;
            seeds.drop_type_high = HIGH;
            // DropsLibrary.linkAssets() turns those ids into tiles at startup. Do it yourself.
            seeds.cached_drop_type_low = low;
            seeds.cached_drop_type_high = high;

            // 4. The power that throws them.
            GodPower power = AssetManager.powers.clone(SEEDS, "$template_seeds$");
            power.drop_id = SEEDS;
            power.name = SEEDS;                     // also its text key
            power.path_icon = "ui/Icons/iconHelloSeeds";
        }

        private static TopTileType Tile(string pId, string pFrom, string pColor)
        {
            TopTileType tile = AssetManager.top_tiles.clone(pId, pFrom);
            tile.setBiome(BIOME);
            tile.color_hex = pColor;

            // [NonSerialized] fields: clone() skips them and linkAssets() already ran.
            tile.color = Toolbox.makeColor(tile.color_hex);
            tile.has_biome_tags = tile.biome_tags != null && tile.biome_tags.Count > 0;

            // your art in GameResources/tiles/<id>/, loaded at startup in the vanilla case
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + tile.id);
            if (variations.Length > 0)
            {
                tile.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    tile.sprites.addVariation(variation, tile.id);
                }
            }
            return tile;
        }
    }
}
```

`HelloBiomes.Initialize();` を `OnModLoad` に追加し、ほかのパワー（GodPower）と同じようにボタンを付けてください：**[パワーのタブとボタン](#/nml/power-buttons)**。

> [!WARNING] Initialize の中の順番が大事
> タイルはバイオームが存在する前に複製されるので、`biome_asset` は `add()` の**後で**設定します。先に結びつけると `null` と結びつくことになり、バイオームが null のタイルは何も育てず誰も出現させません。エラーはひとつも出ません :wbfacepalm:。

## 重要なフィールド

| フィールド | 役割 |
| --- | --- |
| `tile_low` / `tile_high` | このバイオームが塗る2つの地面タイル。低い地面と高い地面 |
| `localized_key` | テキストキー。snake_case に変換されます。`biome_hello_ember` はそのまま |
| `spread_biome` | 隣のタイルへ自然に広がる |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | どの落下物がこれを別の場所へ運べるか |
| `generator_pot_amount` | ワールド生成でのくじの枚数。0 = 新しいワールドでは決して選ばれない |
| `grow_strength` | 広がるときの押しの強さ。デフォルトは6 |
| `cold_biome` / `dark_biome` | 他のシステムが確認するフラグ。本当に寒い、暗い場合だけ設定 |
| `special_biome` | 普通の緑のバイオームではない特殊なものの印。バニラは砂地と丘に使っています |
| `subspecies_name_suffix` | ここで進化した亜種（subspecies）に付くラテン語風の語尾 |
| `spawn_trait_actor`、`spawn_trait_subspecies`、`spawn_trait_culture`、`spawn_trait_clan`、`spawn_trait_language`、`spawn_trait_religion` | ここで生まれたものが得られる特性 |

### 何が育ち、何が出現するか

`addTree`、`addPlant`、`addBush`、`addMineral` は建物（building）IDと重みを受け取ります。`addUnit` は野生動物を、`addSapientUnit` はここで文明を興せる種族を追加します。重みはパーセントではなく、IDが袋に入る回数です：`addUnit("buffalo", 2)` なら、バッファローはハイエナの2倍出やすくなります。

どんなIDでも使えます。**[カスタムアクター](#/nml/custom-actors)** で作った自作の生き物も、バイオームより先に登録してあれば大丈夫です。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## 自作の画像

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

タイルは **[タイルと地形](#/nml/tiles)** と同じルールです：フォルダ名がタイルIDで、中のPNGひとつひとつがバリエーションです。テスト中に画像を省くと、複製は草のスプライトのままで、ミニマップ上の色だけがあなたの色になります。

## テスト

新しいワールドを何度か作って、あなたの色を探してください。草の8に対して `generator_pot_amount = 3` なので毎回は出ません。テストするなら、草の上に種をまいたほうが早いです。草が変わり、サバンナの木が育ち始め、しばらくするとハイエナがやって来るはずです。

> [!NOTE] 扱っていないこと
> 汚染のように建物が広げるクリープ系のバイオームは、別の仕組み（建物の `grow_creep_type`）を使います。それは別のページの話で、まだ書いていません :PES2_Shrug:。
