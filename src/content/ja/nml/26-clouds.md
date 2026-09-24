---
title: 雲と天候
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbtornado:
order: 172
---

# 雲と天候 :wbtornado:

雲とは、マップ上を漂いながら直下のものすべてにオブジェクトを降らせるスプライトです。雨、酸、溶岩、雪、炎：これらはすべて、異なる色と異なる `drop_id` を持つまったく同一のアセットです。

雲はMod制作者にとって、ゲーム内で最もコストパフォーマンスが高い要素です。アセット1つで、新しいイラストすら不要でありながら、自律して移動し、雨を降らせ、地上を照らし、災害リストにも勝手に登録されます。

## 雲を登録する

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] 遅れて登録した雲にはスプライトがない
> `CloudLibrary` はロード中に一度だけ、`path_sprites` から `cached_sprites` を、`color_hex` から `color` を作ります。あなたの雲はその時まだリストになかったので両方とも空で、初めて出た瞬間に `Cloud.prepare()` で `NullReferenceException` が出ます :wbfacepalm:。上の `Initialize` の最後の6行が、その処理をあなたの雲にやっています。


### 各フィールドの解説

バニラの雲をクローンして、`drop_id` と `color_hex` を変えるだけ。それ以上何もいらない雲もたくさんあります。

| フィールド | 役割 |
| --- | --- |
| `color_hex` | 色合い。雲の印象の大部分をこれが決定します |
| `max_alpha` | 不透明度。デフォルトは `0.8` |
| `drop_id` | 降らせるドロップ。バニラまたは自作の `AssetManager.drops` にある任意のID |
| `cloud_action_1` / `cloud_action_2` | 独立した2つのアクション。それぞれ個別のタイマーで動作します |
| `interval_action_1` / `interval_action_2` | 各アクションが実行される間隔（秒） |
| `speed_min` / `speed_max` | 漂う速度。雲ごとにこの範囲内でランダムに決定されます |
| `path_sprites` | スプライト一覧。ゲームは雲ごとに1つを選びます |
| `considered_disaster` | ゲームが災害として扱うかどうか |
| `normal_cloud` | 特殊イベントではなく通常の天候として扱います |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | 地面に落とす光源（炎や溶岩の雲用） |

## 雲のアクションとは何か

`CloudAction` はアクティブな雲のインスタンスを受け取り、戻り値を返さないデリゲートです：

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` はバニラの標準アクションです。雲のスプライト下のランダムなタイルを選び、そこに `drop_id` をスポーンさせます。9割のケースではこれだけで十分であり、`cloud_action_1` に設定して完了です。怠惰で正しい、私の好きな組み合わせです :pepeOK:。

追加の特殊効果を加えたい場合は、独自のアクションを書いて `cloud_action_2` に指定します：

```csharp
private static void SparkAction(Cloud pCloud)
{
    // マップ上のこのタイプの雲すべてに対して interval_action_2 秒ごとに実行されます。
    // 処理は軽く保ち、連続発動しないよう確率判定を入れてください。
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

あとは `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;` と記述するだけです。

## 自作スプライトを使用する

`path_sprites` はパスのリストであり、各項目は `GameResources/` 内から指定されたとおりにロードされます。ゲームは雲1つにつき1枚のテクスチャを選択するため、バニラでは3種類のバリエーションを渡しています。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

雲のスプライトは、ぼやけた大きなグレースケールの塊です。`color_hex` が色塗りを一手に引き受けるため、画像に直接色を塗らないでください。白で描き、着色はゲーム側のティントに任せましょう :wbsmirk:。

## 空に雲を出現させる

雲は専用のマネージャーではなく、エフェクトシステムを介してスポーンさせます：

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

これはバニラのすべての雲パワーが内部で行っている処理とまったく同じです。これを神の力でラップすれば、プレイヤーが使える雲召喚ツールになります：

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

UIボタンについては **[神の力（God powers）](#/nml/god-powers)** と **[パワーのタブとボタン](#/nml/power-buttons)** を参照してください。

## バニラの雲一覧

クローンの元ネタとして、また既存機能の確認として役立ちます：

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// 既に動いているものをベースに、色とドロップだけを変更します。
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

`clone()` は内部で自動的に登録を行うため、直後に `add()` を呼ばないように注意してください。

## 自前でスプライトを描く場合

`path_sprites` は `GameResources/` 配下のパスの配列であり、他とまったく同じルールが適用されます。**[スプライトとリソース](#/nml/sprites-and-resources)** を参照してください。雲のスプライトはふわふわした塊であり、色の仕事はすべて `color_hex` がこなすため、グレースケールの形状を用意するだけで十分です。

> [!TIP] 災害を作る前に雲を検討する
> ゲーム内の災害リストに並ぶものの多くは、単に `considered_disaster = true` をつけた雲に過ぎません。発生条件や持続タイマーを持つ本格的な災害コードを書く前に、自作ドロップを降らせる雲だけで目的が達成できないか確認してみましょう :PES2_HmmmmThumbsUp:。
