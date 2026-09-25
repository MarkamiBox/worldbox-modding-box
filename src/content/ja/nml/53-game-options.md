---
title: ゲームオプション
group: ゲームコンテンツ
subgroup: 神の力とUI
icon: :wbsettingsgear:
order: 206
---

# ゲームオプション :wbsettingsgear:

**[Modの設定](#/nml/mod-config)** では、あなたのModに専用の整理されたタブを与える、NML独自の設定ウィンドウ（`default_config.json`）を見ました。

WorldBoxには、それとは別にネイティブのオプションシステムもあります。`AssetManager.options_library` で、裏側は `PlayerConfig` です。これはバニラの設定ウィンドウ、開発者向けのトグル、神の力のトグルボタンを動かしているシステムです。その隣には、ワールドが進む速さを制御する `AssetManager.time_scales` があります。

## ネイティブオプションを登録する

`AssetManager.options_library` のオプションは `OptionAsset` のインスタンスです。

```csharp Mods/HelloBox/Code/HelloOptions.cs
namespace HelloBox
{
    public static class HelloOptions
    {
        public const string TURBO_HARVEST = "hello_turbo_harvest";

        public static void Initialize()
        {
            if (AssetManager.options_library.has(TURBO_HARVEST)) return;

            OptionAsset option = new OptionAsset
            {
                id = TURBO_HARVEST,
                type = OptionType.Bool,
                default_bool = false,
                translation_key = "option_hello_turbo_harvest",
                translation_key_description = "option_desc_hello_turbo_harvest",
                action = (OptionAsset pAsset) =>
                {
                    bool active = IsTurboActive();
                    Main.Log("Turbo harvest is now: " + active);
                }
            };

            AssetManager.options_library.add(option);

            // アセットを登録しただけでは PlayerConfig.dict は自動的に埋まらない。
            // 自分のコードがすぐ読めるように、値が存在することを保証する:
            if (!PlayerConfig.dict.ContainsKey(TURBO_HARVEST))
            {
                PlayerConfig.dict.Add(TURBO_HARVEST, new PlayerOptionData
                {
                    name = TURBO_HARVEST,
                    boolVal = option.default_bool
                });
            }
        }

        public static bool IsTurboActive()
        {
            if (PlayerConfig.dict.TryGetValue(TURBO_HARVEST, out PlayerOptionData data))
            {
                return data.boolVal;
            }
            return false;
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "option_hello_turbo_harvest": "Turbo Harvest",
  "option_desc_hello_turbo_harvest": "Settlers gather crops at triple speed."
}
```

### OptionAsset のフィールド

| フィールド | 説明 |
| --- | --- |
| `id` | オプションの一意な識別子 |
| `type` | `OptionType.Bool`、`OptionType.Int`、または `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | 未設定時の既定値 |
| `translation_key` | オプション名のローカライズキー |
| `translation_key_description` | ツールチップのローカライズキー |
| `action` | オプションが変更されたときに呼ばれるコールバックデリゲート（`ActionOptionAsset`） |
| `reset_to_default_on_launch` | ゲーム起動時にこのオプションを既定値へ戻すかどうか |
| `computer_only` | trueならPC版でのみ表示 |

> [!WARNING] OptionAssetはストレージではない
> `OptionAsset` はオプションのメタデータとコールバックを記述するだけです。プレイヤーが実際に切り替えた値は `PlayerConfig.dict[id]` に入っています。`OptionAsset` を追加しても、対応する `PlayerOptionData` を `PlayerConfig.dict` に挿入していない場合、設定ウィンドウが一度保存されるまで、`PlayerConfig.dict[id]` にインデックスアクセスしようとするあらゆるコードが `KeyNotFoundException` を投げます！

## トグルボタンと連携する

ネイティブオプションは、パワーバー上の `GodPower` トグルボタンと組み合わせたときに真価を発揮します。

**[パワータブとボタン](#/nml/power-buttons)** で説明したとおり、`power.toggle_name = HelloOptions.TURBO_HARVEST` と設定すると、ボタンがあなたのオプションの状態に直接紐付きます。クリックされると、ゲームは `PlayerConfig.dict[toggle_name].boolVal` を切り替え、ボタンのハイライト表示を更新し、あなたのオプションのコールバックを発火させます。

## シミュレーション速度と時間スケール

WorldBoxは `AssetManager.time_scales`（`WorldTimeScaleLibrary`）を通じてゲームのシミュレーション速度を制御しています。各速度設定は `WorldTimeScaleAsset` です。

```csharp Mods/HelloBox/Code/HelloSpeed.cs
namespace HelloBox
{
    public static class HelloSpeed
    {
        public const string HYPER = "hello_hyper_speed";

        public static void Initialize()
        {
            if (AssetManager.time_scales.has(HYPER)) return;

            WorldTimeScaleAsset hyper = new WorldTimeScaleAsset
            {
                id = HYPER,
                locale_key = "speed_hello_hyper",
                multiplier = 10f,          // ワールドシミュレーション速度を10倍に
                ticks = 2,                 // 1フレームあたりのシミュレーションサブティック数
                conway_ticks = 2,          // 1フレームあたりのCAティック数（火、酸、気温）
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| フィールド | 説明 |
| --- | --- |
| `multiplier` | 見た目とワールド速度の倍率（`1f` = 通常、`0.5f` = スローモーション） |
| `ticks` | 1フレームあたりに実行されるシミュレーションパス数 |
| `conway_ticks` | 1フレームあたりに実行されるセルオートマトンパス数（タイルの伝播、溶岩、氷） |
| `locale_key` | 時計ボタンにホバーしたときに表示される翻訳キー |
| `path_icon` | `ui/Icons/` 内のアイコンテクスチャパス |

バニラの速度は `slow_mo`（0.5倍）、`x1`（1倍）、`x2`（2倍）、`x3`（3倍）、`x4`（4倍）、`x5`（5倍）です。Sonic speed（デバッグオプションでのGreg speed）は、シミュレーションのティック数をさらに引き上げます。

コードから速度をアクティブにするには、

```csharp
// ワールドの時計を自分の速度アセットにスムーズに切り替える:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## どの設定ルートを選ぶべきか

| 用途 | おすすめのルート |
| --- | --- |
| Mod固有の設定（ダメージ倍率、スポーン数、切り替え可能な機能） | **[Modの設定](#/nml/mod-config)**（`default_config.json`）。あなたのModのカード上にあり、数値や文字列をきれいに扱え、本体のUIを汚さない |
| ツールバーのボタンに紐付いたトグル | ネイティブの `OptionAsset` + `GodPower.toggle_name` |
| 独自のゲーム速度やシミュレーションのペース | `AssetManager.time_scales`（`WorldTimeScaleAsset`） |

次は: **[メッセージとワールドログ](#/nml/messages-and-world-log)** で、ヒントの表示と世界の歴史の記録について。
