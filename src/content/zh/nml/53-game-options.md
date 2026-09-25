---
title: 游戏选项
group: 游戏内容
subgroup: 神力与用户界面
icon: :wbsettingsgear:
order: 206
---

# 游戏选项 :wbsettingsgear:

在 **[模组设置](#/nml/mod-config)** 一页中，你已经见过 NML 自己的配置窗口（`default_config.json`），它会给你的模组一个干净独立的设置标签页。

WorldBox 自己也有一套原生选项系统：`AssetManager.options_library`，底层由 `PlayerConfig` 支撑。原版设置窗口、开发者开关和神力切换按钮，用的都是这套系统。与它并列的还有 `AssetManager.time_scales`，控制世界走多快。

## 注册一个原生选项

`AssetManager.options_library` 里的选项是 `OptionAsset` 的实例：

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

            // Registering the asset does NOT automatically populate PlayerConfig.dict.
            // Ensure the value exists so your code can read it immediately:
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

### OptionAsset 上的字段

| 字段 | 含义 |
| --- | --- |
| `id` | 唯一的选项标识符 |
| `type` | `OptionType.Bool`、`OptionType.Int`，或 `OptionType.String` |
| `default_bool` / `default_int` / `default_string` | 未设置时的默认值 |
| `translation_key` | 选项标题的本地化键 |
| `translation_key_description` | 悬浮提示的本地化键 |
| `action` | 选项变化时触发的回调委托（`ActionOptionAsset`） |
| `reset_to_default_on_launch` | 游戏启动时是否把该选项重置为默认值 |
| `computer_only` | 为 `true` 时仅在 PC 构建中显示 |

> [!WARNING] OptionAsset 不是存储本体
> `OptionAsset` 只描述该选项的元数据和回调。玩家实际切换的数值存放在 `PlayerConfig.dict[id]` 里。如果你只添加了 `OptionAsset`，却没有同步往 `PlayerConfig.dict` 里插入一份对应的 `PlayerOptionData`，那么在设置窗口被保存之前，任何试图索引 `PlayerConfig.dict[id]` 的代码都会抛出 `KeyNotFoundException`！

## 和切换按钮绑定

原生选项和能量条上的 `GodPower` 切换按钮搭配使用时最好用。

正如 **[神力标签页与按钮](#/nml/power-buttons)** 中所讲的那样，设置 `power.toggle_name = HelloOptions.TURBO_HARVEST` 会把一个按钮直接绑定到你的选项状态上。点击时，游戏会切换 `PlayerConfig.dict[toggle_name].boolVal`，更新按钮的高亮显示，并触发你的选项回调。

## 模拟速度与时间倍速

WorldBox 通过 `AssetManager.time_scales`（`WorldTimeScaleLibrary`）来控制游戏的模拟速度。每一档速度都是一个 `WorldTimeScaleAsset`：

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
                multiplier = 10f,          // 10x world simulation speed
                ticks = 2,                 // Simulation sub-ticks per frame
                conway_ticks = 2,          // CA ticks per frame (fire, acid, temperature)
                path_icon = "ui/Icons/iconClockX5"
            };

            AssetManager.time_scales.add(hyper);
        }
    }
}
```

| 字段 | 含义 |
| --- | --- |
| `multiplier` | 画面与世界速度的倍率（`1f` = 正常，`0.5f` = 慢动作） |
| `ticks` | 每帧运行多少次模拟计算 |
| `conway_ticks` | 每帧运行多少次元胞自动机计算（地块蔓延、熔岩、结冰） |
| `locale_key` | 悬浮在时钟按钮上时显示的翻译键 |
| `path_icon` | `ui/Icons/` 内的图标纹理路径 |

原版速度档位是 `slow_mo`（0.5 倍）、`x1`（1 倍）、`x2`（2 倍）、`x3`（3 倍）、`x4`（4 倍）和 `x5`（5 倍）。极速模式（调试选项里的 Greg speed）会把模拟 tick 数推得更高。

用代码激活某个速度档位：

```csharp
// Smoothly switch world clock to your speed asset:
WorldTimeScaleAsset target = AssetManager.time_scales.get(HelloSpeed.HYPER);
if (target != null)
{
    Config.time_scale_asset = target;
}
```

## 该选哪条设置路线？

| 需求 | 推荐路线 |
| --- | --- |
| 模组专属配置（伤害倍率、生成数量、开关式功能） | **[模组设置](#/nml/mod-config)**（`default_config.json`）。它挂在你模组自己的卡片上，能干净地处理数字/字符串，且不会污染原版游戏的界面 |
| 绑定到工具栏按钮上的开关 | 原生 `OptionAsset` + `GodPower.toggle_name` |
| 自定义游戏速度或模拟节奏 | `AssetManager.time_scales`（`WorldTimeScaleAsset`） |

接下来：**[消息与世界日志](#/nml/messages-and-world-log)**，学习如何显示提示并记录世界历史。
