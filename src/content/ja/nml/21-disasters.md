---
title: 災害
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbmeteorite:
order: 184
---

# 災害 :wbmeteorite:

災害はワールド自身が引き起こすイベントです：竜巻、熱波、隕石など。時間の経過とともにゲームが自動的に抽選を行うため、神の力とは異なり **誰もクリックする必要がありません**。条件を設定すれば、あとは世界が勝手に動かしてくれます。

## 災害の追加

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

`Main.cs` でステージ登録し（**[完成した Mod](#/nml/all-together)** を参照）、1つ以上の都市と100体以上のユニットが存在するワールドをロードして待ちます。やがて空から自然と火の粉が降り注ぎ始めます :wbfireskull:。

### フィールド一覧

いちばんいじることになるのは `rate` と `chance` です。理由はページ下部の警告で説明しています。

| フィールド | 役割 |
| --- | --- |
| `rate` | 抽選での重み。高いほど他と比べて選ばれやすくなります |
| `chance` | 選ばれた後の2回目の判定 |
| `min_world_population` / `min_world_cities` | そもそも発生するための条件 |
| `type` | `DisasterType.Nature`、`Other`、… |
| `world_log` | `WorldLogAsset` のID：ワールドログに出る行です。ローカライズキーでは**ありません**、下を参照 |
| `action` | あなたのコード。これが災害そのものです |
| `spawn_asset_unit` + `units_min`/`units_max` | 「このクリーチャーをN体出す」の近道 |
| `max_existing_units` | すでにこの数だけいれば、それ以上は出さない |
| `ages_allow` / `ages_forbid` | 特定の時代に限定します。例えば「灰の時代」だけ |

時代による制限は、アセットを作った後で行います：

```csharp
emberStorm.ages_allow.Add("age_ash");
emberStorm.ages_allow.Add("age_chaos");
```

## コードなしで生物をスポーンさせる

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

「コード不要」というのはほぼ正解ですが、災害には**必ず** `action` が必要です。抽選処理が null チェックを行わずに呼び出すため、空のまま抽選に当たると `NullReferenceException` が発生します。バニラの生物系災害はすべてライブラリ組み込みの `simpleUnitAssetSpawnUsingIslands` を指定しており、これが `spawn_asset_unit`、`units_min`、`units_max`、`max_existing_units` を読み取って自動的にワールドログも記録してくれます。あなたの災害でも同様に利用できます。

## ワールドログへの記録

`world_log` はテキスト本体ではなく、`AssetManager.world_log_library` に登録された **`WorldLogAsset` の ID** であり、そのアセットがテキストキーを参照します。存在しない ID を指定すると、災害発生時に `WorldLog.logDisaster()` が `null` を元にメッセージを組み立てようとして `NullReferenceException` でクラッシュします :wbfacepalm:。

バニラの災害は `$basic_disaster$` テンプレートをクローンしており、あらかじめ警告色と "disasters" グループが設定されています。上記の `HelloDisasters` も同様にクローンしています：

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

ログへの書き込みも必要です。バニラの自動生成関数は自身で `WorldLog.logDisaster(pAsset, tile)` を呼び出します。カスタム `action` の場合は自動で行われないため、嵐が始まった最初のタイルを渡して1回呼び出します。これがログの「そこへ移動」ボタンでジャンプする座標になります。

| `WorldLogAsset` のフィールド | 効果 |
| --- | --- |
| `locale_id` | テキストのキー。空の場合は自身の ID が使われます |
| `path_icon` | ログ行の先頭に表示されるアイコン |
| `color` | 行の文字色。テンプレートでは警告用の赤系カラー |
| `group` | ワールドログのどのフィルタータブに分類されるか |
| `random_ids` | 複数のテキストからランダム選択：`<locale_id>_1`, `_2`... |

オオカミの例でも同じ2つの設定が必要です：`disaster_hello_wolf_year` でクローンしたログアセットと、`worldlog_disaster_hello_wolf_year` のテキストです。バニラのスポナー関数が自動的に行を記録してくれます。

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

説明文ではなく、ニュースの見出しのように記述してください。「空から火の粉が降る」は「火の粉関連のイベントが開始されました」に勝ります。プレイヤーがワールドログで読む行になります。

> [!WARNING] 開発時は発生確率を上げてテストする
> `rate = 4, chance = 0.5f` では、自分の災害が発生するまで20分待つことになるかもしれません。開発中は `rate` を大幅に引き上げ、最小制限を 0 にしてテストし、公開前に元の数値に戻しましょう :PES2_EvilPlan:。
