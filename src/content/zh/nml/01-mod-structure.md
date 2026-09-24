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

只有 `mod.json` 是强制必须具备的。其他文件夹只有在你真正需要时才去创建。哪怕一个 Mod 只有 `mod.json` 和 `Code/`，它也是一个功能完整的真实 Mod。

#### 每个文件夹的作用

- **`mod.json`**：身份证。没有它，NML 会当你的 Mod 根本不存在。
- **`icon.png`**：游戏内模组菜单中展示的预览图片。
- **`Code/`**：存放你所有 `.cs` 源码文件（如 `Main.cs`）的地方。**NML 会在每次游戏启动时自动替你编译它们**，因此你无需手动构建 `.dll`，也根本不需要安装 Visual Studio。
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
- **`GUID`**：你的 Mod 的全网唯一标识符，按照约定采用全小写的 `com.yourname.modname` 形式。可以将其视作 Mod 的身份证号：它能杜绝与其他开发者的 Mod 发生名称冲突。**一旦选定就切勿修改**：玩家的配置文件即以此命名。
- **`Dependencies`**：你的 Mod 正常运行所必须预先安装的其他 Mod 的 GUID 列表。若是独立 Mod，保持 `[]` 即可。
- **`OptionalDependencies`**：可选依赖；如果玩家安装了这些 Mod 则提供兼容，但未安装也不影响基本运行。
- **`IncompatibleWith`**：与你的 Mod 冲突互斥的 Mod GUID 列表。若二者同时启用，NML 会主动警告玩家。

你也可以设置 `"ModType": "RESOURCE_PACK"` 或 `"UsePublicizedAssembly": false` :PES5_Hmmmm:。


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
- **`: BasicMod<Main>`**：你的 Mod 的官方通行证。它告诉 NML *"我是合规的正式模组"*，作为回报，NML 免费赠送你日志记录、配置管理和多语言本地化能力。`<Main>` 部分只是重复你自己的类名。看起来确实有点奇特，但规则上就是这样写的。
- **`protected override void OnModLoad()`**：最关键的时刻。当 WorldBox 启动时，NML 会敲开这扇大门一次。你的 Mod 需要初始化的所有内容（特质、物品、神圣能力）全都写在这一对花括号 `{ }` 里面。
- **`LogInfo(...)`**：向日志输出一行文字，且已经自动附带了你的 Mod 名称前缀。这是确认你的代码是否真正执行起来的最直接手段。详见 **[日志与调试](#/nml/logs-and-debugging)**。

> [!TIP] 传统的繁琐写法
> 你在查看某些早期老模组时，可能会看到这种写法：
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
> }
> ```
> `IMod` 是底层裸接口，而 `BasicMod<T>` 则是实现了该接口并封装了大量便捷开箱即用特性的基类。二者都能正常工作。除非有特殊需求，否则强烈建议使用 `BasicMod` :PES5_Noted:。

## 下一步

你已经掌握了整体结构。现在让我们动手做一个真正的 Mod 吧：**[你的第一个 Mod](#/nml/your-first-mod)**。
