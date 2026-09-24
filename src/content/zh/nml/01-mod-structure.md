---
title: Mod 目录结构
group: NML 模组开发
subgroup: 核心开发流程
icon: :wbsavebuttonbox:
order: 20
---

# Mod 目录结构 :wbsavebuttonbox:

## Mod 存放在哪里

每一个 Mod 都是 WorldBox 游戏目录内 `Mods/` 下的**一个独立文件夹**：

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

如果该 `Mods` 文件夹尚不存在，请自己新建一个：右键 → 新建 → 文件夹，命名必须完全精确为 `Mods`。然后在其内部创建你自己的 Mod 文件夹，文件夹名字由你自由决定。

## Mod 的内部组织结构

```text
MyCoolMod/
├── mod.json          <- 你的 Mod 的身份证（必选）
├── icon.png          <- Mod 的预览图标
├── Code/             <- 存放你编写的所有代码的文件夹
├── Locales/          <- 文本与本地化翻译文件（en.json、zh.json 等）
└── GameResources/    <- 自定义贴图、图标、像素画素材与音效
```

只有 `mod.json` 是强制必须具备的。其他文件夹只有在你真正需要时才去创建。哪怕一个 Mod 只有 `mod.json` 和 `Code/`，它也是一个功能完整的真实 Mod。空文件夹打动不了任何人。

#### 每个文件夹的作用

- **`mod.json`**：身份证。没有它，NML 会当你的 Mod 根本不存在。
- **`icon.png`**：游戏内模组菜单中展示的预览图片。
- **`Code/`**：存放你所有 `.cs` 源代码文件（比如 `Main.cs`）的文件夹。其实 NML 会编译它在你模组里找到的任何 `.cs` 文件（会跳过 `bin/`、`obj/` 之类的目录），但把它们放进 `Code/` 可以防止你的项目变成垃圾场。**NML 每次启动游戏都会编译它们**，所以你永远不用自己编译 `.dll`，也永远不需要 Visual Studio。
- **`Locales/`**：多语言翻译文件（如 `en.json`）的存放处。没有它，你添加的所有物品和特质在游戏里都会直接显示为原始的占位键名。
- **`GameResources/`**：所有自定义纹理贴图、像素素材、特质图标、武器贴图和音频。文件夹名称必须一字不差，因为 NML 会精确按此路径检索。详见 **[贴图与资源](#/nml/sprites-and-resources)**。

### 模组清单文件 (Manifest)

NeoModLoader 需要 `mod.json` 来识别你的 Mod :pepeOK:。它直接位于你的 Mod 文件夹根目录中。

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### 这些字段代表什么？

- **`name`**：游戏内模组列表中展示的友好名称。
- **`author`**：你的用户名或昵称。大方展示你的辛勤劳动！
- **`version`**：Mod 的版本号（如 `"0.1.0"`）。每次发布新更新时递增该数值。
- **`description`**：对 Mod 功能的简短介绍。会显示在模组详情弹窗中。
- **`iconPath`**：预览图标的相对路径（通常是根目录下的 `"icon.png"`）。
- **`GUID`**：你的模组的唯一 ID，按惯例写成 `com.yourname.modname`。NML 会在内部把它整理成带下划线的大写形式（`COM_YOURNAME_MY_FIRST_MOD`），那才是它真正的身份。如果你不写，NML 也会把作者名和模组名拼在一起。**定好一次就永远别改**：玩家的设置文件就是以它命名的。
- **`RepoUrl`**：可选的链接，指向你的 GitHub 仓库、Discord 或网站。NML 会在你的模组卡片上放一个按钮，玩家一点就能跳过去。
- **`Dependencies`**：你的 Mod 正常运行所必须预先安装的其他 Mod 的 GUID 列表。若是独立 Mod，保持 `[]` 即可。
- **`OptionalDependencies`**：如果存在你就支持、但并非必需的模组。其中任何一个启用时，NML 甚至会给你的代码提供一个编译常量 `#if OTHER_MOD_GUID`，用来包住联动代码。
- **`IncompatibleWith`**：与你的模组同时启用就会让它出问题的模组 GUID 列表。NML 会检查这个列表，阻止冲突的模组同时加载。

如果你的模组没有代码、只想替换贴图，也可以设置 `"ModType": "RESOURCE_PACK"`；如果你就喜欢跟私有字段死磕，可以设置 `"UsePublicizedAssembly": false` :PES5_Hmmmm:。


## 来点硬核技术细节 :elpepehacker:

每个 Mod 都需要一个 C# 文件来宣布“嗨，我是一个 Mod”。最小的代码实现就长这样：

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

这绝不是为了写指南而故意简化的示例代码：绝大多数公开发布的 Mod 实际上都是从这一小段骨架起步的。

#### 逐行拆解代码

- **`using NeoModLoader.api;`**：就像在动手干活前先把工具箱打开。与其每次繁琐地书写 `NeoModLoader.api.BasicMod`，`using` 告诉计算机：*"把 NML 的工具整齐摆在桌面上备用"*。
- **`namespace MyCoolMod`**：给你写的代码冠一个独一无二的“姓氏”。其他人的 Mod 也可能包含一个名为 `Main` 的类，而命名空间能避免它们产生重名冲突。
- **`public class Main`**：在 C# 中，所有代码都存放在“类 (Class)”内部。一个类本质上就是一个带有名字的蓝图或配方。
- **`: BasicMod<Main>`**：你的模组的官方徽章。它告诉 NML *“我是一个正规模组”*，作为交换，NML 免费给你日志、设置、分阶段加载和翻译功能。`<Main>` 这部分只是重复你自己的类名。没错，看起来很怪，没错，永远都这么写。
- **`protected override void OnModLoad()`**：最关键的时刻。当 WorldBox 启动时，NML 会敲开这扇大门一次。你的 Mod 需要初始化的所有内容（特质、物品、神圣能力）全都写在这一对花括号 `{ }` 里面。
- **`LogInfo(...)`**：向日志输出一行文字，且已经自动附带了你的 Mod 名称前缀。这是确认你的代码是否真正执行起来的最直接手段。详见 **[日志与调试](#/nml/logs-and-debugging)**。

> [!TIP] 传统的繁琐写法
> 你在查看某些早期老模组时，可能会看到这种写法。没错，我老到还记得这曾经是常态的年代：
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` 是底层裸接口，而 `BasicMod<T>` 则是实现了该接口并封装了大量便捷开箱即用特性的基类。二者都能正常工作。除非有特殊需求，否则强烈建议使用 `BasicMod` :PES5_Noted:。

## 下一步

你已经掌握了整体结构。现在让我们动手做一个真正的 Mod 吧：**[你的第一个 Mod](#/nml/your-first-mod)**。
