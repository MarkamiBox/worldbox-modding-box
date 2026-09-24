---
title: タイルと地形
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbrockies:
order: 170
---

# タイルと地形 :wbrockies:

ワールドマップは `WorldTile` のグリッドであり、すべてのタイルは上下に積み重なった**2つ**のタイプを保持しています：

| レイヤー | タイル上のフィールド | ライブラリ | クラス | 例 |
| --- | --- | --- | --- | --- |
| 地面 | `main_type` | `AssetManager.tiles` | `TileType` | 土、砂、岩、深海、溶岩 |
| 上層 | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, 壁 |

どちらも内部的には同一の基底クラス（`TileTypeBase`）であるため、本ページの内容はどちらに対してもそのまま適用できます。違いはどのレイヤーに乗るかだけであり、それは `layer_type` によって決まります。

新しい種類の*地面*を追加したい場合は `TileType` です。地面の**上**に乗るもの（道路、壁、農作物、苔など）を作りたい場合は `TopTileType` であり、大抵の場合はこちらが実際に求めているものです。

## 新規作成ではなくクローンする

タイルの型には約100個のフィールドが存在しますが、その大半は特定のバニラタイルのためだけに存在します。100個全部を並べるつもりはありません。最も近い親をクローンしましょう：

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] バイオームタイルにはバイオームの紐付けが要る
> 草タイルを複製すると `is_biome = true` と `biome_id` はコピーされますが、`BiomeAsset` 本体はロード中に一度だけ `TopTileLibrary.linkAssets()` で引かれます。この1行を飛ばすと、あなたのタイルに動物が湧くまでは動きます。湧いた瞬間、種名にバイオームの接尾辞を付けようとしてバイオームが `null` で、`Subspecies.generateName()` の `NullReferenceException` で落ちます :wbfacepalm:。
>
> 絵も同じ問題を抱えています。`TopTileLibrary` は起動時に `tiles/<id>/` のPNGを `sprites` にします。最後のブロックが無いとタイルは塗れますが、その後マップの描画が画面上のそのタイルごとに `WorldTilemap.getVariation()` で例外を出します。


## 把握しておくべき重要フィールド

### どういった性質のものか

| フィールド | 役割 |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` または上層レイヤー。どちらのライブラリに属するかを決定 |
| `ground`, `liquid`, `ocean`, `lava` | ゲーム全体が分岐処理に使用する大まかなカテゴリフラグ |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | 地形ファミリーフラグ |
| `road`, `wall`, `farm_field` | 構造物フラグ。都市AIがこれらを読み取ります |
| `block`, `block_height` | 移動を遮るかどうか、および描画上の高さ |
| `is_biome`, `can_be_biome`, `biome_id` | タイルを特定のバイオームに関連付けます |
| `biome_tags`, `has_biome_tags` | どのバイオームがこのタイルを繁殖させるか |

### どのように振る舞うか

あなたのタイルが単なる新色ではなくゲームプレイのアイデアなら、ここから始めてください。

| フィールド | 役割 |
| --- | --- |
| `walk_multiplier` | 移動速度倍率。`1.0` が通常、小さいほど遅くなる |
| `damage_units`, `damage` | 上に乗ったユニットにダメージを与えるかとその威力 |
| `damaged_when_walked` | ユニットに踏まれたときにタイル自体が劣化するか |
| `step_action`, `step_action_chance` | 何かが踏むたびに実行されるカスタムコード |
| `unit_death_action` | 上で何かが死亡したときに実行されるカスタムコード |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | 引火・燃焼挙動 |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | 凍結挙動 |
| `remove_on_heat`, `terraform_after_fire` | 熱や火によって残される地形 |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | 爆発処理 |
| `strength` | 耐久度。壁Modなどが耐久性の参照に利用 |
| `cost` | 経路探索（Pathfinding）コスト |

### プレイヤーができる操作

| フィールド | 役割 |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | どのツールで撤去可能か |
| `allowed_to_be_finger_copied` | 指コピー機能で拾えるかどうか |
| `can_build_on`, `can_be_farm` | 都市が建築や農地として利用できるか |
| `only_allowed_to_build_with_tag` | 建築を特定のタグに限定 |

### 状態遷移

| フィールド | 役割 |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | 成長または浸食されたときに変化するタイル |
| `freeze_to_id` | 凍結時に変化するタイル |
| `fill_to_ocean`, `can_be_filled_with_ocean` | 水没時に変化するタイル |
| `lava_increase` / `lava_decrease` / `lava_level` | 溶岩専用の段階的変化チェーン |

### 外観

| フィールド | 役割 |
| --- | --- |
| `color_hex` | ミニマップ描画およびティントカラー |
| `edge_color_hex` | 他のタイルと接する境界線の色 |
| `render_z`, `draw_layer_name` | 描画順序。`setDrawLayer(...)` がヘルパー |
| `force_edge_variation`, `force_edge_variation_frame` | 境界スプライトのバリエーションを固定 |

## 何かが踏んだときにコードを実行する

```csharp
moss.step_action_chance = 0.05f;   // 踏まれた時の5%で発動
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

