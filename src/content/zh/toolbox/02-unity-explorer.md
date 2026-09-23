---
title: 探查游戏内部结构 (UnityExplorer)
group: 概览
subgroup: 外部工具与环境配置
icon: :wbeyeball:
order: 6
---

# 探查游戏内部结构 :wbeyeball:

**UnityExplorer** 是一款内置在游戏里的检查器。它允许你在任何界面暂停游戏，点击任意窗口、按钮或生物单位，实时查看它当前拥有的所有字段值。

你为什么需要它：与其靠玄学去猜原版窗口到底是怎么拼出来的，不如直接打开它*亲眼看一眼*。所有“这玩意到底是怎么实现的？”这类疑惑，都能在两分钟内搞定。

## 安装步骤

1. 先把 **BepInEx** 配置好并正常运行，参见 **[实时控制台](#/toolbox/bepinex-console)**。
2. 下载 [**UnityExplorer for BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases)（在 Releases 页面下载 `UnityExplorer.BepInEx5.Mono.zip` 压缩包）。
3. 将压缩包解压到 `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`。务必确保 `UnityExplorer.BIE5.Mono.dll` 以及它附带的依赖项 `UniverseLib.Mono.dll` 都在里面！
4. 启动游戏并按下 **F7**（默认的呼出快捷键）。

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## 你真正会用到的三个面板

| 面板 | 具体用途 |
| --- | --- |
| **Object Explorer → Scene Explorer** | 当前屏幕上所有对象的实时层级树。你想找的窗口就在这里的某处 |
| **Inspector** | 点击树中的任何对象，即可查看其挂载的所有组件与字段，以及当前的实时数值 |
| **C# Console** | 直接输入一行 C# 代码并在运行中的游戏里立即执行。无需重启游戏 |

## 示例 1：搞清楚原版窗口是怎么拼出来的

你想让自己制作的窗口看起来和游戏原版风格完全一致。那么：

1. 在游戏里打开你喜欢的窗口（比如“世界法则”窗口）。
2. 按下 F7，进入 **Object Explorer → Scene Explorer**，依次展开 `CanvasMain` → `canvas_ui`。
3. 逐层点击子节点，直到高亮选中的对象正好是你刚才打开的窗口。
4. 在 Inspector 中查看它挂载的组件：带有九宫格切片精灵图的 `Image`、`RectTransform` 的尺寸、`ScrollRect` 滑动组件等。

现在你已经掌握了精确的尺寸、贴图路径以及整体结构，可以直接抄到**[自定义窗口](#/nml/custom-windows)**开发中。这样你就能彻底告别盲猜锚点三个小时的痛苦折磨 :PES5_Peek:。

## 示例 2：读取资产的真实字段值

打开 **C# Console** 并运行以下代码：

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

在 UnityExplorer 的日志输出窗口里，你立刻就能看到：

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

你刚刚直接从运行中的游戏里提取了原版特质的图标路径和所属分组。把它们抄进你自己的特质里，它就会规规矩矩地出现在 UI 的正确分类下，并且配有一个真实存在的图标。

## 示例 3：写 Mod 之前先测试验证想法

依然是在 C# 控制台里：

```csharp UnityExplorer C# console
// 在坐标 x=100, y=100 的地块上生成一只狼
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

如果这段代码在这里能正常跑通，那它在你的 Mod 里就一定能跑通。如果它在这里直接抛出了异常，恭喜你，你刚刚为自己省下了一整轮枯燥的重新编译与重启游戏环节 :aPES2_ThumbsUp:。

> [!TIP] 配合控制台一起使用
> UnityExplorer 负责回答“这东西是由什么构成的？”，而 BepInEx 控制台则负责回答“我的代码到底有没有被执行？”。Mod 开发中遇到的大多数令人抓狂的问题，本质上都是这两个疑问之一。
