---
title: 消息与世界日志
group: 游戏内容
subgroup: 神力与用户界面
icon: :wbscroll:
order: 207
---

# 消息与世界日志 :wbscroll:

写代码的时候，用 `Main.Log()` 往控制台打印信息挺好用。但当你的神力扔下一颗陨石、一个自定义 boss 单位苏醒、或是某个王国签订条约时，玩家可不会去看你的调试日志。

他们需要屏幕上的反馈：飘在屏幕上的弹出提示，以及世界历史日志里的条目。

## 用 WorldTip 显示屏幕横幅

把文字摆到玩家面前最快的方法是 `WorldTip.showNow`：

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| 参数 | 含义 | 默认值 |
| --- | --- | --- |
| `pText` | 可以是原始字符串，也可以是本地化键 | 必填 |
| `pTranslate` | 是否让 `pText` 经过 `LocalizedTextManager.getText()` 处理 | `true` |
| `pPosition` | 屏幕锚点：`"center"`、`"top"`、`"bottom"` | `"center"` |
| `pTime` | 淡出前显示的秒数 | `3f` |
| `pColor` | 文字的十六进制颜色代码 | `"#F3961F"`（橙色） |

> [!WARNING] WorldTip 默认会做翻译
> 因为 `pTranslate` 默认是 `true`，写 `WorldTip.showNow("Something happened!")` 会让游戏去查一个名叫 `"Something happened!"` 的本地化键。它当然找不到，于是记录一条缺失翻译的错误，然后显示出原始的占位文字 :PESgn_Oops:。
>
> 如果你传的是字面英文文本，**务必**把 `pTranslate` 设为 `false`：
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> 如果是本地化文本，就传入你的翻译键，并保留 `pTranslate: true`：
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### 底部工具栏文字

如果你想要一条更低调的提示，出现在神力能量条正上方——就像选中一个笔刷时显示的那种提示文字——用 `showToolbarText`：

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

这会在当前激活的能量条正上方绘制一条小小的浮动提示。

## 用 WorldLog 记录世界事件

世界日志是玩家在历史窗口中打开的持久化记录。条目会在存档、读档后依然存在，并和世界的时间线绑定在一起。

游戏在 `WorldLog` 上提供了几个开箱即用的静态辅助方法：

```csharp
// Record an imperial succession:
WorldLog.logNewKing(kingdom);

// Record the founding of a new realm:
WorldLog.logNewKingdom(kingdom);

// Record a disaster event at a specific tile:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### 自定义历史条目

要添加你自己的历史事件，就用来自 `AssetManager.world_log` 的 `WorldLogAsset` 构造一个 `WorldLogMessage`：

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registers the entry with HistoryHud and writes it to the world log database:
            entry.add();
        }
    }
}
```

`entry.add()` 会把这条条目加入当前游戏的历史 HUD，并通过 `DBInserter.insertLog` 持久化写入世界的 SQLite 数据库。

## 地图铭牌（nameplates_library）

打开地图图层时，城市、王国和宗教上方会出现横幅铭牌。这些由 `AssetManager.nameplates_library`（`NameplateAsset`）负责处理。

| 字段 | 含义 |
| --- | --- |
| `id` | 与某个 `MetaType` 对应的标识符 |
| `path_sprite` | 铭牌边框的精灵图路径 |
| `padding_left` / `padding_right` / `padding_top` | 文字的偏移边界 |
| `map_mode` | 该铭牌绘制在哪个 `MetaType` 图层上 |

> [!WARNING] 不要对原版地图模式调用 add()
> 该资源库对每个 `MetaType` 只允许**一个**铭牌。如果你对一个已经存在的 `MetaType`（比如王国或城市）调用 `AssetManager.nameplates_library.add(...)`，它会抛出异常 :wbfacepalm:。
>
> 如果你想给原版铭牌换皮或改样式，用 `get()` 找到已有的那个并修改它的字段：
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

接下来：**[游戏选项与时间倍速](#/nml/game-options)** 了解玩家选项，或者 **[每一帧](#/nml/update-loops)** 学习如何在时钟上运行逻辑。
