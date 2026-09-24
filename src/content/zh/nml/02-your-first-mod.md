---
title: 你的第一个 Mod
group: NML 模组开发
subgroup: 核心开发流程
icon: :wbchosen:
order: 22
---

# 你的第一个 Mod :wbchosen:

本指南中的所有内容都建立在**同一个 Mod** 之上。我们从这里起步，后面的每一篇教程都会为它添加一个新文件。

到最后，HelloBox 会包含大约四十个代码文件，而且每一行代码都是你亲手写下的：拥有独立标签页的角色特质与文化特质、一把武器及其专属附魔、一个状态效果、掉落物、一片云朵、一种地图地块、一道食物配方、一个投掷物、一项世界法则、带专属按钮的神圣能力、一个弹窗、一个配置面板、一座建筑、一个派系、一种全新生物、一场灾难、定制的 AI 行为树，甚至还有一个用来打破游戏原有规则的 Harmony 补丁。

这比任何实际 Mod 所需要的都要多，但这正是我们的目的。你只需要挑选自己真正想要的几个部分，把其余不需要的删掉即可 :PES4_DeleteThis:。

这个 Mod 叫做 **HelloBox**。让我们把它创造出来吧。

> [!NOTE] 之前从来没写过代码？
> 完全没关系。阅读每个代码块下方的“每行代码的含义”说明，并把代码原样复制进去。编程 90% 的本质就是复制能跑通的代码，然后一次只改动一处地方 :PES2_Legit:。

> [!TIP] 或者直接用模板
> 如果你不想一个个手建文件，就拿这个空骨架，直接跳到第 4 步。接下来三步还是值得读：它们讲的是里面装了什么。
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">下载空白 mod 模板</span>
>     <span class="dl-sub"><code>mod.json</code>、<code>Code/Main.cs</code>，以及 NML 会去找的那些文件夹。没别的了。</span>
>   </span>
> </a>

## 1. 创建文件夹

进入你的 WorldBox 目录（即包含 `worldbox.exe` 的文件夹），打开 `Mods/`，在里面新建一个名为 `HelloBox` 的文件夹。在其内部新建一个名为 `Code` 的文件夹。

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- 你的 Mod 目录
        ├── mod.json       <- 身份证文件（下一步创建）
        └── Code/          <- 你的 .cs 代码文件存放在这里
```

## 2. 身份证：mod.json

在 `HelloBox/` 目录下新建一个名为 `mod.json` 的文件，并粘贴以下内容。把 `author` 改为你自己的名字：

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** 是玩家在游戏内模组列表中看到的展示名称。
- **`GUID`** 是全球唯一标识符。填入 `com.yourname.hellobox` 且以后切勿改动。

如果没有这个文件，NML 会无视你的 Mod，当它根本不存在 :pepeno:。

> [!WARNING] 记事本会试图把它存为 `mod.json.txt`
> 在“另存为”对话框中，在输入文件名之前，务必把**保存类型**切换为**所有文件 (*.*)**。保存后在资源管理器中检查：如果你看不到 `.json` 后缀，请开启**查看 → 文件扩展名**，别让 Windows 把扩展名藏起来。名为 `mod.json.txt` 的文件会被 NML 完全忽略，几乎所有新手都会在这栽一次跟头 :PESgn_Oops:。

## 3. 编写代码：Main.cs

创建 `Code/Main.cs` 文件并粘贴以下代码：

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### 逐行拆解代码

- **`using NeoModLoader.api;`**：“我希望在此文件中使用 NML 提供的工具”。没有这一行，计算机根本不知道 `BasicMod` 是什么。
- **`namespace HelloBox`**：代码的“姓氏”，防止你的 `Main` 类与其他 Mod 的 `Main` 类发生重名冲突。
- **`public class Main : BasicMod<Main>`**：你的 Mod 本身。`: BasicMod<Main>` 部分表示“我是一个 NML Mod，请直接赠送我现成的实用组件”（日志、设置、翻译系统）。
- **`protected override void OnModLoad()`**：游戏启动时 NML 敲门的大门。你的 Mod 需要初始化的所有内容都要写进这组花括号 `{ }` 里。
- **`LogInfo(...)`**：向日志输出一行文字，且已经自动附带了你的 Mod 名称。这是检验你的代码究竟有没有运行的最有效手段。

## 4. 运行测试

启动 WorldBox，从主菜单打开 **Mods** 窗口。**HelloBox** 应该已经在列表里，并且已经开启。你自己放进 `Mods/` 的模组，会在 NML 第一次发现它时自动启用。

以后要**关闭**某个模组，也是在这个窗口里。点击图标即可切换，大多数模组要重启之后才会察觉 :PES4_AlrightThen:。

> [!WARNING] 根本没有 Mods 窗口？实验模式没开
> 只有 **设置 -> Experimental Mode** 开启时，NML 才会加载模组，而游戏**每次 WorldBox 更新后都会自己把它关掉**：它会把保存的 `last_used_version` 和你刚启动的版本做比较，不一致就把开关改回 `false`。所以“我的模组昨天还好好的，我什么都没改”几乎都是这个原因。重新打开它，然后重启。

> [!TIP] 列表里根本没有？
> 那说明 NML 从来没看到它。十有八九是文件变成了 `mod.json.txt` 而不是 `mod.json`，或者文件夹不在 `worldbox\Mods/` 里。完整列表见 **[常见问题排查](#/troubleshooting)**。

## 5. 检查运行日志

你的输出现在应该已经写进了日志文件：

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

要找到该日志文件，请在 Windows 资源管理器的地址栏中粘贴以下路径并回车：

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

用记事本打开 `Player.log`，按下 **Ctrl+F** 搜索 `HelloBox`。

如果你看到了这行输出，恭喜你，你现在已经是一位正式的 Mod 开发者了 :PESgn_Congrats:。如果没看到，请前往 **[日志与调试](#/nml/logs-and-debugging)**，该教程正是为解决这类情况而生的。

## 6. 后续所有教程的融入方式

从现在开始，后面的每一篇教程都会为你提供 `Code/` 目录下的**一个新文件**，以及在 `OnModLoad` 中添加的**一行新调用**。模式永远保持一致：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // 由“自定义特质”页面添加
    HelloItems.Initialize();    // 由“自定义物品”页面添加
    // ...以此类推
}
```

每一个新文件的基本骨架都是这样的：

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // 对应页面的具体逻辑代码放在这里
        }
    }
}
```

> [!TIP] 一次只做一件事
> 每添加一个新文件，就启动一次游戏检查日志，确认无误后再继续下一项。如果你一口气加了五个功能然后游戏崩了，你得面对五个嫌疑人；如果你一次只加一个，嫌疑人就只有一个 :aPES_Detect:。
