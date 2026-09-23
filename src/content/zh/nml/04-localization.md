---
title: 本地化与多语言
group: NML 模组开发
subgroup: 核心开发流程
icon: :wbscroll:
order: 26
---

# 本地化与多语言 :wbscroll:

你添加到游戏里的每一件东西（特质、物品、能力、标签页、AI 任务），在赋予本地化文本之前都会显示为像 `trait_hello_swift` 这样的原始键名。这是 Mod 开发中最枯燥的一章，而偷懒跳过它也是一个 Mod 看起来粗制滥造的第一大原因。（咳咳.. 我的 Mod 们.. 咳咳咳 :pensiveanimated: ）

## 最偷懒的途径：Locales 文件夹

如果你的主类继承自 `BasicMod<T>`，只需在你的 Mod 目录下新建一个 `Locales/` 文件夹，并放进一个以语言代码命名的 JSON 文件。NML 会在 `OnModLoad` 运行**之前**自动加载它，你甚至不需要为此写一行代码。

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

文件名**本身就是**语言代码：`en.json`、`cz.json`（简体中文）、`ru.json` 等等。

如果你选择手动实现 `IMod`，则需要实现 `ILocalizable` 接口并指定该目录：

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## 一个文件搞定所有语言：CSV

在同一个文件夹里放置一个 `.csv` 表格文件可以一次性囊括所有语言，这比起维护十五个独立的 JSON 文件要省心得多。此时文件名叫什么都无所谓：

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## 在代码中动态注册文本

`NeoModLoader.General.LM` 是 NML 提供的本地化辅助类。当你的文本需要动态生成，或者你单纯想把所有东西写进一个 `.cs` 文件而不是分成多个 JSON 时非常顺手。

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // 读取当前游戏语言对应的文本
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // 添加到当前已加载的语言中
LM.Add("en", "trait_hello_swift", "Swift");          // 添加到特定语言中
LM.LoadLocale("path/to/Locales/en.json");            // 手动加载一个 json
LM.LoadLocales("path/to/Locales/lang.csv");          // 手动加载一个 csv
LM.ApplyLocale(false);                               // 应用生效。false = 不强制重绘屏幕上的所有文字
```

在 HelloBox 中，该文件看起来是这样的：

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

在 `Main.cs` 中**最先**调用 `HelloLocale.Initialize();`，排在其他所有初始化之前，确保没有任何资源在缺少文本的状态下被过早注册。

**在加载时一次性注册全部文本**，并在末尾调用一次 `ApplyLocale`。向游戏索取一个不存在的键会触发报错并向磁盘写日志，因此充斥着缺失键名的鼠标悬浮提示不仅丑陋，还会让日志疯狂刷屏 :PES_UghPing:。

## 你真正需要掌握的常用键名规则

游戏底层会自动拼接这些键名，因此必须完全吻合：

| 元素类型 | 名称键名 | 描述键名 |
| --- | --- | --- |
| 特质 (Trait) | `trait_<id>` | `trait_<id>_info` |
| 物品 (Item) | `item_<id>` | `item_<id>_description` |
| 神圣能力 | `<power_id>` | `<power_id>_description` |
| 能力分类标签页 | 你传入的 `locale_key` | 你传入的描述键名 |
| 角色行为任务 | `task_unit_<task_id>` | - |
| 状态效果 | `<status_id>` | `<status_id>_description` |
| 世界法则 | `<law_id>_title`（注意后缀） | `<law_id>_description` |

> [!WARNING] ID 不是展示名称
> 无论在哪种语言下，你的 ID 都永远是 `hello_swift`，这是你的其他代码（以及别人的 Mod）引用的唯一标识。**本地化文本**才是会随语言变化的部分。切勿仅仅为了修复显示名称里的错别字而随意改动底层 ID :PESgn_Stop:。
