---
title: 日志与调试
group: NML 模组开发
subgroup: 核心开发流程
icon: :wbdebugburger:
order: 24
---

# 日志与调试 :wbdebugburger:

日志是整个 Mod 开发过程中唯一永远对你说实话的工具。它能解答那个你未来会问上一千遍的终极问题：**我的代码到底有没有被执行？**

## 输出一行日志

有两种写法，最终都会记录在同一个日志文件里。

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML 方式：自动替你加上 Mod 名称前缀
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity 原生方式：需要自己手动拼前缀
        }
    }
}
```

没有继承 `BasicMod`？在 `NeoModLoader.services.LogService` 中同样提供了 `LogInfo`、`LogWarning`、`LogError`，以及能打印完整堆栈追踪的 `LogStackTraceAsError`。

## 正常的日志长什么样

带上上述代码启动游戏，在 `Player.log` 中搜索 `HelloBox`。你应该能看到类似这样的内容：

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

逐行解释：NML 编译了 `Code/` 中的文件，加载了你的素材资源（resource），然后调用了 `OnModLoad`，输出了你的那一行文字。带编号的行是 NML 对每个步骤的耗时统计：`=` 后面的数字是秒数，有时会在日志里显示为红色。**这里的红色并不代表报错**，只说明该步骤是耗时最长的一个环节 :hmm:。

最关键的是你自己输出的那行内容。如果没有看到 `[HelloBox]: HelloBox is alive!`，请继续往下阅读。

## 当你的代码无法编译时

在你的 Mod 运行之前，NML 必须先完成编译。哪怕一个微小的标点错误也会让它原地停下，并且它会精确告诉你错在哪：

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

从右往左看：**`; expected`** 是问题所在（缺少分号），**`(9,42)`** 表示第 9 行第 42 个字符，**`Code\Main.cs`** 则是对应的源码文件。打开该文件，定位到那一行，把分号补上。

真正有价值的信息都在**第一行**。下面的 `Failed to compile mod HelloBox` 只是个总结。很多人往往只看最后一行然后慌了手脚，却忽略了答案其实就明明白白写在正上方 :PES4_1IQ:。

## 报错时的日志长什么样

一旦代码成功编译，下面这个报错将成为你的常客 :PES2_F:：

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

看起来很唬人，但其实就是一句简单的话：

- **`NullReferenceException`**：你访问了一个不存在（为 `null`）的对象。你未来遇到的报错 95% 都是这个。
- **`at HelloBox.HelloTraits.Initialize ()`**：事故发生的具体方法。
- **`in HelloTraits.cs:24`**：**你自己源码文件的第 24 行**。看那一行：上面的某个变量或对象是 `null`。
- 下面的行是调用栈链路，从最新到最旧排列。只需盯紧属于你自己 Mod 的文件名即可。

导致该报错的最经典原因：在调用 `add()` 将资源注册到资源库之前，就试图去修改该资源的 `base_stats`。详情请参阅 **[自定义特质](#/nml/custom-traits)** 教程。

## 日志文件存放在哪里

| 文件 | 路径 | 作用 |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | 当前游戏运行的日志 |
| `Player-prev.log` | 同上目录 | **上一次** 运行的日志（刚刚崩溃退出的那次） :aPES_Flatline: |
| `logs/error_*.log` | 同上目录的 `logs/` 下 | 游戏捕获的每个异常单独生成的日志 |
| `mods_config/<GUID>.config` | 同上目录 | 玩家保存的针对你 Mod 的配置选项 |

把 `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` 粘贴到 Windows 资源管理器地址栏即可一键直达。

## 用实时控制台代替翻看日志文件

每次等游戏关掉再去翻文本文件太慢了。安装 **BepInEx** 后，你可以在玩游戏的同时开启一个黑色控制台窗口，实时滚动打印日志，按下按钮的瞬间就能看到输出。配置只要两分钟：**[BepInEx 实时控制台](#/toolbox/bepinex-console)**。

想要在游戏里点击任意窗口并实时查看其内部参数？请使用 **[UnityExplorer](#/toolbox/unity-explorer)**。

## 别让单点崩溃毁掉整个 Mod

`OnModLoad` 是从上到下按顺序执行的。如果第 3 行报错中断，第 4 到 20 行就永远无法执行，你的半个 Mod 就会无声无息地消失。给各个功能模块加上独立的安全防线：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// 执行单一初始化阶段；即使崩溃，也只记录错误并继续往下执行其他阶段
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

这样一来，某个特质（trait）写崩了也只会丢失该特质，而不至于拖垮整个 Mod，日志也会清楚标明是哪个环节出了差错：

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## 在世界尚未诞生前切勿触碰它

`OnModLoad` 运行在游戏世界真正生成**之前**。此时既没有地图，也没有任何单位。如果你在这个阶段去触碰它们，游戏会在进入主菜单之前直接崩溃 :surprised_pikachu:。每帧都在运行的逻辑必须设置安全守卫：

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // 仍在主菜单
    if (World.world == null || World.world.units == null) return;  // 世界尚未加载
    if (MapBox.instance == null) return;

    // 从此处开始操作游戏世界才是安全的
}
```

