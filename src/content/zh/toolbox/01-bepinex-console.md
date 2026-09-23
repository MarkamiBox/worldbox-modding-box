---
title: 实时控制台 (BepInEx)
group: 概览
subgroup: 外部工具与环境配置
icon: :wbvideo:
order: 5
---

# 实时控制台 :wbvideo:

每次测试完都要在记事本里手动打开 `Player.log` 实在太折磨人了。（说实话我自己偶尔也还这么干 :23062-durrr:）。**BepInEx** 能为你提供一个黑色的控制台窗口，在游戏运行的同时实时滚动输出日志，你的代码一旦执行，对应的日志信息瞬间就会弹出来。

这个配置只需要花费你十分钟时间，搞定这一次，就能受用你的整个 Mod 开发生涯。

## 什么是 BepInEx

它是一个在 Unity 游戏启动前介入挂载的底层 Mod 加载器。WorldBox 开发者主要用它来实现两件事：实时控制台和 **UnityExplorer**（后面有专门的一页介绍）。虽然有些 Mod 在需要时会让 NML 自动帮你装上，但自己手动配置能让你彻底掌控各项参数。

## 安装步骤

1. 前往 [BepInEx 官方 Releases 页面](https://github.com/BepInEx/BepInEx/releases)，滚动到 **Assets** 列表，下载名为 `BepInEx_win_x64_5.4.x.x.zip` 的压缩包。认准这个精确的组合：**win**、**x64**、**5**。页面上的 `x86`、`unix`、`macos` 以及 `BepInEx 6 / IL2CPP` 看起来很诱人，但在这里通通不能用 :PES5_Dumb:。
2. 右键点击下载的 zip 压缩包 → **属性** → 如果有 **解除锁定** 复选框就勾选上，然后将它解压**到 WorldBox 的根目录**下，也就是包含 `worldbox.exe` 的那个文件夹（Steam 默认路径：`C:\Program Files (x86)\Steam\steamapps\common\worldbox`，或者在 Steam 中右键点击 WorldBox → **管理** → **浏览本地文件**）。解压后目录结构应该如下：

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **启动一次游戏然后直接关掉。** 这次初次运行是为了自动生成配置文件。屏幕上不会有任何显眼的变化，这是完全正常的 :hmm:。

## 开启控制台窗口

用任何文本编辑器打开 `BepInEx/config/BepInEx.cfg` 文件，找到 `[Logging.Console]` 配置节，修改为：

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

再次启动游戏。游戏窗口旁边就会同步弹出一个黑色控制台窗口，并且已经在实时打印日志了。

## 查看控制台输出

现在，即便你还没写过任何一行 Mod 代码，启动游戏时也能看到 BepInEx 和 NeoModLoader 的自检信息：

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

只要你能看到这几行字，恭喜你，你的实时控制台已经顺利就绪了！

稍后，当你在 **[你的第一个 Mod](#/nml/your-first-mod)** 教程里写好第一个 Mod 时，你就能在滚滚而过的日志洪流中看到自己的 Mod 正在编译并向你打招呼：

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

能让控制台发挥最大威力的三个好习惯：

- **给每一条日志加上专属前缀**，比如 `[MyMod]`，这样你一眼就能从茫茫日志海里挑出自己的输出。
- **在每个关键步骤的开头和结尾都打上日志**。如果你看到了“正在注册特质...”，却永远没看到“特质注册完毕”，你就能以像素级的精度瞬间定位出崩溃点。
- **把控制台丢在副屏上**（或者占屏幕的一半）。当你点击一个按钮的瞬间，亲眼看着对应的日志立刻跳出来，这是全世界最爽、最快速的调试体验 :memes:。

## 具体使用方式（快速预览）

在 **[你的第一个 Mod](#/nml/your-first-mod)** 中建好 Mod 文件后，你就可以添加实时日志来监听游戏事件了：

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // 鼠标左键，每次点击触发一次
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

每次点击鼠标，控制台都会在同一瞬间吐出一行信息。这种毫无延迟的即时反馈，正是 BepInEx 让人欲罢不能的核心原因！
