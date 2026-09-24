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


如果你的表格软件导出时默认使用分号或制表符而非英文逗号，可以在主类上实现 `ICsvSepCustomized` 并在 `GetCsvSeparator()` 中返回 `';'`，以免 NML 把你的文本解析成一锅乱粥 :PES2_Shrug:。
在同一个文件夹里放置一个 `.csv` 表格文件可以一次性囊括所有语言，这比起维护十五个独立的 JSON 文件要省心得多。此时文件名叫什么都无所谓：

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## 在代码中动态注册文本

`NeoModLoader.General.LM` 是本地化辅助工具。当你的文本是动态生成的，或者你只是想把所有内容放进一个 `.cs` 文件而不是一堆 JSON 时，它很方便。

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

在 HelloBox 里，这个文件长这样：

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

把 `HelloLocale.Initialize();` **最先**加到 `Main.cs` 里，放在所有其他东西之前，这样就不会有任何东西在文本缺失的情况下被注册。

**在加载时一次性注册所有内容**，最后只调用一次 `ApplyLocale`。向游戏请求一个它没有的键，会直接把键名本身当作文本返回，而且每个键都会在日志里产生一条 `missing text` 错误，所以由缺失键拼成的提示框不仅难看，还会让你的日志充满噪音 :PES_UghPing:。

## 你真正需要掌握的常用键名规则

这些键是游戏自己拼出来的，所以必须完全一致，否则什么都不会显示。其中有两个**不**遵循“和 id 相同”的规则，大家恰恰在这两个上浪费一个小时：

| 对象 | 名称键 | 描述键 |
| --- | --- | --- |
| 特质 | `trait_<id>` | `trait_<id>_info` |
| 物品 | 如果设置了就是 `translation_key`，否则是 `item_<equipment_subtype or id>` | `<id>_description`（没有 `item_` 前缀） |
| 神力 | `<power_id>` | `<power_id>_description` |
| 神力标签页 | 你传入的 `locale_key` | 你传入的描述键 |
| 角色任务 | `task_unit_<task_id>` | - |
| 状态效果 | 你设置的 `locale_id` **字段** | 你设置的 `locale_description` **字段** |
| 世界法则 | `<law_id>_title`（注意后缀） | `<law_id>_description` |

> [!WARNING] id 不是名字
> 你的 id 在任何语言里都永远是 `hello_swift`，你其余的代码（以及别人的模组）引用的都是它。会变的是**本地化文本**。千万别为了修正显示名称里的错字就去改 id :PESgn_Stop:。
