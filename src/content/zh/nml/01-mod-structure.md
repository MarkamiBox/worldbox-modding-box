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
HelloBox/
├── mod.json          <- 你的 Mod 的身份证（必选）
├── icon.png          <- Mod 的预览图标
├── Code/             <- 存放你编写的所有代码的文件夹
├── Locales/          <- 文本与本地化翻译文件（en.json 等）
└── GameResources/    <- 自定义贴图、图标、像素画素材与音效
```

每个 Mod 都必须包含 `mod.json`。HelloBox 还需要它的 C# 入口点。其他文件夹只有在你真正需要时才去创建。哪怕一个 Mod 只有 `mod.json` 和 `Code/`，它也是一个功能完整的真实 Mod。空文件夹打动不了任何人。

#### 每个文件夹的作用

- **`mod.json`**：身份证。没有它，NML 会当你的 Mod 根本不存在。
- **`icon.png`**：游戏内模组菜单中展示的预览图片。
- **`Code/`**：存放你所有 `.cs` 源代码文件（比如 `Main.cs`）的文件夹。其实 NML 会编译它在你模组里找到的任何 `.cs` 文件，包括子文件夹（会跳过 `bin/`、`obj/`、`Properties/`、`packages/` 以及任何以点开头的文件夹）。所以直接放在 `mod.json` 旁的 `.cs` 文件也能运行，有些模组确实这么做，但把它们放进 `Code/` 可以防止你的项目变成垃圾场。**NML 会在需要时编译源码并重用已编译的缓存。** 在本指南中你不需要额外的构建步骤。
- **`Locales/`**：多语言翻译文件（如 `en.json`）的存放处。没有它，你添加的所有物品和特质在游戏里都会直接显示为原始的占位键名。
- **`GameResources/`**：所有自定义纹理贴图、像素素材、特质图标、武器贴图和音频。文件夹名称必须一字不差，因为 NML 会精确按此路径检索。详见 **[贴图与资源](#/nml/sprites-and-resources)**。

> [!WARNING] 文件夹名称区分大小写，只是在你的 Windows 上看不出
> Windows 不在乎你写的是 `Locales` 还是 `locales`。Linux 在乎。NML 精确检索 `Locales` 和 `GameResources` 拼写，因此在你电脑上能运行的模组，在别人那里可能会丢失全部文本和贴图。严格匹配上述大小写，这个问题就永远不会发生。

#### 其他人的 Mod 中可能见到的文件夹

入门时你完全不需要这些文件夹。但在浏览别人的模组时你会看到它们，以下是它们的具体用途：

| 文件夹 | 作用 |
| --- | --- |
| `Assemblies/` | 源码模组使用的第三方托管库。NML 会直接收集该文件夹内的 `.dll` 文件作为编译器引用并尝试加载它们。这里不能放置游戏本体或 NML 的 DLL |
| `GameResourcesReplace/` | NML 紧随 `GameResources/` 之后以完全相同的方式加载它。NML 将该名称归为 NCMS 兼容特性。在编写新模组时，直接使用 `GameResources/` 即可 |
| `EmbededResources/` | 没错，拼写故意少了一个 'd'，且必须如此。其中的文件会被打包进 **NCMS 风格**模组的编译代码中。经检验的源码编译器仅在其 NCMS 兼容分支中读取它。它不是 HelloBox 的 `BasicMod` 代码的自动嵌入机制。`EmbeddedResources/` 并不是该分支所使用的文件夹名称 |

#### 发布 `.dll` 而不是源代码

在所检验的模组加载器中，**直接位于 `mod.json` 旁边**的 `.dll` 文件会触发预编译加载流程。NML 会跳过源码编译并直接加载根目录下的 DLL。将你编译好的 HelloBox DLL 放在那里，并在发布包中剔除 `Code/`。构建与打包检查请参阅 **[发布你的 Mod](#/nml/publishing)**。

> [!WARNING] 一个多余的 .dll 会直接关停你的源码
> 这也是为什么把第三方库直接丢在 `mod.json` 旁边会“搞坏”源码模组：NML 看到该 `.dll`，便会跳过 `Code/`，导致你的任何代码改动都不会被加载。库文件必须放入 `Assemblies/`，绝不要放在模组根目录。


### 模组清单文件 (Manifest)

NeoModLoader 需要 `mod.json` 来识别你的 Mod :pepeOK:。它直接位于你的 Mod 文件夹根目录中。

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### 这些字段代表什么？

| 字段 | 作用 |
| --- | --- |
| `name` | 显示名称，这里是 `HelloBox` |
| `author` | 你的用户名或昵称 |
| `version` | 发布版本号。发布新版本时递增 |
| `description` | 简短描述 |
| `iconPath` | 相对于模组根目录的图标路径 |
| `GUID` | 稳定的身份标识。NML 会将其规范化为 `UID`；在本例中为 `COM_YOURNAME_HELLOBOX`。发布后请勿更改 |
| `RepoUrl` | 代码仓库或支持网址元数据。请在你面向的 NML 版本中核对其实际显示效果 |
| `Dependencies` | 所需的前置模组 ID 列表。文档所述的源码工作流需要它们才能顺利编译 |
| `OptionalDependencies` | 可选的前置模组 ID 列表。NML 可以在源码编译期间提供其引用和编译器符号 |
| `IncompatibleWith` | 冲突声明列表。请勿假设各加载器版本之间的强制处理机制完全相同 |
| `UsePublicizedAssembly` | 在所检验的加载器中默认为 `true`。在源码编译期间添加 NML 的公开化游戏程序集引用 |

> [!WARNING] 在填写冲突列表前请先核验其行为
> 附带文档将 `IncompatibleWith` 标记为未完成功能。所安装的加载器包含一个移除阶段，该阶段在查找列表中列出的 ID 之前，会直接移除列表非空的模组。请在示例中保持其为空。在发布包含冲突声明的模组前，请务必针对冲突模组存在和不存在的情况，在你的实际加载器版本上进行测试。

#### ModType 与 targetGameBuild

所检验的枚举包含 `NEOMOD`、`COMPILED_NEOMOD`、`BEPINEX` 和 `RESOURCE_PACK`。默认值为 `NEOMOD`；检测到根目录存在 DLL 时会选择 `COMPILED_NEOMOD`。

枚举名称并不代表可直接运行的配方。所检验的 `LoadMod` 方法仅处理这两种 NeoMod 类型，并在该流程中拒绝其他类型。在 HelloBox 的清单中请省略 `ModType`。本指南并不断言仅仅设置 `RESOURCE_PACK` 就能创建出可正常工作的材质包。

`targetGameBuild` 在程序集中存在 JSON 映射，但所检验的基于文件的构造函数并没有将其复制到活动声明中。请勿将其用作版本兼容性拦截阀门。请在你的发布说明中明确注明经过测试的游戏版本和 NML 版本。

#### 清单文件的键不可随意替换

所检验的声明会将 `GUID` 映射到运行时的 `UID`。它没有对 `id`、`mainClass`、`modLoader`、`gameVersion` 或 `homepage` 的映射，其基于文件的构造函数也不会读取这些键。它们不能替代上述字段。

NML 会自动在程序集中寻找合适的入口类型。`mainClass` 字符串并不能指定入口类型。请保持清单小巧清晰，切勿直接导入其他加载器的配置结构。

#### 依赖项编译符号

对于**此处使用的 ASCII 标识符**，NML 会将字母转换为大写，并将标点符号替换为下划线：`com.yourname.hellobox-extra` 会变为 `COM_YOURNAME_HELLOBOX_EXTRA`。请勿将该规则推广到所有 Unicode 字符；所检验的规范化逻辑会保留其中的一部分。

在源码编译期间，当可选依赖项的 ID 存在于编译器的引用映射表中时，NML 才会定义该符号。仅凭安装并不构成判断依据。如果编译失败，加载器还可能在不带可选依赖项的情况下重试编译。

> [!WARNING] 拼错符号会悄悄剔除你的代码
> 未知的 `#if` 符号会被求值为 false。请核对依赖项 ID、`OptionalDependencies` 列表以及规范化后的符号。编译成功并不证明你的联动集成代码确实已被包含进去。

