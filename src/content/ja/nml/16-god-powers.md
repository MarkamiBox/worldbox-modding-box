---
title: 神の力
group: ゲームコンテンツ
subgroup: 神の力とUI
icon: :wbgodfinger:
order: 200
---

# 神の力 :wbgodfinger:

神の力とは、プレイヤーがツールを選択してワールド上をクリックしたときに発生する効果のことです。何者かをスポーンさせたり、祝福を与えたり、爆破したりします。

ここには2つの独立した要素が関わっており、これらを混同するのは初心者にありがちな定番のミスです:

| | |
| --- | --- |
| **パワー** (`GodPower`) | データそのもの: ID、アイコン、クリック時に実行されるコード |
| **ボタン** (`PowerButton`) | プレイヤーが実際に押すことができるバー上のボタン |

このページではパワーを作成します。画面上に表示する方法は **[パワータブ & ボタン](#/nml/power-buttons)** のページで扱います。

## パワーを作成する

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // 同じIDを二重に登録しないこと: ゲーム側は最初に登録された方を保持します。
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // アンロック不要
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // ウィンドウが開いたときにツール選択を解除
                show_tool_sizes = false,            // ブラシサイズ（小/中/大）の非表示

                // このツールを選択した状態でプレイヤーがタイルをクリックしたときの処理
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = クリックが消費された
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

`Main.cs` に `HelloPowers.Initialize();` を追加します。

### 各部分の役割

- **`id`**: 他のすべてが参照する名前。ボタン、ローカライズ、他のMODなど。
- **`name`**: ゲーム自体のUIルックアップで使用されます。id と同じにしておくとトラブルを防げます。
- **`rank = PowerRank.Rank0_free`**: 最初から使用可能で、アンロック不要。
- **`path_icon`**: カーソルおよびツールのアイコン。
- **`unselect_when_window`**: ウィンドウを開いたときにツールの構えを解除し、パネルの背後にあるマップを誤って破壊してしまうのを防ぎます。
- **`click_action`**: 実行するコード。**クリックされたタイル** と **パワーID** を受け取り、何らかのアクションを行った場合は `true` を返します。

> [!WARNING] クリック処理のシグネチャは (WorldTile, string) である
> `click_action` は `PowerActionWithID` デリゲートであるため、第2引数は `GodPower` ではなく **string 型のパワーID** です。なお、もう一つ `click_power_action` という `(WorldTile, GodPower)` を受け取るフィールドも存在します。型を間違えると意味不明なコンパイルエラーに悩まされることになります :PES_DaFuq:。

## クリック時に行える便利な処理

```csharp
// タイルの上（または隣）に立っているユニットを取得
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// 生物をスポーンさせる
World.world.units.spawnNewUnit("wolf", pTile);

// タイル位置に視覚効果を発生させる
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// 空から物を落とす（ドロップ & 落下物を参照）
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// プレイヤーにメッセージを表示する
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## 長押しで連続使用（ブラシのように塗る）

`hold_action = true` と `click_interval` を設定すると、バニラのブラシ系ツールのようにマウスを押したままドラッグして連続発動できるようになります:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // 連続発動の間隔（秒）
```

## 独自のアイコン

`path_icon` はツールのカーソルとボタンの表面画像の両方に使われます。`GameResources/` 内から指定した通りのパスで読み込まれます。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] アイコンが見つからないと透明なボタンになる
> パスが間違っているとスプライトが `null` になります。そして `null` スプライトは画像欠落アイコンになるのではなく、バー上に透明な穴が空いてしまい、プレイヤーには見つけることすらできません。**[パワータブ & ボタン](#/nml/power-buttons)** のフォールバック用関数を参照してください :aPES_Hide:。

## テキスト設定

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## ブラシ

神の力は **ブラシ** を使ってマップ上を塗ります。ブラシとは1クリックで影響を与えるタイルの形状のことです。ゲームはコードによって各ブラシのピクセル配列とプレビュー画像を生成するため、新しい形状を追加するのに画像ファイルは一切不要です。

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

バニラの単一タイル対象の力が `sqr_0` に固定されているのと同様に、`force_brush = "hello_target"` で力を特定のブラシに固定できます。ブラシ切り替えショートカットキーは `_available_brushes` を順繰りに切り替えるため、自作ブラシもローテーションに含まれます。ブラシ選択ウィンドウは起動時にボタンを構築するため、もし一覧に表示されない場合でも `force_brush` やショートカットキーから問題なく使用できます。

> [!WARNING] ブラシの寸法は起動時に計算されます
> `BrushLibrary.post_init()` は全ブラシの `generate_action` を実行して `width`、`height`、`sqr_size` を計算し、`linkAssets()` がピクセル順をシャッフルします。後から追加されたブラシにはこれが適用されないため、上記のように `pos` とサイズを手動で設定してください。プレビュー画像は `pos` から直接描画されるため、アイコン画像を用意する必要はありません。

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## まだゲーム内には表示されません

その通りです。パワーを作成しただけで、それを表示するものがまだありません。もう半分を担う **[パワータブ & ボタン](#/nml/power-buttons)** へ進みましょう。わずか10行のコードです :pepeOK:。
