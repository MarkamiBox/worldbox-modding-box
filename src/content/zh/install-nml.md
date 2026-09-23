---
title: 安装 NML
group: NML 模组开发
icon: :wbhammer:
order: 1
---

# 安装 NML :wbhammer:

**NML**（NeoModLoader）是让 WorldBox 模组跑起来的程序。NML 只需要装一次，之后装模组就是复制一个文件夹。

这一页假设你从来没做过这种事。如果你知道 `.dll` 是什么，直接跳到 **[简短版](#简短版)** :PES_OkHand:。

> [!NOTE] Windows、Mac 与 Linux (Steam Deck)
> 模组支持 **Windows、Mac 与 Linux（包括 Steam Deck / SteamOS）的 Steam 正版游戏**。手机版、平板版与主机版不支持。

## 简短版

1. 在游戏里：**设置 → Experimental Mode → 打开**。
2. 从 [官方发布页](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) 下载 `NeoModLoader.dll`。
3. 把它放进 WorldBox 文件夹里的 `worldbox_Data/StreamingAssets/Mods/`。
4. 在同一个文件夹里，删掉所有名字带 `NCMS` 的东西。
5. 启动游戏。以后模组都放进 `worldbox.exe` 旁边的 `Mods` 文件夹。

就这些。下面是同样的五步，每一次点击都写出来了。

---

## Windows

### 第 1 步：打开 Experimental Mode

1. 像平常一样从 Steam 启动 WorldBox。
2. 打开游戏的 **设置** 窗口。
3. 在列表里找到 **Experimental Mode**（中文游戏里叫 **实验模式**），把它打开。
4. 关掉游戏。

没有这个开关，游戏根本不会去找模组。没有报错，没有提示，就是什么都不发生 :PES5_Hmmmm:。

> [!WARNING] 有两个名叫 Mods 的文件夹
> 在 `worldbox_Data\StreamingAssets\Mods/` 里的这个文件夹，**仅用于存放 NML 本身**（具体为 `NeoModLoader.dll`），不放任何其他内容。存放你的 **模组（Mods）** 的是另一个独立的文件夹，位于游戏根目录下与 `worldbox.exe` 并列（即 /`worldbox\Mods\`）。它现在还不存在，初次启动游戏时 NML 会自动创建它。把模组放进 `StreamingAssets\Mods/`，或者把 NML 放进 `worldbox\Mods/`，是这一页最常见的错误。

### 第 2 步：下载 NML

1. 打开这个链接：**[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**。它永远指向最新的 NML，可以加进书签。
2. 往下滚到 **Assets** 这一栏。如果是折叠的，点一下展开。
3. 点 **NeoModLoader.dll**。它和其他文件一样被下载，一般在 **下载** 文件夹里。

你只需要这一个文件。页面上还有 `.pdb`、`.xml` 和 "Source code" 文件：不用管。

> [!WARNING] 只从这个链接下载
> `.dll` 是程序。NML **只** 从上面的 GitHub 页面下载，绝不要从随便什么网站、或者别人在聊天里发给你的文件拿。如果浏览器问"要保留这个文件吗？"，那是因为它是 `.dll`，从这个页面下载的话答案就是保留。

### 第 3 步：打开 WorldBox 文件夹

这是 Steam 安装游戏的文件夹。你永远不用去找它：

1. 打开 **Steam**，进入 **库**。
2. 在左边的列表里 **右键** 点 WorldBox。
3. 点 **管理**，再点 **浏览本地文件**。

会打开一个装着游戏文件的窗口。如果你能看到一个叫 `worldbox`（或 `worldbox.exe`）的文件和一个叫 `worldbox_Data` 的文件夹，就对了。大多数电脑上是：

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

把这个窗口开着。从现在起，"WorldBox 文件夹"就是指它。

> [!TIP] 让 Windows 显示文件扩展名
> Windows 默认会隐藏文件名的结尾，所以 `NeoModLoader.dll` 只显示成 `NeoModLoader`。这会让任何教程都更难跟。在文件夹窗口顶部点 **查看**，勾选 **文件扩展名**（Windows 11：**查看 → 显示 → 文件扩展名**）。什么都不会坏，你只是能看到完整的名字了。

### 第 4 步：把 NML 放到正确的位置

1. 在 WorldBox 文件夹里双击 **worldbox_Data**。
2. 双击 **StreamingAssets**。
3. 双击 **Mods**。
4. 现在在第二个窗口里打开 **下载** 文件夹，把 **NeoModLoader.dll** 拖进这个 `Mods` 窗口。

最后应该是这样：

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     游戏自带的，别动
            └── NeoModLoader.dll     <- 你刚放进去的
```

如果里面看不到 `test_asset_load`，说明你进错文件夹了。回到 WorldBox 文件夹再试一次。

**既然来了：** 如果有名字带 **NCMS** 的东西（比如 `NCMS_memload.dll`，或者叫 `NCMS` 的文件夹），删掉。NCMS 是旧的模组加载器，已经死了，而且 NML 本来就能运行旧的 NCMS 模组 :PES2_Shrug:。

> [!WARNING] 有两个叫 Mods 的文件夹
> 这个在 `worldbox_Data\StreamingAssets/` 里的，**只给 NML 自己用**。放 **模组** 的是另一个文件夹，在 `worldbox.exe` 旁边。它现在还不存在，下一步 NML 会创建它。把模组放在这里，或者把 NML 放到那边，是这一页最常见的错误。

### 第 5 步：启动游戏并检查

从 Steam 启动 WorldBox，第一次多给它一点时间。

做对了的话：

- 世界加载时，游戏会显示 **Experimental mode is enabled** 这条消息。
- 屏幕下方的标签按钮里多了一个带 **NML 图标** 的新按钮。点它：你的模组列表就在那里。
- 回到 WorldBox 文件夹，`worldbox.exe` 旁边多了一个新的空文件夹 **Mods**。
- NML 在 `worldbox_Data\StreamingAssets\Mods/` 里给自己建了一个 **NML** 文件夹。别动它。

如果这些都没发生，跳到 **[没成功](#没成功)**。

---

## Mac

同样的五步。只是文件夹藏的位置不同，因为在 Mac 上整个游戏被打包成了一个应用图标。

1. **Experimental Mode**：和 Windows 完全一样，**[第 1 步](#第-1-步-打开-experimental-mode)**。关于更新的警告对你也一样。
2. 从 [同一个发布页](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) **下载** `NeoModLoader.dll`。Windows 和 Mac 用的是同一个文件。
3. **打开 WorldBox 文件夹**：Steam → 库 → 右键 WorldBox → **管理 → 浏览本地文件**。会打开一个 Finder 窗口。
4. **进入应用内部**：右键点 **worldbox** 应用图标，选 **显示包内容**。然后依次打开 **Contents → Resources → Data → StreamingAssets → Mods**，把 `NeoModLoader.dll` 拖进去。顺手删掉名字带 `NCMS` 的东西。
5. **启动游戏**，检查和 **[第 5 步](#第-5-步-启动游戏并检查)** 一样的几点。放模组的新 `Mods` 文件夹会出现在 WorldBox 文件夹里、应用的旁边，而不是应用里面。

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML 放这里
└── Mods/                        <- 模组放这里
```

---

## Linux 与 Steam Deck

操作原理完全相同。Linux 版 Steam 将游戏安装在用户目录下，在 Steam Deck 上只需先切换到桌面模式。

1. **开启实验模式 (Experimental Mode)**：与 Windows 完全相同，参见 **[步骤 1](#第-1-步-打开-experimental-mode)**。
2. 从 [官方发布页面](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) **下载** `NeoModLoader.dll`（所有系统通用）。
3. **打开 WorldBox 游戏目录**：
   - **桌面 Linux**：Steam → 库 → 右键点击 WorldBox → **管理 → 浏览本地文件**。
   - **Steam Deck**：按下 **STEAM 键 → 电源 → 切换至桌面**。在桌面模式下打开 Steam，前往库 → 右键点击 WorldBox（或使用左触控板/扳机键）→ **管理 → 浏览本地文件**。
   默认路径通常为：
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **放入 NML 核心文件**：进入 `worldbox_Data → StreamingAssets → Mods` 文件夹，将 `NeoModLoader.dll` 拖入其中。如果里面有任何带 `NCMS` 字样的文件或文件夹，请直接删除。
5. **启动游戏**（Steam Deck 可切换回游戏模式），按照 **[步骤 5](#第-5-步-启动游戏并检查)** 进行验证。WorldBox 根目录下将自动生成全新的 `Mods` 文件夹。

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## 安装模组

现在是简单的部分，也是你会反复做的部分。

1. 下载模组。先读它的说明：有些模组还需要别的东西，作者通常会写。
2. 如果是 **.zip** 文件，先解压。Windows：右键 → **全部解压缩**。Mac：双击。
3. 把得到的文件夹拖进 **`worldbox\Mods/`**，也就是 `worldbox.exe` 旁边那个。
4. 启动游戏。

模组文件夹里总会在某处有一个叫 `mod.json` 的文件。NML 就是靠它认出模组的。如果 zip 解出来是文件夹里套文件夹，也没关系，NML 会往里找。

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] 用 HelloBox 试一下
> 不确定装好了没有？本指南做的那个模组就是现成的测试。从 **[完整的 Mod 整合](#/nml/all-together)** 下载，解压到 `Mods`，启动游戏。如果出现一个塞满蠢按钮的新神力标签页，就说明全都装对了 :wbpeak:。

**要删除模组**，关掉游戏，把它的文件夹从 `Mods` 里删掉。**要关掉但不删除**，用游戏里 NML 的模组列表。

**创意工坊的模组** 也能用：在 Steam 创意工坊订阅，NML 会自己找到，不用复制任何东西。

---

## 没成功

按顺序检查。第一条能解决大多数人的问题。

| 你看到的 | 该怎么办 |
| --- | --- |
| 没有 NML 按钮，`worldbox.exe` 旁边也没有 `Mods` 文件夹 | Experimental Mode 没开。打开它，重启游戏。每次游戏更新后也要检查 |
| 还是什么都没有，Experimental Mode 已经开了 | `NeoModLoader.dll` 放错文件夹了。它必须在 `worldbox_Data\StreamingAssets\Mods/` 里，和 `test_asset_load` 放在一起 |
| 文件名变成了 `NeoModLoader.dll.dll` 或 `NeoModLoader (1).dll` | 把它精确地改名为 `NeoModLoader.dll` |
| NML 在，但某个模组不出现 | 模组放错了 `Mods`。它应该放在 `worldbox.exe` 旁边那个里面，是一个里面有 `mod.json` 的文件夹，而不是 `.zip` |
| NML 说某个模组 "has been disabled due to an error" | 这个模组坏了，或者对你的游戏版本来说太旧了。找找它的更新，或者去问作者 |
| WorldBox 一更新就全坏了 | 重新打开 Experimental Mode。然后等你的模组更新：游戏更新经常会让旧模组坏上几天 |

还是不行？**[疑难排查](#/troubleshooting)** 有长长的列表，**[日志与调试](#/nml/logs-and-debugging)** 会告诉你游戏把出错信息写在哪里。求助的时候，说清楚你用了哪些模组、坏掉之前刚做了什么，并附上错误文本。"不能用"这种话谁也修不好，包括我 :PESgn_ReadRules:。

---

## 大家总会问的问题

**NML 和 BepInEx 能一起用吗？**
能。它们互不干扰。两个具体的 *模组* 之间仍然可能冲突，但那是模组的问题，不是加载器的问题。

**模组说它需要的是 BepInEx，不是 NML。**
那它就不放进 `Mods`。按照 **[实时控制台 (BepInEx)](#/toolbox/bepinex-console)** 里的步骤安装 BepInEx（Windows），启动一次游戏，再把这个模组放进 `BepInEx\plugins/`。需要哪个加载器，模组说明里会写。

**NML 还是 NCMS？**
NML。NCMS 已经停止更新，在当前版本的游戏上跑不起来。NML 照样能运行旧的 NCMS 模组，所以你什么都不会失去。

**每个模组都要重新装一次 NML 吗？**
不用。装一次就够。之后每个模组都只是 `Mods` 里的一个文件夹。

**NML 需要更新吗？**
一般不用。NML 每次游戏启动时都会检查新版本并自动替换自己（它旁边出现的 `NeoModLoader.AutoUpdate_memload.dll` 就是干这个的）。万一失败了，就从同一个链接下载新的 `NeoModLoader.dll`，手动替换旧的。

**模组会弄坏我的存档吗？**
有可能。用模组做的存档，在去掉那个模组之后可能加载不正常。尝试新东西之前，先把重要的世界备份一份 :PES_MonkaSweat:。

不只想用模组，还想自己做？从 **[新手上路](#/getting-started)** 开始。