完整示例与独立的运行时检查请参阅 **[与其他 Mod 协同工作](#/nml/other-mods)**。

#### 会破坏 Mod 文件夹的做法

- **附带游戏本体或加载器的 DLL。** 切勿包含 `Assembly-CSharp.dll`、其公开化副本、`NeoModLoader.dll`、Unity 库或从游戏 `Managed/` 目录复制的其他 DLL。构建时引用本地副本，但在打包 zip 时切勿包含它们。NML 的额外库加载器具有特殊判断和去重机制，复制 DLL 并不是替换已加载版本的可靠方式。
- **嵌套清单文件。** NML 首先检查模组自身文件夹下的 `mod.json`。仅当它不存在时才会向下搜索子文件夹。如果存在多个嵌套匹配，所检验的加载器会发出警告并使用第一个结果。切勿依赖这种顺序。请始终在 `HelloBox/mod.json` 保持唯一的清单文件。
- **在 Mod 内保留源码备份。** `dist/`、`backup/` 或 `old/` 等文件夹可能会在源码编译时引入重复的 C# 类。请将发布临时文件夹和备份存放在安装的模组文件夹之外。
- **硬编码路径。** 在你的 `BasicMod` 类中，请使用 `GetDeclaration().FolderPath` 和 `Path.Combine` 来访问打包的文件。游戏的 `StreamingAssets/mods` 目录是原生加载器的位置，而不是 HelloBox 所在的文件夹。
- **超出软件包范围的路径。** 使用大小写匹配的相对图标与资源路径。切勿使用绝对路径或包含 `..` 的路径片段。`Path.Combine` 仅拼接路径，它不会检查玩家输入的路径是否逃出了你的模组文件夹。

> [!NOTE] 检验依据说明
> 本文所述的文件夹与编译器行为均在安装的 NML 程序集（文件版本 `1.2.0.1`，信息提交哈希 `cd47a1a6c437718d38e8f29240bdb761d543e09a`）及附带的 NML 文档上跟踪确认。这并不代表对每个未来版本的永久保证。


## 来点硬核技术细节 :elpepehacker:

每个 Mod 都需要一个 C# 文件来宣布“嗨，我是一个 Mod”。最小的代码实现就长这样：

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
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
- **`namespace HelloBox`**：给你写的代码冠一个独一无二的“姓氏”。其他人的 Mod 也可能包含一个名为 `Main` 的类，而命名空间能避免它们产生重名冲突。
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
