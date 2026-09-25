---
title: 神力
group: 游戏内容
subgroup: 神力与用户界面
icon: :wbgodfinger:
order: 200
---

# 神力 :wbgodfinger:

神力（GodPower）就是当玩家选中你的工具并点击世界地图时发生的事情。生成生物、赋予祝福、或者引爆某些东西。

这里涉及两件完全独立的事情，把它们混淆是初学者最经典的错误：

| | |
| --- | --- |
| **神力数据** (`GodPower`) | 底层数据：一个 id、一个图标以及点击时运行的代码 |
| **神力按钮** (`PowerButton`) | 底部操作栏中玩家真正能够点击的按钮 |

本页负责创建神力数据。**[能力标签页与按钮](#/nml/power-buttons)** 页面则负责将其显示在屏幕上。

## 创建神力

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // 避免用同一个 id 替换掉已经注册的资源。
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // 无需解锁
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // 打开窗口时自动收回工具
                show_tool_sizes = false,            // 不显示大/中/小笔刷尺寸

                // 玩家选中该工具并点击地块时执行的操作。
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = 成功响应了点击
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

在 `Main.cs` 中添加 `HelloPowers.Initialize();`。

### 各个部分的作用

- **`id`**：其他一切都引用的名字。按钮、翻译、其他模组。
- **`name`**：游戏自己的界面查找时会用到。让它和 id 保持一致能省去很多麻烦。
- **`rank = PowerRank.Rank0_free`**：一开始就能用，不需要解锁。
- **`path_icon`**：光标/工具图标。
- **`unselect_when_window`**：玩家打开窗口时，工具会自动取消选中，免得他们一不小心把面板后面的地图劈了。
- **`click_action`**：你的代码。它接收**被点击的地块（tile）**和**神力 id**，如果做了事情就返回 `true`。

> [!WARNING] 点击的签名是 `(WorldTile, string)`
> `click_action` 是一个 `PowerActionWithID`，所以它的第二个参数是**字符串形式的神力 id**，而不是 `GodPower`。还有另一个字段 `click_power_action`，它接收的是 `(WorldTile, GodPower)`。用错了形式，你会得到一个读起来毫无道理的编译错误 :PES_DaFuq:。

## 点击时可以执行的实用操作

```csharp
// 获取站立在该地块上（或周围）的生物单位（若有）
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// 生成生物
World.world.units.spawnNewUnit("wolf", pTile);

// 在地块上产生视觉特效
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// 从天而降掉落物体（参见 坠落物与水滴）
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// 向玩家提示信息
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## 按住以连续涂抹

设置 `hold_action = true` 并指定 `click_interval`，可以让该能力在按住鼠标时连续触发，就像原版的笔刷涂抹工具一样：

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // 连续触发的时间间隔（秒）
```

## 到底是哪个委托在画笔刷？

| 字段 | 含义 |
| --- | --- |
| `click_action` | `bool (WorldTile pTile, string pPowerID)`，作用于单个地块 |
| `click_brush_action` | 签名相同，一旦被赋值就会取代 `click_action` 被调用 |
| `click_power_action` | `bool (WorldTile pTile, GodPower pPower)`，作用于单个地块 |
| `click_power_brush_action` | 同样基于资源对象的签名，一旦被赋值就会取代 `click_power_action` 被调用 |

玩家点击的调用路径上，只要这两个字段中任意一个被设置了，就会优先使用基于资源对象的那一对。笔刷委托拿到的是笔刷**中心**那一格地块，它并不会神奇地对笔刷覆盖的每一个像素各跑一次。这个可选的替换逻辑，应该写在 `click_action` 已经赋值之后、能力设置的内部：

```csharp
strike.show_tool_sizes = true;
strike.click_brush_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null || World.world == null) return false;
    GodPower power = AssetManager.powers.get(pPowerID);
    if (power == null || power.click_action == null) return false;
    World.world.loopWithBrush(pTile, Config.current_brush_data,
        power.click_action, pPowerID);
    return true;
};
```

> [!WARNING] 光标变大不等于作用范围变大
> `show_tool_sizes` 只是把笔刷尺寸的选择暴露出来。你的笔刷回调依然必须自己遍历地块。原版的 `PowerLibrary.loopWithCurrentBrush` 辅助方法是 `private` 的；上面的示例改用了公开的世界方法。对于 `(WorldTile, GodPower)` 这一对，`loopWithBrush` 也有对应的重载，接收 `PowerAction` 和该神力资源。

关于点击后的反馈提示，见 **[消息与世界日志](#/nml/messages-and-world-log)**。

## 自定义图标

`path_icon` 既是工具光标，也是按钮图标。它会完全按照所写的路径从 `GameResources/` 中加载。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] 缺少图标会导致按钮隐形
> 如果路径错误，返回的贴图将是 `null`。而 `null` 贴图并不会显示为一个缺失贴图的占位符，而是直接在底栏中留出一个不可见的空洞，玩家根本找不到它。请参考 **[能力标签页与按钮](#/nml/power-buttons)** 中的备用图标辅助方法 :aPES_Hide:。

## 文本与本地化

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## 画笔

神圣力量通过**画笔**在地图上涂抹作用：即单次点击覆盖的地块几何轮廓。游戏会通过代码动态生成每种画笔的像素列表及预览缩略图，因此创建新形状完全不需要额外绘制美术图片。

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

神圣力量可以通过 `force_brush = "hello_target"` 将自己强制锁定为特定画笔，正如原版单格力量强制锁定为 `sqr_0` 一样。游戏内置的画笔切换快捷键会遍历 `_available_brushes` 列表，因此你的自定义画笔会自动进入该轮换循环。画笔选择窗口则是另一套逻辑：它在窗口初次唤醒时构建按钮；即便自制画笔未在面板列表显式列出，`force_brush` 与快捷键依然能无缝调用它。

> [!WARNING] 画笔的几何尺寸在游戏启动期完成计算
> `BrushLibrary.post_init()` 会执行每个画笔的 `generate_action` 并计算 `width`、`height` 与 `sqr_size`，随后 `linkAssets()` 会打乱像素排列。模组后续注册的画笔无法自动参与该流程：因此必须如上文所示手动赋值 `pos` 数组与尺寸参数。画笔的预览图完全根据 `pos` 数组像素实时绘制，因此画笔本身无需配置图标。

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## 它仍然没有出现在游戏中

没错：你创建了神力数据，但没有任何东西展示它。请前往 **[能力标签页与按钮](#/nml/power-buttons)**，那是另一半工作，而且只需十行代码 :pepeOK:。
