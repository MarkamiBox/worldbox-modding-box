---
title: 世界法则
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbworldlaws:
order: 176
---

# 世界法则 :wbworldlaws:

世界法则就是 **世界法则** 窗口中的各项开关：“生老病死”、“饥饿”、“和平怪物”等。这是你能添加的最便于玩家操作的功能，因为它能让玩家无需接触任何配置文件即可开启或关闭你 mod 的行为。

它们也是整款游戏中最简单的资源之一，一共仅有四个字段。

## 添加一个开关

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // 属于哪个分页标签
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // 默认关闭
            });
        }
    }
}
```

在 `Main.cs` 中加入 `HelloLaws.Initialize();`，开关就已经进入游戏了。真的就这么简单 :poggers:。

| 字段 | 含义 |
| --- | --- |
| `id` | 法则名称，同时也是翻译键 |
| `group_id` | 所在标签页：`units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
| `icon_path` | 图标，路径规则与其他地方相同 |
| `default_state` | `true` = 新世界默认开启，`false` = 默认关闭 |
| `can_turn_off` | 默认为 `true`。设为 `false` 则该法则一旦开启就无法关闭 |

## 在代码中读取该开关

这就是添加开关的核心意义所在。一个没人读取的开关只是装饰品。在 mod 的任何地方都可以判断：

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // 玩家想要混乱，那就赐予他们混乱
}
```

实战示例：仅在法则开启时蔓延火星余烬：

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## 在开关切换的瞬间作出响应

如果开启法则需要立即 *执行* 某些操作，而不仅仅是后续读取：

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* 玩家将其开启时运行 */ }
};
```

## 文本与本地化

```json Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] 世界法则使用 _title，而不是纯裸 id
> 几乎所有其他资源都直接使用纯 id 作为名称本地化键。但世界法则要求使用 `<id>_title`。一旦搞错，开关在游戏中就会变成没有任何文字的空白按钮 :PESgn_Really:。

> [!TIP] 世界法则胜过设置菜单
> Mod 设置选项藏在玩家只打开一次的菜单深处。而世界法则就在游戏主界面中，紧挨着原版法则，按每个世界单独保存，并且可以在游戏中途随时切换。如果你的 mod 带有开关类行为，这里才是最完美的归宿 :wbblessed:。