## 无需重启游戏热重载代码

每次只改动了一行代码就得重启一遍 WorldBox 是模组开发中最耗费时间的事情。不信去问问一晚上重启过四十次的人。NML 可以在游戏运行期间重新编译你的模组，并热替换掉你打上标记的方法。

1. 你的主类需要实现 `IReloadable` 接口，该接口仅包含一个 `Reload()` 方法。HelloBox 的实现在 **[完整模组范例](#/nml/all-together)** 中。
2. 在 NML 的活动模组菜单中，任何实现了 `IReloadable` 的模组都会自动出现重载按钮。（旧版模组列表需要 `Config.isEditor = true` 才会显示按钮，但主菜单不需要你绕这个弯。）
3. 使用来自 `NeoModLoader.api.attributes` 的 `[Hotfixable]` 属性标记希望热替换的方法：

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // 在游戏运行时编辑此处逻辑，保存后点击重载，观察下一个生物执行新行为
}
```

随后修改方法代码并保存，在 NML 的模组列表中点击该模组的重载按钮。NML 将重新编译、修补已标记的方法，并调用 `Reload()`。未标记的方法将继续保持旧代码运行。

> [!NOTE] 如果你真的要打开 `Config.isEditor`
> `Config.isEditor` 是游戏内部的 Unity 开关。手动打开它，WorldBox 会以为自己在 Unity 编辑器里运行，部分界面会切换成移动端布局。在新版 NML 中使用 `IReloadable` 就用不到它，所以别去碰它。

不支持的范围：`Awake`、`Update` 等 Unity 原生生命周期回调、构造函数，以及游戏已经根据旧代码实例化的持久化数据。启动时注册的资产（asset）仍会保留当时赋予的委托回调，因此应在 `Reload()` 方法中手动重新赋值更新。

## 每个人都会踩一遍的经典错误

| 现象 | 真正的原因 |
| --- | --- |
| 列表中看不到 Mod | 缺少 `mod.json`，或 JSON 格式错误（末尾多了一个逗号 :pepeclown:） |
| 列表中有 Mod，但进游戏毫无反应 | `OnModLoad` 报错中断。去日志里搜索你的 Mod 前缀和 `Exception` |
| `Failed to compile mod ...` | C# 语法或拼写错误。真正的报错信息在**上面一行** |
| 新建资源时报 `NullReferenceException` | 在 `add()` 之前访问了 `base_stats`：属性表是由库负责分配的 |
| 游戏内文本显示为 `trait_whatever` | 缺少多语言翻译，详见 **[本地化与多语言](#/nml/localization)** |
| 按钮呈现为一个透明隐形空洞 | 贴图路径写错导致找不到素材，返回了 `null` |
| 在自己电脑上正常，别人电脑上全崩 | 把包含自己 Windows 用户名的绝对路径写死了 :homerhide: |