このガイドにある他のアクションと同一の規則に従います：必ず最初にnullチェックを行い、何もしなかった時は `false` を返し、この処理がマップ上のこのタイプの全タイルを踏む全ユニットに対して走ることを忘れないでください。

## 自作テクスチャの配置

タイルは例外的な仕様を持っています：**パスを指定するフィールドが一切存在しません**。ゲームはタイルの**ID**と完全に一致する名前のフォルダを自動的に探し、その中にあるすべての画像をバリエーションとして読み込みます。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- タイルのIDと完全に一致させる
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

コード側で設定することは何もありません。登録したIDの名前でフォルダを作成するだけで、タイルが自力で見つけ出します。

そのフォルダ内の複数の画像はランダムバリエーションとなり、タイルを敷き詰めた時に壁紙のように不自然に連続するのを防ぎます。画像が1枚だけでも問題なく動きます。地面タイルも上層タイルも、まったく同じ仕組みでロードされます。

`color_hex` は画像とは独立しており、依然として不可欠です。ミニマップの描画色となり、ゲームがタイルを着色する際の色合いとしても使われます。

## 実行時にタイルを変更する

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // 上層タイルを変更
tile.setTileType(AssetManager.tiles.get("sand"));                // 地面タイルを変更
tile.setTileTypes("sand", null);                                 // 地面を変更し、上層をクリア
```

3つともすべて公開メソッドです。タイルを変更すると該当チャンクにダーティフラグが立ち、レンダラーが自動的に再描画を行います。

### 敷かれているタイルを判定する

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

`main_type` も `top_type` も両方 `null` になる可能性があります。触る前に必ずnull判定を行ってください。これはマップを走査するModにおける最大のクラッシュ原因です :PES2_F:。

## テラフォームオプション

`AssetManager.terraform` 内の `TerraformOptions` は、神の力や投射物が利用する「このタイルを整地・浄化する」ルールのプリセットです：

| フィールド | 役割 |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | 構造物の撤去 |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | 残骸の撤去 |
| `destroy_buildings`, `make_ruins` | 建てられた建造物の処理 |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | 状態の除去 |
| `add_burned`, `add_heat`, `flash` | 状態の付与 |

`ProjectileAsset` は `terraform_option` に名前を指定し、`terraform_range` と組み合わせることで、着弾時に地面を吹き飛ばして更地にする爆発矢などを実現します。

## バイオーム

`AssetManager.biome_library` 内の `BiomeAsset` は、どのタイルがどこに現れるかを決定します。タイルは `setBiome("biome_forest")` または適切な `biome_tags` を持つことでバイオームに参加します。既存のバイオームをクローンしてタイルIDを差し替えるのが一番の近道であり、「クローンすれば自動的に登録される」ルールも同様に適用されます。

> [!TIP] Modの主戦場は上層タイルにある
> 実際に作られるもののほぼすべて（壁、道路、作物、大陸を侵食する汚染など）は、`step_action` と配置判定コードを組み合わせた上層タイルです。新しい地面タイプは稀であり、見た目を自然になじませるのが難しく、予期せぬ形でワールド生成器と衝突しがちです :PES3_Yikes:。
