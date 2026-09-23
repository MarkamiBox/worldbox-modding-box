---
title: 模组设置
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbsettingsgear:
order: 40
---

# 模组设置 :wbsettingsgear:

迟早会有人来跟你抱怨说你的模组太强、太卡或者音效太吵。与其在 Discord 上跟他们对线 :PESgn_WhySoToxic:，不如给他们提供一个设置窗口，让他们自己去调。

NML 会自动帮你绘制整个窗口，你只需要写一个 JSON 文件。

## default_config.json

在模组根目录下、紧挨着 `mod.json` 的位置放一个 `default_config.json`：

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` 是**分组 ID (group id)**：代表设置里的一个标签页。里面的每一个对象就是窗口里的一行设置。

| 键 | 含义 |
| --- | --- |
| `Id` | 在分组内必须唯一。在代码中凭此 ID 读取配置值 |
| `Type` | `SWITCH`（开关）、`SLIDER`（浮点数滑块）、`INT_SLIDER`（整数滑块）、`TEXT`（文本框） |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | 与类型匹配的默认初始值 |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | 滑块范围边界 |
| `IconPath` | 该行显示的自选图标路径 |
| `Callback` | 改变值时调用的可选回调：`Namespace.Type:MethodName` |

## 读取配置值

使用 `BasicMod<T>` 可以直接白嫖 `GetConfig()`，它按分组名称、再按 ID 建立索引：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

是的，给每一行都包上 `try/catch` 看起来像是被迫害妄想症。其实不然：当玩家从老版本升级你的模组时，他们本地保存的配置文件里根本没有你刚加进去的新键，而缺失任何一个键都会导致整个模组加载崩溃。

## Callbacks

`Callback` 的格式是 `Namespace.Type:MethodName`，对应的方法会接收修改后的新数值作为参数：

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // 当玩家拖动滑块时由 NML 调用
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] 更改只有在窗口关闭时才会生效
> 拖动滑块的过程中是不会触发更新的。如果你的回调里做的是耗时操作，这绝对是个好消息；但如果你期望即时预览，这就是为什么它“看起来坏了”的原因 :huh:。

## 配置保存位置

你的 `default_config.json` 仅仅是**模板**。玩家实际的设置修改会保存在：

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

当你测试默认值却纳闷为什么新数值死活不生效时，这也是你该第一时间去删掉的文件 :PESgn_OOF:。

## Don't forget the text (again)

分组 ID 和配置项 ID 同时也是本地化语言键，记得加到 `Locales/` 里面，否则游戏里会直接显示裸代码键名：

组 id 和条目 id 也是本地化键，放进 `Locales/en.json`，否则会原样显示。每一行还想要第二个键 **`"<id> Description"`**（带空格、大写 D），用作提示文字：

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] 日志会告诉你漏了哪些
> 缺少标签时会打印 `LocalizedTextManager: missing text: strike_radius Description`。把设置窗口开一次，然后搜 `missing text:`，要补的键就一个不差地列在那儿 :wbsmirk:。


## 不使用 BasicMod

如果你的主类直接实现 `IMod` 接口，就在同一个类上实现 `IConfigurable` 并亲自返回配置实例：

```csharp
public ModConfig GetConfig()
{
    return _config;   // 由你自行创建或加载
}
```

就这一个方法，便能让模组列表里你的模组旁边冒出齿轮设置按钮。
