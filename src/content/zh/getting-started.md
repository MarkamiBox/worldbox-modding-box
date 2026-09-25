---
title: 准备工作与快速入门
group: 概览
icon: :wbsalut:
order: 3
---

# 准备工作与快速入门 :wbsalut:

在写下第一行代码前你需要做好的所有准备。请按顺序执行以下步骤，大约只需耗费你十五分钟。

> [!NOTE] 此时此刻你甚至不需要懂编程
> 你**完全不需要**安装庞大的 Visual Studio、额外的编译链或任何类似工具。NML 会直接读取模组文件夹中的 `.cs` 源码文件，并在需要时自动为你完成编译。**Windows 自带的“记事本”完全足够用来编写你的第一个模组** :PES_OkHand:。你可以等到以后确实感到功能受限时，再随时升级你的开发工具。

## 1. 找到你的 WorldBox 游戏安装目录

在这份指南中，你会被要求把文件“放入 WorldBox 根目录”大概不下四十次，所以现在就一次性找准它：

**Steam → 右键点击 WorldBox → 管理 → 浏览本地文件**

随后会打开包含 `worldbox.exe` 的资源管理器窗口。在绝大多数电脑上，其默认路径为：

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

请保持该窗口开启，或将其固定在快速访问栏中。每当本指南提到 *WorldBox 根目录* 时，指的都是这个位置 :gatoxd:。

## 2. 开启游戏内的实验模式

不开启实验模式，模组将彻底无法加载。不是“运行不稳定”，而是压根不会被载入：没有任何报错，完全一片沉寂。

在游戏内：打开 **设置**，找到 **实验模式 (Experimental Mode)** 并将其勾选开启。每次游戏版本更新后请重新检查一次：游戏在版本迭代时往往会自动将其重置关闭。

## 3. 安装 NeoModLoader (NML)

**NML** 是负责扫描、编译并载入运行你的模组的核心加载器。没有 NML 就无法进行 WorldBox 模组开发。此前从未接触过？**[安装 NML](#/install-nml)** 中详细记录了每一步点击流程（包含 Mac 系统）。

1. 前往 [NML Releases 发布页](https://github.com/WorldBoxOpenMods/ModLoader/releases) 下载最新版本的 `NeoModLoader.dll`。只需下载这一个 DLL 文件即可。
2. 在你的 WorldBox 游戏根目录中，依次进入 `worldbox_Data\StreamingAssets\Mods/`。
3. 将下载的 `NeoModLoader.dll` 放入该文件夹。

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- 放入这里
```

启动游戏。如果安装成功，你会在游戏主界面底部的功能栏中看到带有 NML 图标的新按钮，并且在 `worldbox.exe` 同级目录下会自动生成一个空的 `Mods` 文件夹。如果没有看到，请重新检查第 2 步 :PES5_Hmmmm:.

> [!NOTE] 你不需要创意工坊版本
> NML 在每次游戏启动时都会检查新版本并自动更新，因此上面介绍的手动安装方式本身就是自动更新的。Steam 上确实有一个 [NML 创意工坊页面](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469)，但在手动安装的同时**又**订阅它，是导致“模组不显示”或“无法删除模组”的常见原因：两个副本会互相冲突。二选一即可。另外，如果你曾经在创意工坊订阅过内容，仅在模组列表中取消勾选并不等同于取消订阅。

## 4. 选择文本编辑器

任何能保存纯文本的编辑器都行。大致按“好用程度”排序：

| 编辑器 | 特性简析 |
| --- | --- |
| **系统记事本 (Notepad)** | Windows 开箱即用。写第一个最简单的模组绰绰有余 |
| **[VS Code](https://code.visualstudio.com/)** | 免费、轻量，支持代码高亮与语法纠错。绝大多数开发者的黄金之选 |
| **Visual Studio** | 工业级 IDE。引用游戏 DLL 后可提供完整的智能代码补全。但在写大型工程前显得过于臃肿 |

无论你选择哪个编辑器：保存 `.cs` 文件时，务必确保文件后缀是 `.cs` 而**不是** `.cs.txt`。记事本经常会擅自给文件附上 txt 后缀坑害新手 :PESgn_SMH:。

## 5. 大功告成，开始动手创造吧！

请前往 NML 模组开发板块下的 **[模组基本结构](#/nml/mod-structure)**，随后开始阅读 **[你的第一个模组](#/nml/your-first-mod)** :gatoxd: !

---

## 后期进阶工具推荐（初期无需安装）

编写基础模组**不需要**以下工具。请等到后续具体页面提及它们时再行安装。

- **[实时调试控制台 (BepInEx)](#/toolbox/bepinex-console)**：一个独立的黑色控制台窗口，能在你游玩测试时实时滚动输出 Log，无需每次退出去翻日志文件。建议尽早配置，能省下海量调试时间。
- **[UnityExplorer 游戏内对象浏览器](#/toolbox/unity-explorer)**：直接在游戏里点击任意物体，实时洞察其底层数据与内部组件。
- **[dnSpy 或 ILSpy 反编译器](#/toolbox/reading-the-game-code)**：直接反编译游戏本体程序集，查看官方开发者是如何编写底层代码的。
- **[AssetRipper 资源提取器](#/toolbox/getting-the-sprites)**：解包提取游戏原版的贴图与音效，方便你对齐官方像素画风。
- **[BepInEx 模组开发](#/toolbox/bepinex-modding)**：如果你想要对 Unity 引擎进行底层挂钩，而不是制作 NML 内容，就可以编写预编译的 `.dll` 插件。

> [!NOTE] 阅读老旧的 NCMS 模组
> NML 内置了一层 NCMS 兼容层，也支持旧版的 `[ModEntry]` 入口点。但这并不能修复那些调用了已经变动过的游戏 API 的代码。在依赖某个老模组之前，先拿你当前的游戏版本和 NML 版本实测一遍。请像本指南一样，用 `BasicMod<Main>` 来启动 HelloBox。

接下来：**[模组基本结构](#/nml/mod-structure)**。
